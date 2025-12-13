import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import Dashboard from './components/Dashboard';
import MatchSetup from './components/MatchSetup';
import Scorer from './components/Scorer';
import AdminDashboard from './components/AdminDashboard';
import MatchCenter from './components/MatchCenter';
import { Shield, Home, Tv, Zap } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

// Navigation Item Component
const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: any; label: string; isActive: boolean }) => (
  <Link to={to} className="relative group">
    <motion.div
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-2xl transition-all duration-300
        ${isActive
          ? 'text-sports-primary'
          : 'text-slate-500 dark:text-sports-muted hover:text-slate-800 dark:hover:text-white'
        }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-sports-primary/10' : 'group-hover:bg-slate-100 dark:group-hover:bg-white/5'}`}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">
        {label}
      </span>
    </motion.div>

    {/* Active Indicator */}
    {isActive && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 md:w-8 md:h-1 bg-sports-primary rounded-full shadow-lg shadow-sports-primary/50"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

// Theme Toggle Button



// Main Layout Component
const Layout = ({ children }: React.PropsWithChildren<{}>) => {
  const location = useLocation();
  const hideNav = ['/scorer', '/live'].includes(location.pathname);




  return (
    <div className="min-h-screen bg-sports-white dark:bg-sports-black text-slate-900 dark:text-white font-sans transition-colors duration-500">
      {/* Fixed Theme Toggle */}



      {/* Navigation */}
      <AnimatePresence>
        {!hideNav && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto safe-area-pb"
          >
            <div className="mx-4 mb-4 md:mb-0 md:mx-0">
              <div className="glass-ultra md:rounded-none rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl md:shadow-lg">
                <div className="container mx-auto px-4 md:px-6 h-20 md:h-16 flex items-center justify-between">
                  {/* Logo - Hidden on mobile, visible on desktop */}
                  <Link to="/" className="hidden md:flex items-center gap-3 group">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-sports-primary to-emerald-400 rounded-xl flex items-center justify-center font-display font-black text-black text-lg shadow-lg shadow-sports-primary/30"
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      OCL
                    </motion.div>
                    <div className="hidden md:block">
                      <span className="font-tech font-bold tracking-[0.2em] text-lg text-slate-800 dark:text-white">
                        OIZOM
                      </span>
                      <span className="block text-[9px] font-bold tracking-[0.3em] text-sports-primary uppercase">
                        CHAMPIONS LEAGUE
                      </span>
                    </div>
                  </Link>

                  {/* Navigation Items - Centered and spaced on mobile */}
                  <div className="flex flex-1 md:flex-none items-center justify-around md:justify-end gap-1 md:gap-2">
                    <NavItem
                      to="/"
                      icon={Home}
                      label="Home"
                      isActive={location.pathname === '/'}
                    />
                    <NavItem
                      to="/live"
                      icon={Tv}
                      label="Live"
                      isActive={location.pathname === '/live'}
                    />
                    <NavItem
                      to="/admin"
                      icon={Shield}
                      label="Admin"
                      isActive={location.pathname === '/admin'}
                    />
                  </div>

                  {/* Status Indicator (Desktop) */}
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-sports-primary"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-sports-muted uppercase tracking-wider">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content with Page Transitions */}
      <main className={!hideNav ? "pb-28 md:pt-20 md:pb-8" : ""}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Main App Component
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