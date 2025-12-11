import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import Dashboard from './components/Dashboard';
import MatchSetup from './components/MatchSetup';
import Scorer from './components/Scorer';
import AdminDashboard from './components/AdminDashboard';
import MatchCenter from './components/MatchCenter';
import { Shield, Home, Tv, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }: React.PropsWithChildren<{}>) => {
  const location = useLocation();
  const hideNav = ['/scorer', '/live'].includes(location.pathname);
  
  // Theme Toggle Logic
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('oizom_theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('oizom_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-sports-white dark:bg-sports-black text-slate-900 dark:text-white selection:bg-sports-primary selection:text-black font-sans transition-colors duration-300">
      <div className="fixed top-4 right-4 z-[100]">
        <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-sports-surface shadow-lg border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:scale-110 transition-transform"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-sports-black/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/5 md:top-0 md:bottom-auto md:border-t-0 md:border-b transition-colors duration-300">
           <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sports-primary rounded flex items-center justify-center font-display font-bold text-black text-xl shadow-neon">OZ</div>
                  <span className="hidden md:block font-tech font-bold tracking-wider text-lg text-slate-900 dark:text-white">CHAMPIONSHIP</span>
              </div>
              
              <div className="flex items-center gap-6">
                  <Link to="/" className={`p-2 transition-colors ${location.pathname === '/' ? 'text-sports-primary' : 'text-slate-500 dark:text-sports-muted hover:text-slate-900 dark:hover:text-white'}`}>
                      <Home size={24} />
                  </Link>
                  <Link to="/live" className={`p-2 transition-colors ${location.pathname === '/live' ? 'text-sports-primary' : 'text-slate-500 dark:text-sports-muted hover:text-slate-900 dark:hover:text-white'}`}>
                      <Tv size={24} />
                  </Link>
                  <Link to="/admin" className={`p-2 transition-colors ${location.pathname === '/admin' ? 'text-sports-primary' : 'text-slate-500 dark:text-sports-muted hover:text-slate-900 dark:hover:text-white'}`}>
                      <Shield size={24} />
                  </Link>
              </div>
           </div>
        </nav>
      )}
      <div className={!hideNav ? "pb-20 md:pt-20 md:pb-0" : ""}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <TournamentProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/setup" element={<MatchSetup />} />
            <Route path="/scorer" element={<Scorer />} />
            <Route path="/live" element={<MatchCenter />} />
          </Routes>
        </Layout>
      </HashRouter>
    </TournamentProvider>
  );
}

export default App;