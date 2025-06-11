import React, { useState } from 'react';

const ExamAdd = () => {
  const [examName, setExamName] = useState('');
  const [description, setDescription] = useState('');
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  const handleAddExam = () => {
    if (!examName.trim() || !description.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    const newExam = {
      id: Date.now(),
      name: examName.trim(),
      desc: description.trim(),
    };

    setExams((prev) => [...prev, newExam]);
    setExamName('');
    setDescription('');
    setError('');
  };

  return (
    <div className="max-w-lg mx-auto mt-12 px-6 py-8 bg-white rounded-xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        ➕ Add New Exam
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Exam Name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md transition focus:outline-none focus:ring-2 ${
            error && !examName.trim()
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />

        <textarea
          placeholder="Exam Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md h-24 resize-none transition focus:outline-none focus:ring-2 ${
            error && !description.trim()
              ? 'border-red-500 focus:ring-red-400'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />

        {error && (
          <p className="text-sm text-red-600 -mt-2">{error}</p>
        )}

        <button
          onClick={handleAddExam}
          className="w-full bg-[#1658a0] hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          Add Exam
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Exams List
        </h3>

        {exams.length === 0 ? (
          <p className="text-gray-500 italic">No exams added yet.</p>
        ) : (
          <ul className="space-y-3">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="p-4 border border-gray-200 rounded-md bg-gray-50 hover:shadow-md transition"
              >
                <h4 className="font-semibold text-blue-700">{exam.name}</h4>
                <p className="text-gray-600">{exam.desc}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExamAdd;
