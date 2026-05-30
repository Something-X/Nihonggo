import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../stores';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/quiz', icon: '🎮', label: 'Quiz' },
  { to: '/sentence', icon: '📝', label: 'Kalimat' },
  { to: '/library', icon: '📚', label: 'Perpustakaan' },
  { to: '/achievements', icon: '🏆', label: 'Achievement' },
  { to: '/leaderboard', icon: '🏅', label: 'Leaderboard' },
  { to: '/profile', icon: '👤', label: 'Profil' },
];

const adminItems = [
  { to: '/admin', icon: '⚙️', label: 'Admin' },
  { to: '/admin/kotoba', icon: '📖', label: 'Kotoba' },
  { to: '/admin/kanji', icon: '🈴', label: 'Kanji' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const [sideOpen, setSideOpen] = useState(false);
  const nav = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    logout();
    nav('/login');
    toast.success('Logout berhasil!');
  };

  const SideContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-black bg-gradient-to-r from-sakura-400 to-primary-400 bg-clip-text text-transparent">
          🎌 NihonGO!
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">日本語を学ぼう</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={() => setSideOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`
            }>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.to} to={item.to} end onClick={() => setSideOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-nihon-500/10 text-nihon-600 dark:text-nihon-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`
                }>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sakura-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">Lv.{user?.level} • {user?.xp} XP</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-sm text-gray-500 hover:text-nihon-500 transition-colors py-2 rounded-lg hover:bg-nihon-50 dark:hover:bg-nihon-500/10">
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col glass-card rounded-none border-r border-gray-200 dark:border-white/10">
        <SideContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-white dark:bg-dark-850 shadow-2xl lg:hidden">
              <SideContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 glass border-b border-gray-200 dark:border-white/10">
          <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {/* Streak */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-semibold">
              🔥 {user?.streak?.current_streak || 0}
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-semibold">
              ⭐ {user?.xp || 0}
            </div>

            {/* Dark mode */}
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-lg">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
