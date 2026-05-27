import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `nav-link ${location.pathname === path ? 'nav-link-active' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-nav">
      <nav className="flex items-center justify-between h-nav px-6 max-w-container mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl text-primary" aria-hidden>
            ⚡
          </span>
          <span className="text-xl font-extrabold text-textPrimary tracking-tight">CabRush</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <Link to="/" className={linkClass('/')}>
            Home
          </Link>
          <Link to="/history" className={linkClass('/history')}>
            History
          </Link>
          <span className="ml-2 badge-ranchi hidden sm:inline-flex">Ranchi Only</span>
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1A1A1A',
              border: '1px solid #EEEEEE',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              fontSize: '15px',
            },
            success: {
              iconTheme: { primary: '#F5C518', secondary: '#1A1A1A' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
