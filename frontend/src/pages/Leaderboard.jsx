import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../stores';

export default function Leaderboard() {
  const { user } = useAuthStore();
  const { data } = useQuery({ queryKey: ['leaderboard'], queryFn: () => api.get('/leaderboard').then(r => r.data) });

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold">🏅 Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top learners berdasarkan XP</p>
      </motion.div>

      <div className="space-y-3">
        {(data || []).map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 flex items-center gap-4 ${u.id === user?.id ? 'border-2 border-primary-500/30 bg-primary-500/5' : ''}`}>
            <div className="w-10 text-center font-black text-lg">
              {i < 3 ? <span className="text-2xl">{medals[i]}</span> : <span className="text-gray-500">#{i + 1}</span>}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sakura-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{u.name} {u.id === user?.id && <span className="text-xs text-primary-500">(Kamu)</span>}</p>
              <p className="text-xs text-gray-500">Lv.{u.level} • {u.total_correct} jawaban benar</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary-500">{u.xp}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
