import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuthStore } from '../stores';

const StatCard = ({ icon, label, value, sub, color = 'primary' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${color}-100 dark:bg-${color}-500/20 text-${color}-600 dark:text-${color}-400`}>{sub}</span>
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard').then(r => r.data) });
  const { data: progress } = useQuery({ queryKey: ['progress'], queryFn: () => api.get('/stats/progress').then(r => r.data) });
  const { data: accuracy } = useQuery({ queryKey: ['accuracy'], queryFn: () => api.get('/stats/accuracy').then(r => r.data) });
  const { data: quests } = useQuery({ queryKey: ['quests'], queryFn: () => api.get('/quests/daily').then(r => r.data) });

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin text-4xl">🌸</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-primary-500/10 via-sakura-500/10 to-nihon-500/10">
        <h2 className="text-2xl font-bold">おかえり、{stats.user.name}！👋</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Level {stats.user.level} • {stats.user.xp} XP • 🔥 Streak {stats.streak.current} hari
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.overall_percentage}%` }} transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-500 to-sakura-500 rounded-full" />
          </div>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{stats.overall_percentage}%</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📖" label="Kotoba Dihafal" value={stats.kotoba.learned} sub={`/ ${stats.kotoba.total}`} />
        <StatCard icon="🈴" label="Kanji Dihafal" value={stats.kanji.learned} sub={`/ ${stats.kanji.total}`} color="sakura" />
        <StatCard icon="✅" label="Total Benar" value={stats.user.total_correct} sub={`${stats.user.accuracy}%`} />
        <StatCard icon="🎮" label="Game Dimainkan" value={stats.games_played} sub={`Lv.${stats.user.level}`} color="nihon" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">📈 Progress Harian</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={progress || []}>
                <defs>
                  <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f06595" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f06595" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a1b2e', border: '1px solid #374151', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="correct" stroke="#5c7cfa" fillOpacity={1} fill="url(#colorCorrect)" name="Benar" />
                <Area type="monotone" dataKey="xp" stroke="#f06595" fillOpacity={1} fill="url(#colorXp)" name="XP" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Accuracy Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">🎯 Akurasi Jawaban</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={accuracy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1b2e', border: '1px solid #374151', borderRadius: 12 }} labelStyle={{ color: '#fff' }} />
                <Bar dataKey="accuracy" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Akurasi %" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5c7cfa" />
                    <stop offset="100%" stopColor="#f06595" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Daily Quests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">📋 Quest Harian</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {(quests || []).map((q, i) => (
            <div key={i} className={`p-4 rounded-xl border ${q.completed ? 'border-green-500/30 bg-green-500/5' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{q.description}</span>
                {q.completed && <span className="text-green-500">✅</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-sakura-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (q.current_value / q.target_value) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500">{q.current_value}/{q.target_value}</span>
              </div>
              <p className="text-xs text-primary-500 mt-1">+{q.xp_reward} XP</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Mastery Overview */}
      <div className="grid sm:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">📖 Kotoba Progress</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-gray-700" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#kotobaGrad)" strokeWidth="3"
                  strokeDasharray={`${stats.kotoba.total > 0 ? (stats.kotoba.learned / stats.kotoba.total) * 100 : 0}, 100`} strokeLinecap="round" />
                <defs><linearGradient id="kotobaGrad"><stop offset="0%" stopColor="#5c7cfa" /><stop offset="100%" stopColor="#f06595" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {stats.kotoba.total > 0 ? Math.round((stats.kotoba.learned / stats.kotoba.total) * 100) : 0}%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dipelajari: <strong>{stats.kotoba.learned}</strong></p>
              <p className="text-sm text-gray-500">Mastered: <strong>{stats.kotoba.mastered}</strong></p>
              <p className="text-sm text-gray-500">Rata-rata: <strong>{stats.kotoba.avg_point} poin</strong></p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">🈴 Kanji Progress</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-gray-700" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#kanjiGrad)" strokeWidth="3"
                  strokeDasharray={`${stats.kanji.total > 0 ? (stats.kanji.learned / stats.kanji.total) * 100 : 0}, 100`} strokeLinecap="round" />
                <defs><linearGradient id="kanjiGrad"><stop offset="0%" stopColor="#f06595" /><stop offset="100%" stopColor="#ff6b6b" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {stats.kanji.total > 0 ? Math.round((stats.kanji.learned / stats.kanji.total) * 100) : 0}%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dipelajari: <strong>{stats.kanji.learned}</strong></p>
              <p className="text-sm text-gray-500">Mastered: <strong>{stats.kanji.mastered}</strong></p>
              <p className="text-sm text-gray-500">Rata-rata: <strong>{stats.kanji.avg_point} poin</strong></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
