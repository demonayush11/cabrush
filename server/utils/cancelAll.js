import { emitStatus } from './statusEmitter.js';

export async function cancelAll(activeBookings, sessionId) {
  console.log(`[cancelAll] Cancelling ${activeBookings.length} active booking(s)...`);

  const results = await Promise.allSettled(
    activeBookings.map(async ({ platform, cancel }) => {
      try {
        if (cancel) {
          await cancel();
        }
        emitStatus(sessionId, { platform, status: 'CANCELLED' });
        console.log(`[cancelAll] ${platform} cancelled`);
      } catch (err) {
        console.error(`[cancelAll] Failed to cancel ${platform}:`, err.message);
        emitStatus(sessionId, { platform, status: 'CANCELLED' });
      }
    })
  );

  return results;
}
