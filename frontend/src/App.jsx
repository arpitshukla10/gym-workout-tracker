import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProgramCreator from './pages/ProgramCreator';
import WorkoutLogger from './pages/WorkoutLogger';
import WorkoutHistory from './pages/WorkoutHistory';
import ExerciseLibrary from './pages/ExerciseLibrary';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-muted-foreground bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 border-t-stone-800 mb-3"></div>
        <p className="text-sm">Restoring session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="grain min-h-screen bg-background text-foreground flex flex-col">
        {user && <Navbar />}
        <main className="flex-grow relative z-10">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/programs"
              element={
                <ProtectedRoute>
                  <ProgramCreator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logger"
              element={
                <ProtectedRoute>
                  <WorkoutLogger />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <WorkoutHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <ProtectedRoute>
                  <ExerciseLibrary />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
