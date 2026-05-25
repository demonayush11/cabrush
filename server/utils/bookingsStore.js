import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOKINGS_FILE = path.join(__dirname, '..', 'bookings.json');

export async function saveBooking(booking) {
  let bookings = [];
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    bookings = JSON.parse(data);
  } catch {
    bookings = [];
  }

  bookings.unshift({
    id: Date.now().toString(),
    ...booking,
    createdAt: new Date().toISOString(),
  });

  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  return bookings[0];
}

export async function getBookings() {
  try {
    const data = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
