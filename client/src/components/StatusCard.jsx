import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  IDLE: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Idle' },
  SEARCHING: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Searching', pulse: true },
  FOUND: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Found', bounce: true },
  CONFIRMED: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Confirmed' },
  CANCELLED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled', strike: true },
  FAILED: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Failed' },
};

const PLATFORM_INFO = {
  uber: { name: 'Uber', emoji: '🚗', color: 'from-gray-800 to-black' },
  ola: { name: 'Ola', emoji: '🟢', color: 'from-green-700 to-green-900' },
  rapido: { name: 'Rapido', emoji: '🏍️', color: 'from-yellow-600 to-orange-700' },
};

export default function StatusCard({ platform, status = 'IDLE', eta, driverName, message }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.IDLE;
  const info = PLATFORM_INFO[platform] || { name: platform, emoji: '🚕', color: 'from-gray-700 to-gray-900' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 ${
        status === 'CONFIRMED' ? 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/20' : ''
      } ${config.strike ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-lg`}>
            {info.emoji}
          </div>
          <span className="font-semibold text-lg">{info.name}</span>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border ${config.color} ${
            config.pulse ? 'animate-pulse-slow' : ''
          } ${config.bounce ? 'animate-bounce-soft' : ''} ${config.strike ? 'line-through' : ''}`}
        >
          {status === 'CONFIRMED' && '✓ '}
          {config.label}
        </span>
      </div>

      {status === 'SEARCHING' && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Searching for drivers...
        </div>
      )}

      {message && status === 'SEARCHING' && (
        <p className="text-xs text-yellow-400">{message}</p>
      )}

      {eta && (status === 'CONFIRMED' || status === 'FOUND') && (
        <p className="text-sm text-gray-300">
          ETA: <span className="text-white font-medium">{eta}</span>
        </p>
      )}

      {driverName && status === 'CONFIRMED' && (
        <p className="text-sm text-gray-300">
          Driver: <span className="text-white font-medium">{driverName}</span>
        </p>
      )}
    </motion.div>
  );
}
