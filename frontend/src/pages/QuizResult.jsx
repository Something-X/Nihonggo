import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizStore } from '../stores';

export default function QuizResult() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { score, maxCombo, answers, session, reset } = useQuizStore();

  const total = score.correct + score.wrong;
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;
  const xp = state?.xp_earned || 0;
  const breakdown = state?.xp_breakdown || {};
  const achievements = state?.new_achievements || [];

  const handlePlayAgain = () => { reset(); nav('/quiz'); };
  const handleDashboard = () => { reset(); nav('/dashboard'); };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Victory banner */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
        className="glass-card p-8 text-center bg-gradient-to-br from-primary-500/10 via-sakura-500/10 to-nihon-500/10">
        <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
          className="text-7xl mb-4">
          {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
        </motion.div>
        <h1 className="text-3xl font-black mb-2">
          {accuracy >= 90 ? 'PERFECT!' : accuracy >= 70 ? 'すごい！' : accuracy >= 50 ? 'がんばった！' : 'もっと練習しよう！'}
        </h1>
        <p className="text-gray-500">{session?.burn_mode ? '🔥 Burn Mode' : ''} Quiz Selesai!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5 text-center">
          <p className="text-4xl font-black text-green-500">{score.correct}</p>
          <p className="text-sm text-gray-500">Benar ✅</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-5 text-center">
          <p className="text-4xl font-black text-nihon-500">{score.wrong}</p>
          <p className="text-sm text-gray-500">Salah ❌</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card p-5 text-center">
          <p className="text-4xl font-black text-primary-500">{accuracy}%</p>
          <p className="text-sm text-gray-500">Akurasi 📊</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="glass-card p-5 text-center">
          <p className="text-4xl font-black text-orange-500">{maxCombo}x</p>
          <p className="text-sm text-gray-500">Max Combo 🔥</p>
        </motion.div>
      </div>

      {/* XP Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="glass-card p-6">
        <h3 className="font-bold mb-3">⭐ XP Earned</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Base XP</span><span className="font-semibold">+{breakdown.base || 0}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Combo Bonus</span><span className="font-semibold text-orange-500">+{breakdown.combo_bonus || 0}</span></div>
          {breakdown.burn_bonus > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">🔥 Burn Bonus</span><span className="font-semibold text-nihon-500">+{breakdown.burn_bonus}</span></div>
          )}
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-black text-primary-500">+{xp} XP</span></div>
        </div>
        {state?.new_level && <p className="mt-2 text-sm text-sakura-500 font-semibold">📈 Level: {state.new_level}</p>}
      </motion.div>

      {/* New Achievements */}
      {achievements.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
          className="glass-card p-6 border-2 border-yellow-500/30 bg-yellow-500/5">
          <h3 className="font-bold mb-3">🏅 Achievement Unlocked!</h3>
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 mb-2">
              <span className="text-3xl">{a.icon}</span>
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="text-xs text-gray-500">{a.description} • +{a.xp_reward} XP</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handlePlayAgain} className="flex-1 btn-primary text-center">🎮 Main Lagi</button>
        <button onClick={handleDashboard} className="flex-1 btn-sakura text-center">📊 Dashboard</button>
      </div>
    </div>
  );
}
