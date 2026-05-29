import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    pool.on('error', (err) => console.error('DB error', err));
    pool
      .query('SELECT NOW()')
      .then(() => console.log('✅ Database connected'))
      .catch((err) => console.error('❌ DB connection failed:', err));
  }
  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}

export default { getPool, query };
