// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const Header = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useExamContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      navigate(0); // refresh
    } else {
      navigate(path);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getAvatarSrc = () => {
    if (user?.avatar) {
      return `http://localhost:5000/uploads/${user.avatar}`;
    }
    if (user?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32&background=1658a0&color=fff`;
    }
    return '/dp.jpg';
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm relative">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="w-72 px-4 py-2 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Right: Navigation + Avatar */}
      <nav className="flex items-center gap-6 text-sm text-[#003366] font-semibold">
        <button
          onClick={() => handleNavClick('/home')}
          className={`pb-1 ${isActive('/home') ? 'border-b-2 border-blue-700' : 'hover:text-blue-600'}`}
        >
          HOME
        </button>
        <button
          onClick={() => handleNavClick('/services')}
          className={`pb-1 ${isActive('/services') ? 'border-b-2 border-blue-700' : 'hover:text-blue-600'}`}
        >
          SERVICES
        </button>
        <button
          onClick={() => handleNavClick('/about')}
          className={`pb-1 ${isActive('/about') ? 'border-b-2 border-blue-700' : 'hover:text-blue-600'}`}
        >
          ABOUT US
        </button>

        {/* Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={getAvatarSrc()}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            onClick={toggleDropdown}
          />
          {dropdownOpen && (
            <div className="absolute right-0 top-12 bg-white border shadow-lg rounded-md w-56 z-50">
              <div className="p-4 text-sm">
                <p className="font-semibold text-gray-800">{user?.name || 'User Name'}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
                <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
              </div>
              <hr />
              <button
                onClick={() => navigate('/profile')}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
