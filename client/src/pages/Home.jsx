import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios.js';
import BookingForm from '../components/BookingForm.jsx';
import StatusCard from '../components/StatusCard.jsx';
import HeroDecor from '../components/HeroDecor.jsx';
import { showToast } from '../components/Toast.jsx';

const PLATFORMS = ['uber', 'ola', 'rapido'];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

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
    colors: ['#F5C518', '#1A1A1A', '#FFFFFF', '#E6B800'],
  });
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bookingActive, setBookingActive] = useState(false);
  const [statuses, setStatuses] = useState(initialStatus);
  const [winner, setWinner] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const eventSourceRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    api
      .get('/api/config')
      .then((res) => {
        setApiKey(res.data.googleMapsApiKey || '');
      })
      .catch(() => {
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

  const connectSSE = useCallback(
    (sessionId) => {
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
        }
      };

      es.onerror = () => {
        console.warn('SSE connection error');
      };
    },
    [cleanupSSE]
  );

  const handleBook = async ({ pickup, drop }) => {
    const sessionId = crypto.randomUUID();
    sessionIdRef.current = sessionId;
    setLoading(true);
    setBookingActive(true);
    setWinner(null);
    setStatuses(initialStatus());

    connectSSE(sessionId);

    try {
      await api.post('/api/book', { pickup, drop, sessionId });
      showToast('Racing Uber, Ola & Rapido...', 'success');
    } catch (err) {
      setLoading(false);
      showToast(err.response?.data?.error || 'Booking failed', 'error');
    }
  };

  return (
    <>
      {/* Winner banner — slides from top */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-nav left-0 right-0 z-40 bg-primary py-4 px-6 text-center shadow-btn"
          >
            <p className="text-lg md:text-xl font-bold text-accent">
              Booked via {winner.platform.charAt(0).toUpperCase() + winner.platform.slice(1)}! Driver
              arriving in {winner.eta || 'a few mins'}
              {winner.driverName && ` — ${winner.driverName}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`px-6 pb-20 max-w-container mx-auto pt-nav ${winner ? 'mt-16' : ''}`}>
        {/* Hero — split layout */}
        <section className="py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-8">
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0 }}>
                <p className="section-label mb-4">Cab Booking</p>
                <h1
                  className="text-hero font-extrabold tracking-hero leading-hero text-textPrimary"
                  style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}
                >
                  Book the fastest cab.{' '}
                  <span className="text-primary">Automatically.</span>
                </h1>
                <p className="mt-5 text-base text-textSecondary max-w-[420px] leading-body">
                  We race Uber, Ola & Rapido simultaneously. First to confirm wins.
                </p>
              </motion.div>

              <BookingForm onBook={handleBook} loading={loading} apiKey={apiKey} />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block"
            >
              <HeroDecor />
            </motion.div>
          </div>

          {/* Mobile decorative blob */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="md:hidden mt-8 flex justify-center"
          >
            <div className="w-48 h-48 rounded-full bg-primary flex items-center justify-center text-5xl shadow-card">
              🚕
            </div>
          </motion.div>
        </section>

        <AnimatePresence>
          {bookingActive && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pb-10"
            >
              <motion.p
                {...fadeUp}
                className="section-label mb-2 text-center lg:text-left"
              >
                Live Status
              </motion.p>
              <h2 className="text-2xl md:text-[36px] font-bold text-textPrimary mb-8 text-center lg:text-left tracking-tight">
                Racing your ride
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PLATFORMS.map((platform, i) => (
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <StatusCard platform={platform} {...statuses[platform]} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
