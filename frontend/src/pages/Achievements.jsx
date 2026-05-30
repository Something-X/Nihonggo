import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Achievements() {
  const { data } = useQuery({ queryKey: ['achievements'], queryFn: () => api.get('/achievements').then(r => r.data) });

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold">🏆 Achievements</h1>
        <p className="text-gray-500 mt-1">Kumpulkan semua pencapaian!</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass-card p-5 transition-all ${a.unlocked ? 'border-2 border-yellow-500/30 bg-yellow-500/5' : 'opacity-60 grayscale'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{a.icon}</span>
              <div>
                <h3 className="font-bold">{a.name}</h3>
                <p className="text-xs text-gray-500">{a.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary-500 font-semibold">+{a.xp_reward} XP</span>
              {a.unlocked ? (
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-semibold">✅ Unlocked</span>
              ) : (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">🔒 Locked</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
