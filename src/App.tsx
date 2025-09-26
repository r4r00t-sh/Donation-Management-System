import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Receipt, Users, Printer, CreditCard, BarChart2, Settings as SettingsIcon, LogIn } from 'lucide-react';
import './App.css';
import ReceiptsPage from './pages/Receipts';
import ReportsPage from './pages/Reports';
import LoginPage from './pages/Login';
import SettingsPage from './pages/Settings';
import PushpanjaliPage from './pages/Donate';
import ThemeSelector from './components/ThemeSelector';
import { User } from './types/user';
import RegisterPage from './pages/Register';
import SupportPage from './pages/Support';
import TicketsPage from './pages/Tickets';
import StaffTicketsPage from './pages/StaffTickets';
import logo from './logo.png';
import { useRef } from 'react';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import ProfilePage from './pages/Profile';

const navItems = [
  { to: '/', label: 'Home', icon: <Receipt className="inline w-5 h-5 mr-1" /> },
  // { to: '/pushpanjali', label: 'Book Pushpanjali', icon: <CreditCard className="inline w-5 h-5 mr-1" /> }, // Will be conditionally shown
  { to: '/receipts', label: 'Receipts', icon: <Printer className="inline w-5 h-5 mr-1" /> },
  { to: '/reports', label: 'Reports', icon: <BarChart2 className="inline w-5 h-5 mr-1" /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon className="inline w-5 h-5 mr-1" /> },
  { to: '/support', label: 'Support', icon: <Users className="inline w-5 h-5 mr-1" /> },
  { to: '/tickets', label: 'Tickets', icon: <Printer className="inline w-5 h-5 mr-1" /> },
  { to: '/staff-tickets', label: 'Staff Tickets', icon: <Printer className="inline w-5 h-5 mr-1" /> },
  { to: '/login', label: 'Login', icon: <LogIn className="inline w-5 h-5 mr-1" /> },
  { to: '/register', label: 'Register', icon: <Users className="inline w-5 h-5 mr-1" /> },
];  

const STORAGE_USER_KEY = 'ashram-user';

function App() {
  const [user, setUser] = React.useState<User | null>(() => {
    const data = localStorage.getItem(STORAGE_USER_KEY);
    return data ? JSON.parse(data) : null;
  });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [logoutRedirect, setLogoutRedirect] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function handleLogin(u: User) {
    setUser(u);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
  }
  function handleLogout() {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    setLogoutRedirect(true);
  }

  // Restrict public user to only /pushpanjali
  function isPublicOnlyRoute(path: string) {
    return path === '/pushpanjali';
  }

  return (
    <Router>
      {logoutRedirect && <Navigate to="/login" replace />}
      <div className="min-h-screen bg-ashram-light flex flex-col">
        <nav className="bg-white/90 shadow flex items-center px-4 py-2 gap-2 relative">
          <Link to="/" className="mr-4 flex items-center">
            <img src={logo} alt="Santhigiri Ashram Logo" className="h-10 w-auto" />
          </Link>
          {/* Hamburger for mobile/tablet */}
          <button
            className="md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-ashram-primary"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
          </button>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            {!user ? (
              <>
                <Link to="/" className="text-ashram-primary hover:text-ashram-accent px-2 py-1 rounded transition flex items-center">
                  <Receipt className="inline w-5 h-5 mr-1" /> Home
                </Link>
                <Link to="/login" className="text-ashram-primary hover:text-ashram-accent px-2 py-1 rounded transition flex items-center">
                  <LogIn className="inline w-5 h-5 mr-1" /> Login
                </Link>
                <Link to="/register" className="text-ashram-primary hover:text-ashram-accent px-2 py-1 rounded transition flex items-center">
                  <Users className="inline w-5 h-5 mr-1" /> Register
                </Link>
                <ThemeSelector />
              </>
            ) : (
              <>
                {navItems.filter(item => {
                  if (item.to === '/login' || item.to === '/register') return !user;
                  // Only show Book Pushpanjali if logged in and not staff
                  if (item.to === '/pushpanjali') return user && user.role !== 'staff';
                  if (user && user.role === 'public') {
                    return item.to === '/pushpanjali';
                  }
                  if (user && user.role === 'staff') {
                    // Staff: only allow receipts, tickets, staff-tickets, reports, settings
                    return ['/receipts', '/tickets', '/staff-tickets', '/reports', '/settings'].includes(item.to);
                  }
                  if (item.to === '/receipts' || item.to === '/reports') return user;
                  if (item.to === '/support') return user && user.role === 'public';
                  if (item.to === '/tickets') return user && (user.role === 'admin' || user.role === 'staff');
                  if (item.to === '/staff-tickets') return user && user.role === 'staff';
                  return true;
                }).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-ashram-primary hover:text-ashram-accent px-2 py-1 rounded transition flex items-center"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <Link to="/profile" className="text-ashram-primary hover:text-ashram-accent px-2 py-1 rounded transition flex items-center">Profile</Link>
                <ThemeSelector />
                <button onClick={handleLogout} className="ml-auto bg-ashram-accent text-white px-3 py-1 rounded hover:bg-ashram-primary transition">Logout</button>
              </>
            )}
          </div>
          {/* Mobile/tablet dropdown menu */}
          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 w-full bg-white shadow-lg z-50 flex flex-col md:hidden animate-fade-in"
            >
              {!user ? (
                <>
                  <Link to="/" className="text-ashram-primary hover:text-ashram-accent px-4 py-3 border-b flex items-center" onClick={() => setMenuOpen(false)}>
                    <Receipt className="inline w-5 h-5 mr-2" /> Home
                  </Link>
                  <Link to="/login" className="text-ashram-primary hover:text-ashram-accent px-4 py-3 border-b flex items-center" onClick={() => setMenuOpen(false)}>
                    <LogIn className="inline w-5 h-5 mr-2" /> Login
                  </Link>
                  <Link to="/register" className="text-ashram-primary hover:text-ashram-accent px-4 py-3 border-b flex items-center" onClick={() => setMenuOpen(false)}>
                    <Users className="inline w-5 h-5 mr-2" /> Register
                  </Link>
                  <div className="px-4 py-3 border-b"><ThemeSelector /></div>
                </>
              ) : (
                <>
                  {navItems.filter(item => {
                    if (item.to === '/login' || item.to === '/register') return !user;
                    if (item.to === '/pushpanjali') return user && user.role !== 'staff';
                    if (user && user.role === 'public') {
                      return item.to === '/pushpanjali';
                    }
                    if (user && user.role === 'staff') {
                      return ['/receipts', '/tickets', '/staff-tickets', '/reports', '/settings'].includes(item.to);
                    }
                    if (item.to === '/receipts' || item.to === '/reports') return user;
                    if (item.to === '/support') return user && user.role === 'public';
                    if (item.to === '/tickets') return user && (user.role === 'admin' || user.role === 'staff');
                    if (item.to === '/staff-tickets') return user && user.role === 'staff';
                    return true;
                  }).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-ashram-primary hover:text-ashram-accent px-4 py-3 border-b flex items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <Link to="/profile" className="text-ashram-primary hover:text-ashram-accent px-4 py-3 border-b flex items-center" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <div className="px-4 py-3 border-b"><ThemeSelector /></div>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="bg-ashram-accent text-white px-3 py-2 rounded hover:bg-ashram-primary transition mx-4 my-2">Logout</button>
                </>
              )}
            </div>
          )}
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Routes>
            <Route path="/" element={user && user.role === 'public' ? <Navigate to="/pushpanjali" replace /> : <HomePage />} />
            <Route path="/pushpanjali" element={user && user.role !== 'staff' ? <PushpanjaliPage /> : <Navigate to="/receipts" replace />} />
            <Route path="/receipts" element={user && user.role !== 'public' ? <ReceiptsPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/reports" element={user && user.role !== 'public' ? <ReportsPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/settings" element={user && user.role !== 'public' ? <SettingsPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/support" element={user && user.role === 'public' ? <SupportPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/tickets" element={user && (user.role === 'admin' || user.role === 'staff') ? <TicketsPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/staff-tickets" element={user && user.role === 'staff' ? <StaffTicketsPage /> : <Navigate to="/pushpanjali" replace />} />
            <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to={user && user.role === 'public' ? '/pushpanjali' : '/'} replace />} />
          </Routes>
        </main>
        <footer className="mt-8 text-xs text-ashram-accent text-center pb-2">
          &copy; {new Date().getFullYear()} Santhigiri Ashram. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="max-w-xl w-full bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-4">
        <Receipt className="w-10 h-10 text-ashram-primary" />
        <h1 className="text-3xl font-bold text-ashram-primary tracking-tight">Santhigiri Ashram<br />Receipt Management</h1>
      </div>
      <p className="text-lg text-ashram-accent mb-6 text-center">
        A modern, digital system for generating, managing, and tracking donation receipts.<br />
        Supports multiple payment methods and easy printing.
      </p>
      <div className="flex flex-wrap gap-6 justify-center mb-6 w-full">
        <div className="flex-1 flex flex-col items-center min-w-[100px]">
          <CreditCard className="w-8 h-8 text-ashram-pink mb-1 mx-auto" />
          <span className="text-xs text-ashram-primary font-medium text-center">Card/UPI</span>
        </div>
        <div className="flex-1 flex flex-col items-center min-w-[100px]">
          <Printer className="w-8 h-8 text-ashram-accent mb-1 mx-auto" />
          <span className="text-xs text-ashram-primary font-medium text-center">Receipt Printing</span>
        </div>
        <div className="flex-1 flex flex-col items-center min-w-[100px]">
          <Users className="w-8 h-8 text-ashram-pink mb-1 mx-auto" />
          <span className="text-xs text-ashram-primary font-medium text-center">User Management</span>
        </div>
      </div>
      <Link
        to="/receipts"
        className="inline-block bg-ashram-primary text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-ashram-accent transition"
      >
        Get Started
      </Link>
    </div>
  );
}

export default App;
