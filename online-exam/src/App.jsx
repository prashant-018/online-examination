// App.jsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ExamProvider, useExamContext } from './components/context/ExamContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './components/RoleSelection';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ExamCards from './components/ExamCards';
import ExamPage from './components/ExamPage';
import ExamAttempt from './components/ExamAttempt';
import ExamResults from './components/ExamResults';
import StudentResults from './components/StudentResults';
import ExamQuestionManager from './components/ExamQuestionManager';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import ExamAdd from './components/ExamAdd';
import Profile from './components/Profile';
import Unauthorized from './components/Unauthorized';

const AppContent = () => {
  const { isAuthenticated, user, loading } = useExamContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && (
        <Sidebar user={user} />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        {isAuthenticated && (
          <Header user={user} />
        )}

        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <RoleSelection />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <RegistrationForm />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <LoginForm />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <ExamCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:subject"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-attempt/:examId"
            element={
              <ProtectedRoute>
                <ExamAttempt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-results/:examId"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <ExamResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-results"
            element={
              <ProtectedRoute>
                <StudentResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:examId/questions"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <ExamQuestionManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-exam"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <ExamAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <ExamProvider>
    <Router>
      <AppContent />
    </Router>
  </ExamProvider>
);

export default App;
