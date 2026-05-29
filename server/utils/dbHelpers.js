import { query } from '../db/index.js';

export async function logActivity(userId, action, metadata = {}) {
  await query(
    'INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)',
    [userId, action, metadata]
  );
}

export async function createBooking(userId, pickup, dropLocation) {
  const result = await query(
    `INSERT INTO bookings (user_id, pickup, drop_location, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [userId, pickup, dropLocation]
  );
  return result.rows[0];
}

export async function updateBooking(bookingId, { platform_won, status, eta, driver_name }) {
  const result = await query(
    `UPDATE bookings
     SET platform_won = COALESCE($2, platform_won),
         status = COALESCE($3, status),
         eta = COALESCE($4, eta),
         driver_name = COALESCE($5, driver_name)
     WHERE id = $1
     RETURNING *`,
    [bookingId, platform_won ?? null, status ?? null, eta ?? null, driver_name ?? null]
  );
  return result.rows[0];
}
