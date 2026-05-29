import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { showToast } from './Toast.jsx';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalTab,
    closeAuthModal,
    setAuthModalTab,
    login,
  } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setErrors({});
    setFormError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const validate = () => {
    const e = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (authModalTab === 'signup' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (authModalTab === 'signup' && form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      if (authModalTab === 'login') {
        const payload = {
          email: form.email,
          password: form.password,
        };
        console.log('[auth-modal] login payload:', payload);
        const res = await api.post('/api/auth/login', payload);
        login(res.data.user, res.data.token);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        };
        console.log('[auth-modal] signup payload:', payload);
        const res = await api.post('/api/auth/signup', payload);
        login(res.data.user, res.data.token);
        showToast('Welcome to CabRush!', 'success');
      }
      handleClose();
      navigate('/home');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const switchTab = (tab) => {
    setAuthModalTab(tab);
    setErrors({});
    setFormError('');
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-[0_24px_80px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-textMuted hover:bg-surface hover:text-textPrimary transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl text-primary">⚡</span>
              <span className="text-xl font-extrabold text-textPrimary">CabRush</span>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-surface rounded-pill">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all ${
                  authModalTab === 'login' ? 'bg-primary text-accent' : 'text-textSecondary'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all ${
                  authModalTab === 'signup' ? 'bg-primary text-accent' : 'text-textSecondary'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authModalTab === 'signup' && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field !pl-4"
                  />
                  {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field !pl-4"
                />
                {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
              </div>

              {authModalTab === 'signup' && (
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field !pl-4"
                  />
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field !pl-4 !pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
              </div>

              {authModalTab === 'signup' && (
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="input-field !pl-4"
                  />
                  {errors.confirmPassword && (
                    <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {authModalTab === 'login' && (
                <p className="text-right text-sm text-textSecondary">
                  <button type="button" className="hover:text-textPrimary">
                    Forgot Password?
                  </button>
                </p>
              )}

              {formError && (
                <p className="rounded-input border border-error/30 bg-error/5 px-4 py-3 text-sm font-semibold text-error">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="h-4 w-4 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
                )}
                {submitting
                  ? 'Please wait...'
                  : authModalTab === 'login'
                  ? 'Login'
                  : 'Create Account'}
              </button>
            </form>

            {authModalTab === 'login' && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-textMuted text-sm">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-center text-sm text-textSecondary">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchTab('signup')}
                    className="font-semibold text-textPrimary hover:text-primary"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {authModalTab === 'signup' && (
              <p className="text-center text-sm text-textSecondary mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-semibold text-textPrimary hover:text-primary"
                >
                  Login
                </button>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
