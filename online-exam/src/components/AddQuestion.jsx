import React, { useState } from 'react';
import { useExamContext } from './context/ExamContext';
import API_BASE from '../config';

const AddQuestion = ({ examId, onQuestionAdded, onCancel }) => {
  const { user } = useExamContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'Multiple Choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    explanation: '',
    difficulty: 'Medium'
  });

  const [formErrors, setFormErrors] = useState({});

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

      if (questionForm.correctAnswer === questionForm.options[index]) {
        setQuestionForm(prev => ({
          ...prev,
          correctAnswer: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...questionForm,
          examId: examId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Question added successfully!');
        if (onQuestionAdded) {
          onQuestionAdded(result.question);
        }

        // Reset form
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

        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add question');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Only teachers can add questions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">➕ Add New Question</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            name="questionText"
            value={questionForm.questionText}
            onChange={handleInputChange}
            required
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.questionText ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter your question here..."
          />
          {formErrors.questionText && (
            <p className="text-red-500 text-sm mt-1">{formErrors.questionText}</p>
          )}
        </div>

        {/* Question Type, Marks, Difficulty */}
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
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

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            name="explanation"
            value={questionForm.explanation}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Explain why this is the correct answer..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
          >
            {loading ? 'Adding...' : 'Add Question'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddQuestion; 