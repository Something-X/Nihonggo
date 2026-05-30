import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'reset'|'ban', user }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get(`/admin/users?page=${page}`).then(r => r.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/admin/users/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User diupdate!'); },
    onError: () => toast.error('Gagal mengupdate'),
  });
  const resetMut = useMutation({
    mutationFn: (id) => api.post(`/admin/users/${id}/reset`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmAction(null); toast.success('Progress direset!'); },
    onError: () => toast.error('Gagal mereset'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmAction(null); toast.success('User dihapus!'); },
    onError: () => toast.error('Gagal menghapus'),
  });

  const toggleBan = (user) => {
    updateMut.mutate({ id: user.id, payload: { is_banned: !user.is_banned } });
  };
  const toggleRole = (user) => {
    updateMut.mutate({ id: user.id, payload: { role: user.role === 'admin' ? 'user' : 'admin' } });
  };

  const filtered = data?.data?.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const confirmTexts = {
    delete: { icon: '⚠️', title: 'Hapus User?', desc: 'Semua data user termasuk progress akan dihapus permanen.', btn: '🗑️ Hapus', color: 'btn-danger' },
    reset: { icon: '🔄', title: 'Reset Progress?', desc: 'Semua progress belajar user akan direset ke awal.', btn: '🔄 Reset', color: 'btn-danger' },
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') deleteMut.mutate(confirmAction.user.id);
    if (confirmAction.type === 'reset') resetMut.mutate(confirmAction.user.id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-black">👥 Kelola Users</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manajemen pengguna NihonGO!</p>
      </motion.div>

      <div className="glass-card p-4">
        <input type="text" placeholder="🔍 Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin text-3xl">🌸</div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['#','User','Level','XP','Games','Role','Status','Aksi'].map(h => (
                    <th key={h} className={`${h==='Aksi'?'text-right':'text-left'} p-4 font-semibold text-gray-500`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filtered || []).map((u, i) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400">{(data.current_page - 1) * data.per_page + i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sakura-400 to-primary-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">Lv.{u.level}</td>
                    <td className="p-4"><span className="text-primary-500 font-semibold">{u.xp}</span></td>
                    <td className="p-4 text-gray-500">{u.game_histories_count}</td>
                    <td className="p-4">
                      <button onClick={() => toggleRole(u)} className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {u.role}
                      </button>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleBan(u)} className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${u.is_banned ? 'bg-nihon-100 dark:bg-nihon-500/20 text-nihon-600 dark:text-nihon-400' : 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'}`}>
                        {u.is_banned ? '🚫 Banned' : '✅ Aktif'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setConfirmAction({ type: 'reset', user: u })} className="p-2 rounded-lg hover:bg-orange-500/10 text-orange-500 transition-colors" title="Reset Progress">🔄</button>
                      <button onClick={() => setConfirmAction({ type: 'delete', user: u })} className="p-2 rounded-lg hover:bg-nihon-500/10 text-nihon-500 transition-colors" title="Hapus User">🗑️</button>
                    </td>
                  </tr>
                ))}
                {filtered?.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data?.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">{data.from}—{data.to} dari {data.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-sm font-semibold">{page}/{data.last_page}</span>
              <button onClick={() => setPage(p => Math.min(data.last_page, p + 1))} disabled={page === data.last_page} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmAction && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setConfirmAction(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-dark-850 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                <div className="text-5xl mb-4">{confirmTexts[confirmAction.type].icon}</div>
                <h3 className="text-lg font-bold mb-1">{confirmTexts[confirmAction.type].title}</h3>
                <p className="text-sm font-semibold text-primary-500 mb-2">{confirmAction.user.name}</p>
                <p className="text-sm text-gray-500 mb-6">{confirmTexts[confirmAction.type].desc}</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold">Batal</button>
                  <button onClick={handleConfirm} disabled={deleteMut.isPending || resetMut.isPending}
                    className={`flex-1 ${confirmTexts[confirmAction.type].color} disabled:opacity-50`}>
                    {deleteMut.isPending || resetMut.isPending ? '⏳...' : confirmTexts[confirmAction.type].btn}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
