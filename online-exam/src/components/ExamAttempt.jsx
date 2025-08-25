import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const ExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useExamContext();

  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  // Once exam is loaded, enforce access rules
  useEffect(() => {
    if (!exam) return;
    // Only students can attempt
    if (user?.role !== 'Student') {
      setError('Only students can attempt exams.');
      navigate(`/exam-details/${exam._id}`);
      return;
    }
    // Respect allowed roles
    if (Array.isArray(exam?.allowedRoles) && !exam.allowedRoles.includes('Student')) {
      setError('You are not allowed to attempt this exam.');
      navigate('/exam');
      return;
    }
    // Time window check
    const now = new Date();
    const starts = new Date(exam.startTime);
    const ends = new Date(exam.endTime);
    if (now < starts) {
      setError('This exam has not started yet.');
      navigate('/exam');
      return;
    }
    if (now > ends) {
      setError('This exam has already ended.');
      navigate('/exam');
      return;
    }
  }, [exam, user, navigate]);

  useEffect(() => {
    if (exam && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exam, timeLeft]);

  const fetchExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExam(data);
        setTimeLeft(data.duration * 60); // Convert to seconds
        startTimeRef.current = new Date();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch exam');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswer: answer,
        timeSpent: prev[questionId]?.timeSpent || 0
      }
    }));
  };

  const handleQuestionNavigation = (index) => {
    // Save current question time
    if (exam && exam.questions[currentQuestionIndex]) {
      const currentQuestionId = exam.questions[currentQuestionIndex]._id;
      const timeSpent = startTimeRef.current ?
        Math.floor((new Date() - startTimeRef.current) / 1000) : 0;

      setAnswers(prev => ({
        ...prev,
        [currentQuestionId]: {
          ...prev[currentQuestionId],
          timeSpent: (prev[currentQuestionId]?.timeSpent || 0) + timeSpent
        }
      }));
    }

    setCurrentQuestionIndex(index);
    startTimeRef.current = new Date();
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      await submitExam();
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  const handleSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmSubmit(false);
    await submitExam();
  };

  const submitExam = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      // Calculate final scores
      let totalMarksObtained = 0;
      const finalAnswers = { ...answers };

      exam.questions.forEach(question => {
        const answer = finalAnswers[question._id];
        if (answer && answer.selectedAnswer === question.correctAnswer) {
          totalMarksObtained += question.marks;
          finalAnswers[question._id].isCorrect = true;
          finalAnswers[question._id].marksObtained = question.marks;
        } else {
          finalAnswers[question._id].isCorrect = false;
          finalAnswers[question._id].marksObtained = 0;
        }
      });

      const percentage = (totalMarksObtained / exam.totalMarks) * 100;
      const isPassed = totalMarksObtained >= exam.passingMarks;

      const examResult = {
        student: user.id,
        exam: exam._id,
        answers: Object.values(finalAnswers),
        totalMarks: exam.totalMarks,
        marksObtained: totalMarksObtained,
        percentage: Math.round(percentage * 100) / 100,
        isPassed,
        startTime: startTimeRef.current,
        endTime: new Date(),
        duration: Math.floor((new Date() - startTimeRef.current) / 60000), // in minutes
        status: 'Completed'
      };

      // Save exam result
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exam-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(examResult),
      });

      if (response.ok) {
        // Navigate to results page
        navigate(`/exam-result/${exam._id}`, {
          state: {
            result: examResult,
            exam: exam
          }
        });
      } else {
        throw new Error('Failed to submit exam');
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const questionId = exam.questions[index]._id;
    const answer = answers[questionId];

    if (answer && answer.selectedAnswer) {
      return 'answered';
    }
    return 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Exam</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/exam')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/exam')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const hasQuestions = Array.isArray(exam.questions) && exam.questions.length > 0;
  const currentQuestion = hasQuestions ? exam.questions[currentQuestionIndex] : null;

  // If there are no questions, still show the Instructions first. After user clicks Start, show the empty state.
  if (!hasQuestions && !showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">This exam doesn't have any questions yet.</p>
          <button
            onClick={() => navigate('/exam')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
              <p className="text-gray-600">{exam.subject}</p>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
              <div className={`text-2xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-blue-600'
                }`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="text-lg font-semibold text-gray-800">
                {hasQuestions ? (currentQuestionIndex + 1) : 0} / {hasQuestions ? exam.questions.length : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">📋 Exam Instructions</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">⏱️</span>
                  <div>
                    <h3 className="font-semibold">Time Limit</h3>
                    <p className="text-gray-600">You have {exam.duration} minutes to complete this exam.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">📝</span>
                  <div>
                    <h3 className="font-semibold">Questions</h3>
                    <p className="text-gray-600">This exam contains {exam.questions.length} questions worth {exam.totalMarks} total marks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">🎯</span>
                  <div>
                    <h3 className="font-semibold">Passing Score</h3>
                    <p className="text-gray-600">You need at least {exam.passingMarks} marks to pass this exam.</p>
                  </div>
                </div>
              </div>

              {exam.instructions && exam.instructions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Additional Instructions:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {exam.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigate('/exam')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Start Exam
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Question Navigation</h3>

              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {hasQuestions && exam.questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`p-2 rounded-lg text-sm font-medium transition ${index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : getQuestionStatus(index) === 'answered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600">Current</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Unanswered</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  {hasQuestions && (
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Question {currentQuestionIndex + 1} of {exam.questions.length}
                    </h2>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {hasQuestions && currentQuestion && (
                      <span>Type: {currentQuestion.questionType || 'Not specified'}</span>
                    )}
                    {hasQuestions && currentQuestion && (
                      <span>Marks: {currentQuestion.marks || 1}</span>
                    )}
                    {hasQuestions && currentQuestion && (
                      <span>Difficulty: {currentQuestion.difficulty || 'Not specified'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                {hasQuestions && currentQuestion && (
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentQuestion.questionText || currentQuestion.text || 'Question text not available'}
                  </p>
                )}
              </div>

              {/* Question Options */}
              <div className="space-y-3">
                {hasQuestions && currentQuestion && (currentQuestion.questionType === 'Multiple Choice' || currentQuestion.questionType === 'MCQ' || !currentQuestion.questionType) && currentQuestion.options && (
                  currentQuestion.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion._id}`}
                        value={option}
                        checked={answers[currentQuestion._id]?.selectedAnswer === option}
                        onChange={() => handleAnswerChange(currentQuestion._id, option)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))
                )}

                {hasQuestions && currentQuestion && (currentQuestion.questionType === 'True/False' || currentQuestion.questionType === 'TrueFalse') && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestion._id}`}
                          value={option}
                          checked={answers[currentQuestion._id]?.selectedAnswer === option}
                          onChange={() => handleAnswerChange(currentQuestion._id, option)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {hasQuestions && currentQuestion && (currentQuestion.questionType === 'Short Answer' || currentQuestion.questionType === 'ShortAnswer') && (
                  <textarea
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion._id]?.selectedAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                )}

                {hasQuestions && currentQuestion && (currentQuestion.questionType === 'Essay') && (
                  <textarea
                    placeholder="Type your detailed answer here..."
                    value={answers[currentQuestion._id]?.selectedAnswer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                  disabled={!hasQuestions || currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <button
                  onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                  disabled={!hasQuestions || currentQuestionIndex === exam.questions.length - 1}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Submission</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit your exam? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttempt;