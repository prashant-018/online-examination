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



  return (
    <div className="w-52 bg-[#1658a0] text-white p-5 rounded-r-3xl min-h-screen relative">
      <div className="text-lg font-bold mb-10 mt-5">TestMaster</div>

      {/* User Info - Removed as requested */}



<br>
</br>
<br>
</br><br>
</br> 
<br>
</br>

     
     
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
