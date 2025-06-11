// src/components/ExamPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ExamPage = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const questions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1} on ${subject}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedReview, setMarkedReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          alert("⏰ Time's up! Submitting...");
          handleSubmit();
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (option) => {
    const id = questions[currentIndex].id;
    setAnswers({ ...answers, [id]: option });
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const handleSubmit = () => {
    alert('✅ Exam Submitted!\n' + JSON.stringify(answers, null, 2));
    navigate('/exam');
  };

  const current = questions[currentIndex];
  const isMarked = markedReview[current.id];
  const selected = answers[current.id];

  const toggleMark = () => {
    setMarkedReview((prev) => ({
      ...prev,
      [current.id]: !prev[current.id],
    }));
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#f3f4f6] font-sans">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex justify-between items-center px-6 py-4">
        <h2 className="text-lg font-bold text-blue-800">📝 {subject.replace(/-/g, ' ')}</h2>
        <div className="text-sm font-mono bg-gray-800 text-white px-4 py-1 rounded">
          ⏱ {formatTime(timeLeft)}
        </div>
        <span className="text-sm text-gray-600">
          Answered {Object.keys(answers).length}/{questions.length}
        </span>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto pt-24 pb-10 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Question */}
        <div className="md:col-span-3 bg-white p-6 rounded-lg shadow">
          <div ref={scrollRef}>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Q{currentIndex + 1}. {current.question}
            </h3>
            <div className="space-y-3 mb-6">
              {current.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    selected === opt
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="mr-3"
                    name={`q${current.id}`}
                    checked={selected === opt}
                    onChange={() => handleAnswer(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* Mark + Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={toggleMark}
                className={`px-4 py-2 rounded font-medium ${
                  isMarked
                    ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {isMarked ? 'Unmark' : 'Mark for Review'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  disabled={currentIndex === questions.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className={`w-full py-3 mt-4 font-bold text-lg rounded ${
                Object.keys(answers).length < questions.length
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Right: Question palette */}
        <div className="bg-white p-4 rounded-lg shadow h-fit">
          <h4 className="text-md font-semibold mb-3">📌 Questions</h4>
          <div className="grid grid-cols-5 gap-2 text-xs">
            {questions.map((q, i) => {
              const isActive = currentIndex === i;
              const answered = answers[q.id];
              const marked = markedReview[q.id];
              let base = 'w-8 h-8 rounded-full font-bold';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`${base} ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : marked
                      ? 'bg-yellow-400 text-white'
                      : answered
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-800'
                  } hover:scale-110 transition`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
