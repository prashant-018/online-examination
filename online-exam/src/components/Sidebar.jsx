import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GrSettingsOption } from 'react-icons/gr';
import { FaStar } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const Sidebar = ({ onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="w-52 bg-[#1658a0] text-white p-5 rounded-r-3xl min-h-screen relative">
      {/* Close Button */}
      <button onClick={onToggle} className="absolute top-3 right-3 text-white hover:text-red-300">
        <IoMdClose size={20} />
      </button>

      <div className="text-lg font-bold mb-10 mt-5">SOHalla NekHat</div>
      <nav className="flex flex-col gap-6 text-sm font-medium">
        <Link to="/exam" className="hover:underline">EXAMS</Link>
        <Link to="/add-exam" className="hover:underline flex items-center gap-2">
          <FaStar className="text-sm" />
          ADD EXAM
        </Link>
        <Link to="/settings" className="hover:underline flex items-center gap-2">
          <GrSettingsOption className="text-lg" />
          SETTING
        </Link>
        <button onClick={handleLogout} className="text-left hover:underline">LOG OUT</button>
      </nav>
    </div>
  );
};

export default Sidebar;
