import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export const useThemeStore = create((set) => ({
  dark: localStorage.getItem('theme') === 'dark',
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return { dark: next };
    }),
}));

export const useQuizStore = create((set) => ({
  session: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  combo: 0,
  maxCombo: 0,
  score: { correct: 0, wrong: 0 },
  timeLeft: 0,
  burnActive: false,
  setSession: (session, questions) => set({ session, questions, currentIndex: 0, answers: [], combo: 0, maxCombo: 0, score: { correct: 0, wrong: 0 } }),
  nextQuestion: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  addAnswer: (answer, isCorrect) =>
    set((s) => {
      const newCombo = isCorrect ? s.combo + 1 : 0;
      return {
        answers: [...s.answers, { ...answer, isCorrect }],
        combo: newCombo,
        maxCombo: Math.max(s.maxCombo, newCombo),
        score: {
          correct: s.score.correct + (isCorrect ? 1 : 0),
          wrong: s.score.wrong + (isCorrect ? 0 : 1),
        },
      };
    }),
  setTimeLeft: (t) => set({ timeLeft: t }),
  setBurnActive: (v) => set({ burnActive: v }),
  reset: () => set({ session: null, questions: [], currentIndex: 0, answers: [], combo: 0, maxCombo: 0, score: { correct: 0, wrong: 0 }, timeLeft: 0, burnActive: false }),
}));
