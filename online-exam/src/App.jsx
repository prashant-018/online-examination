import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import RoleSelection from './components/RoleSelection';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ExamCards from './components/ExamCards';
import ExamPage from './components/ExamPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import ExamAdd from './components/ExamAdd';

const AppContent = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isExamPage = location.pathname.startsWith('/exam/') && location.pathname.split('/').length === 3;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    navigate('/register');
  };

  const handleRegister = () => {
    setIsRegistered(true);
    navigate('/login');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/home');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar shows only if logged in, not on exam page, and visible */}
      {isLoggedIn && !isExamPage && showSidebar && (
        <Sidebar onToggle={() => setShowSidebar(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header shows only if logged in and not on exam page */}
        {isLoggedIn && !isExamPage && (
          <Header onShowSidebar={() => setShowSidebar(true)} showSidebar={showSidebar} />
        )}

        <Routes>
          <Route path="/" element={<RoleSelection onSelectRole={handleRoleSelect} />} />
          <Route
            path="/register"
            element={
              selectedRole ? (
                <RegistrationForm role={selectedRole} onRegister={handleRegister} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              isRegistered ? (
                <LoginForm onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" replace />} />
          <Route path="/exam" element={isLoggedIn ? <ExamCards /> : <Navigate to="/" replace />} />
          <Route path="/exam/:subject" element={isLoggedIn ? <ExamPage /> : <Navigate to="/" replace />} />
          <Route path="/about" element={isLoggedIn ? <AboutUs /> : <Navigate to="/" replace />} />
          <Route path="/services" element={isLoggedIn ? <Services /> : <Navigate to="/" replace />} />
          <Route path="/add-exam" element={isLoggedIn ? <ExamAdd /> : <Navigate to="/" replace />} />
          <Route path="/settings" element={isLoggedIn ? <div className="p-8">Settings Page</div> : <Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
