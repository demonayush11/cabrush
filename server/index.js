import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleBook } from './routes/book.js';
import { onStatus, offStatus } from './utils/statusEmitter.js';
import { getBookings } from './utils/bookingsStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

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

app.post('/api/book', handleBook);

app.get('/api/bookings', async (_req, res) => {
  const bookings = await getBookings();
  res.json(bookings);
});

app.get('/api/config', (_req, res) => {
  res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CabRush' });
});

app.listen(PORT, () => {
  console.log(`\n⚡ CabRush server running on http://localhost:${PORT}`);
  console.log(`   SSE: GET /api/status/:sessionId`);
  console.log(`   Book: POST /api/book\n`);
});
