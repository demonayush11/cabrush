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

export default function History() {
  const [filter, setFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const history = getHistory().filter(
    (item) => filter === 'all' || item.platform === filter
  );

  const handleClear = () => {
    clearHistory();
    setRefreshKey((k) => k + 1);
    showToast('History cleared', 'success');
  };

  const platformEmoji = { uber: '🚗', ola: '🟢', rapido: '🏍️' };

  return (
    <main className="px-6 pb-16 max-w-4xl mx-auto" key={refreshKey}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Booking History</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f.value
                      ? 'bg-accent text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Clear History
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No bookings found</p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === 'all' ? 'Your ride history will appear here' : `No ${filter} bookings yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/[0.07]"
              >
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">
                    {new Date(item.date).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-white font-medium">
                    {item.pickup} → {item.drop}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {item.platform && (
                    <span className="px-3 py-1 text-sm rounded-full bg-white/10 capitalize">
                      {platformEmoji[item.platform]} {item.platform}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      item.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
