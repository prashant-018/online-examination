import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';

const ExamCards = () => {
  const navigate = useNavigate();
  const { user } = useExamContext();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data
          : (Array.isArray(data?.exams) ? data.exams : []);
        setExams(normalized);
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
    const now = new Date();

    // Only students can attempt exams
    if (user?.role !== 'Student') {
      alert('Only students can attempt exams.');
      return navigate('/exam');
    }

    // Respect allowed roles if present
    if (Array.isArray(exam?.allowedRoles) && !exam.allowedRoles.includes('Student')) {
      return alert('You are not allowed to attempt this exam.');
    }

    // Time window check: must be active
    const starts = new Date(exam.startTime);
    const ends = new Date(exam.endTime);
    if (now < starts) {
      return alert('Exam has not started yet.');
    }
    if (now > ends) {
      return alert('This exam has ended.');
    }

    navigate(`/exam-attempt/${exam._id}`);
  };

  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  const handleEditExam = (exam) => {
    navigate(`/edit-exam/${exam._id}`);
  };

  const handleViewExam = (exam) => {
    navigate(`/exam-details/${exam._id}`);
  };

  const handleDeleteExam = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${examToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExams(exams.filter(exam => exam._id !== examToDelete._id));
        setShowDeleteModal(false);
        setExamToDelete(null);
      } else {
        throw new Error('Failed to delete exam');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getFilteredExams = () => {
    const now = new Date();
    let filtered = exams;

    // Apply status filter
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(exam => new Date(exam.startTime) > now);
        break;
      case 'active':
        filtered = filtered.filter(exam =>
          new Date(exam.startTime) <= now && new Date(exam.endTime) >= now
        );
        break;
      case 'ended':
        filtered = filtered.filter(exam => new Date(exam.endTime) < now);
        break;
      default:
      // No filter applied
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(term) ||
        exam.subject.toLowerCase().includes(term) ||
        exam.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);

    if (now < startTime) return {
      text: 'Upcoming',
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    };
    if (now > endTime) return {
      text: 'Ended',
      color: 'bg-gray-100 text-gray-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return {
      text: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      'Mathematics': '🧮',
      'Computer Science': '💻',
      'Islamic Studies': '☪️',
      'Web Engineering': '🌐',
      'English': '📖',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'Science': '🔬',
      'History': '📜',
      'Geography': '🌍',
      'Economics': '💹'
    };
    return icons[subject] || '📝';
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'from-blue-500 to-blue-600',
      'Computer Science': 'from-purple-500 to-purple-600',
      'Islamic Studies': 'from-green-500 to-green-600',
      'Web Engineering': 'from-indigo-500 to-indigo-600',
      'English': 'from-red-500 to-red-600',
      'Physics': 'from-yellow-500 to-yellow-600',
      'Chemistry': 'from-pink-500 to-pink-600',
      'Biology': 'from-teal-500 to-teal-600',
      'Science': 'from-orange-500 to-orange-600',
      'History': 'from-amber-500 to-amber-600',
      'Geography': 'from-cyan-500 to-cyan-600',
      'Economics': 'from-fuchsia-500 to-fuchsia-600'
    };
    return colors[subject] || 'from-gray-500 to-gray-600';
  };

  // Build a student-attempt URL that can be shared
  const getExamLink = (exam) => {
    const origin = typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : '';
    return `${origin}/exam-attempt/${exam._id}`;
  };

  const handleCopyLink = async (exam) => {
    try {
      const link = getExamLink(exam);
      await navigator.clipboard.writeText(link);
      setCopiedId(exam._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      alert('Failed to copy link.');
    }
  };

  const handleShareLink = async (exam) => {
    const link = getExamLink(exam);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Exam: ${exam.title || exam.subject}`, url: link });
      } catch (_) {
        // user cancelled share
      }
    } else {
      handleCopyLink(exam);
    }
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center mb-6">
            <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Loading Exams</h2>
          <p className="text-gray-500">Please wait while we load available exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Error Loading Exams</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={fetchExams}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredExams = getFilteredExams();
  const filterCounts = {
    all: exams.length,
    upcoming: exams.filter(e => new Date(e.startTime) > new Date()).length,
    active: exams.filter(e => new Date(e.startTime) <= new Date() && new Date(e.endTime) >= new Date()).length,
    ended: exams.filter(e => new Date(e.endTime) < new Date()).length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.role === 'Teacher' ? 'Exam Management' : 'Available Exams'}
              </h1>
              <p className="text-gray-500 mt-1">
                {user?.role === 'Teacher'
                  ? 'Create, edit, and manage your exams'
                  : 'Browse and attempt your exams'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exams..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {user?.role === 'Teacher' && (
                <button
                  onClick={handleCreateExam}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Exam
                </button>
              )}

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'upcoming', 'active', 'ended'].map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({filterCounts[key]})
                </button>
              ))}

              {(filter !== 'all' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 flex items-center"
                >
                  Clear Filters
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchTerm
                ? 'No matching exams found'
                : filter === 'all'
                  ? user?.role === 'Teacher' ? 'No exams created yet' : 'No exams available'
                  : `No ${filter} exams`}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try a different search term'
                : filter === 'all'
                  ? user?.role === 'Teacher'
                    ? 'Create your first exam to get started'
                    : 'Check back later for new exams'
                  : `There are currently no ${filter} exams`}
            </p>
            {filter === 'all' && user?.role === 'Teacher' && (
              <button
                onClick={handleCreateExam}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Exam
              </button>
            )}
            {(filter !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 ml-3"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const status = getStatus(exam);
              const subjectColor = getSubjectColor(exam.subject);
              const userId = user?._id || user?.id;
              const createdById = typeof exam.createdBy === 'object' && exam.createdBy !== null
                ? (exam.createdBy._id || exam.createdBy.id)
                : exam.createdBy;
              const isOwner = String(createdById) === String(userId);

              return (
                <div
                  key={exam._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                  {/* Subject Header */}
                  <div className={`bg-gradient-to-r ${subjectColor} p-4 flex items-center`}>
                    <div className="bg-white bg-opacity-20 rounded-full p-3 mr-3">
                      <span className="text-xl">{getSubjectIcon(exam.subject)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{exam.subject}</h3>
                      <p className="text-white text-opacity-80 text-sm">{exam.questions?.length || 0} questions</p>
                    </div>
                    {user?.role === 'Teacher' && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewExam(exam);
                          }}
                          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title="View Details"
                          aria-label="View exam details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExam(exam);
                          }}
                          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title="Edit Exam"
                          aria-label="Edit exam"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(exam);
                          }}
                          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title={copiedId === exam._id ? 'Copied!' : 'Copy link'}
                          aria-label="Copy exam link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-2m-6 6l-4-4m0 0l4-4m-4 4h12" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareLink(exam);
                          }}
                          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title="Share link"
                          aria-label="Share exam link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zm9 9a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExam(exam);
                          }}
                          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                          title="Delete Exam"
                          aria-label="Delete exam"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    {/* Status and Title */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        <span className="ml-1">{status.text}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(exam.startTime)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {exam.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {exam.description}
                    </p>

                    {/* Exam Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{exam.duration} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Marks</p>
                        <p className="font-medium">{exam.totalMarks}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Passing Marks</p>
                        <p className="font-medium">{exam.passingMarks}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Max Attempts</p>
                        <p className="font-medium">{exam.maxAttempts || 'Unlimited'}</p>
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-4">
                      <div className="flex items-center mb-1">
                        <svg className="h-3 w-3 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Starts: {formatTime(exam.startTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-3 w-3 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Ends: {formatTime(exam.endTime)}</span>
                      </div>
                    </div>

                    {/* Action Button - positioned at bottom with mt-auto */}
                    <div className="mt-auto">
                      {user?.role === 'Teacher' ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleViewExam(exam)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-green-600 hover:text-green-700 border border-green-200 hover:border-green-300 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCopyLink(exam)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded transition-colors"
                          >
                            {copiedId === exam._id ? 'Copied' : 'Copy Link'}
                          </button>
                          <button
                            onClick={() => handleShareLink(exam)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded transition-colors"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam)}
                            className="flex-1 py-2 px-3 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startExam(exam)}
                          disabled={status.text === 'Ended'}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-colors ${status.text === 'Upcoming' ? 'bg-blue-600 hover:bg-blue-700' :
                            status.text === 'Active' ? 'bg-green-600 hover:bg-green-700' :
                              'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                          {status.text === 'Ended' ? 'Exam Ended' : 'Start Exam'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Exam</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{examToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteExam}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCards;