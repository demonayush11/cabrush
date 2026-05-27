import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  IDLE: {
    badge: 'bg-surface text-textMuted border-border',
    label: 'Idle',
  },
  SEARCHING: {
    badge: 'bg-primary text-accent border-primary',
    label: 'Searching',
    pulse: true,
  },
  FOUND: {
    badge: 'bg-primaryLight text-accent border-primary',
    label: 'Found',
    pulse: true,
  },
  CONFIRMED: {
    badge: 'bg-success/15 text-success border-success/30',
    label: 'Confirmed',
  },
  CANCELLED: {
    badge: 'bg-error/15 text-error border-error/30',
    label: 'Cancelled',
    dim: true,
  },
  FAILED: {
    badge: 'bg-warning/15 text-warning border-warning/30',
    label: 'Failed',
  },
};

const PLATFORM_INFO = {
  uber: { name: 'Uber', emoji: '🚗' },
  ola: { name: 'Ola', emoji: '🚕' },
  rapido: { name: 'Rapido', emoji: '🏍️' },
};

export default function StatusCard({ platform, status = 'IDLE', eta, driverName, message }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.IDLE;
  const info = PLATFORM_INFO[platform] || { name: platform, emoji: '🚕' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`card card-hover p-6 flex flex-col gap-4 ${
        config.dim ? 'opacity-50' : ''
      } ${status === 'CONFIRMED' ? 'ring-2 ring-success/40' : ''}`}
    >
      {/* Decorative yellow accent lines */}
      <div className="flex gap-1.5" aria-hidden>
        <span className="h-1 w-8 rounded-full bg-primary" />
        <span className="h-1 w-5 rounded-full bg-primary" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl shrink-0">
            {info.emoji}
          </div>
          <span className="font-semibold text-lg text-textPrimary">{info.name}</span>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-pill border shrink-0 ${config.badge} ${
            config.pulse ? 'animate-pulse-slow' : ''
          }`}
        >
          {status === 'CONFIRMED' && '✓ '}
          {config.label}
        </span>
      </div>

      {status === 'SEARCHING' && (
        <div className="flex items-center gap-2 text-sm text-textSecondary">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Searching for drivers...
        </div>
      )}

      {message && status === 'SEARCHING' && (
        <p className="text-xs text-textSecondary font-medium">{message}</p>
      )}

      {eta && (status === 'CONFIRMED' || status === 'FOUND') && (
        <p className="text-sm text-textSecondary">
          ETA: <span className="text-textPrimary font-semibold">{eta}</span>
        </p>
      )}

      {driverName && status === 'CONFIRMED' && (
        <p className="text-sm text-textSecondary">
          Driver: <span className="text-textPrimary font-semibold">{driverName}</span>
        </p>
      )}
    </motion.div>
  );
}
