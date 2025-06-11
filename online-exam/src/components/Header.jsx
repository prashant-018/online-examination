import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onShowSidebar, showSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      navigate(0); // refresh if same path
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      {/* Left: 3-dot + Search bar */}
      <div className="flex items-center gap-4">
        {!showSidebar && (
          <button
            onClick={onShowSidebar}
            className="text-2xl text-gray-700 hover:text-blue-600 focus:outline-none"
            title="Show Sidebar"
          >
            &#8942;
          </button>
        )}
        <input
          type="text"
          placeholder="Search"
          className="w-72 px-4 py-2 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Right: Navigation */}
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
        <img
          src="/dp2.jpg"
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      </nav>
    </div>
  );
};

export default Header;
