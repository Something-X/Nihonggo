import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, color, delay = 0, to }) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`glass-card p-6 hover:scale-[1.02] transition-transform cursor-pointer group`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-3xl font-black">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">⚙️</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-black">⚙️ Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manajemen konten dan pengguna NihonGO!</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats?.total_users} color="from-primary-500 to-primary-700" delay={0.05} to="/admin/users" />
        <StatCard icon="🟢" label="Aktif Hari Ini" value={stats?.active_today} color="from-green-500 to-emerald-700" delay={0.1} />
        <StatCard icon="📖" label="Total Kotoba" value={stats?.total_kotoba} color="from-sakura-500 to-sakura-700" delay={0.15} to="/admin/kotoba" />
        <StatCard icon="🈴" label="Total Kanji" value={stats?.total_kanji} color="from-nihon-500 to-nihon-700" delay={0.2} to="/admin/kanji" />
        <StatCard icon="🎮" label="Total Games" value={stats?.total_games} color="from-amber-500 to-orange-700" delay={0.25} />
      </div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4">🚀 Aksi Cepat</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/admin/kotoba" className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-sakura-500/50 hover:bg-sakura-500/5 transition-all group">
            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">📖</span>
            <h3 className="font-semibold mt-2">Kelola Kotoba</h3>
            <p className="text-xs text-gray-500 mt-1">Tambah, edit, hapus kosakata</p>
          </Link>
          <Link to="/admin/kanji" className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-nihon-500/50 hover:bg-nihon-500/5 transition-all group">
            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">🈴</span>
            <h3 className="font-semibold mt-2">Kelola Kanji</h3>
            <p className="text-xs text-gray-500 mt-1">Tambah, edit, hapus kanji</p>
          </Link>
          <Link to="/admin/users" className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group">
            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">👥</span>
            <h3 className="font-semibold mt-2">Kelola Users</h3>
            <p className="text-xs text-gray-500 mt-1">Manajemen pengguna</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
