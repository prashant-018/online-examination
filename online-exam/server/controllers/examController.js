const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');

// Create new exam
const createExam = async (req, res) => {
  try {
    const { title, description, subject, duration, totalMarks, passingMarks, startTime, endTime, instructions, maxAttempts, allowedRoles } = req.body;

    // Validate required fields
    if (!title || !description || !subject || !duration || !totalMarks || !passingMarks || !startTime || !endTime) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Validate passing marks
    if (passingMarks > totalMarks) {
      return res.status(400).json({ message: 'Passing marks cannot exceed total marks' });
    }

    const exam = new Exam({
      title,
      description,
      subject,
      duration,
      totalMarks,
      passingMarks,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      instructions: instructions || [],
      maxAttempts: maxAttempts || 1,
      allowedRoles: allowedRoles || ['Student'],
      createdBy: req.user.id
    });

    await exam.save();

    const populatedExam = await Exam.findById(exam._id)
      .populate('createdBy', 'name email')
      .populate('questions', 'questionText questionType marks');

    res.status(201).json({
      message: 'Exam created successfully',
      exam: populatedExam
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all exams (with role-based filtering)
const getAllExams = async (req, res) => {
  try {
    const { role } = req.user;
    let query = { isActive: true };

    // If user is a student, only show exams they can take
    if (role === 'Student') {
      query.allowedRoles = { $in: ['Student'] };
      query.startTime = { $lte: new Date() };
      query.endTime = { $gte: new Date() };
    }

    const exams = await Exam.find(query)
      .populate('createdBy', 'name')
      .populate('questions', 'questionText questionType marks')
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exams created by teacher
const getExamsByTeacher = async (req, res) => {
  try {
    const exams = await Exam.find({
      createdBy: req.user.id,
      isActive: true
    })
      .populate('questions', 'questionText questionType marks')
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exam by ID
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('questions', 'questionText questionType options marks difficulty explanation');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if student can access this exam
    if (req.user.role === 'Student') {
      const now = new Date();
      if (now < exam.startTime || now > exam.endTime) {
        return res.status(403).json({ message: 'Exam is not available at this time' });
      }

      // Check if student has already attempted max times
      const existingAttempts = await ExamResult.countDocuments({
        student: req.user.id,
        exam: exam._id
      });

      if (existingAttempts >= exam.maxAttempts) {
        return res.status(403).json({ message: 'Maximum attempts reached for this exam' });
      }
    }

    res.json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }

    // Check if exam has already started
    if (new Date() >= exam.startTime) {
      return res.status(400).json({ message: 'Cannot update exam that has already started' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('questions', 'questionText questionType marks');

    res.json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    // Check if exam has already started
    if (new Date() >= exam.startTime) {
      return res.status(400).json({ message: 'Cannot delete exam that has already started' });
    }

    // Soft delete by setting isActive to false
    exam.isActive = false;
    await exam.save();

    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add questions to exam
const addQuestionsToExam = async (req, res) => {
  try {
    const { questionIds } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this exam' });
    }

    // Check if exam has already started
    if (new Date() >= exam.startTime) {
      return res.status(400).json({ message: 'Cannot modify exam that has already started' });
    }

    // Validate that all questions exist and belong to the same subject
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: 'Some questions not found' });
    }

    // Check if all questions are from the same subject
    const subjects = [...new Set(questions.map(q => q.subject))];
    if (subjects.length > 1 || subjects[0] !== exam.subject) {
      return res.status(400).json({ message: 'All questions must be from the same subject as the exam' });
    }

    exam.questions = [...new Set([...exam.questions, ...questionIds])];
    await exam.save();

    const updatedExam = await Exam.findById(exam._id)
      .populate('createdBy', 'name email')
      .populate('questions', 'questionText questionType marks');

    res.json({ message: 'Questions added to exam successfully', exam: updatedExam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove questions from exam
const removeQuestionsFromExam = async (req, res) => {
  try {
    const { questionIds } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this exam' });
    }

    // Check if exam has already started
    if (new Date() >= exam.startTime) {
      return res.status(400).json({ message: 'Cannot modify exam that has already started' });
    }

    exam.questions = exam.questions.filter(q => !questionIds.includes(q.toString()));
    await exam.save();

    const updatedExam = await Exam.findById(exam._id)
      .populate('createdBy', 'name email')
      .populate('questions', 'questionText questionType marks');

    res.json({ message: 'Questions removed from exam successfully', exam: updatedExam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get questions for a specific exam
const getExamQuestions = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this exam\'s questions' });
    }

    const questions = await Question.find({ _id: { $in: exam.questions } })
      .sort({ createdAt: 1 });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reorder questions in an exam
const reorderExamQuestions = async (req, res) => {
  try {
    const { questionId, newIndex } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this exam' });
    }

    // Check if exam has already started
    if (new Date() >= exam.startTime) {
      return res.status(400).json({ message: 'Cannot modify exam that has already started' });
    }

    const currentIndex = exam.questions.indexOf(questionId);
    if (currentIndex === -1) {
      return res.status(400).json({ message: 'Question not found in exam' });
    }

    // Remove question from current position and insert at new position
    exam.questions.splice(currentIndex, 1);
    exam.questions.splice(newIndex, 0, questionId);

    await exam.save();
    res.json({ message: 'Questions reordered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get exam statistics for teacher
const getExamStats = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (exam.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this exam\'s statistics' });
    }

    const results = await ExamResult.find({ exam: exam._id, status: 'Completed' });

    const stats = {
      totalAttempts: results.length,
      averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0,
      passRate: results.length > 0 ? (results.filter(r => r.isPassed).length / results.length) * 100 : 0,
      highestScore: results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0,
      lowestScore: results.length > 0 ? Math.min(...results.map(r => r.percentage)) : 0
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamsByTeacher,
  getExamById,
  updateExam,
  deleteExam,
  addQuestionsToExam,
  removeQuestionsFromExam,
  getExamQuestions,
  reorderExamQuestions,
  getExamStats
}; 