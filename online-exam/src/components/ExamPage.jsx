// src/components/ExamPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ExamPage = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const questions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1} on ${subject}? This is a sample question text that might be longer to demonstrate the layout. What would be the correct answer choice?`,
    options: [
      'Option A is the first possible answer',
      'Option B is another choice that might be correct',
      'Option C could be the right one',
      'Option D is always worth considering'
    ],
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedReview, setMarkedReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
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

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
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

  // Scroll to top when question changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex]);

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 font-sans">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => window.confirm('Are you sure you want to leave? Your progress will be lost.') && navigate('/exam')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800 capitalize">{subject.replace(/-/g, ' ')} Exam</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-bold text-blue-800">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-3">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {Object.keys(answers).length}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto pt-24 pb-10 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question */}
        <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div ref={scrollRef} className="overflow-y-auto max-h-[calc(100vh-200px)] pr-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                <span className="text-blue-600">Question {currentIndex + 1}:</span> {current.question}
              </h3>
              <button
                onClick={toggleMark}
                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm ${
                  isMarked
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isMarked ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Marked
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Mark
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {current.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                    selected === opt
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1 mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500"
                    name={`q${current.id}`}
                    checked={selected === opt}
                    onChange={() => handleAnswer(opt)}
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="flex items-center px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Submit Exam
                </button>
                
                <button
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  disabled={currentIndex === questions.length - 1}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question palette */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Question Palette</h4>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                Answered
              </span>
              <span className="flex items-center text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                Marked
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => {
              const isActive = currentIndex === i;
              const answered = answers[q.id];
              const marked = markedReview[q.id];
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative w-full aspect-square flex items-center justify-center rounded-lg font-medium transition-all ${
                    isActive
                      ? 'ring-2 ring-blue-500 bg-blue-50 text-blue-700 scale-105'
                      : marked
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : answered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {q.id}
                  {marked && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowSubmitModal(true)}
            className={`w-full py-3 mt-6 font-medium rounded-lg ${
              Object.keys(answers).length < questions.length
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Submit Exam</h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You have answered {Object.keys(answers).length} out of {questions.length} questions.
              </p>
              {Object.keys(answers).length < questions.length && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        You have {questions.length - Object.keys(answers).length} unanswered questions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <p className="font-medium">Are you sure you want to submit the exam?</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;