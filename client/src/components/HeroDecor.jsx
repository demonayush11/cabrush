import { motion } from 'framer-motion';

export default function HeroDecor() {
  return (
    <div className="relative w-full h-full min-h-[320px] md:min-h-[420px] flex items-center justify-center">
      {/* Small scattered circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-8 right-12 w-6 h-6 rounded-full bg-primary"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-16 left-8 w-4 h-4 rounded-full bg-primary"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/3 left-4 w-3 h-3 rounded-full bg-primaryLight border border-primary"
      />

      <motion.div
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-4 right-4 grid grid-cols-2 w-6 h-6"
        aria-hidden
      >
        <span className="bg-accent" />
        <span />
        <span />
        <span className="bg-accent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, rotate: 10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 left-12 grid grid-cols-2 w-6 h-6"
        aria-hidden
      >
        <span className="bg-accent" />
        <span />
        <span />
        <span className="bg-accent" />
      </motion.div>

      {/* Main yellow blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full bg-primary flex items-center justify-center shadow-card"
      >
        {/* Inner cab illustration */}
        <div className="relative z-10 text-center">
          <svg
            viewBox="0 0 120 80"
            className="w-40 h-28 md:w-48 md:h-32 mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect x="10" y="35" width="100" height="28" rx="8" fill="#1A1A1A" />
            <rect x="25" y="22" width="70" height="22" rx="6" fill="#1A1A1A" />
            <rect x="30" y="26" width="28" height="14" rx="3" fill="#F5C518" />
            <rect x="62" y="26" width="28" height="14" rx="3" fill="#F5C518" />
            <circle cx="32" cy="63" r="10" fill="#1A1A1A" />
            <circle cx="32" cy="63" r="5" fill="#555555" />
            <circle cx="88" cy="63" r="10" fill="#1A1A1A" />
            <circle cx="88" cy="63" r="5" fill="#555555" />
            <rect x="48" y="42" width="24" height="4" rx="2" fill="#F5C518" />
          </svg>
          <p className="mt-2 text-sm font-bold text-accent">Fastest ride wins</p>
        </div>
      </motion.div>
    </div>
  );
}
