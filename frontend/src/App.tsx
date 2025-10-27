import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GameRoom from './pages/GameRoom';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
              <Route path="/game/:gameType" element={<GameRoom />} />
              <Route path="/tournaments" element={<MainLayout><Tournaments /></MainLayout>} />
              <Route path="/tournament/:id" element={<MainLayout><TournamentDetail /></MainLayout>} />
            </Route>
            
            <Route path="/leaderboard" element={<MainLayout><Leaderboard /></MainLayout>} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin/*" element={<AdminPanel />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;