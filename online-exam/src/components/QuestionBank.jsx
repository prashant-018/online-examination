import React, { useState, useEffect, useCallback } from 'react';
import { useExamContext } from './context/ExamContext';
import config from '../config';

const QuestionBank = ({ onSelectQuestions, selectedQuestions = [], examSubject }) => {
  const { user } = useExamContext();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    subject: examSubject || '',
    difficulty: '',
    questionType: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const questionsPerPage = 10;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      let url = `${config.API_BASE}/api/questions`;

      // Add filters to URL
      const params = new URLSearchParams();
      if (filter.subject) params.append('subject', filter.subject);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.questionType) params.append('questionType', filter.questionType);
      if (filter.search) params.append('search', filter.search);
      params.append('page', currentPage);
      params.append('limit', questionsPerPage);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // ✅ Ensure questions is always an array
      if (Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
      }

      setTotalPages(
        data.totalPages || Math.ceil((data.totalCount || (data.questions?.length || data.length || 0)) / questionsPerPage)
      );
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to fetch questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, questionsPerPage]);

  useEffect(() => {
    if (user?.role === 'Teacher') {
      fetchQuestions();
    }
  }, [user, fetchQuestions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      onSelectQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      onSelectQuestions([...selectedQuestions, questionId]);
    }
  };

  const selectAllQuestions = () => {
    const allQuestionIds = (Array.isArray(questions) ? questions : []).map(q => q._id);
    if (selectedQuestions.length === allQuestionIds.length) {
      onSelectQuestions([]);
    } else {
      onSelectQuestions(allQuestionIds);
    }
  };

  const isQuestionSelected = (questionId) => {
    return selectedQuestions.includes(questionId);
  };

  const clearFilters = () => {
    setFilter({
      subject: examSubject || '',
      difficulty: '',
      questionType: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
        <div className="text-5xl mb-4">👨‍🏫</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Teacher Access Required</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Only teachers with appropriate permissions can access the question bank.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">Loading Question Bank</h3>
        <p className="text-gray-500">Please wait while we fetch your questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
        <div className="text-5xl mb-4 text-red-500">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h3>
        <p className="text-red-500 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={fetchQuestions}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
          >
            Try Again
          </button>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  // ✅ Safe array handling
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const filteredQuestions = safeQuestions.filter(question => {
    if (
      filter.search &&
      !question.questionText?.toLowerCase().includes(filter.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = filter.subject || filter.difficulty || filter.questionType || filter.search;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-800">📚 Question Bank</h3>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition flex items-center gap-1"
              >
                <span>Clear Filters</span>
              </button>
            )}
            <div className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
              {selectedQuestions.length} selected
            </div>
          </div>
        </div>

        {/* Filters */}
        {/* ... (your filters UI remains unchanged) ... */}
      </div>

      {/* Questions List */}
      {/* ... (rest of your rendering logic stays unchanged, now using safeQuestions/filteredQuestions) ... */}
    </div>
  );
};

export default QuestionBank;
