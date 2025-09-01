// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExamContext } from "./context/ExamContext";
import config from "../config";
import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark,
  HiOutlineUserCircle
} from "react-icons/hi2";

const Header = ({ user, isSidebarOpen, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useExamContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const dropdownRef = useRef();
  const searchRef = useRef();

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }

    if (searchRef.current && !searchRef.current.contains(e.target) && isMobileSearchVisible) {
      setIsMobileSearchVisible(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement actual search functionality
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileSearchVisible(false);
    }
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchVisible(!isMobileSearchVisible);
    if (!isMobileSearchVisible) {
      setTimeout(() => {
        const searchInput = document.getElementById("mobile-search-input");
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileSearchVisible]);

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

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "Services", path: "/services" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 px-4 md:px-6 py-3 bg-white shadow-sm border-b border-gray-200">
        {/* Top Row: Sidebar + Logo + Search + Avatar */}
        <div className="flex justify-between items-center">
          {/* Left: Sidebar toggle + Logo */}
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <HiOutlineBars3 size={22} />
              </button>
            )}
            <span
              className="text-xl font-bold text-blue-700 cursor-pointer hover:text-blue-800 transition-colors"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
            >
             TestMaster


            </span>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <form
            onSubmit={handleSearch}
            className={`relative w-1/2 hidden md:flex items-center transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-blue-500' : ''} rounded-full bg-gray-50`}
            ref={searchRef}
          >
            <HiOutlineMagnifyingGlass
              className="absolute left-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-transparent focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <HiOutlineXMark size={18} />
              </button>
            )}
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={toggleMobileSearch}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
              aria-label="Search"
            >
              <HiOutlineMagnifyingGlass size={20} />
            </button>

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleDropdown}
                role="button"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
              >
                <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-xs">
                  {user?.name || "User"}
                </span>
                <div className="relative">
                  <img
                    src={getAvatarSrc()}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border shadow-sm"
                    onError={(e) => {
                      e.target.src = "https://ui-avatars.com/api/?name=User&size=32&background=1658a0&color=fff";
                    }}
                  />
                  {dropdownOpen && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg w-48 z-50 py-1"
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-800 text-sm truncate">{user?.name || "User"}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email || ""}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    role="menuitem"
                  >
                    <HiOutlineUserCircle className="mr-3" size={16} />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    role="menuitem"
                  >
                    <HiOutlineCog6Tooth className="mr-3" size={16} />
                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    role="menuitem"
                  >
                    <HiOutlineArrowRightOnRectangle className="mr-3" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Centered Navigation Tabs */}
        <nav
          className="flex justify-center gap-6 mt-4 overflow-x-auto scrollbar-hide text-sm font-medium"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`whitespace-nowrap px-5 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive(item.path)
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchVisible && (
        <div className="fixed inset-0 z-50 bg-white p-4 md:hidden">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setIsMobileSearchVisible(false)}
              className="p-2 text-gray-600 rounded-lg"
              aria-label="Close search"
            >
              <HiOutlineXMark size={24} />
            </button>
            <span className="text-lg font-medium">Search</span>
          </div>
          <form onSubmit={handleSearch} className="relative">
            <HiOutlineMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              id="mobile-search-input"
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              autoComplete="off"
            />
          </form>
        </div>
      )}
    </>
  );
};

export default Header;