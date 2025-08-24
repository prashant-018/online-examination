const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Create a question and link to an exam
exports.createQuestion = async (req, res) => {
  try {
    const { examId, questionText, options, correctAnswer } = req.body;
    if (!examId) return res.status(400).json({ message: 'examId is required' });
    if (!questionText) return res.status(400).json({ message: 'questionText is required' });
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'At least 2 options are required' });
    }

    const correctIndex = typeof correctAnswer === 'string' ? options.indexOf(correctAnswer) : -1;
    if (correctIndex < 0) {
      return res.status(400).json({ message: 'correctAnswer must match one of the options' });
    }

    const question = await Question.create({
      exam: examId,
      text: questionText,
      options,
      correctIndex,
    });

    await Exam.findByIdAndUpdate(examId, { $addToSet: { questions: question._id } });

    return res.status(201).json({ question });
  } catch (err) {
    console.error('createQuestion error:', err);
    return res.status(500).json({ message: 'Failed to create question' });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, options, correctAnswer } = req.body;

    const update = {};
    if (questionText) update.text = questionText;
    if (Array.isArray(options) && options.length >= 2) {
      update.options = options;
      if (typeof correctAnswer === 'string') {
        const idx = options.indexOf(correctAnswer);
        if (idx < 0) return res.status(400).json({ message: 'correctAnswer must match options' });
        update.correctIndex = idx;
      }
    } else if (typeof correctAnswer === 'string') {
      // Need existing options to compute index
      const existing = await Question.findById(id).lean();
      if (!existing) return res.status(404).json({ message: 'Question not found' });
      const idx = existing.options.indexOf(correctAnswer);
      if (idx < 0) return res.status(400).json({ message: 'correctAnswer must match options' });
      update.correctIndex = idx;
    }

    const question = await Question.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    return res.json({ question });
  } catch (err) {
    console.error('updateQuestion error:', err);
    return res.status(500).json({ message: 'Failed to update question' });
  }
};

// Delete question and unlink from exam
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Exam.findByIdAndUpdate(question.exam, { $pull: { questions: question._id } });
    await Question.findByIdAndDelete(id);
    return res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('deleteQuestion error:', err);
    return res.status(500).json({ message: 'Failed to delete question' });
  }
};

// List questions for an exam
exports.listExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const questions = await Question.find({ exam: examId }).sort({ createdAt: 1 }).lean();
    return res.json(questions);
  } catch (err) {
    console.error('listExamQuestions error:', err);
    return res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

// Add existing questions to an exam
exports.addQuestionsToExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'questionIds is required' });
    }

    const exam = await Exam.findByIdAndUpdate(
      examId,
      { $addToSet: { questions: { $each: questionIds } } },
      { new: true }
    ).populate({ path: 'questions', options: { sort: { createdAt: 1 } } });

    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    return res.json({ exam });
  } catch (err) {
    console.error('addQuestionsToExam error:', err);
    return res.status(500).json({ message: 'Failed to add questions to exam' });
  }
};

// Remove questions from an exam
exports.removeQuestionsFromExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'questionIds is required' });
    }

    await Exam.findByIdAndUpdate(examId, { $pull: { questions: { $in: questionIds } } });
    return res.json({ message: 'Questions removed from exam' });
  } catch (err) {
    console.error('removeQuestionsFromExam error:', err);
    return res.status(500).json({ message: 'Failed to remove questions from exam' });
  }
};

// Reorder questions inside an exam
exports.reorderExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionId, newIndex } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const currentIndex = exam.questions.findIndex((q) => q.toString() === questionId);
    if (currentIndex === -1) return res.status(400).json({ message: 'Question not in exam' });
    if (newIndex < 0 || newIndex >= exam.questions.length) return res.status(400).json({ message: 'newIndex out of range' });

    const [moved] = exam.questions.splice(currentIndex, 1);
    exam.questions.splice(newIndex, 0, moved);
    await exam.save();

    return res.json({ message: 'Reordered' });
  } catch (err) {
    console.error('reorderExamQuestions error:', err);
    return res.status(500).json({ message: 'Failed to reorder questions' });
  }
};
