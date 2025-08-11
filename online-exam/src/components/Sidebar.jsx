// src/components/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GrSettingsOption } from 'react-icons/gr';
import { FaStar } from 'react-icons/fa';
import { useExamContext } from './context/ExamContext';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useExamContext();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAvatarSrc = () => {
    if (user?.avatar) {
      return `http://localhost:5000/uploads/${user.avatar}`;
    }
    if (user?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=64&background=fff&color=1658a0`;
    }
    return '/dp.jpg';
  };

  return (
    <div className="w-52 bg-[#1658a0] text-white p-5 rounded-r-3xl min-h-screen relative">
      <div className="text-lg font-bold mb-10 mt-5">SOHalla NekHat</div>

      {/* User Info */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={getAvatarSrc()}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-white"
        />
        <div className="text-center">
          <div className="font-semibold text-sm">{user?.name || 'User'}</div>
          <div className="text-xs text-gray-200 capitalize">{user?.role || 'Student'}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-6 text-sm font-medium">
        <Link to="/exam" className="hover:underline">EXAMS</Link>
        {user?.role === 'Teacher' && (
          <Link to="/add-exam" className="hover:underline flex items-center gap-2">
            <FaStar className="text-sm" /> ADD EXAM
          </Link>
        )}
        {user?.role === 'Teacher' && (
          <Link to="/exam" className="hover:underline">MANAGE EXAMS</Link>
        )}
        {user?.role === 'Student' && (
          <Link to="/my-results" className="hover:underline">MY RESULTS</Link>
        )}
        <Link to="/profile" className="hover:underline">PROFILE</Link>
        <button onClick={handleLogout} className="text-left hover:underline">LOG OUT</button>
      </nav>
    </div>
  );
};

export default Sidebar;
