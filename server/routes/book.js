import { bookUber } from '../automation/uber.js';
import { bookOla } from '../automation/ola.js';
import { bookRapido } from '../automation/rapido.js';
import { cancelAll } from '../utils/cancelAll.js';
import { saveBooking } from '../utils/bookingsStore.js';
import { emitStatus } from '../utils/statusEmitter.js';
import { createBooking, updateBooking, logActivity } from '../utils/dbHelpers.js';
import { getBookingCredentials, missingPlatforms } from '../utils/platformCredentials.js';

const PLATFORMS = ['uber', 'ola', 'rapido'];

function initPlatformStatus(sessionId) {
  for (const platform of PLATFORMS) {
    emitStatus(sessionId, { platform, status: 'IDLE' });
  }
}

async function closeBookingBrowsers(results) {
  await Promise.allSettled(
    results.map(async (result) => {
      const browser = result.status === 'fulfilled' ? result.value?.browser : null;
      if (browser) {
        await browser.close();
      }
    })
  );
}

export async function handleBook(req, res) {
  const { pickup, drop, sessionId } = req.body;
  const userId = req.user.id;

  if (!pickup || !drop || !sessionId) {
    return res.status(400).json({ error: 'pickup, drop, and sessionId are required' });
  }

  console.log(`[book] User ${userId} | Session ${sessionId}: ${pickup} → ${drop}`);

  const credentials = await getBookingCredentials(userId);
  const missing = missingPlatforms(credentials);
  if (missing.length > 0) {
    return res.status(400).json({
      error: `Add your ${missing.map((p) => p[0].toUpperCase() + p.slice(1)).join(', ')} account details first`,
      missingPlatforms: missing,
    });
  }

  let dbBooking;
  try {
    dbBooking = await createBooking(userId, pickup, drop);
    await logActivity(userId, 'booking_started', {
      bookingId: dbBooking.id,
      pickup,
      drop,
      sessionId,
    });
  } catch (err) {
    console.error('[book] DB create error:', err.message);
    return res.status(500).json({ error: 'Failed to create booking record' });
  }

  initPlatformStatus(sessionId);

  res.json({
    success: true,
    sessionId,
    bookingId: dbBooking.id,
    message: 'Booking started across all platforms',
  });

  runParallelBooking({
    pickup,
    drop,
    sessionId,
    userId,
    bookingId: dbBooking.id,
    credentials,
  }).catch((err) => {
    console.error('[book] Unhandled error:', err);
  });
}

async function runParallelBooking({ pickup, drop, sessionId, userId, bookingId, credentials }) {
  const bookers = [
    { name: 'uber', fn: bookUber },
    { name: 'ola', fn: bookOla },
    { name: 'rapido', fn: bookRapido },
  ];

  const activeResults = [];

  const promises = bookers.map(({ name, fn }) =>
    fn({ pickup, drop, sessionId, credentials: credentials[name] }).then((result) => {
      if (result?.cancel) {
        activeResults.push({ platform: name, cancel: result.cancel, result });
      }
      return result;
    })
  );

  const confirmedPromise = new Promise((resolve) => {
    promises.forEach((p) => {
      p.then((result) => {
        if (result?.status === 'confirmed') {
          resolve(result);
        }
      });
    });
  });

  let winner = null;

  try {
    winner = await Promise.race([
      confirmedPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Booking timeout')), 5 * 60 * 1000)
      ),
    ]);
  } catch {
    console.log('[book] No platform confirmed within timeout');
  }

  const allResults = await Promise.allSettled(promises);

  if (winner) {
    console.log(`[book] Winner: ${winner.platform}`);

    const losers = activeResults.filter((r) => r.platform !== winner.platform);
    await cancelAll(losers, sessionId);

    emitStatus(sessionId, {
      type: 'winner',
      platform: winner.platform,
      status: 'CONFIRMED',
      eta: winner.eta,
      driverName: winner.driverName,
    });

    try {
      await updateBooking(bookingId, {
        platform_won: winner.platform,
        status: 'confirmed',
        eta: winner.eta,
        driver_name: winner.driverName,
      });
      await logActivity(userId, 'booking_confirmed', {
        bookingId,
        platform: winner.platform,
        eta: winner.eta,
      });
    } catch (err) {
      console.error('[book] DB update error:', err.message);
    }

    await saveBooking({
      pickup,
      drop,
      platform: winner.platform,
      status: 'completed',
      eta: winner.eta,
      driverName: winner.driverName,
      sessionId,
      userId,
    });
    await closeBookingBrowsers(allResults);
  } else {
    const anyConfirmed = allResults.some(
      (r) => r.status === 'fulfilled' && r.value?.status === 'confirmed'
    );

    if (!anyConfirmed) {
      emitStatus(sessionId, { type: 'complete', status: 'FAILED', message: 'No platform confirmed' });
      try {
        await updateBooking(bookingId, { status: 'failed' });
        await logActivity(userId, 'booking_failed', { bookingId });
      } catch (err) {
        console.error('[book] DB fail update error:', err.message);
      }
      await saveBooking({
        pickup,
        drop,
        platform: null,
        status: 'failed',
        sessionId,
        userId,
      });
      await closeBookingBrowsers(allResults);
    }
  }
}

export default handleBook;
