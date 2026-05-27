import { useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory, clearHistory } from '../components/BookingHistory.jsx';
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

export default function History() {
  const [filter, setFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const history = getHistory().filter((item) => filter === 'all' || item.platform === filter);

  const handleClear = () => {
    clearHistory();
    setRefreshKey((k) => k + 1);
    showToast('History cleared', 'success');
  };

  const platformEmoji = { uber: '🚗', ola: '🚕', rapido: '🏍️' };

  return (
    <main className="px-6 pb-20 max-w-container mx-auto" key={refreshKey}>
      <motion.div {...fadeUp} className="pt-10 md:pt-16">
        <p className="section-label mb-3">Ride History</p>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <h1 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight leading-tight">
            Booking History
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
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
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-pill text-sm font-semibold text-error border border-error/30 bg-error/5 hover:bg-error/10 transition-all duration-300 ease-smooth"
            >
              Clear History
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-2xl">
              📋
            </div>
            <p className="text-lg font-semibold text-textPrimary">No bookings found</p>
            <p className="text-textSecondary text-sm mt-2">
              {filter === 'all'
                ? 'Your ride history will appear here'
                : `No ${filter} bookings yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm text-textMuted">
                    {new Date(item.date).toLocaleString('en-IN', {
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
                    className={`px-3 py-1 text-sm font-semibold rounded-pill ${
                      item.status === 'completed'
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
