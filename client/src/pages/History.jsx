import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios.js';
import { showToast } from '../components/Toast.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'uber', label: 'Uber' },
  { value: 'ola', label: 'Ola' },
  { value: 'rapido', label: 'Rapido' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const platformEmoji = { uber: '🚗', ola: '🚕', rapido: '🏍️' };

export default function History() {
  const [filter, setFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/user/bookings')
      .then((res) => setHistory(res.data))
      .catch(() => showToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((item) => filter === 'all' || item.platform === filter);

  return (
    <main className="px-6 pb-20 max-w-container mx-auto pt-10">
      <motion.div {...fadeUp}>
        <p className="section-label mb-3">Ride History</p>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h1 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight leading-tight">
            Booking History
          </h1>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-300 ease-smooth ${
                  filter === f.value
                    ? 'bg-primary text-accent shadow-btn'
                    : 'bg-surface text-textSecondary border border-border hover:border-primary hover:text-textPrimary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-lg font-semibold text-textPrimary">No bookings found</p>
            <p className="text-textSecondary text-sm mt-2">
              {filter === 'all'
                ? 'Your ride history will appear here'
                : `No ${filter} bookings yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm text-textMuted">
                    {new Date(item.date || item.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-textPrimary font-semibold">
                    {item.pickup} → {item.drop}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {item.platform && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-pill bg-primaryLight text-accent capitalize border border-primary/30">
                      {platformEmoji[item.platform]} {item.platform}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-pill capitalize ${
                      item.status === 'completed' || item.status === 'confirmed'
                        ? 'bg-success/15 text-success'
                        : item.status === 'cancelled'
                        ? 'bg-error/15 text-error'
                        : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
