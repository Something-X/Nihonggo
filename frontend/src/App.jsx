import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore, useThemeStore } from './stores';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizSetup from './pages/QuizSetup';
import QuizPlay from './pages/QuizPlay';
import QuizResult from './pages/QuizResult';
import SentenceMode from './pages/SentenceMode';
import Library from './pages/Library';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKotoba from './pages/admin/AdminKotoba';
import AdminKanji from './pages/admin/AdminKanji';
import AdminUsers from './pages/admin/AdminUsers';

const qc = new QueryClient();

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  const { dark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: '!bg-white dark:!bg-dark-800 !text-gray-900 dark:!text-white !shadow-xl', duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="quiz" element={<QuizSetup />} />
            <Route path="quiz/play" element={<QuizPlay />} />
            <Route path="quiz/result" element={<QuizResult />} />
            <Route path="sentence" element={<SentenceMode />} />
            <Route path="library" element={<Library />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="admin/kotoba" element={<AdminRoute><AdminKotoba /></AdminRoute>} />
            <Route path="admin/kanji" element={<AdminRoute><AdminKanji /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
