// src/components/AddExam.jsx
import React, { useState } from 'react';

const AddExam = () => {
  const [examName, setExamName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Exam Added:', { examName, description });
    // Reset form
    setExamName('');
    setDescription('');
    // You can also send this data to backend API here
  };

  return (
    <div className="p-8 w-full bg-white min-h-screen">
      <h2 className="text-2xl font-bold text-[#003366] mb-6">ADD NEW EXAM</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Exam Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          required
        />

        <textarea
          placeholder="Add Description"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-[#1658a0] text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
        >
          Add Exam
        </button>
      </form>
    </div>
  );
};

export default AddExam;
