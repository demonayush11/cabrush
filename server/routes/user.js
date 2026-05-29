import { Router } from 'express';
import { query } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getCredentialStatus,
  upsertPlatformCredential,
  normalizePlatform,
} from '../utils/platformCredentials.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await query(
      `SELECT
         COUNT(*)::int AS total_bookings,
         COUNT(*) FILTER (WHERE status IN ('completed', 'confirmed'))::int AS completed_bookings
       FROM bookings WHERE user_id = $1`,
      [userId]
    );

    const platformResult = await query(
      `SELECT platform_won, COUNT(*)::int AS count
       FROM bookings
       WHERE user_id = $1 AND platform_won IS NOT NULL
       GROUP BY platform_won
       ORDER BY count DESC
       LIMIT 1`,
      [userId]
    );

    const recentBookings = await query(
      `SELECT id, pickup, drop_location, platform_won, status, eta, driver_name, created_at
       FROM bookings WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    const activityLog = await query(
      `SELECT id, action, metadata, created_at
       FROM activity_log WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    const monthResult = await query(
      `SELECT COUNT(*)::int AS rides_this_month
       FROM bookings
       WHERE user_id = $1
         AND created_at >= date_trunc('month', NOW())`,
      [userId]
    );

    const stats = statsResult.rows[0];

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        created_at: req.user.created_at,
      },
      stats: {
        totalBookings: stats.total_bookings,
        completedBookings: stats.completed_bookings,
        favouritePlatform: platformResult.rows[0]?.platform_won || null,
        totalRides: stats.total_bookings,
        ridesThisMonth: monthResult.rows[0]?.rides_this_month || 0,
      },
      recentBookings: recentBookings.rows.map((b) => ({
        id: b.id,
        pickup: b.pickup,
        drop: b.drop_location,
        platform: b.platform_won,
        status: b.status,
        eta: b.eta,
        driverName: b.driver_name,
        createdAt: b.created_at,
      })),
      activityLog: activityLog.rows,
    });
  } catch (err) {
    console.error('[user] dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/platform-credentials', async (req, res) => {
  try {
    const credentials = await getCredentialStatus(req.user.id);
    res.json({ credentials });
  } catch (err) {
    console.error('[user] platform credential status error:', err.message);
    res.status(500).json({ error: 'Failed to load platform accounts' });
  }
});

router.put('/platform-credentials/:platform', async (req, res) => {
  try {
    const platform = normalizePlatform(req.params.platform);
    const { identifier, secret } = req.body;

    await upsertPlatformCredential(req.user.id, platform, { identifier, secret });

    res.json({
      success: true,
      credentials: await getCredentialStatus(req.user.id),
    });
  } catch (err) {
    console.error('[user] platform credential save error:', err.message);
    const status =
      err.message === 'Unsupported platform' || err.message === 'Account phone or email is required'
        ? 400
        : 500;
    res.status(status).json({ error: err.message || 'Failed to save platform account' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, pickup, drop_location, platform_won, status, eta, driver_name, created_at
       FROM bookings WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(
      result.rows.map((b) => ({
        id: b.id,
        pickup: b.pickup,
        drop: b.drop_location,
        platform: b.platform_won,
        status: b.status,
        eta: b.eta,
        driverName: b.driver_name,
        date: b.created_at,
        createdAt: b.created_at,
      }))
    );
  } catch (err) {
    console.error('[user] bookings error:', err.message);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

export default router;
