import React from 'react';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#1658a0] ">
      <div className="text-center text-white">
        <h1 className="text-xl font-semibold mb-10">Are you a student or teacher?</h1>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => onSelectRole('Teacher')}
            className="bg-white text-black px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
          >
            Teacher
          </button>
          <button
            onClick={() => onSelectRole('Student')}
            className="bg-white text-black px-6 py-2 rounded-full shadow hover:bg-gray-200 transition"
          >
            Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
