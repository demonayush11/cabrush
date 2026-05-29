import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { showToast } from '../components/Toast.jsx';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const platformBadge = {
  uber: 'bg-accent text-white',
  ola: 'bg-[#00B140] text-white',
  rapido: 'bg-primary text-accent',
};

const statusBadge = {
  confirmed: 'bg-success/15 text-success',
  completed: 'bg-success/15 text-success',
  pending: 'bg-primary/20 text-accent',
  cancelled: 'bg-error/15 text-error',
  failed: 'bg-warning/15 text-warning',
};

const platformLabels = {
  uber: 'Uber',
  ola: 'Ola',
  rapido: 'Rapido',
};

const platformHelp = {
  uber: 'Email or phone used on Uber',
  ola: 'Mobile number used on Ola',
  rapido: 'Mobile number used on Rapido',
};

function formatAction(action) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [accountForm, setAccountForm] = useState({
    uber: { identifier: '', secret: '' },
    ola: { identifier: '', secret: '' },
    rapido: { identifier: '', secret: '' },
  });
  const [savingPlatform, setSavingPlatform] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/user/dashboard'), api.get('/api/user/platform-credentials')])
      .then(([dashboardRes, credentialRes]) => {
        setData(dashboardRes.data);
        setCredentials(credentialRes.data.credentials || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const savePlatformAccount = async (platform) => {
    const form = accountForm[platform];
    if (!form.identifier.trim()) {
      showToast(`${platformLabels[platform]} account number is required`, 'error');
      return;
    }

    setSavingPlatform(platform);
    try {
      const res = await api.put(`/api/user/platform-credentials/${platform}`, {
        identifier: form.identifier.trim(),
        secret: form.secret || undefined,
      });
      setCredentials(res.data.credentials || {});
      setAccountForm((prev) => ({
        ...prev,
        [platform]: { identifier: '', secret: '' },
      }));
      showToast(`${platformLabels[platform]} account saved`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not save account', 'error');
    } finally {
      setSavingPlatform(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const memberSince = data?.user?.created_at
    ? new Date(data.user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

  const latestRide = data?.recentBookings?.find((booking) =>
    ['confirmed', 'completed'].includes(booking.status)
  );
  const connectedCount = Object.values(credentials).filter((item) => item.connected).length;

  return (
    <main className="px-6 pb-20 max-w-container mx-auto pt-10">
      <motion.div {...fadeUp}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary">
          Welcome back, {user?.name?.split(' ')[0] || 'Rider'} 👋
        </h1>
        <p className="text-textSecondary mt-2">Here&apos;s your ride summary</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
        {[
          { label: 'Total Rides', value: stats.totalRides ?? 0, icon: '🚕' },
          { label: 'This Month', value: stats.ridesThisMonth ?? 0, icon: '📅' },
          {
            label: 'Favourite Platform',
            value: stats.favouritePlatform
              ? stats.favouritePlatform.charAt(0).toUpperCase() + stats.favouritePlatform.slice(1)
              : '—',
            icon: '🏆',
          },
          { label: 'Member Since', value: memberSince, icon: '⭐' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
            className="card p-5"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg mb-3">
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-textPrimary">{s.value}</p>
            <p className="text-sm text-textSecondary mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div {...fadeUp} className="lg:col-span-2 card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="section-label mb-2">Latest Ride</p>
              <h2 className="text-2xl font-extrabold text-textPrimary">
                {latestRide
                  ? `${platformLabels[latestRide.platform] || 'Cab'} confirmed`
                  : 'No confirmed ride yet'}
              </h2>
              <p className="text-textSecondary mt-2">
                {latestRide
                  ? `${latestRide.pickup} to ${latestRide.drop}`
                  : 'Your winning ride summary will appear here after booking.'}
              </p>
            </div>
            <div className="bg-surface rounded-card px-5 py-4 min-w-[180px]">
              <p className="text-xs font-semibold uppercase text-textMuted">Arrival</p>
              <p className="text-2xl font-extrabold text-textPrimary mt-1">
                {latestRide?.eta || '--'}
              </p>
              <p className="text-sm text-textSecondary mt-1">
                {latestRide?.driverName || 'Driver details after confirm'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="card p-6">
          <p className="section-label mb-2">Booking Readiness</p>
          <h2 className="text-2xl font-extrabold text-textPrimary">{connectedCount}/3 ready</h2>
          <p className="text-sm text-textSecondary mt-2">
            Add all platform accounts once. CabRush uses them in the background while booking.
          </p>
        </motion.div>
      </div>

      <motion.section {...fadeUp} className="mt-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-textPrimary">Platform Accounts</h2>
            <p className="text-sm text-textSecondary">
              Save the login number or email for each cab app.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Object.keys(platformLabels).map((platform) => {
            const saved = credentials[platform];
            const form = accountForm[platform];
            return (
              <div key={platform} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-textPrimary">{platformLabels[platform]}</h3>
                    <p className="text-xs text-textMuted">
                      {saved?.connected ? `Saved as ${saved.identifier}` : 'Not connected'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-pill text-xs font-bold ${
                      saved?.connected ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {saved?.connected ? 'Ready' : 'Add'}
                  </span>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.identifier}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        [platform]: { ...prev[platform], identifier: e.target.value },
                      }))
                    }
                    placeholder={platformHelp[platform]}
                    className="input-field pl-4"
                  />
                  <input
                    type="password"
                    value={form.secret}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        [platform]: { ...prev[platform], secret: e.target.value },
                      }))
                    }
                    placeholder={platform === 'rapido' ? 'Password or OTP backup, if any' : 'Password'}
                    className="input-field pl-4"
                  />
                  <button
                    type="button"
                    onClick={() => savePlatformAccount(platform)}
                    disabled={savingPlatform === platform}
                    className="btn-primary"
                  >
                    {savingPlatform === platform ? 'Saving...' : 'Save Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Quick book */}
      <motion.div
        {...fadeUp}
        className="mt-8 bg-primary rounded-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-accent">Ready to ride?</h2>
          <p className="text-textSecondary mt-1">Book a cab in seconds</p>
        </div>
        <Link
          to="/home"
          className="inline-flex items-center justify-center px-8 py-3 rounded-pill font-bold bg-accent text-white hover:bg-accentSoft transition-all shrink-0"
        >
          Book Now
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Recent bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Recent Bookings</h2>
            <Link to="/history" className="text-sm font-semibold text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    {['Date', 'Pickup', 'Drop', 'Platform', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-textSecondary">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentBookings || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-textMuted">
                        No bookings yet
                      </td>
                    </tr>
                  ) : (
                    data.recentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-textMuted whitespace-nowrap">
                          {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 max-w-[120px] truncate">{b.pickup}</td>
                        <td className="px-4 py-3 max-w-[120px] truncate">{b.drop}</td>
                        <td className="px-4 py-3">
                          {b.platform ? (
                            <span
                              className={`px-2 py-0.5 rounded-pill text-xs font-semibold capitalize ${
                                platformBadge[b.platform] || 'bg-surface text-textPrimary'
                              }`}
                            >
                              {b.platform}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-pill text-xs font-semibold capitalize ${
                              statusBadge[b.status] || 'bg-surface text-textMuted'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2 className="text-xl font-bold text-textPrimary mb-4">Recent Activity</h2>
          <div className="card p-5 space-y-4">
            {(data?.activityLog || []).length === 0 ? (
              <p className="text-textMuted text-sm">No activity yet</p>
            ) : (
              data.activityLog.slice(0, 8).map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{formatAction(a.action)}</p>
                    <p className="text-xs text-textMuted">
                      {new Date(a.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
