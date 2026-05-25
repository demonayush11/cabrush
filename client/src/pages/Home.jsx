import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import axios from 'axios';
import BookingForm from '../components/BookingForm.jsx';
import StatusCard from '../components/StatusCard.jsx';
import { showToast } from '../components/Toast.jsx';
import { saveToHistory } from '../components/BookingHistory.jsx';

const PLATFORMS = ['uber', 'ola', 'rapido'];

const initialStatus = () =>
  PLATFORMS.reduce((acc, p) => {
    acc[p] = { status: 'IDLE', eta: null, driverName: null, message: null };
    return acc;
  }, {});

function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
  });
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bookingActive, setBookingActive] = useState(false);
  const [statuses, setStatuses] = useState(initialStatus);
  const [winner, setWinner] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [lastTrip, setLastTrip] = useState(null);
  const eventSourceRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    axios.get('/api/config').then((res) => {
      setApiKey(res.data.googleMapsApiKey || '');
    }).catch(() => {
      showToast('Could not load Google Maps config', 'error');
    });
  }, []);

  const cleanupSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanupSSE(), [cleanupSSE]);

  const connectSSE = useCallback((sessionId) => {
    cleanupSSE();
    const es = new EventSource(`/api/status/${sessionId}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'winner') {
        setWinner({ platform: data.platform, eta: data.eta, driverName: data.driverName });
        setStatuses((prev) => ({
          ...prev,
          [data.platform]: {
            ...prev[data.platform],
            status: 'CONFIRMED',
            eta: data.eta,
            driverName: data.driverName,
          },
        }));
        fireConfetti();
        setLoading(false);
        if (lastTrip) {
          saveToHistory({
            pickup: lastTrip.pickup,
            drop: lastTrip.drop,
            platform: data.platform,
            status: 'completed',
          });
        }
        showToast(`Booked via ${data.platform}!`, 'success');
        return;
      }

      if (data.platform && data.status) {
        setStatuses((prev) => ({
          ...prev,
          [data.platform]: {
            ...prev[data.platform],
            status: data.status,
            eta: data.eta ?? prev[data.platform]?.eta,
            driverName: data.driverName ?? prev[data.platform]?.driverName,
            message: data.message ?? prev[data.platform]?.message,
          },
        }));
      }

      if (data.type === 'complete' && data.status === 'FAILED') {
        setLoading(false);
        showToast('No platform confirmed the ride', 'error');
        if (lastTrip) {
          saveToHistory({
            pickup: lastTrip.pickup,
            drop: lastTrip.drop,
            platform: null,
            status: 'cancelled',
          });
        }
      }
    };

    es.onerror = () => {
      console.warn('SSE connection error');
    };
  }, [cleanupSSE, lastTrip]);

  const handleBook = async ({ pickup, drop }) => {
    const sessionId = crypto.randomUUID();
    sessionIdRef.current = sessionId;
    setLastTrip({ pickup, drop });
    setLoading(true);
    setBookingActive(true);
    setWinner(null);
    setStatuses(initialStatus());

    connectSSE(sessionId);

    try {
      await axios.post('/api/book', { pickup, drop, sessionId });
      showToast('Racing Uber, Ola & Rapido...', 'success');
    } catch (err) {
      setLoading(false);
      showToast(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  return (
    <main className="px-6 pb-16 max-w-6xl mx-auto">
      <section className="text-center pt-8 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Book the fastest cab.{' '}
          <span className="bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">
            Automatically.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg max-w-xl mx-auto"
        >
          We race Uber, Ola & Rapido simultaneously. First to confirm wins.
        </motion.p>
      </section>

      <BookingForm onBook={handleBook} loading={loading} apiKey={apiKey} />

      <AnimatePresence>
        {bookingActive && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-10"
          >
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-300">Live Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLATFORMS.map((platform) => (
                <StatusCard
                  key={platform}
                  platform={platform}
                  {...statuses[platform]}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <p className="text-2xl font-bold text-green-400">
              🎉 Booked via {winner.platform.charAt(0).toUpperCase() + winner.platform.slice(1)}!
            </p>
            <p className="text-gray-300 mt-2">
              Driver arriving in {winner.eta || 'a few mins'}
              {winner.driverName && ` — ${winner.driverName}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
