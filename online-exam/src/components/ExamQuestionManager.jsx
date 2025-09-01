import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';
import QuestionBank from './QuestionBank';
import config from '../config';

const ExamQuestionManager = () => {
  const { examId } = useParams();
  const { user } = useExamContext();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [importing, setImporting] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditQuestion, setQuickEditQuestion] = useState(null);
  const [quickEditAnswer, setQuickEditAnswer] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'stats', 'actions'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form state for adding/editing questions
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'Multiple Choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    explanation: '',
    difficulty: 'Medium'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Question templates
  const questionTemplates = [
    {
      name: 'Basic Multiple Choice',
      template: {
        questionText: 'What is the capital of France?',
        questionType: 'Multiple Choice',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris',
        marks: 1,
        difficulty: 'Easy'
      }
    },
    {
      name: 'True/False Question',
      template: {
        questionText: 'The Earth is round.',
        questionType: 'True/False',
        options: ['True', 'False'],
        correctAnswer: 'True',
        marks: 1,
        difficulty: 'Easy'
      }
    },
    {
      name: 'Short Answer',
      template: {
        questionText: 'Explain the concept of photosynthesis in one sentence.',
        questionType: 'Short Answer',
        correctAnswer: 'Photosynthesis is the process by which plants convert sunlight into energy.',
        marks: 2,
        difficulty: 'Medium'
      }
    }
  ];

  useEffect(() => {
    if (examId) {
      fetchExamAndQuestions();
    }
  }, [examId]);

  const fetchExamAndQuestions = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch exam details
      const examResponse = await fetch(`${config.API_BASE}/api/exams/${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!examResponse.ok) {
        throw new Error('Failed to fetch exam');
      }

      const examData = await examResponse.json();
      setExam(examData);

      // Fetch questions for this exam
      const questionsResponse = await fetch(`${config.API_BASE}/api/exams/${examId}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!questionForm.questionText.trim()) {
      errors.questionText = 'Question text is required';
    }

    if (!questionForm.correctAnswer.trim()) {
      errors.correctAnswer = 'Correct answer is required';
    }

    if (questionForm.marks < 1) {
      errors.marks = 'Marks must be at least 1';
    }

    if (questionForm.questionType === 'Multiple Choice') {
      if (questionForm.options.length < 2) {
        errors.options = 'At least 2 options are required';
      }

      const validOptions = questionForm.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        errors.options = 'At least 2 valid options are required';
      }

      if (!questionForm.options.includes(questionForm.correctAnswer)) {
        errors.correctAnswer = 'Correct answer must match one of the options';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));

    // Clear options error
    if (formErrors.options) {
      setFormErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    if (questionForm.options.length < 6) {
      setQuestionForm(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (questionForm.options.length > 2) {
      const newOptions = questionForm.options.filter((_, i) => i !== index);
      setQuestionForm(prev => ({
        ...prev,
        options: newOptions
      }));

      // If the correct answer was removed, clear it
      if (questionForm.correctAnswer === questionForm.options[index]) {
        setQuestionForm(prev => ({
          ...prev,
          correctAnswer: ''
        }));
      }
    }
  };

  const resetForm = () => {
    setQuestionForm({
      questionText: '',
      questionType: 'Multiple Choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: '',
      difficulty: 'Medium'
    });
    setFormErrors({});
    setEditingQuestion(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingQuestion
        ? `${config.API_BASE}/api/questions/${editingQuestion._id}`
        : `${config.API_BASE}/api/questions`;

      const method = editingQuestion ? 'PUT' : 'POST';
      const body = {
        ...questionForm,
        examId: examId,
        subject: exam.subject
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();

        if (editingQuestion) {
          // Update existing question in the list
          setQuestions(prev =>
            prev.map(q => q._id === editingQuestion._id ? result.question : q)
          );
          setSuccess('Question updated successfully!');
        } else {
          // Add new question to the list
          setQuestions(prev => [...prev, result.question]);
          setSuccess('Question added successfully!');
        }

        resetForm();
        setShowAddForm(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save question');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      explanation: question.explanation || '',
      difficulty: question.difficulty
    });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        setSuccess('Question deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete question');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const moveQuestion = async (questionId, direction) => {
    const currentIndex = questions.findIndex(q => q._id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/exams/${examId}/questions/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          newIndex
        }),
      });

      if (response.ok) {
        // Update local state
        const newQuestions = [...questions];
        const [movedQuestion] = newQuestions.splice(currentIndex, 1);
        newQuestions.splice(newIndex, 0, movedQuestion);
        setQuestions(newQuestions);
        setSuccess('Question reordered successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to reorder questions');
      setTimeout(() => setError(''), 5000);
    }
  };

  const useTemplate = (template) => {
    setQuestionForm(template);
    setFormErrors({});
    setShowTemplates(false);
    setShowAddForm(true);
  };

  const handleBulkImport = async () => {
    if (!bulkQuestions.trim()) {
      setError('Please enter questions to import');
      return;
    }

    setImporting(true);
    try {
      const token = localStorage.getItem('token');
      const lines = bulkQuestions.trim().split('\n');
      const questionsToImport = [];
      let errorCount = 0;

      for (const line of lines) {
        if (line.trim()) {
          try {
            // Parse CSV format: question,type,options,correctAnswer,marks,difficulty
            const [questionText, questionType, optionsStr, correctAnswer, marks, difficulty] = line.split(',').map(s => s.trim());

            if (!questionText || !correctAnswer) {
              errorCount++;
              continue;
            }

            const questionData = {
              questionText,
              questionType: questionType || 'Multiple Choice',
              options: questionType === 'Multiple Choice' ? optionsStr.split('|') : [],
              correctAnswer,
              marks: parseInt(marks) || 1,
              difficulty: difficulty || 'Medium',
              subject: exam.subject
            };

            questionsToImport.push(questionData);
          } catch (err) {
            errorCount++;
          }
        }
      }

      if (questionsToImport.length === 0) {
        throw new Error('No valid questions found in the input');
      }

      // Use bulk create endpoint
      const response = await fetch(`${config.API_BASE}/api/questions/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questions: questionsToImport,
          examId: examId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuestions(prev => [...prev, ...result.questions]);
        setSuccess(`Successfully imported ${result.questions.length} questions${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        setBulkQuestions('');
        setShowBulkImport(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import questions');
      }
    } catch (err) {
      setError('Bulk import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleAddFromQuestionBank = async () => {
    if (selectedQuestions.length === 0) {
      setError('Please select questions to add');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/exams/${examId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionIds: selectedQuestions
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuestions(prev => [...prev, ...result.exam.questions.filter(q => !prev.find(pq => pq._id === q._id))]);
        setSuccess(`Successfully added ${selectedQuestions.length} questions to the exam!`);
        setSelectedQuestions([]);
        setShowQuestionBank(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add questions to exam');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleQuestionSelection = (questionIds) => {
    setSelectedQuestions(questionIds);
  };

  const handleRemoveFromExam = async (questionId) => {
    if (!window.confirm('Are you sure you want to remove this question from the exam? The question will remain in your question bank.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/exams/${examId}/questions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionIds: [questionId]
        }),
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        setSuccess('Question removed from exam successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove question from exam');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDuplicate = (question) => {
    setQuestionForm({
      questionText: `${question.questionText} (Copy)`,
      questionType: question.questionType,
      options: question.options ? [...question.options] : ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      explanation: question.explanation || '',
      difficulty: question.difficulty
    });
    setFormErrors({});
    setEditingQuestion(null);
    setShowAddForm(true);
    setSuccess('Question duplicated! Please review and save the copy.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportQuestions = () => {
    if (questions.length === 0) {
      setError('No questions to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Question', 'Type', 'Options', 'Correct Answer', 'Marks', 'Difficulty', 'Explanation'],
      ...questions.map(q => [
        q.questionText,
        q.questionType,
        q.options ? q.options.join('|') : '',
        q.correctAnswer,
        q.marks,
        q.difficulty,
        q.explanation || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam?.title || 'exam'}_questions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess('Questions exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleQuickEdit = (question) => {
    setQuickEditQuestion(question);
    setQuickEditAnswer(question.correctAnswer);
    setShowQuickEdit(true);
  };

  const handleQuickEditSubmit = async () => {
    if (!quickEditAnswer.trim()) {
      setError('Please select a correct answer');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/questions/${quickEditQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          correctAnswer: quickEditAnswer
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuestions(prev =>
          prev.map(q => q._id === quickEditQuestion._id ? result.question : q)
        );
        setSuccess('Correct answer updated successfully!');
        setShowQuickEdit(false);
        setQuickEditQuestion(null);
        setQuickEditAnswer('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update answer');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Calculate question statistics
  const questionStats = {
    totalQuestions: questions.length,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    byType: questions.reduce((acc, q) => {
      acc[q.questionType] = (acc[q.questionType] || 0) + 1;
      return acc;
    }, {}),
    byDifficulty: questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {}),
    averageMarks: questions.length > 0 ? (questions.reduce((sum, q) => sum + q.marks, 0) / questions.length).toFixed(1) : 0
  };

  if (user?.role !== 'Teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only teachers can manage exam questions.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Questions</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchExamAndQuestions}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  // Mobile menu component
  const MobileMenu = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 p-2">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        >
          <span className="text-lg">📝</span>
          <span className="text-xs">Questions</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'stats' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
        >
          <span className="text-lg">📊</span>
          <span className="text-xs">Stats</span>
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center p-2 rounded-lg text-gray-600"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-xs">Actions</span>
        </button>
      </div>
    </div>
  );

  // Mobile actions menu
  const MobileActionsMenu = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
      <div className="bg-white rounded-t-2xl w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Actions</h3>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setShowAddForm(true); setIsMobileMenuOpen(false); }}
            className="p-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Add Question
          </button>
          <button
            onClick={() => { setShowQuestionBank(true); setIsMobileMenuOpen(false); }}
            className="p-3 bg-indigo-600 text-white rounded-lg text-sm font-medium"
          >
            Question Bank
          </button>
          <button
            onClick={() => { setShowBulkImport(true); setIsMobileMenuOpen(false); }}
            className="p-3 bg-orange-600 text-white rounded-lg text-sm font-medium"
          >
            Bulk Import
          </button>
          <button
            onClick={() => { setShowTemplates(true); setIsMobileMenuOpen(false); }}
            className="p-3 bg-purple-600 text-white rounded-lg text-sm font-medium"
          >
            Templates
          </button>
          <button
            onClick={() => { handleExportQuestions(); setIsMobileMenuOpen(false); }}
            className="p-3 bg-teal-600 text-white rounded-lg text-sm font-medium"
          >
            Export
          </button>
          <button
            onClick={() => { navigate(`/exam-results/${examId}`); setIsMobileMenuOpen(false); }}
            className="p-3 bg-green-600 text-white rounded-lg text-sm font-medium"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-blue-800">📝 Question Manager</h1>
                {exam && (
                  <div className="text-gray-600 text-sm">
                    <p className="font-medium">{exam.title}</p>
                    <p>{exam.subject} • {questions.length} questions • {totalMarks} marks</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600"
              >
                ⚙️
              </button>
            </div>

            {/* Desktop buttons */}
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/exam-results/${examId}`)}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
              >
                View Results
              </button>
              <button
                onClick={handleExportQuestions}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition"
              >
                Export
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
              >
                Templates
              </button>
              <button
                onClick={() => setShowQuestionBank(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition"
              >
                Question Bank
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition"
              >
                Bulk Import
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
              >
                Add Question
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Exam Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-blue-600">{questionStats.totalQuestions}</div>
                <div className="text-xs md:text-sm text-blue-700">Total Questions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-green-600">{questionStats.totalMarks}</div>
                <div className="text-xs md:text-sm text-green-700">Total Marks</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-purple-600">{questionStats.averageMarks}</div>
                <div className="text-xs md:text-sm text-purple-700">Avg Marks</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-orange-600">
                  {exam ? Math.round((questionStats.totalMarks / exam.totalMarks) * 100) : 0}%
                </div>
                <div className="text-xs md:text-sm text-orange-700">Marks Used</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">By Question Type</h4>
                <div className="space-y-2">
                  {Object.entries(questionStats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{type}</span>
                      <span className="text-sm font-medium text-gray-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">By Difficulty</h4>
                <div className="space-y-2">
                  {Object.entries(questionStats.byDifficulty).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{difficulty}</span>
                      <span className="text-sm font-medium text-gray-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <>
            {/* Add/Edit Question Form */}
            {showAddForm && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h3>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      name="questionText"
                      value={questionForm.questionText}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.questionText ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter your question here..."
                    />
                    {formErrors.questionText && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.questionText}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        name="questionType"
                        value={questionForm.questionType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Multiple Choice">Multiple Choice</option>
                        <option value="True/False">True/False</option>
                        <option value="Short Answer">Short Answer</option>
                        <option value="Essay">Essay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marks *
                      </label>
                      <input
                        type="number"
                        name="marks"
                        value={questionForm.marks}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.marks ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formErrors.marks && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.marks}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        value={questionForm.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Options for Multiple Choice */}
                  {questionForm.questionType === 'Multiple Choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options * (Click the radio button to mark correct answer)
                      </label>
                      <div className="space-y-3">
                        {questionForm.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${questionForm.correctAnswer === option
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                              }`}
                          >
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={option}
                              checked={questionForm.correctAnswer === option}
                              onChange={handleInputChange}
                              className="text-green-600 focus:ring-green-500"
                              id={`option-${index}`}
                            />
                            <label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer"
                            >
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </label>
                            {questionForm.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                title="Remove option"
                              >
                                ✕
                              </button>
                            )}
                            {questionForm.correctAnswer === option && (
                              <div className="hidden md:flex items-center gap-1 text-green-600">
                                <span className="text-sm font-medium">✓ Correct</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {questionForm.options.length < 6 && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="w-full px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg transition text-sm font-medium"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>
                      {formErrors.options && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.options}</p>
                      )}
                      {formErrors.correctAnswer && (
                        <p className="text-red-500 text-sm mt-2">{formErrors.correctAnswer}</p>
                      )}
                    </div>
                  )}

                  {/* Correct Answer for non-multiple choice */}
                  {questionForm.questionType !== 'Multiple Choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      {questionForm.questionType === 'True/False' ? (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value="True"
                              checked={questionForm.correctAnswer === 'True'}
                              onChange={handleInputChange}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                              True
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value="False"
                              checked={questionForm.correctAnswer === 'False'}
                              onChange={handleInputChange}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                              False
                            </span>
                          </label>
                        </div>
                      ) : (
                        <textarea
                          name="correctAnswer"
                          value={questionForm.correctAnswer}
                          onChange={handleInputChange}
                          required
                          rows={questionForm.questionType === 'Essay' ? 4 : 2}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.correctAnswer ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder={
                            questionForm.questionType === 'Essay'
                              ? 'Enter the expected essay answer or key points...'
                              : 'Enter the correct answer...'
                          }
                        />
                      )}
                      {formErrors.correctAnswer && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.correctAnswer}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      name="explanation"
                      value={questionForm.explanation}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Questions ({questions.length})
                </h3>
                {questions.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {totalMarks} total marks
                  </div>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Yet</h3>
                  <p className="text-gray-500 mb-6">Add questions to get started with your exam.</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
                    >
                      Use Templates
                    </button>
                    <button
                      onClick={() => setShowBulkImport(true)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm"
                    >
                      Bulk Import
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                    >
                      Add First Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <div key={question._id} className="p-4 md:p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg font-semibold text-gray-400 mt-1">#{index + 1}</span>
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                              {question.questionText}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {question.difficulty}
                              </span>
                              <span>{question.questionType}</span>
                              <span className="font-medium">{question.marks} marks</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDuplicate(question)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => {
                              setPreviewQuestion(question);
                              setShowPreview(true);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Preview"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleQuickEdit(question)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            title="Quick Edit"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleRemoveFromExam(question._id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition"
                            title="Remove from exam"
                          >
                            ➖
                          </button>
                          <button
                            onClick={() => handleDelete(question._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Show options for multiple choice */}
                      {question.questionType === 'Multiple Choice' && question.options && (
                        <div className="ml-8 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border-2 ${option === question.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                                }`}>
                                {option === question.correctAnswer && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                )}
                              </span>
                              <span className={`text-sm ${option === question.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}`}>
                                {option}
                                {option === question.correctAnswer && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    ✓ Correct
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show correct answer for other types */}
                      {question.questionType !== 'Multiple Choice' && (
                        <div className="ml-8">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Correct Answer:</span> {question.correctAnswer}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              ✓ Correct
                            </span>
                          </div>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="ml-8 mt-2">
                          <p className="text-sm text-gray-500 italic">
                            <span className="font-medium">Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      )}

                      {/* Move buttons for desktop */}
                      <div className="ml-8 mt-3 flex gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => moveQuestion(question._id, 'up')}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                          >
                            ↑ Move Up
                          </button>
                        )}
                        {index < questions.length - 1 && (
                          <button
                            onClick={() => moveQuestion(question._id, 'down')}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                          >
                            ↓ Move Down
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Question Templates</h3>
              <div className="space-y-3 mb-6">
                {questionTemplates.map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-800 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.template.questionText}</p>
                    <button
                      onClick={() => useTemplate(template.template)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="w-full px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showBulkImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📥 Bulk Import Questions</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Format: question,type,options,correctAnswer,marks,difficulty
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Example: "What is 2+2?,Multiple Choice,2|3|4|5,4,1,Easy"
                </p>
                <textarea
                  value={bulkQuestions}
                  onChange={(e) => setBulkQuestions(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter questions in CSV format..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkImport}
                  disabled={importing}
                  className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
                >
                  {importing ? 'Importing...' : 'Import Questions'}
                </button>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuestionBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h3 className="text-xl font-semibold text-gray-800">📚 Add Questions from Question Bank</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddFromQuestionBank}
                    disabled={selectedQuestions.length === 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
                  >
                    Add {selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ''}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuestionBank(false);
                      setSelectedQuestions([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <QuestionBank
                onSelectQuestions={handleQuestionSelection}
                selectedQuestions={selectedQuestions}
                examSubject={exam?.subject}
              />
            </div>
          </div>
        )}

        {showPreview && previewQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">👁️ Question Preview</h3>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewQuestion(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Question:</h4>
                  <p className="text-gray-700">{previewQuestion.questionText}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="ml-2 text-gray-800">{previewQuestion.questionType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Marks:</span>
                    <span className="ml-2 text-gray-800">{previewQuestion.marks}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Difficulty:</span>
                    <span className="ml-2 text-gray-800">{previewQuestion.difficulty}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Subject:</span>
                    <span className="ml-2 text-gray-800">{previewQuestion.subject}</span>
                  </div>
                </div>

                {previewQuestion.questionType === 'Multiple Choice' && previewQuestion.options && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Options:</h4>
                    <div className="space-y-2">
                      {previewQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border-2 ${option === previewQuestion.correctAnswer
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                            }`}>
                            {option === previewQuestion.correctAnswer && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </span>
                          <span className={`${option === previewQuestion.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}`}>
                            {option}
                            {option === previewQuestion.correctAnswer && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                ✓ Correct Answer
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewQuestion.questionType !== 'Multiple Choice' && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Correct Answer:</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      {previewQuestion.correctAnswer}
                    </p>
                  </div>
                )}

                {previewQuestion.explanation && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Explanation:</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {previewQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showQuickEdit && quickEditQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Edit Correct Answer</h3>
              <p className="text-sm text-gray-600 mb-4">
                Current Correct Answer: <span className="font-medium text-green-700">{quickEditQuestion.correctAnswer}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Correct Answer *
                </label>
                <textarea
                  value={quickEditAnswer}
                  onChange={(e) => setQuickEditAnswer(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the new correct answer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleQuickEditSubmit}
                  className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Update Answer
                </button>
                <button
                  onClick={() => {
                    setShowQuickEdit(false);
                    setQuickEditQuestion(null);
                    setQuickEditAnswer('');
                  }}
                  className="flex-1 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu />
      {isMobileMenuOpen && <MobileActionsMenu />}
    </div>
  );
};

export default ExamQuestionManager;