import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const ExamCards = () => {
  const navigate = useNavigate();
  const { user } = useExamContext();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, active, ended

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exams', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        throw new Error('Failed to fetch exams');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (exam) => {
    navigate(`/exam-attempt/${exam._id}`);
  };

  const getFilteredExams = () => {
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return exams.filter(exam => new Date(exam.startTime) > now);
      case 'active':
        return exams.filter(exam =>
          new Date(exam.startTime) <= now && new Date(exam.endTime) >= now
        );
      case 'ended':
        return exams.filter(exam => new Date(exam.endTime) < now);
      default:
        return exams;
    }
  };

  const getStatusColor = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) return 'bg-blue-100 text-blue-800';
    if (now > endTime) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) return 'Upcoming';
    if (now > endTime) return 'Ended';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-10 px-4 md:px-12">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available exams...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-100 py-10 px-4 md:px-12">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Exams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchExams}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const filteredExams = getFilteredExams();

  return (
    <section className="bg-gray-100 py-10 px-4 md:px-12">
      <div className="mb-8">
        <h2 className="inline-block bg-[#1658a0] text-white px-4 py-2 text-lg font-semibold rounded shadow mb-4">
          📚 Available Exams
        </h2>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Exams', count: exams.length },
            { key: 'upcoming', label: 'Upcoming', count: exams.filter(e => new Date(e.startTime) > new Date()).length },
            { key: 'active', label: 'Active', count: exams.filter(e => new Date(e.startTime) <= new Date() && new Date(e.endTime) >= new Date()).length },
            { key: 'ended', label: 'Ended', count: exams.filter(e => new Date(e.endTime) < new Date()).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'all' ? 'No exams available' : `No ${filter} exams`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'Check back later for new exams.'
              : `There are currently no ${filter} exams.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              {/* Subject Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">
                    {exam.subject === 'Mathematics' ? '📐' :
                      exam.subject === 'Computer Science' ? '💻' :
                        exam.subject === 'Islamic Studies' ? '☪️' :
                          exam.subject === 'Web Engineering' ? '🌐' :
                            exam.subject === 'English' ? '📚' :
                              exam.subject === 'Physics' ? '⚛️' :
                                exam.subject === 'Chemistry' ? '🧪' :
                                  exam.subject === 'Biology' ? '🧬' : '📝'}
                  </div>
                  <div className="font-semibold text-lg">{exam.subject}</div>
                </div>
              </div>

              <div className="p-6">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(exam)}`}>
                    {getStatusText(exam)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {exam.questions?.length || 0} questions
                  </span>
                </div>

                {/* Exam Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {exam.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {exam.description}
                </p>

                {/* Exam Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{exam.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <span className="font-medium">{exam.totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Marks:</span>
                    <span className="font-medium">{exam.passingMarks}</span>
                  </div>
                </div>

                {/* Time Information */}
                <div className="text-xs text-gray-400 mb-4">
                  <div>Start: {formatDate(exam.startTime)} at {formatTime(exam.startTime)}</div>
                  <div>End: {formatDate(exam.endTime)} at {formatTime(exam.endTime)}</div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => startExam(exam)}
                  disabled={getStatusText(exam) === 'Ended'}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition ${getStatusText(exam) === 'Ended'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {getStatusText(exam) === 'Ended' ? 'Exam Ended' : 'Start Exam'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExamCards;
