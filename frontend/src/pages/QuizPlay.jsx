import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../stores';
import api from '../services/api';
import JapaneseKeyboard from '../components/JapaneseKeyboard';

// Sound effects using Web Audio API
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    if (type === 'correct') {
      osc.frequency.value = 523.25; osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 659.25; o2.type = 'sine'; g2.gain.value = 0.15;
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o2.start(); o2.stop(ctx.currentTime + 0.3);
      }, 150);
    } else if (type === 'wrong') {
      osc.frequency.value = 200; osc.type = 'sawtooth';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'burn') {
      osc.frequency.value = 150; osc.type = 'square';
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    }
  } catch {}
};

export default function QuizPlay() {
  const nav = useNavigate();
  const { session, questions, currentIndex, combo, maxCombo, score, addAnswer, nextQuestion, setBurnActive, reset } = useQuizStore();
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctAnswer }
  const [typingAnswer, setTypingAnswer] = useState('');
  const [useTyping, setUseTyping] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [timeLeft, setTimeLeft] = useState(session?.timer || 0);
  const [shaking, setShaking] = useState(false);
  const [burnErrors, setBurnErrors] = useState(0);
  const timerRef = useRef(null);

  const question = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;
  const isBurn = session?.burn_mode;

  // Timer
  useEffect(() => {
    if (!session?.timer || session.timer === 0) return;
    setTimeLeft(session.timer);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return session.timer;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex]);

  const handleTimeout = () => {
    if (question) handleAnswer(null, true);
  };

  // Randomly decide typing vs multiple choice
  useEffect(() => {
    if (question) {
      setUseTyping(Math.random() > 0.6);
      setTypingAnswer('');
      setFeedback(null);
      if (session?.timer) setTimeLeft(session.timer);
    }
  }, [currentIndex]);

  const handleAnswer = async (selected, isTimeout = false) => {
    clearInterval(timerRef.current);
    const correct = question.correct_answer;

    // Normalize for comparison: trim, lowercase, normalize full-width/half-width
    const normalize = (str) => {
      if (!str) return '';
      return str
        .trim()
        .toLowerCase()
        // Normalize full-width alphanumeric to half-width
        .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
        // Normalize full-width space to half-width
        .replace(/\u3000/g, ' ')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ');
    };

    // Support multiple correct answers separated by "/"
    // e.g. "Mahal/Tinggi" → answering "Tinggi" or "Mahal" are both correct
    const normalizedSelected = normalize(selected);
    const correctAlternatives = correct.split('/').map((alt) => normalize(alt));
    const isCorrect = !isTimeout && correctAlternatives.some((alt) => alt === normalizedSelected);

    setFeedback({ isCorrect, correctAnswer: correct, selected });

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
      if (isBurn) {
        playSound('burn');
        setShaking(true);
        setBurnActive(true);
        setBurnErrors((p) => p + 1);
        setTimeout(() => { setShaking(false); setBurnActive(false); }, 600);
      }
    }

    // Send to API
    try {
      await api.post('/quiz/answer', {
        item_id: question.id,
        type: question.type,
        answer: selected || '',
        correct_answer: correct,
      });
    } catch {}

    addAnswer({ question, selected }, isCorrect);

    // Next question after delay
    setTimeout(() => {
      setFeedback(null);
      if (session?.endless && !isCorrect && burnErrors + 1 >= (session?.max_errors || 3)) {
        finishQuiz();
      } else {
        nextQuestion();
      }
    }, 1500);
  };

  const finishQuiz = async () => {
    try {
      const result = await api.post('/quiz/finish', {
        mode: session.mode,
        total_questions: score.correct + score.wrong,
        correct_answers: score.correct,
        wrong_answers: score.wrong,
        max_combo: maxCombo,
        burn_mode: isBurn || false,
        time_seconds: null,
      });
      nav('/quiz/result', { state: result.data });
    } catch {
      nav('/quiz/result', { state: { xp_earned: 0, xp_breakdown: { base: 0, combo_bonus: 0, burn_bonus: 0 } } });
    }
  };

  // Auto-finish when all questions answered
  useEffect(() => {
    if (isFinished && questions.length > 0) finishQuiz();
  }, [isFinished]);

  if (!session || !question) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-4xl">🌸</div>
      </div>
    );
  }

  const timerPercentage = session.timer > 0 ? (timeLeft / session.timer) * 100 : 100;
  const timerColor = timerPercentage > 50 ? 'from-primary-500 to-green-500' : timerPercentage > 25 ? 'from-yellow-500 to-orange-500' : 'from-nihon-500 to-red-700';

  return (
    <div className={`max-w-2xl mx-auto ${shaking ? 'animate-shake' : ''}`}>
      {/* Burn overlay */}
      {isBurn && feedback && !feedback.isCorrect && <div className="burn-overlay" />}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Soal {currentIndex + 1} / {questions.length}</span>
          <div className="flex items-center gap-3">
            {combo > 0 && (
              <motion.span key={combo} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm font-bold text-orange-500">
                🔥 {combo}x Combo!
              </motion.span>
            )}
            <span className="text-sm font-semibold">✅ {score.correct} ❌ {score.wrong}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-sakura-500 rounded-full" />
        </div>
      </div>

      {/* Timer bar */}
      {session.timer > 0 && (
        <div className="mb-4">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${timerPercentage}%` }} transition={{ duration: 0.5 }}
              className={`h-full bg-gradient-to-r ${timerColor} rounded-full`} />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">⏱️ {timeLeft}s</p>
        </div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
          className={`glass-card p-8 text-center mb-6 ${isBurn && feedback && !feedback.isCorrect ? 'border-2 border-nihon-500 animate-fire' : ''}`}>

          {/* Difficulty badge */}
          {session.difficulty === 'expert' && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-nihon-500/10 text-nihon-500 px-2 py-0.5 rounded-full mb-2">🔥 Expert</span>
          )}

          <p className="text-sm text-gray-500 mb-2">{question.question_label}</p>
          <h2 className="text-5xl sm:text-6xl font-bold font-jp mb-3">{question.question}</h2>

          {/* Beginner: show romaji hint */}
          {session.difficulty !== 'expert' && question.romaji && (
            <p className="text-sm text-gray-400">({question.romaji})</p>
          )}

          {/* Beginner: show TTS button */}
          {session.difficulty !== 'expert' && (
            <button onClick={() => {
              const u = new SpeechSynthesisUtterance(question.question);
              u.lang = 'ja-JP'; u.rate = 0.8;
              speechSynthesis.speak(u);
            }} className="mt-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-2xl">
              🔊
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-x-0 bottom-0 p-6 z-40 ${feedback.isCorrect ? 'bg-green-500' : 'bg-nihon-500'} text-white`}>
            <div className="max-w-2xl mx-auto">
              <p className="text-2xl font-bold mb-1">{feedback.isCorrect ? '✅ 正解！Benar!' : '❌ 不正解... Salah!'}</p>
              {!feedback.isCorrect && <p className="text-sm opacity-90">Jawaban: {feedback.correctAnswer}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Options */}
      {!feedback && (
        <>
          {!useTyping ? (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt, i) => (
                <motion.button key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => handleAnswer(opt)}
                  className="p-4 rounded-xl glass-card text-left hover:border-primary-500 hover:bg-primary-500/5 transition-all active:scale-95 group">
                  <span className="text-xs text-gray-400 font-semibold">{String.fromCharCode(65 + i)}</span>
                  <p className="text-lg font-semibold font-jp mt-1 group-hover:text-primary-500 transition-colors">{opt}</p>
                </motion.button>
              ))}
            </div>
          ) : (
            <div>
              {/* Input mode toggle */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <button
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    showKeyboard
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-500 border border-transparent'
                  }`}
                >
                  {showKeyboard ? (
                    <><span>⌨️</span> <span>Keyboard JP</span> <span className="opacity-50">ON</span></>
                  ) : (
                    <><span>🔤</span> <span>Keyboard JP</span> <span className="opacity-50">OFF</span></>
                  )}
                </button>
              </div>

              {showKeyboard ? (
                <JapaneseKeyboard
                  value={typingAnswer}
                  onInput={(char) => setTypingAnswer((p) => p + char)}
                  onDelete={() => setTypingAnswer((p) => p.slice(0, -1))}
                  onSubmit={() => handleAnswer(typingAnswer)}
                />
              ) : (
                <div className="flex gap-2">
                  <input value={typingAnswer} onChange={(e) => setTypingAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnswer(typingAnswer)}
                    className="input-field text-lg font-jp" placeholder="Ketik jawaban..." autoFocus />
                  <button onClick={() => handleAnswer(typingAnswer)} className="btn-primary px-6">➡️</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Combo display */}
      {combo >= 3 && !feedback && (
        <motion.div key={`combo-${combo}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="fixed top-20 right-4 text-right z-30">
          <div className="bg-gradient-to-r from-orange-500 to-nihon-500 text-white px-4 py-2 rounded-xl shadow-xl">
            <p className="text-2xl font-black">🔥 {combo}x</p>
            <p className="text-xs opacity-80">COMBO!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
