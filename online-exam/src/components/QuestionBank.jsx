import React, { useState, useEffect } from 'react';
import { useExamContext } from './context/ExamContext';

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

  useEffect(() => {
    if (user?.role === 'Teacher') {
      fetchQuestions();
    }
  }, [user, filter]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${config.API_BASE}/api/questions`;

      // Add filters to URL
      const params = new URLSearchParams();
      if (filter.subject) params.append('subject', filter.subject);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.questionType) params.append('questionType', filter.questionType);
      if (filter.search) params.append('search', filter.search);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleQuestionSelection = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      onSelectQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      onSelectQuestions([...selectedQuestions, questionId]);
    }
  };

  const isQuestionSelected = (questionId) => {
    return selectedQuestions.includes(questionId);
  };

  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Only teachers can access the question bank.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredQuestions = questions.filter(question => {
    if (filter.search && !question.questionText.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Question Bank</h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              name="subject"
              value={filter.subject}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Web Engineering">Web Engineering</option>
              <option value="Islamic Studies">Islamic Studies</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={filter.difficulty}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="questionType"
              value={filter.questionType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True/False">True/False</option>
              <option value="Short Answer">Short Answer</option>
              <option value="Essay">Essay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search questions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredQuestions.length} questions found
          </p>
          <p className="text-sm text-gray-600">
            {selectedQuestions.length} questions selected
          </p>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Found</h3>
          <p className="text-gray-500">Try adjusting your filters or create new questions.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredQuestions.map((question) => (
            <div
              key={question._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${isQuestionSelected(question._id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              onClick={() => toggleQuestionSelection(question._id)}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isQuestionSelected(question._id)}
                  onChange={() => toggleQuestionSelection(question._id)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-800 line-clamp-2">
                      {question.questionText}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {question.questionType}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {question.marks} marks
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    Subject: {question.subject}
                  </p>

                  {/* Show options for multiple choice questions */}
                  {question.questionType === 'Multiple Choice' && question.options && (
                    <div className="text-sm text-gray-500">
                      <p className="font-medium mb-1">Options:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {question.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <span className="truncate">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {selectedQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedQuestions.length} question(s) selected
            </p>
            <button
              onClick={() => onSelectQuestions([])}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank; 