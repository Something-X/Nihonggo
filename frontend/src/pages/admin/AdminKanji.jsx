import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['N5', 'N4', 'N3', 'N2', 'N1'];
const emptyForm = { character: '', onyomi: '', kunyomi: '', meaning: '', stroke_count: 0, difficulty: 'N5' };

const diffBadge = (d) => {
  const c = { N5:'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400', N4:'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', N3:'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', N2:'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400', N1:'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' };
  return c[d] || '';
};

export default function AdminKanji() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kanjis', page],
    queryFn: () => api.get(`/admin/kanjis?page=${page}`).then(r => r.data),
  });

  const storeMut = useMutation({
    mutationFn: (p) => api.post('/admin/kanjis', p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-kanjis'] }); setModal(null); setForm(emptyForm); toast.success('Kanji ditambah!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Gagal'),
  });
  const updateMut = useMutation({
    mutationFn: (p) => api.put(`/admin/kanjis/${editId}`, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-kanjis'] }); setModal(null); setForm(emptyForm); setEditId(null); toast.success('Kanji diupdate!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Gagal'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/kanjis/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-kanjis'] }); setDeleteId(null); toast.success('Kanji dihapus!'); },
    onError: () => toast.error('Gagal menghapus'),
  });

  const handleSubmit = (e) => { e.preventDefault(); modal === 'edit' ? updateMut.mutate(form) : storeMut.mutate(form); };
  const openEdit = (item) => {
    setForm({ character: item.character, onyomi: item.onyomi || '', kunyomi: item.kunyomi || '', meaning: item.meaning, stroke_count: item.stroke_count || 0, difficulty: item.difficulty });
    setEditId(item.id); setModal('edit');
  };

  const filtered = data?.data?.filter(k => !search || k.character.includes(search) || k.meaning.toLowerCase().includes(search.toLowerCase()) || k.kunyomi?.includes(search) || k.onyomi?.includes(search));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">🈴 Kelola Kanji</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manajemen karakter kanji</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal('add'); }} className="btn-primary flex items-center gap-2 self-start">＋ Tambah Kanji</button>
      </motion.div>

      <div className="glass-card p-4">
        <input type="text" placeholder="🔍 Cari kanji..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin text-3xl">🌸</div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['#','Kanji','On\'yomi','Kun\'yomi','Meaning','Guratan','Level','Aksi'].map(h => (
                    <th key={h} className={`${h==='Aksi'?'text-right':'text-left'} p-4 font-semibold text-gray-500`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filtered || []).map((k, i) => (
                  <tr key={k.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400">{(data.current_page - 1) * data.per_page + i + 1}</td>
                    <td className="p-4 font-jp text-3xl font-bold">{k.character}</td>
                    <td className="p-4 font-jp text-gray-500">{k.onyomi || '—'}</td>
                    <td className="p-4 font-jp text-gray-500">{k.kunyomi || '—'}</td>
                    <td className="p-4">{k.meaning}</td>
                    <td className="p-4 text-gray-500">{k.stroke_count}</td>
                    <td className="p-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diffBadge(k.difficulty)}`}>{k.difficulty}</span></td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(k)} className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-500 transition-colors">✏️</button>
                      <button onClick={() => setDeleteId(k.id)} className="p-2 rounded-lg hover:bg-nihon-500/10 text-nihon-500 transition-colors">🗑️</button>
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

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(null)}>
              <div className="w-full max-w-lg bg-white dark:bg-dark-850 rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold mb-4">{modal === 'edit' ? '✏️ Edit' : '➕ Tambah'} Kanji</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Karakter *</label><input type="text" required value={form.character} onChange={e => setForm({...form, character: e.target.value})} className="input-field font-jp text-3xl text-center" maxLength={5} /></div>
                    <div><label className="block text-sm font-medium mb-1">Jumlah Guratan</label><input type="number" min="0" value={form.stroke_count} onChange={e => setForm({...form, stroke_count: parseInt(e.target.value) || 0})} className="input-field" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">On'yomi</label><input type="text" value={form.onyomi} onChange={e => setForm({...form, onyomi: e.target.value})} className="input-field font-jp" /></div>
                    <div><label className="block text-sm font-medium mb-1">Kun'yomi</label><input type="text" value={form.kunyomi} onChange={e => setForm({...form, kunyomi: e.target.value})} className="input-field font-jp" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Meaning *</label><input type="text" required value={form.meaning} onChange={e => setForm({...form, meaning: e.target.value})} className="input-field" /></div>
                  <div><label className="block text-sm font-medium mb-1">Difficulty *</label><select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="input-field">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Batal</button>
                    <button type="submit" disabled={storeMut.isPending || updateMut.isPending} className="flex-1 btn-primary disabled:opacity-50">{storeMut.isPending || updateMut.isPending ? '⏳...' : 'Simpan'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-dark-850 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold mb-2">Hapus Kanji?</h3>
                <p className="text-sm text-gray-500 mb-6">Aksi ini tidak dapat dibatalkan.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold">Batal</button>
                  <button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 btn-danger disabled:opacity-50">{deleteMut.isPending ? '⏳...' : '🗑️ Hapus'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
