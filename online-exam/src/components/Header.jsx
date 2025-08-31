// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExamContext } from "./context/ExamContext";
import config from "../config";
import { HiOutlineBars3 } from "react-icons/hi2";
import { HiOutlineSearch, HiOutlineCog, HiOutlineLogout } from "react-icons/hi";

const Header = ({ user, isSidebarOpen, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useExamContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      navigate(0);
    } else {
      navigate(path);
    }
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getAvatarSrc = () => {
    if (user?.avatar) {
      return `${config.API_BASE}/uploads/${user.avatar}`;
    }
    if (user?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&size=32&background=1658a0&color=fff`;
    }
    return "/dp.jpg";
  };

  return (
    <div className="px-6 py-4 bg-white shadow-sm border-b border-gray-100">
      {/* Top Row: Sidebar toggle + Search + Avatar */}
      <div className="flex justify-between items-center">
        {/* Left: Sidebar toggle + Search */}
        <div className="flex items-center gap-4">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <HiOutlineBars3 size={20} />
            </button>
          )}

          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <HiOutlineSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </form>
        </div>

        {/* Right: Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleDropdown}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="relative">
              <img
                src={getAvatarSrc()}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg rounded-lg w-56 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">
                  {user?.name || "User Name"}
                </p>
                <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <HiOutlineCog className="mr-3" size={16} />
                  View Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiOutlineLogout className="mr-3" size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Second Row: Navigation under search */}
      <nav className="flex justify-center gap-10 mt-5 text-sm font-medium">
        <button
          onClick={() => handleNavClick("/home")}
          className={`pb-1.5 transition-colors ${isActive("/home")
              ? "text-blue-700 border-b-2 border-blue-700 font-semibold"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          HOME
        </button>
        <button
          onClick={() => handleNavClick("/services")}
          className={`pb-1.5 transition-colors ${isActive("/services")
              ? "text-blue-700 border-b-2 border-blue-700 font-semibold"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          SERVICES
        </button>
        <button
          onClick={() => handleNavClick("/about")}
          className={`pb-1.5 transition-colors ${isActive("/about")
              ? "text-blue-700 border-b-2 border-blue-700 font-semibold"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          ABOUT US
        </button>
      </nav>
    </div>
  );
};

export default Header;
