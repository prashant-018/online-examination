// src/components/Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useExamContext } from "./context/ExamContext";

const Sidebar = ({ user, isOpen, onClose }) => {
  const { logout } = useExamContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 w-52 bg-[#1658a0] text-white p-5 min-h-screen z-40 shadow-xl">
      {/* Header with Close button */}
      <div className="flex items-center justify-between text-lg font-bold mb-10 mt-5">
        <span>TestMaster</span>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="p-1 rounded hover:bg-white/10"
        >
          <RxCross1 size={20} />
        </button>
      </div>

      <nav className="flex flex-col gap-6 text-sm font-medium">
        <Link to="/exam" className="hover:underline">
          EXAMS
        </Link>
        {user?.role === "Teacher" && (
          <Link to="/add-exam" className="hover:underline flex items-center gap-2">
            <FaStar className="text-sm" /> ADD EXAM
          </Link>
        )}
        {user?.role === "Teacher" && (
          <Link to="/manage-exams" className="hover:underline">
            MANAGE EXAMS
          </Link>
        )}
        {user?.role === "Student" && (
          <Link to="/my-results" className="hover:underline">
            MY RESULTS
          </Link>
        )}
        <Link to="/profile" className="hover:underline">
          PROFILE
        </Link>
        <button onClick={handleLogout} className="text-left hover:underline">
          LOG OUT
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
