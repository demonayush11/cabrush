import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import HeroDecor from '../components/HeroDecor.jsx';
import Footer from '../components/Footer.jsx';
import { Stats } from '@/components/ui/statistics-card';
import { ServiceCard } from '@/components/ui/service-card';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

const STEPS = [
  { n: 1, title: 'Enter Your Route', desc: 'Set pickup and drop in Ranchi with smart autocomplete.' },
  { n: 2, title: 'We Race All Three', desc: 'Uber, Ola & Rapido book at the same time automatically.' },
  { n: 3, title: 'Fastest Wins', desc: 'First confirmed ride wins — others are cancelled instantly.' },
];

const PLATFORMS = [
  { name: 'Uber', color: 'text-accent', tagline: 'Premium rides, fast pickup', logo: '🚗' },
  { name: 'Ola', color: 'text-[#00B140]', tagline: 'Reliable city cabs', logo: '🚕' },
  { name: 'Rapido', color: 'text-primary', tagline: 'Quick bike & auto rides', logo: '🏍️' },
];

const SERVICE_STEPS = [
  {
    n: 1,
    title: 'Enter Your Route',
    desc: 'Set pickup and drop in Ranchi with smart autocomplete.',
    variant: 'lightgray',
    imgSrc: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=320&q=75',
    imgAlt: 'Map route illustration',
  },
  {
    n: 2,
    title: 'We Race All Three',
    desc: 'Uber, Ola & Rapido book at the same time automatically.',
    variant: 'yellow',
    imgSrc: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=320&q=75',
    imgAlt: 'Racing cars illustration',
  },
  {
    n: 3,
    title: 'Fastest Wins',
    desc: 'First confirmed ride wins instantly while the others are cancelled.',
    variant: 'lightgray',
    imgSrc: 'https://images.unsplash.com/photo-1567443024551-f3e3a7b9567f?w=320&q=75',
    imgAlt: 'Trophy winner illustration',
  },
];

const SERVICE_PLATFORMS = [
  {
    name: 'Uber',
    variant: 'black',
    tagline: 'Premium rides, fast pickup',
    imgSrc: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=320&q=75',
    imgAlt: 'Uber cab',
  },
  {
    name: 'Ola',
    variant: 'lightgray',
    tagline: 'Reliable city cabs',
    imgSrc: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=320&q=75',
    imgAlt: 'Ola cab',
  },
  {
    name: 'Rapido',
    variant: 'yellow',
    tagline: 'Quick bike and auto rides',
    imgSrc: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=320&q=75',
    imgAlt: 'Rapido bike',
  },
];

const stepTopContent = (stepNumber, isYellow = false) => (
  <div>
    <div className="flex gap-1.5 mb-3">
      <span className={`h-1 w-8 rounded-full ${isYellow ? 'bg-[#1A1A1A]/30' : 'bg-[#F5C518]'}`} />
      <span className={`h-1 w-5 rounded-full ${isYellow ? 'bg-[#1A1A1A]/30' : 'bg-[#F5C518]'}`} />
    </div>
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold ${
        isYellow ? 'bg-[#1A1A1A] text-[#F5C518]' : 'bg-[#F5C518] text-[#1A1A1A]'
      }`}
    >
      {stepNumber}
    </div>
  </div>
);

const FEATURES = [
  { icon: '⚡', title: 'Simultaneous Booking', desc: 'All three at once' },
  { icon: '🏆', title: 'Auto-Cancel Losers', desc: 'Winners keep, others cancel' },
  { icon: '📍', title: 'Ranchi Optimized', desc: 'Built for Ranchi streets' },
  { icon: '📊', title: 'Ride History', desc: "Track every ride you've taken" },
  { icon: '🔒', title: 'Secure Login', desc: 'Your data, your account' },
  { icon: '🆓', title: 'Completely Free', desc: 'No hidden fees, ever' },
];

const TESTIMONIALS = [
  {
    name: 'Rahul Verma',
    location: 'Ranchi',
    text: 'Got a cab in 40 seconds. Uber confirmed before Ola even loaded. Amazing tool!',
  },
  {
    name: 'Priya Singh',
    location: 'Ranchi',
    text: 'No more switching between apps. CabRush does it all automatically. Love it.',
  },
  {
    name: 'Amit Kumar',
    location: 'Ranchi',
    text: 'Saved so much time during rush hour. Rapido got confirmed in under a minute!',
  },
];

export default function Landing() {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-nav">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <div className="pt-nav">
        {/* HERO */}
        <section className="px-6 py-12 md:py-20 max-w-container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <p className="section-label mb-4">Cab Booking</p>
              <h1
                className="font-extrabold tracking-hero leading-hero text-textPrimary"
                style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}
              >
                Book the fastest cab.{' '}
                <span className="text-primary">Automatically.</span>
              </h1>
              <p className="mt-5 text-base text-textSecondary max-w-[420px] leading-body">
                We race Uber, Ola & Rapido simultaneously. First to confirm wins.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="px-7 py-3 rounded-pill font-bold bg-primary text-accent shadow-btn hover:bg-primaryDark hover:-translate-y-0.5 transition-all duration-300 ease-smooth"
                >
                  Get Started Free
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="px-7 py-3 rounded-pill font-bold border-2 border-accent text-accent hover:bg-surface transition-all duration-300 ease-smooth"
                >
                  See How It Works
                </button>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.15)} className="hidden md:block">
              <HeroDecor />
            </motion.div>
          </div>
        </section>

        {/* PERFORMANCE */}
        <section className="bg-surface py-16 md:py-20">
          <div className="max-w-container mx-auto px-6">
            <motion.div {...fadeUp()} className="mb-10 max-w-3xl">
              <p className="section-label mb-3">PERFORMANCE</p>
              <h2 className="text-3xl md:text-[42px] font-extrabold text-textPrimary tracking-tight">
                We don&apos;t race slow. We race to win.
              </h2>
              <p className="mt-4 text-sm md:text-base text-textSecondary leading-body max-w-2xl">
                CabRush confirms your cab faster than any manual booking method. Every time.
              </p>
            </motion.div>
            <Stats />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="px-6 py-20 max-w-container mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-label mb-3">How It Works</p>
            <h2 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight">
              Three steps to your ride
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_STEPS.map((step, i) => (
              <motion.div key={step.n} {...fadeUp(i * 0.1)}>
                <ServiceCard
                  title={step.title}
                  variant={step.variant}
                  description={step.desc}
                  topContent={stepTopContent(step.n, step.variant === 'yellow')}
                  href="#"
                  imgSrc={step.imgSrc}
                  imgAlt={step.imgAlt}
                  className="min-h-[220px]"
                />
              </motion.div>
            ))}
          </div>
          <div className="hidden">
            {STEPS.map((step, i) => (
              <motion.div key={step.n} {...fadeUp(i * 0.1)} className="card card-hover p-7 relative">
                <div className="flex gap-1.5 mb-4">
                  <span className="h-1 w-8 rounded-full bg-primary" />
                  <span className="h-1 w-5 rounded-full bg-primary" />
                </div>
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-extrabold text-accent mb-4">
                  {step.n}
                </div>
                <h3 className="text-xl font-semibold text-textPrimary mb-2">{step.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <span className="hidden md:block absolute -right-4 top-1/2 text-primary text-2xl">→</span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* PLATFORMS */}
        <section id="platforms" className="px-6 py-20 bg-surface">
          <div className="max-w-container mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-14">
              <p className="section-label mb-3">Platforms</p>
              <h2 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight">
                We race all three, so you don&apos;t have to
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICE_PLATFORMS.map((platform, i) => (
                <motion.div key={platform.name} {...fadeUp(i * 0.1)}>
                  <ServiceCard
                    title={platform.name}
                    variant={platform.variant}
                    description={platform.tagline}
                    href="#"
                    imgSrc={platform.imgSrc}
                    imgAlt={platform.imgAlt}
                    className="min-h-[220px]"
                  />
                </motion.div>
              ))}
            </div>
            <div className="hidden">
              {PLATFORMS.map((p, i) => (
                <motion.div
                  key={p.name}
                  {...fadeUp(i * 0.1)}
                  className="card card-hover p-7 text-center border-border hover:border-primary transition-colors"
                >
                  <span className={`text-5xl block mb-4 ${p.color}`}>{p.logo}</span>
                  <h3 className={`text-xl font-bold mb-2 ${p.color}`}>{p.name}</h3>
                  <p className="text-textSecondary text-sm">{p.tagline}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="px-6 py-20 max-w-container mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="section-label mb-3">Features</p>
            <h2 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.05)} className="card p-6">
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-lg mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-textPrimary mb-1">{f.title}</h3>
                <p className="text-textSecondary text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="px-6 py-20 bg-surfaceAlt">
          <div className="max-w-container mx-auto">
            <motion.div {...fadeUp()} className="text-center mb-14">
              <p className="section-label mb-3">What People Say</p>
              <h2 className="text-3xl md:text-[36px] font-bold text-textPrimary tracking-tight">
                Ranchi riders love CabRush
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} {...fadeUp(i * 0.1)} className="card p-7 relative">
                  <span className="text-4xl text-primary font-serif leading-none">&ldquo;</span>
                  <p className="text-textSecondary text-sm leading-relaxed mt-2 mb-4">{t.text}</p>
                  <p className="font-bold text-textPrimary">{t.name}</p>
                  <p className="text-textMuted text-xs">{t.location}</p>
                  <p className="text-primary mt-2 text-sm">★★★★★</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16 px-6">
          <motion.div {...fadeUp()} className="max-w-container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-accent mb-3">
              Ready to ride smarter?
            </h2>
            <p className="text-textSecondary mb-8">Join Ranchi&apos;s fastest cab booking tool</p>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-8 py-3 rounded-pill font-bold bg-accent text-white hover:bg-accentSoft transition-all duration-300 ease-smooth"
            >
              Start Booking Free
            </button>
          </motion.div>
        </section>
      </div>
      <Footer />
    </>
  );
}
