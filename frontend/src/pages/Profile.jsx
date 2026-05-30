import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const { data: history } = useQuery({ queryKey: ['history'], queryFn: () => api.get('/quiz/history').then(r => r.data) });
  const { data: streak } = useQuery({ queryKey: ['streak'], queryFn: () => api.get('/streak').then(r => r.data) });

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/user/profile', { name });
      setUser({ ...user, name: data.name });
      toast.success('Profil diperbarui!');
    } catch { toast.error('Gagal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">👤 Profil</h1>
      </motion.div>

      {/* Profile card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sakura-400 to-primary-500 flex items-center justify-center text-white text-3xl font-black shadow-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className="flex gap-3 mt-1 text-sm">
              <span className="text-primary-500 font-semibold">Lv.{user?.level}</span>
              <span className="text-sakura-500 font-semibold">⭐ {user?.xp} XP</span>
              <span className="text-orange-500 font-semibold">🔥 {streak?.current_streak || 0} hari</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <button onClick={save} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? '⏳' : '💾 Simpan'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{user?.total_correct || 0}</p>
          <p className="text-xs text-gray-500">Total Benar</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-nihon-500">{user?.total_wrong || 0}</p>
          <p className="text-xs text-gray-500">Total Salah</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{streak?.longest_streak || 0}</p>
          <p className="text-xs text-gray-500">Longest Streak</p>
        </div>
      </div>

      {/* History */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4">📜 Riwayat Bermain</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {(history || []).map((g, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-800">
              <span className="text-2xl">{g.mode === 'kotoba' ? '📖' : g.mode === 'kanji' ? '🈴' : g.mode === 'sentence' ? '📝' : '🎯'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize">{g.mode} {g.burn_mode ? '🔥' : ''}</p>
                <p className="text-xs text-gray-500">✅{g.correct_answers} ❌{g.wrong_answers} • Combo {g.max_combo}x</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary-500">+{g.xp_earned} XP</p>
                <p className="text-xs text-gray-500">{new Date(g.played_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          ))}
          {(!history || history.length === 0) && <p className="text-gray-500 text-sm text-center">Belum ada riwayat bermain</p>}
        </div>
      </div>
    </div>
  );
}
