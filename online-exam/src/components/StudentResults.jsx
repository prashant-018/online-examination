import React, { useState, useEffect } from 'react';
import { useExamContext } from './context/ExamContext';
import API_BASE from '../config';

const StudentResults = () => {
  const { user } = useExamContext();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    if (user?.role === 'Student') {
      fetchStudentResults();
    }
  }, [user]);

  const fetchStudentResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/exam-results/student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        throw new Error('Failed to fetch results');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    switch (filter) {
      case 'passed':
        return results.filter(result => result.isPassed);
      case 'failed':
        return results.filter(result => !result.isPassed);
      default:
        return results;
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPassStatusColor = (isPassed) => {
    return isPassed ? 'text-green-600' : 'text-red-600';
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

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (user?.role !== 'Student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Results</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchStudentResults}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredResults = getFilteredResults();

  // Calculate overall statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => r.isPassed).length;
  const averageScore = totalExams > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalExams * 100) / 100
    : 0;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">📊 My Exam Results</h1>
        <p className="text-gray-600">Track your performance across all exams</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-gray-900">{passedExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Results', count: results.length },
            { key: 'passed', label: 'Passed', count: results.filter(r => r.isPassed).length },
            { key: 'failed', label: 'Failed', count: results.filter(r => !r.isPassed).length }
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

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'all' ? 'No exam results yet' : `No ${filter} results`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'Take some exams to see your results here.'
              : `You haven't ${filter} any exams yet.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div
              key={result._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {result.exam.title}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPassStatusColor(result.isPassed)} bg-opacity-10`}>
                      {result.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{result.exam.subject}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Score:</span>
                      <span className={`ml-1 font-semibold ${getScoreColor(result.percentage)}`}>
                        {result.marksObtained}/{result.totalMarks}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Percentage:</span>
                      <span className={`ml-1 font-semibold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">{formatDuration(result.duration)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-1 capitalize">{result.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 border-t pt-3">
                <span>Submitted: {formatDate(result.endTime || result.createdAt)} at {formatTime(result.endTime || result.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults; 