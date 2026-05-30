import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// Progress bar color based on percentage
const getProgressColor = (pct) => {
  if (pct >= 80) return 'from-emerald-400 to-emerald-500';
  if (pct >= 50) return 'from-blue-400 to-blue-500';
  if (pct >= 20) return 'from-amber-400 to-amber-500';
  if (pct > 0) return 'from-orange-400 to-orange-500';
  return 'from-gray-300 to-gray-400';
};

const getProgressBg = (pct) => {
  if (pct >= 80) return 'bg-emerald-50 dark:bg-emerald-500/10';
  if (pct >= 50) return 'bg-blue-50 dark:bg-blue-500/10';
  if (pct >= 20) return 'bg-amber-50 dark:bg-amber-500/10';
  if (pct > 0) return 'bg-orange-50 dark:bg-orange-500/10';
  return 'bg-gray-50 dark:bg-white/5';
};

const getStatusLabel = (pct) => {
  if (pct >= 100) return { text: 'Hafal', emoji: '🎌', color: 'text-emerald-600 dark:text-emerald-400' };
  if (pct >= 80) return { text: 'Hampir', emoji: '🔥', color: 'text-emerald-500 dark:text-emerald-400' };
  if (pct >= 50) return { text: 'Belajar', emoji: '📖', color: 'text-blue-500 dark:text-blue-400' };
  if (pct > 0) return { text: 'Mulai', emoji: '🌱', color: 'text-amber-500 dark:text-amber-400' };
  return { text: 'Belum', emoji: '⬜', color: 'text-gray-400' };
};

export default function Library() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [flippedCard, setFlippedCard] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const searchTimeout = useRef(null);

  useEffect(() => {
    api.get('/library/chapters').then(({ data }) => {
      setChapters(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const params = {};
    if (selectedChapter) params.chapter = selectedChapter;
    if (search) params.search = search;
    api.get('/library/words', { params }).then(({ data }) => setWords(data));
  }, [selectedChapter, search]);

  const handleSearch = (val) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 300);
  };

  const playTTS = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = 0.8;
    speechSynthesis.speak(u);
  };

  // Calculate overall stats
  const totalWords = chapters.reduce((a, c) => a + c.word_count, 0);
  const totalLearned = chapters.reduce((a, c) => a + (c.learned || 0), 0);
  const totalMastered = chapters.reduce((a, c) => a + (c.mastered || 0), 0);
  const overallPct = totalWords > 0 ? chapters.reduce((a, c) => a + (c.percentage || 0) * c.word_count, 0) / (totalWords || 1) : 0;

  const selectedChapterData = chapters.find(c => c.id === selectedChapter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">📚</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">📚 Perpustakaan Kotoba</h1>
        <p className="text-gray-500 dark:text-gray-400">Minna no Nihongo Bab 1-50 • {totalWords} kosakata</p>
      </motion.div>

      {/* Overall Progress Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">{overallPct.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Hafalan Total</p>
          <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(overallPct)}`} />
          </div>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{totalLearned}</p>
          <p className="text-xs text-gray-500 mt-1">Sedang Dipelajari</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{totalMastered}</p>
          <p className="text-xs text-gray-500 mt-1">Sudah Hafal</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{totalWords - totalLearned}</p>
          <p className="text-xs text-gray-500 mt-1">Belum Dipelajari</p>
        </div>
      </motion.div>

      {/* Search & View Toggle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input type="text" placeholder="Cari kosakata... (Jepang, Hiragana, atau Arti)"
            onChange={(e) => handleSearch(e.target.value)} className="input-field pl-11 w-full" />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <button onClick={() => setViewMode('grid')}
            className={`px-3 py-2.5 text-sm transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-850'}`}>▦</button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-2.5 text-sm transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-850'}`}>☰</button>
        </div>
      </motion.div>

      {/* Chapter Tabs with Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button onClick={() => setSelectedChapter(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !selectedChapter ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-850'
            }`}>Semua</button>
          {chapters.map((ch) => (
            <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap relative ${
                selectedChapter === ch.id ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-850'
              }`}>
              <span>{ch.label}</span>
              <span className="ml-1 text-xs opacity-70">({ch.word_count})</span>
              {/* Mini progress bar under tab */}
              {ch.percentage > 0 && selectedChapter !== ch.id && (
                <div className="absolute bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(ch.percentage)}`}
                    style={{ width: `${ch.percentage}%` }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Chapter Progress Detail */}
      {selectedChapterData && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{selectedChapterData.label}</h3>
              <p className="text-xs text-gray-500">{selectedChapterData.learned}/{selectedChapterData.word_count} dipelajari • {selectedChapterData.mastered} hafal</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getStatusLabel(selectedChapterData.percentage).color}`}>{selectedChapterData.percentage}%</p>
              <p className="text-xs text-gray-500">{getStatusLabel(selectedChapterData.percentage).emoji} {getStatusLabel(selectedChapterData.percentage).text}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${selectedChapterData.percentage}%` }} transition={{ duration: 0.8 }}
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(selectedChapterData.percentage)}`} />
          </div>
        </motion.div>
      )}

      {/* Word Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {selectedChapter ? selectedChapterData?.label : 'Semua Bab'} • {words.length} kata
        </p>
        <p className="text-xs text-gray-400">
          Benar: +5 poin • Salah: -7 poin • Maks: 100 poin
        </p>
      </div>

      {/* Words Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {words.map((word, i) => {
              const status = getStatusLabel(word.percentage);
              return (
                <motion.div key={word.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  onClick={() => setFlippedCard(flippedCard === word.id ? null : word.id)}
                  className={`glass-card p-5 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden ${
                    word.percentage >= 100 ? 'border-emerald-200 dark:border-emerald-500/30' :
                    word.percentage > 0 ? 'hover:border-primary-300 dark:hover:border-primary-500/30' : ''
                  }`}>
                  {/* Progress background indicator */}
                  <div className="absolute top-0 left-0 bottom-0 opacity-[0.04]" style={{ width: `${word.percentage}%`, background: word.percentage >= 80 ? '#10b981' : word.percentage >= 50 ? '#3b82f6' : '#f59e0b' }} />
                  
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-2 relative">
                    <h3 className="text-2xl font-bold font-jp">{word.japanese}</h3>
                    <div className="flex items-center gap-1">
                      {word.percentage >= 100 && <span className="text-sm">🎌</span>}
                      <button onClick={(e) => { e.stopPropagation(); playTTS(word.japanese); }}
                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-lg opacity-50 group-hover:opacity-100">🔊</button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 font-jp mb-2">{word.romaji}</p>

                  <AnimatePresence>
                    {flippedCard === word.id ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="pt-2 border-t border-gray-100 dark:border-white/10">
                          <p className="text-base font-semibold text-primary-600 dark:text-primary-400">{word.meaning}</p>
                          {(word.times_correct > 0 || word.times_wrong > 0) && (
                            <p className="text-xs text-gray-400 mt-1">✅ {word.times_correct}x benar • ❌ {word.times_wrong}x salah</p>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Tap untuk lihat arti</p>
                    )}
                  </AnimatePresence>

                  {/* Bottom: progress bar + badges */}
                  <div className="mt-3 space-y-2 relative">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(word.percentage)} transition-all duration-500`}
                          style={{ width: `${word.percentage}%` }} />
                      </div>
                      <span className={`text-xs font-bold min-w-[36px] text-right ${status.color}`}>{word.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold">
                        {word.category?.replace('minna_bab_', 'Bab ')}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${getProgressBg(word.percentage)} ${status.color} font-semibold`}>
                        {status.emoji} {status.text}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kata</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hiragana</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Arti</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Bab</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hafalan</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">✅/❌</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase w-12">🔊</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word, i) => {
                    const status = getStatusLabel(word.percentage);
                    return (
                      <motion.tr key={word.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-colors">
                        <td className="py-3 px-4 font-jp text-lg font-bold">{word.japanese}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 font-jp">{word.romaji}</td>
                        <td className="py-3 px-4 text-sm font-medium">{word.meaning}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            {word.category?.replace('minna_bab_', 'Bab ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 justify-center min-w-[100px]">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden max-w-[60px]">
                              <div className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(word.percentage)}`}
                                style={{ width: `${word.percentage}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${status.color}`}>{word.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-500">
                          {word.times_correct > 0 || word.times_wrong > 0 ? (
                            <span>{word.times_correct}/{word.times_wrong}</span>
                          ) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => playTTS(word.japanese)}
                            className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">🔊</button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {words.length === 0 && (
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">Tidak ditemukan kosakata</p>
        </div>
      )}
    </div>
  );
}
