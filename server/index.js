import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleBook } from './routes/book.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { authMiddleware } from './middleware/auth.js';
import { onStatus, offStatus } from './utils/statusEmitter.js';
import { getBookings } from './utils/bookingsStore.js';
import { migrate } from './db/migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('DB URL loaded:', !!process.env.DATABASE_URL);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const sseClients = new Map();

function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

app.get('/api/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sendSSE(res, { type: 'connected', sessionId });

  if (!sseClients.has(sessionId)) {
    sseClients.set(sessionId, new Set());
  }
  sseClients.get(sessionId).add(res);

  const listener = (data) => {
    if (data.sessionId === sessionId) {
      sendSSE(res, data);
    }
  };

  onStatus(listener);

  req.on('close', () => {
    offStatus(listener);
    const clients = sseClients.get(sessionId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(sessionId);
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.post('/api/book', authMiddleware, handleBook);

app.get('/api/bookings', authMiddleware, async (req, res) => {
  const bookings = await getBookings();
  res.json(bookings);
});

app.get('/api/config', (_req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CabRush' });
});

async function start() {
  try {
    await migrate();
  } catch (err) {
    console.error('[db] Migration failed:', err.message);
    console.error('[db] Server starting anyway — auth/booking DB features may not work');
  }

  app.listen(PORT, () => {
    console.log(`\n⚡ CabRush server running on http://localhost:${PORT}`);
    console.log(`   Auth: POST /api/auth/signup | /api/auth/login`);
    console.log(`   SSE:  GET /api/status/:sessionId`);
    console.log(`   Book: POST /api/book (protected)\n`);
  });
}

start();
