import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19] relative overflow-hidden font-sans">
      
      {/* Animated Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-sakura-500/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
            className="text-5xl font-black mb-3 tracking-tight"
          >
            <span className="bg-gradient-to-r from-sakura-400 via-pink-300 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">
              🎌 NihonGO!
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gray-400 font-medium tracking-wide"
          >
            日本語を楽しく学ぼう！
          </motion.p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">ログイン (Masuk)</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-primary-400" />
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-400 focus:bg-white/10 focus:ring-4 focus:ring-primary-400/10 outline-none transition-all duration-300"
                  placeholder="email@example.com" 
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-primary-400" />
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-400 focus:bg-white/10 focus:ring-4 focus:ring-primary-400/10 outline-none transition-all duration-300"
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button 
              type="submit" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-sakura-500 hover:from-primary-400 hover:to-sakura-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>🚀 Masuk</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-400 text-sm mt-8">
            Belum punya akun?{' '}
            <Link to="/register" className="text-sakura-400 hover:text-sakura-300 font-bold transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-gray-500">
          <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            Demo: riko@nihongo.com
          </span>
          <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            Admin: admin@nihongo.com
          </span>
        </div>
      </motion.div>
    </div>
  );
}