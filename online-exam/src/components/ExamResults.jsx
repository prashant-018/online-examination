import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const ExamResults = () => {
  const { examId } = useParams();
  const { user } = useExamContext();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/exam-results/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch exam results');
        }
        const data = await res.json();
        setResults(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (examId && (user?.role === 'Teacher' || user?.role === 'Admin')) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [examId, user]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');
  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      : '';

  if (user?.role !== 'Teacher' && user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only teachers/admins can access this page.</p>
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
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">📑 Exam Results</h1>
        <p className="text-gray-600">Exam ID: {examId}</p>
      </div>

      {(!results || results.length === 0) ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No submissions yet</h3>
          <p className="text-gray-500">Once students submit, their results will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-600">
            <div>Student</div>
            <div>Email</div>
            <div>Score</div>
            <div>Percentage</div>
            <div>Status</div>
            <div>Submitted</div>
          </div>
          <div>
            {results.map((r) => (
              <div key={r._id} className="grid grid-cols-6 gap-4 px-6 py-4 border-t text-sm items-center">
                <div className="font-medium text-gray-800">{r.student?.name || '-'}</div>
                <div className="text-gray-600">{r.student?.email || '-'}</div>
                <div className="text-gray-800">{r.marksObtained}/{r.totalMarks}</div>
                <div className={`font-semibold ${r.percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>{r.percentage}%</div>
                <div className="capitalize text-gray-700">{r.isPassed ? 'Passed' : 'Failed'}</div>
                <div className="text-gray-500">{formatDate(r.endTime || r.createdAt)} {formatTime(r.endTime || r.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResults;