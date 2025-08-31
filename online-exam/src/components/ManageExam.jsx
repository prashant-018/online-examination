import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';
import { FiSearch, FiPlus, FiEdit, FiEye, FiTrash2, FiFilter, FiCalendar, FiClock, FiBook } from 'react-icons/fi';
import config from '../config';

const ManageExam = () => {
  const navigate = useNavigate();
  const { user } = useExamContext();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch exams');
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data?.exams) ? data.exams : [];
      // Only exams owned by this teacher (if teacher)
      const owned = user?.role === 'Teacher' ? list.filter(e => e.createdBy === user.id) : list;
      setExams(owned);
    } catch (e) {
      setError(e.message || 'Error fetching exams');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.API_BASE}/api/exams/${examToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete exam');
      setExams(prev => prev.filter(e => e._id !== examToDelete._id));
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (e) {
      setError(e.message || 'Error deleting exam');
    }
  };

  const onEdit = (exam) => navigate(`/edit-exam/${exam._id}`);
  const onView = (exam) => navigate(`/exam-details/${exam._id}`);
  const onAdd = () => navigate('/add-exam');

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'completed';
  };

  const filtered = exams.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.subject?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    );
  }).filter((e) => {
    if (filterStatus === 'all') return true;
    return getExamStatus(e) === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Exams</h1>
          <p className="text-gray-600">Create, edit and manage your examination content</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exams by title, subject, or description..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FiFilter className="h-4 w-4" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">By Title</option>
                </select>
              </div>

              <button
                onClick={onAdd}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2" />
                Add Exam
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500 mb-6">
              {search || filterStatus !== 'all'
                ? 'Try adjusting your search or filter to find what you are looking for.'
                : 'Get started by creating your first exam.'}
            </p>
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2" />
              Create Exam
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div key={exam._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{exam.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exam.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <FiBook className="mr-2 text-gray-400" />
                        {exam.subject}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiClock className="mr-2 text-gray-400" />
                        {exam.duration} min
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="mr-2 text-gray-400">Marks:</span>
                        {exam.passingMarks}/{exam.totalMarks}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      <div className="flex items-center mb-1">
                        <FiCalendar className="mr-2" />
                        Starts: {new Date(exam.startTime).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        Ends: {new Date(exam.endTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => onView(exam)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <FiEye className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => onEdit(exam)}
                        className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        <FiEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => { setExamToDelete(exam); setShowDeleteModal(true); }}
                        className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <FiTrash2 className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Exam</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{examToDelete?.title}</span>"?
              This action cannot be undone and all exam data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExam}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExam;