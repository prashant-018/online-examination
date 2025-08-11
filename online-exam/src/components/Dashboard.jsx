import React, { useState, useRef, useEffect } from 'react';
import { GrSettingsOption } from 'react-icons/gr';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ googleUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const exams = [
    { title: 'Mathematics', image: '/maths.png' },
    { title: 'Computer Science', image: '/cs.png' },
    { title: 'Web Engineering', image: '/web-engg.png' },
    { title: 'Islamic Studies', image: '/islamic.png' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Sidebar */}
      <aside className="w-52 bg-[#1658a0] text-white p-6 rounded-r-3xl flex flex-col justify-between">
        <div>
          <div className="text-lg font-bold mb-10">SOHalla NekHat</div>
          <nav className="flex flex-col gap-6 text-sm font-medium">
            <Link to="/exam" className="hover:underline">EXAMS</Link>
            <Link to="/add-exam" className="hover:underline">ADD EXAM</Link>
            <Link to="/settings" className="hover:underline flex items-center gap-2">
              <GrSettingsOption className="text-lg" /> SETTING
            </Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="text-sm hover:underline text-left">LOG OUT</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
          <input
            type="text"
            placeholder="Search"
            className="w-72 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <nav className="flex items-center gap-6 text-sm text-[#003366] font-semibold relative">
            <Link to="/home" className="border-b-2 border-blue-700 pb-1">HOME</Link>
            <Link to="/services" className="hover:text-blue-600">SERVICES</Link>
            <Link to="/about" className="hover:text-blue-600">ABOUT US</Link>

            {/* Avatar and Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={googleUser?.picture || '/dp.jpg'}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10">
                  <div className="mb-2 text-sm">
                    <div className="font-semibold">{googleUser?.name || 'Guest'}</div>
                    <div className="text-gray-600">{googleUser?.email || 'guest@example.com'}</div>
                  </div>
                  <hr className="my-2" />
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left text-sm text-blue-700 hover:underline mb-2"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* Body Content */}
        <section className="px-6 py-10">
          <h1 className="text-2xl font-bold text-[#003366] mb-3">
            ONLINE EXAMINATION SYSTEM
          </h1>
          <p className="text-gray-700 mb-8">
            Welcome! Students can attend online exams directly through this system.
          </p>

          {/* Exam Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {exams.map((exam, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={exam.image}
                  alt={exam.title}
                  className="w-full h-40 object-cover"
                />
                <div className="text-center py-3 font-medium text-[#003366]">
                  {exam.title}
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
