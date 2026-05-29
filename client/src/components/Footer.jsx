import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { openAuthModal, isAuthenticated } = useAuth();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = `/#${id}`;
  };

  return (
    <footer className="bg-accent text-white mt-auto">
      <div className="max-w-container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-extrabold">CabRush</span>
            </div>
            <p className="text-[#888888] text-sm leading-relaxed">
              Ranchi&apos;s fastest cab booking tool
            </p>
            <p className="text-[#888888] text-sm mt-3">Made with ❤️ in Ranchi</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-[#888888]">
              <li>
                <button type="button" onClick={() => scrollTo('how-it-works')} className="hover:text-white">
                  How It Works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('platforms')} className="hover:text-white">
                  Platforms
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('features')} className="hover:text-white">
                  Features
                </button>
              </li>
              <li>
                <Link to={isAuthenticated ? '/home' : '/'} className="hover:text-white">
                  Book a Ride
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-[#888888]">
              <li>
                <button type="button" onClick={() => openAuthModal('login')} className="hover:text-white">
                  Login
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openAuthModal('signup')} className="hover:text-white">
                  Sign Up
                </button>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Info</h4>
            <ul className="space-y-2 text-sm text-[#888888]">
              <li><span>About CabRush</span></li>
              <li><span>Privacy Policy</span></li>
              <li><span>Terms of Use</span></li>
              <li><span>Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#333333] flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px] text-[#888888]">
          <span>© 2024 CabRush. All rights reserved.</span>
          <span>Ranchi Only 🟡</span>
        </div>
      </div>
    </footer>
  );
}
