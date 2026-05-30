import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizStore } from '../stores';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function QuizSetup() {
  const [mode, setMode] = useState('kotoba');
  const [count, setCount] = useState(10);
  const [timer, setTimer] = useState(0);
  const [burnMode, setBurnMode] = useState(false);
  const [endless, setEndless] = useState(false);
  const [maxErrors, setMaxErrors] = useState(3);
  const [difficulty, setDifficulty] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const { setSession } = useQuizStore();
  const nav = useNavigate();

  const startQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/start', { mode, count: endless ? 50 : count, timer, burn_mode: burnMode, endless, max_errors: maxErrors });
      data.session.difficulty = difficulty;
      setSession(data.session, data.questions);
      nav('/quiz/play');
    } catch (err) {
      toast.error('Gagal memulai quiz');
    } finally { setLoading(false); }
  };

  const modes = [
    { id: 'kotoba', icon: '📖', label: 'Kotoba', desc: 'Kosakata' },
    { id: 'kanji', icon: '🈴', label: 'Kanji', desc: 'Huruf Kanji' },
    { id: 'mixed', icon: '🎯', label: 'Campuran', desc: 'Kotoba + Kanji' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">🎮 Quiz Mode</h1>
        <p className="text-gray-500 dark:text-gray-400">Atur permainan sesuai kemampuanmu</p>
      </motion.div>

      {/* Mode Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-semibold mb-3">Mode Hafalan</h3>
        <div className="grid grid-cols-3 gap-3">
          {modes.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${mode === m.id ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
              <span className="text-3xl block mb-1">{m.icon}</span>
              <p className="font-semibold text-sm">{m.label}</p>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <h3 className="font-semibold mb-3">🎓 Tingkat Kesulitan</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setDifficulty('beginner')}
            className={`p-4 rounded-xl border-2 transition-all text-center ${difficulty === 'beginner' ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}>
            <span className="text-3xl block mb-1">🌱</span>
            <p className="font-semibold text-sm">Beginner</p>
            <p className="text-xs text-gray-500 mt-1">Dengan bantuan cara baca & suara</p>
          </button>
          <button onClick={() => setDifficulty('expert')}
            className={`p-4 rounded-xl border-2 transition-all text-center ${difficulty === 'expert' ? 'border-nihon-500 bg-nihon-500/10 shadow-lg shadow-nihon-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-nihon-300'}`}>
            <span className="text-3xl block mb-1">🔥</span>
            <p className="font-semibold text-sm">Expert</p>
            <p className="text-xs text-gray-500 mt-1">Tanpa bantuan, murni hafalan!</p>
          </button>
        </div>
      </motion.div>

      {/* Question Count */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Jumlah Soal</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={endless} onChange={(e) => setEndless(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500" />
            Endless Mode
          </label>
        </div>
        {!endless ? (
          <div className="grid grid-cols-4 gap-3">
            {[10, 20, 30, 50].map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`py-3 rounded-xl font-bold transition-all ${count === n ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-850'}`}>
                {n}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2">Berhenti setelah kesalahan:</p>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 5].map((n) => (
                <button key={n} onClick={() => setMaxErrors(n)}
                  className={`py-3 rounded-xl font-bold transition-all ${maxErrors === n ? 'bg-nihon-500 text-white shadow-lg shadow-nihon-500/25' : 'bg-gray-100 dark:bg-dark-800'}`}>
                  {n} kesalahan
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h3 className="font-semibold mb-3">⏱️ Timer per Soal</h3>
        <div className="grid grid-cols-4 gap-3">
          {[{ v: 0, l: 'Tanpa' }, { v: 30, l: '30 dtk' }, { v: 60, l: '1 mnt' }, { v: 180, l: '3 mnt' }].map(({ v, l }) => (
            <button key={v} onClick={() => setTimer(v)}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${timer === v ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-dark-800'}`}>
              {l}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Burn Mode */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className={`glass-card p-6 transition-all ${burnMode ? 'border-2 border-nihon-500 animate-fire' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">🔥 Burn Mode {burnMode && <span className="text-xs bg-nihon-500 text-white px-2 py-0.5 rounded-full animate-pulse">AKTIF</span>}</h3>
            <p className="text-sm text-gray-500 mt-1">Timer berkurang saat salah, efek api & panik!</p>
          </div>
          <button onClick={() => setBurnMode(!burnMode)}
            className={`relative w-14 h-7 rounded-full transition-all ${burnMode ? 'bg-gradient-to-r from-nihon-500 to-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all ${burnMode ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        onClick={startQuiz} disabled={loading}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50 ${burnMode
          ? 'bg-gradient-to-r from-nihon-500 via-orange-500 to-nihon-500 text-white shadow-xl shadow-nihon-500/30 hover:shadow-2xl hover:shadow-nihon-500/40'
          : 'btn-primary shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30'}`}>
        {loading ? '⏳ Mempersiapkan...' : burnMode ? '🔥 MULAI BURN MODE!' : '🚀 Mulai Quiz!'}
      </motion.button>
    </div>
  );
}
