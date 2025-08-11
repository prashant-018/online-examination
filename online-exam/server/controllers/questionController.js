const Question = require('../models/Question');

// Create new question
const createQuestion = async (req, res) => {
  try {
    const { questionText, questionType, options, correctAnswer, marks, explanation, difficulty, subject, examId } = req.body;

    const question = new Question({
      questionText,
      questionType,
      options,
      correctAnswer,
      marks,
      explanation,
      difficulty,
      subject,
      createdBy: req.user.id
    });

    await question.save();

    // If examId is provided, add the question to the exam
    if (examId) {
      const Exam = require('../models/Exam');
      const exam = await Exam.findById(examId);

      if (exam && exam.createdBy.toString() === req.user.id) {
        exam.questions.push(question._id);
        await exam.save();
      }
    }

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Bulk create questions
const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions, examId } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required and must not be empty' });
    }

    if (questions.length > 100) {
      return res.status(400).json({ message: 'Cannot create more than 100 questions at once' });
    }

    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];

        // Validate required fields
        if (!questionData.questionText || !questionData.correctAnswer || !questionData.subject) {
          errors.push(`Question ${i + 1}: Missing required fields`);
          continue;
        }

        const question = new Question({
          questionText: questionData.questionText,
          questionType: questionData.questionType || 'Multiple Choice',
          options: questionData.options || [],
          correctAnswer: questionData.correctAnswer,
          marks: questionData.marks || 1,
          explanation: questionData.explanation || '',
          difficulty: questionData.difficulty || 'Medium',
          subject: questionData.subject,
          createdBy: req.user.id
        });

        await question.save();
        createdQuestions.push(question);
      } catch (err) {
        errors.push(`Question ${i + 1}: ${err.message}`);
      }
    }

    // If examId is provided, add all questions to the exam
    if (examId && createdQuestions.length > 0) {
      const Exam = require('../models/Exam');
      const exam = await Exam.findById(examId);

      if (exam && exam.createdBy.toString() === req.user.id) {
        const questionIds = createdQuestions.map(q => q._id);
        exam.questions.push(...questionIds);
        await exam.save();
      }
    }

    res.status(201).json({
      message: `Successfully created ${createdQuestions.length} questions${errors.length > 0 ? ` (${errors.length} failed)` : ''}`,
      questions: createdQuestions,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .populate('createdBy', 'name')
      .select('-correctAnswer'); // Don't expose correct answers in listing
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get question by ID (with correct answer for teachers/admins)
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only show correct answer to teachers and admins
    if (req.user.role === 'Student') {
      const questionWithoutAnswer = question.toObject();
      delete questionWithoutAnswer.correctAnswer;
      delete questionWithoutAnswer.explanation;
      return res.json(questionWithoutAnswer);
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the creator or admin
    if (question.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the creator or admin
    if (question.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get questions by subject
const getQuestionsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const questions = await Question.find({
      subject,
      isActive: true
    }).select('-correctAnswer -explanation');

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate question format
const validateQuestion = async (req, res) => {
  try {
    const { questionText, questionType, options, correctAnswer, marks } = req.body;
    const errors = [];
    const warnings = [];

    // Required field validation
    if (!questionText || !questionText.trim()) {
      errors.push('Question text is required');
    } else if (questionText.length < 10) {
      warnings.push('Question text seems too short');
    }

    if (!correctAnswer || !correctAnswer.trim()) {
      errors.push('Correct answer is required');
    }

    if (!marks || marks < 1) {
      errors.push('Marks must be at least 1');
    }

    // Question type specific validation
    if (questionType === 'Multiple Choice') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      } else {
        const validOptions = options.filter(opt => opt && opt.trim());
        if (validOptions.length < 2) {
          errors.push('At least 2 valid options are required');
        }
        
        if (!validOptions.includes(correctAnswer)) {
          errors.push('Correct answer must match one of the options');
        }

        // Check for duplicate options
        const uniqueOptions = [...new Set(validOptions)];
        if (uniqueOptions.length !== validOptions.length) {
          warnings.push('Duplicate options detected');
        }
      }
    }

    if (questionType === 'True/False') {
      if (!['True', 'False'].includes(correctAnswer)) {
        errors.push('True/False questions must have "True" or "False" as correct answer');
      }
    }

    // Content validation
    if (questionText && questionText.length > 1000) {
      warnings.push('Question text is very long, consider breaking it down');
    }

    if (correctAnswer && correctAnswer.length > 500) {
      warnings.push('Correct answer is very long');
    }

    res.json({
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: warnings.length > 0 ? 'Consider reviewing the warnings before proceeding' : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createQuestion,
  bulkCreateQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsBySubject,
  validateQuestion
}; 