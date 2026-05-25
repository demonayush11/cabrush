import { bookUber } from '../automation/uber.js';
import { bookOla } from '../automation/ola.js';
import { bookRapido } from '../automation/rapido.js';
import { cancelAll } from '../utils/cancelAll.js';
import { saveBooking } from '../utils/bookingsStore.js';
import { emitStatus } from '../utils/statusEmitter.js';

const PLATFORMS = ['uber', 'ola', 'rapido'];

function initPlatformStatus(sessionId) {
  for (const platform of PLATFORMS) {
    emitStatus(sessionId, { platform, status: 'IDLE' });
  }
}

export async function handleBook(req, res) {
  const { pickup, drop, sessionId } = req.body;

  if (!pickup || !drop || !sessionId) {
    return res.status(400).json({ error: 'pickup, drop, and sessionId are required' });
  }

  console.log(`[book] Session ${sessionId}: ${pickup} → ${drop}`);
  initPlatformStatus(sessionId);

  res.json({ success: true, sessionId, message: 'Booking started across all platforms' });

  runParallelBooking({ pickup, drop, sessionId }).catch((err) => {
    console.error('[book] Unhandled error:', err);
  });
}

async function runParallelBooking({ pickup, drop, sessionId }) {
  const bookers = [
    { name: 'uber', fn: bookUber },
    { name: 'ola', fn: bookOla },
    { name: 'rapido', fn: bookRapido },
  ];

  const activeResults = [];

  const promises = bookers.map(({ name, fn }) =>
    fn({ pickup, drop, sessionId }).then((result) => {
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

    await saveBooking({
      pickup,
      drop,
      platform: winner.platform,
      status: 'completed',
      eta: winner.eta,
      driverName: winner.driverName,
      sessionId,
    });
  } else {
    const anyConfirmed = allResults.some(
      (r) => r.status === 'fulfilled' && r.value?.status === 'confirmed'
    );

    if (!anyConfirmed) {
      emitStatus(sessionId, { type: 'complete', status: 'FAILED', message: 'No platform confirmed' });
      await saveBooking({
        pickup,
        drop,
        platform: null,
        status: 'failed',
        sessionId,
      });
    }
  }
}

export default handleBook;
