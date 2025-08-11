import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamContext } from './context/ExamContext';
import QuestionBank from './QuestionBank';

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
      const examResponse = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!examResponse.ok) {
        throw new Error('Failed to fetch exam');
      }

      const examData = await examResponse.json();
      setExam(examData);

      // Fetch questions for this exam
      const questionsResponse = await fetch(`http://localhost:5000/api/exams/${examId}/questions`, {
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
        ? `http://localhost:5000/api/questions/${editingQuestion._id}`
        : `http://localhost:5000/api/questions`;

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
      const response = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
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
      const response = await fetch(`http://localhost:5000/api/exams/${examId}/questions/reorder`, {
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
      const response = await fetch('http://localhost:5000/api/questions/bulk', {
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
      const response = await fetch(`http://localhost:5000/api/exams/${examId}/questions`, {
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
      const response = await fetch(`http://localhost:5000/api/exams/${examId}/questions`, {
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
      const response = await fetch(`http://localhost:5000/api/questions/${quickEditQuestion._id}`, {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only teachers can manage exam questions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Questions</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchExamAndQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">📝 Question Manager</h1>
            {exam && (
              <div className="text-gray-600">
                <p className="text-lg">{exam.title}</p>
                <p className="text-sm">{exam.subject} • {questions.length} questions • {totalMarks} total marks</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/exam-results/${examId}`)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              View Results
            </button>
            <button
              onClick={handleExportQuestions}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
            >
              Export
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Templates
            </button>
            <button
              onClick={() => setShowQuestionBank(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Question Bank
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              Bulk Import
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Exam Summary */}
      {exam && questions.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Exam Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-blue-700">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalMarks}</div>
              <div className="text-green-700">Total Marks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {questions.filter(q => q.difficulty === 'Easy').length}
              </div>
              <div className="text-purple-700">Easy Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {questions.filter(q => q.difficulty === 'Medium').length}
              </div>
              <div className="text-orange-700">Medium Questions</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {questions.filter(q => q.difficulty === 'Hard').length}
                </div>
                <div className="text-red-700">Hard Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {questions.filter(q => q.questionType === 'Multiple Choice').length}
                </div>
                <div className="text-indigo-700">Multiple Choice</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {questions.filter(q => q.questionType !== 'Multiple Choice').length}
                </div>
                <div className="text-teal-700">Other Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round((totalMarks / questions.length) * 10) / 10}
                </div>
                <div className="text-gray-700">Avg Marks/Question</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Statistics */}
      {questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Question Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questionStats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{questionStats.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{questionStats.averageMarks}</div>
              <div className="text-sm text-gray-600">Avg Marks</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {exam ? Math.round((questionStats.totalMarks / exam.totalMarks) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Marks Used</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

      {/* Question Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4">
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
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full mx-4">
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
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
              >
                {importing ? 'Importing...' : 'Import Questions'}
              </button>
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      {showQuestionBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">📚 Add Questions from Question Bank</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleAddFromQuestionBank}
                  disabled={selectedQuestions.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
                >
                  Add {selectedQuestions.length > 0 ? `(${selectedQuestions.length})` : ''} Questions
                </button>
                <button
                  onClick={() => {
                    setShowQuestionBank(false);
                    setSelectedQuestions([]);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
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

      {/* Question Preview Modal */}
      {showPreview && previewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                        <span className={option === previewQuestion.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}>
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

      {/* Add/Edit Question Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h3>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="flex items-center gap-1 text-green-600">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Questions ({questions.length})
          </h3>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Yet</h3>
            <p className="text-gray-500 mb-6">Add questions to get started with your exam.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Use Templates
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
              >
                Bulk Import
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add First Question
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question, index) => (
              <div key={question._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        {question.questionText}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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

                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(question._id, 'up')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Move Up"
                      >
                        ↑
                      </button>
                    )}
                    {index < questions.length - 1 && (
                      <button
                        onClick={() => moveQuestion(question._id, 'down')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Move Down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(question)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(question)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm"
                      title="Duplicate question"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        setPreviewQuestion(question);
                        setShowPreview(true);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                      title="Preview question"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleRemoveFromExam(question._id)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm"
                      title="Remove from exam (keeps question in bank)"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleQuickEdit(question)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm"
                      title="Quick edit correct answer"
                    >
                      ✏️
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
                        <span className={`${option === question.correctAnswer ? 'font-medium text-green-700' : 'text-gray-600'}`}>
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
                        ✓ Correct Answer
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {showQuickEdit && quickEditQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
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
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Update Answer
              </button>
              <button
                onClick={() => {
                  setShowQuickEdit(false);
                  setQuickEditQuestion(null);
                  setQuickEditAnswer('');
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamQuestionManager; 