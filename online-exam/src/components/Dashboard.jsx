import React, { useState, useRef, useEffect } from 'react';
import { 
  GrSettingsOption, 
  HiOutlineSearch, 
  HiOutlineLogout, 
  HiOutlineUser, 
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/all';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Dashboard = ({ googleUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef();
  const sidebarRef = useRef();
  const notificationsRef = useRef();

  const exams = [
    { title: 'Mathematics', image: '/maths.png', enrolled: 125, progress: 75 },
    { title: 'Computer Science', image: '/cs.png', enrolled: 98, progress: 60 },
    { title: 'Web Engineering', image: '/web-engg.png', enrolled: 87, progress: 45 },
    { title: 'Islamic Studies', image: '/islamic.png', enrolled: 112, progress: 85 },
  ];

  const notifications = [
    { id: 1, text: 'Your Mathematics exam starts in 2 days', time: '2 hours ago', read: false },
    { id: 2, text: 'You scored 92% in the Web Engineering quiz', time: '1 day ago', read: true },
    { id: 3, text: 'New study material added for Computer Science', time: '2 days ago', read: false },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        setSidebarOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const handleLogout = () => {
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed lg:relative w-64 bg-gradient-to-b from-[#1658a0] to-[#0f3a6b] text-white p-6 rounded-r-3xl flex flex-col justify-between z-50 h-full transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="text-xl font-bold flex items-center gap-2">
              <HiOutlineAcademicCap className="text-2xl" />
              <span>SOHalla NekHat</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1 rounded hover:bg-white/10"
            >
              <HiOutlineX size={20} />
            </button>
          </div>
          
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive('/dashboard') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <HiOutlineHome className="text-lg" />
              <span>DASHBOARD</span>
            </Link>
            
            <Link 
              to="/exam" 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive('/exam') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <HiOutlineBookOpen className="text-lg" />
              <span>EXAMS</span>
            </Link>
            
            <Link 
              to="/add-exam" 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive('/add-exam') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <GrSettingsOption className="text-lg" />
              <span>ADD EXAM</span>
            </Link>
            
            <Link 
              to="/results" 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive('/results') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <HiOutlineChartBar className="text-lg" />
              <span>RESULTS</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive('/settings') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <GrSettingsOption className="text-lg" />
              <span>SETTINGS</span>
            </Link>
          </nav>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 p-3 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <HiOutlineLogout className="text-lg" />
          <span>LOG OUT</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex justify-between items-center px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <HiOutlineMenu size={20} />
              </button>
              
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search exams, materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-72 pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </form>
            </div>
            
            <nav className="flex items-center gap-4 lg:gap-6 text-sm text-[#003366] font-semibold">
              <Link 
                to="/home" 
                className={`hidden lg:block pb-1 transition-colors ${
                  isActive('/home') 
                    ? 'border-b-2 border-blue-700 text-blue-700' 
                    : 'hover:text-blue-600'
                }`}
              >
                HOME
              </Link>
              
              <Link 
                to="/services" 
                className={`hidden lg:block pb-1 transition-colors ${
                  isActive('/services') 
                    ? 'border-b-2 border-blue-700 text-blue-700' 
                    : 'hover:text-blue-600'
                }`}
              >
                SERVICES
              </Link>
              
              <Link 
                to="/about" 
                className={`hidden lg:block pb-1 transition-colors ${
                  isActive('/about') 
                    ? 'border-b-2 border-blue-700 text-blue-700' 
                    : 'hover:text-blue-600'
                }`}
              >
                ABOUT US
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                >
                  <HiOutlineBell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 rounded-lg mb-2 cursor-pointer ${!notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <p className="text-sm">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Link 
                      to="/notifications" 
                      className="block text-center text-sm text-blue-600 mt-3 hover:text-blue-800"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* Avatar and Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <img
                  src={googleUser?.picture || '/dp.jpg'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-gray-200"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={googleUser?.picture || '/dp.jpg'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-sm">{googleUser?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-600">{googleUser?.email || 'guest@example.com'}</div>
                      </div>
                    </div>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-lg"
                    >
                      <HiOutlineUser size={16} />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg mt-1"
                    >
                      <HiOutlineLogout size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex justify-around items-center px-4 py-2 border-t border-gray-200 bg-white">
            <Link 
              to="/home" 
              className={`flex flex-col items-center p-2 text-xs ${
                isActive('/home') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <HiOutlineHome size={18} />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/services" 
              className={`flex flex-col items-center p-2 text-xs ${
                isActive('/services') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <HiOutlineAcademicCap size={18} />
              <span>Services</span>
            </Link>
            
            <Link 
              to="/about" 
              className={`flex flex-col items-center p-2 text-xs ${
                isActive('/about') ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              <HiOutlineUser size={18} />
              <span>About</span>
            </Link>
          </div>
        </header>

        {/* Body Content */}
        <section className="px-4 lg:px-6 py-8 flex-1">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#003366] mb-2">
              ONLINE EXAMINATION SYSTEM
            </h1>
            <p className="text-gray-700 max-w-3xl">
              Welcome! Students can attend online exams directly through this system. 
              Track your progress, access study materials, and achieve your academic goals.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#003366]">4</div>
              <div className="text-sm text-gray-600">Active Exams</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#003366]">12</div>
              <div className="text-sm text-gray-600">Completed Exams</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#003366]">87%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#003366]">3</div>
              <div className="text-sm text-gray-600">Upcoming Exams</div>
            </div>
          </div>

          {/* Exam Cards */}
          <h2 className="text-xl font-semibold text-[#003366] mb-4">Available Exams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exams.map((exam, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="relative">
                  <img
                    src={exam.image}
                    alt={exam.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="text-white font-medium">{exam.title}</div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                    <span>{exam.enrolled} students enrolled</span>
                    <span className="font-semibold text-blue-600">{exam.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${exam.progress}%` }}
                    ></div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/exam-details')}
                    className="w-full bg-[#1658a0] hover:bg-[#124880] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;