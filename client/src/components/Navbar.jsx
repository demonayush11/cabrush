import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ variant = 'app' }) {
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const linkClass = (path) =>
    `nav-link ${location.pathname === path ? 'nav-link-active' : ''}`;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-smooth border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-[10px] shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-border'
          : 'bg-white border-border'
      }`}
    >
      <nav className="flex items-center justify-between h-nav px-4 md:px-6 max-w-container mx-auto">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl text-primary">⚡</span>
          <span className="text-xl font-extrabold text-textPrimary tracking-tight">CabRush</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {!isAuthenticated ? (
            <>
              <Link to="/" className={linkClass('/')}>
                Home
              </Link>
              <button type="button" onClick={() => scrollTo('how-it-works')} className="nav-link">
                How It Works
              </button>
              <button type="button" onClick={() => scrollTo('platforms')} className="nav-link">
                Platforms
              </button>
              <button type="button" onClick={() => scrollTo('features')} className="nav-link">
                Features
              </button>
            </>
          ) : (
            <>
              <Link to="/home" className={linkClass('/home')}>
                Home
              </Link>
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/history" className={linkClass('/history')}>
                History
              </Link>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="badge-ranchi hidden sm:inline-flex">Ranchi Only</span>

          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden sm:inline-flex px-4 py-2 rounded-pill text-sm font-semibold border-2 border-accent text-accent hover:bg-surface transition-all"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-pill text-sm font-bold bg-primary text-accent shadow-btn hover:bg-primaryDark transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full border border-border text-textSecondary hover:bg-surface"
                aria-label="Notifications"
              >
                🔔
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-primary text-accent font-bold text-sm flex items-center justify-center"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-card shadow-cardHover py-2 z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-textPrimary hover:bg-surface"
                    >
                      👤 My Dashboard
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-textPrimary hover:bg-surface"
                    >
                      📋 My Bookings
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-textMuted hover:bg-surface"
                    >
                      ⚙️ Settings
                    </button>
                    <hr className="my-1 border-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
