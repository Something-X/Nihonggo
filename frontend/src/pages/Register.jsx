import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/register', form);
      setAuth(data.user, data.token);
      toast.success(`ようこそ、${data.user.name}！`);
      nav('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors;
      if (msg) Object.values(msg).flat().forEach((m) => toast.error(m));
      else toast.error('Registrasi gagal');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-900 via-sakura-900/20 to-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-sakura-500/20 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-primary-400 via-sakura-400 to-nihon-400 bg-clip-text text-transparent">🎌 NihonGO!</span>
          </h1>
          <p className="text-gray-400 text-sm">新しい冒険を始めよう！</p>
        </div>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">登録 — Daftar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Nama</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-sakura-400 focus:ring-2 focus:ring-sakura-400/20 outline-none transition-all"
                placeholder="Nama lengkap" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-sakura-400 focus:ring-2 focus:ring-sakura-400/20 outline-none transition-all"
                placeholder="email@example.com" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-sakura-400 focus:ring-2 focus:ring-sakura-400/20 outline-none transition-all"
                placeholder="Min 6 karakter" required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Konfirmasi Password</label>
              <input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-sakura-400 focus:ring-2 focus:ring-sakura-400/20 outline-none transition-all"
                placeholder="Ulangi password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-sakura disabled:opacity-50 text-lg py-3.5">
              {loading ? '⏳ Loading...' : '✨ Daftar Sekarang'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Sudah punya akun? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Masuk</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
