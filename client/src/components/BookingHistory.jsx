const STORAGE_KEY = 'cabrush_history';

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveToHistory(entry) {
  const history = getHistory();
  history.unshift({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...entry,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function BookingHistory() {
  const history = getHistory();
  const platformEmoji = { uber: '🚗', ola: '🟢', rapido: '🏍️' };

  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-gray-400 text-lg">No booking history yet</p>
        <p className="text-gray-500 text-sm mt-2">Your completed rides will appear here</p>
      </div>
    );
  }

  return (
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
  );
}
