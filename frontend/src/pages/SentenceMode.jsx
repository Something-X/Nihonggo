import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SentenceMode() {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [arranged, setArranged] = useState([]);
  const [available, setAvailable] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/sentence/start', { count });
      setQuestions(data.questions);
      setCurrentIdx(0);
      setScore({ correct: 0, wrong: 0 });
      loadQuestion(data.questions[0]);
      setStarted(true);
    } catch { toast.error('Gagal memuat kalimat'); }
    finally { setLoading(false); }
  };

  const loadQuestion = (q) => {
    const shuffled = [...q.shuffled_words];
    setAvailable(shuffled.map((w, i) => ({ id: `${w}-${i}`, word: w })));
    setArranged([]);
    setFeedback(null);
  };

  const addWord = (item) => {
    setArranged([...arranged, item]);
    setAvailable(available.filter((a) => a.id !== item.id));
  };

  const removeWord = (item) => {
    setAvailable([...available, item]);
    setArranged(arranged.filter((a) => a.id !== item.id));
  };

  const submitAnswer = async () => {
    const q = questions[currentIdx];
    const answer = arranged.map((a) => a.word);
    try {
      const { data } = await api.post('/sentence/answer', { sentence_id: q.id, answer });
      setFeedback(data);
      if (data.is_correct) {
        setScore((s) => ({ ...s, correct: s.correct + 1 }));
      } else {
        setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
      }
    } catch { toast.error('Error'); }
  };

  const nextQ = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setStarted(false);
      toast.success(`Selesai! Benar: ${score.correct + (feedback?.is_correct ? 1 : 0)}`);
      return;
    }
    setCurrentIdx(next);
    loadQuestion(questions[next]);
  };

  if (!started) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">📝 Mode Kalimat</h1>
          <p className="text-gray-500">Susun kata menjadi kalimat yang benar!</p>
        </motion.div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-3">Jumlah Soal</h3>
          <div className="grid grid-cols-4 gap-3">
            {[3, 5, 8, 10].map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`py-3 rounded-xl font-bold transition-all ${count === n ? 'bg-sakura-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-dark-800'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startGame} disabled={loading} className="w-full btn-sakura text-lg py-4 disabled:opacity-50">
          {loading ? '⏳ Loading...' : '📝 Mulai Mode Kalimat!'}
        </button>

        {score.correct + score.wrong > 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-lg font-bold">Hasil Terakhir</p>
            <p className="text-green-500">✅ {score.correct} Benar</p>
            <p className="text-nihon-500">❌ {score.wrong} Salah</p>
          </div>
        )}
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Kalimat {currentIdx + 1} / {questions.length}</span>
        <span className="text-sm font-semibold">✅ {score.correct} ❌ {score.wrong}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sakura-500 to-primary-500 rounded-full transition-all"
          style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <motion.div key={currentIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Susun kalimat dalam bahasa Jepang:</p>
        <h2 className="text-2xl font-bold">🇮🇩 {q.meaning}</h2>
      </motion.div>

      {/* Arranged words */}
      <div className="glass-card p-4 min-h-[60px]">
        <p className="text-xs text-gray-500 mb-2">Jawaban kamu:</p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {arranged.map((item) => (
              <motion.button key={item.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => !feedback && removeWord(item)}
                className={`px-4 py-2 rounded-xl font-jp text-lg font-semibold transition-all ${
                  feedback
                    ? feedback.is_correct ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-nihon-100 dark:bg-nihon-500/20 text-nihon-700 dark:text-nihon-400'
                    : 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 hover:bg-primary-200 cursor-pointer active:scale-90'
                }`}>
                {item.word}
              </motion.button>
            ))}
          </AnimatePresence>
          {arranged.length === 0 && !feedback && <span className="text-gray-400 text-sm">Tap kata di bawah untuk menyusun...</span>}
        </div>
      </div>

      {/* Available words */}
      {!feedback && (
        <div className="flex flex-wrap gap-2 justify-center">
          <AnimatePresence>
            {available.map((item) => (
              <motion.button key={item.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => addWord(item)}
                className="px-5 py-3 rounded-xl glass-card font-jp text-xl font-semibold hover:border-sakura-500 hover:bg-sakura-500/5 transition-all active:scale-90 cursor-pointer">
                {item.word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl ${feedback.is_correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-nihon-500/10 border border-nihon-500/30'}`}>
          <p className="text-xl font-bold mb-2">{feedback.is_correct ? '✅ 正解！Benar!' : '❌ Salah!'}</p>
          {!feedback.is_correct && (
            <div>
              <p className="text-sm text-gray-500">Jawaban yang benar:</p>
              <p className="text-xl font-jp font-bold mt-1">{feedback.correct_answer.join('')}</p>
            </div>
          )}
          <p className="text-lg font-jp mt-2 text-gray-600 dark:text-gray-400">{feedback.japanese}</p>
          <button onClick={nextQ} className="mt-4 btn-primary">
            {currentIdx + 1 >= questions.length ? '🏁 Selesai' : '➡️ Selanjutnya'}
          </button>
        </motion.div>
      )}

      {/* Submit button */}
      {!feedback && arranged.length > 0 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={submitAnswer} className="w-full btn-sakura text-lg py-4">
          ✅ Periksa Jawaban
        </motion.button>
      )}
    </div>
  );
}
