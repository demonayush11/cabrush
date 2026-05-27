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
  const platformEmoji = { uber: '🚗', ola: '🚕', rapido: '🏍️' };

  if (history.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-lg font-semibold text-textPrimary">No booking history yet</p>
        <p className="text-textSecondary text-sm mt-2">Your completed rides will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
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
          <div className="flex items-center gap-3">
            {item.platform && (
              <span className="px-3 py-1 text-sm font-semibold rounded-pill bg-primaryLight text-accent capitalize">
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
        </div>
      ))}
    </div>
  );
}
