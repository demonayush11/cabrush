import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg transition-all duration-300 ${
      location.pathname === path
        ? 'bg-white/10 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl">⚡</span>
        <span className="text-xl font-bold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">
          CabRush
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link to="/" className={linkClass('/')}>
          Home
        </Link>
        <Link to="/history" className={linkClass('/history')}>
          History
        </Link>
        <span className="ml-2 px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
          Ranchi Only
        </span>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
