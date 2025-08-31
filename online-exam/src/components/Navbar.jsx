import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineBars3, HiX, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { HiOutlineHome, HiOutlineCog, HiOutlineInformationCircle, HiOutlineDocumentText, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi2';

const Navbar = ({ user, isSidebarOpen, onToggleSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExamsSubmenuOpen, setIsExamsSubmenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileMenuRef = useRef();
  const firstFocusableElementRef = useRef();
  const lastFocusableElementRef = useRef();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && firstFocusableElementRef.current) {
      firstFocusableElementRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsExamsSubmenuOpen(false);
  }, [location.pathname]);

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsExamsSubmenuOpen(false);
  };

  const toggleExamsSubmenu = () => {
    setIsExamsSubmenuOpen(!isExamsSubmenuOpen);
  };

  const handleNavClick = (path) => {
    if (location.pathname === path) {
      navigate(0);
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/home', icon: HiOutlineHome },
    { name: 'Services', path: '/services', icon: HiOutlineCog },
    { name: 'About Us', path: '/about', icon: HiOutlineInformationCircle },
  ];

  const examSubmenuItems = [
    { name: 'Add Exam', path: '/add-exam', icon: HiOutlineDocumentText },
    { name: 'Manage Exams', path: '/manage-exams', icon: HiOutlineCog },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo Section - Left */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button - Always visible */}
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <HiOutlineBars3 className="w-6 h-6" />
              </button>

              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  ExamSystem
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Center/Right */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(link.path)
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </button>
                );
              })}

              {/* Exams Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                  <HiOutlineDocumentText className="w-5 h-5" />
                  <span>Exams</span>
                  <HiChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Desktop Exams Submenu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {examSubmenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavClick(item.path)}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Profile & Logout */}
              {user && (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <HiOutlineUser className="w-5 h-5" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      // Add your logout logic here
                      console.log('Logout clicked');
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <HiOutlineLogout className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* User Avatar & Mobile Menu Button - Right */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                ref={firstFocusableElementRef}
                onClick={openMobileMenu}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                aria-label="Open mobile menu"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <HiOutlineBars3 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 left-0 h-full w-80 bg-blue-600 text-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">ExamSystem</span>
          </div>

          <button
            ref={lastFocusableElementRef}
            onClick={closeMobileMenu}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
            aria-label="Close mobile menu"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-6 space-y-2">
          {/* Mobile Navigation Links */}
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive(link.path)
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:bg-white/10'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </button>
            );
          })}

          {/* Exams Section with Submenu */}
          <div className="space-y-2">
            <button
              onClick={toggleExamsSubmenu}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-blue-100 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <HiOutlineDocumentText className="w-5 h-5" />
                <span>Exams</span>
              </div>
              {isExamsSubmenuOpen ? (
                <HiChevronDown className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <HiChevronRight className="w-4 h-4 transition-transform duration-200" />
              )}
            </button>

            {/* Collapsible Submenu */}
            <div className={`overflow-hidden transition-all duration-300 ${isExamsSubmenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
              <div className="pl-8 space-y-1">
                {examSubmenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-blue-500 pt-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-blue-200 capitalize">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  View Profile
                </button>

                <button
                  onClick={() => {
                    // Add your logout logic here
                    console.log('Logout clicked');
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
