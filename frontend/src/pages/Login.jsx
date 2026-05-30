import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/login', form);
      setAuth(data.user, data.token);
      toast.success(`おかえり、${data.user.name}！`);
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-900 via-primary-900/30 to-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sakura-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-sakura-400 via-pink-400 to-primary-400 bg-clip-text text-transparent">🎌 NihonGO!</span>
          </motion.h1>
          <p className="text-gray-400 text-sm">日本語を楽しく学ぼう！</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">ログイン</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all"
                placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary disabled:opacity-50 text-lg py-3.5">
              {loading ? '⏳ Loading...' : '🚀 Masuk'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Belum punya akun? <Link to="/register" className="text-sakura-400 hover:text-sakura-300 font-semibold">Daftar</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Demo: riko@nihongo.com / password</p>
          <p>Admin: admin@nihongo.com / password</p>
        </div>
      </motion.div>
    </div>
  );
}
