import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const ExamResults = () => {
  const { examId } = useParams();
  const { user } = useExamContext();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (examId) {
      fetchExamAndResults();
    }
  }, [examId]);

  const fetchExamAndResults = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch exam details
      const examResponse = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!examResponse.ok) {
        throw new Error('Failed to fetch exam');
      }

      const examData = await examResponse.json();
      setExam(examData);

      // Fetch exam results
      const resultsResponse = await fetch(`http://localhost:5000/api/exam-results/exam/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!resultsResponse.ok) {
        throw new Error('Failed to fetch results');
      }

      const resultsData = await resultsResponse.json();
      setResults(resultsData);

      // Calculate statistics
      if (resultsData.length > 0) {
        const totalAttempts = resultsData.length;
        const completedResults = resultsData.filter(r => r.status === 'Completed');
        const averageScore = completedResults.length > 0
          ? completedResults.reduce((sum, r) => sum + r.percentage, 0) / completedResults.length
          : 0;
        const passRate = completedResults.length > 0
          ? (completedResults.filter(r => r.isPassed).length / completedResults.length) * 100
          : 0;
        const highestScore = completedResults.length > 0
          ? Math.max(...completedResults.map(r => r.percentage))
          : 0;
        const lowestScore = completedResults.length > 0
          ? Math.min(...completedResults.map(r => r.percentage))
          : 0;

        setStats({
          totalAttempts,
          completedAttempts: completedResults.length,
          averageScore: Math.round(averageScore * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
          highestScore: Math.round(highestScore * 100) / 100,
          lowestScore: Math.round(lowestScore * 100) / 100
        });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPassStatusColor = (isPassed) => {
    return isPassed ? 'text-green-600' : 'text-red-600';
  };

  if (user?.role !== 'Teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only teachers can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam results...</p>
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
            onClick={fetchExamAndResults}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">📊 Exam Results</h1>
        {exam && (
          <div className="text-gray-600">
            <p className="text-lg">{exam.title}</p>
            <p className="text-sm">{exam.subject} • {exam.totalMarks} marks</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAttempts}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">📋 Student Results</h3>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Yet</h3>
            <p className="text-gray-500">Students haven't taken this exam yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {result.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className={`font-semibold ${getScoreColor(result.percentage)}`}>
                          {result.marksObtained}/{result.totalMarks}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.percentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPassStatusColor(result.isPassed)} bg-opacity-10`}>
                        {result.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(result.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(result.endTime || result.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResults; 