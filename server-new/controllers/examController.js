const Exam = require('../models/Exam');
const Question = require('../models/Question');

// POST /api/exams  (Teacher only)
exports.createExam = async (req, res) => {
	try {
		const { title, subject, description, questions } = req.body;
		if (!title || !subject) {
			return res.status(400).json({ message: 'title and subject are required' });
		}

		const exam = await Exam.create({
			title,
			subject,
			description: description || '',
			createdBy: req.user._id,
			questions: [],
		});

		// Optional: create questions if provided as an array of { text, options, correctIndex }
		if (Array.isArray(questions) && questions.length > 0) {
			const created = await Question.insertMany(
				questions.map((q) => ({ ...q, exam: exam._id }))
			);
			exam.questions = created.map((q) => q._id);
			await exam.save();
		}

		return res.status(201).json(exam);
	} catch (error) {
		console.error('Create exam error:', error);
		return res.status(500).json({ message: 'Failed to create exam' });
	}
};

// GET /api/exams (Authenticated)
exports.listExams = async (req, res) => {
	try {
		const exams = await Exam.find()
			.sort({ createdAt: -1 })
			.lean();
		return res.json(exams);
	} catch (error) {
		console.error('List exams error:', error);
		return res.status(500).json({ message: 'Failed to fetch exams' });
	}
};

// GET /api/exams/teacher/exams (Teacher only)
exports.getTeacherExams = async (req, res) => {
	try {
		const exams = await Exam.find({ createdBy: req.user._id })
			.sort({ createdAt: -1 })
			.lean();
		return res.json(exams);
	} catch (error) {
		console.error('Get teacher exams error:', error);
		return res.status(500).json({ message: 'Failed to fetch teacher exams' });
	}
};

// GET /api/exams/:id (Authenticated)
exports.getExam = async (req, res) => {
	try {
		const { id } = req.params;
		const exam = await Exam.findById(id)
			.populate({ path: 'questions', options: { sort: { createdAt: 1 } } })
			.lean();
		if (!exam) return res.status(404).json({ message: 'Exam not found' });
		return res.json(exam);
	} catch (error) {
		console.error('Get exam error:', error);
		return res.status(500).json({ message: 'Failed to fetch exam' });
	}
};

// PUT /api/exams/:id (Teacher only - owner)
exports.updateExam = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, subject, description, duration, totalMarks, passingMarks, startTime, endTime, status } = req.body;

		const exam = await Exam.findById(id);
		if (!exam) {
			return res.status(404).json({ message: 'Exam not found' });
		}

		// Check if user owns this exam
		if (exam.createdBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to update this exam' });
		}

		const updatedExam = await Exam.findByIdAndUpdate(
			id,
			{ title, subject, description, duration, totalMarks, passingMarks, startTime, endTime, status },
			{ new: true, runValidators: true }
		);

		return res.json(updatedExam);
	} catch (error) {
		console.error('Update exam error:', error);
		return res.status(500).json({ message: 'Failed to update exam' });
	}
};

// DELETE /api/exams/:id (Teacher only - owner)
exports.deleteExam = async (req, res) => {
	try {
		const { id } = req.params;

		const exam = await Exam.findById(id);
		if (!exam) {
			return res.status(404).json({ message: 'Exam not found' });
		}

		// Check if user owns this exam
		if (exam.createdBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized to delete this exam' });
		}

		// Delete associated questions first
		await Question.deleteMany({ exam: id });

		// Delete the exam
		await Exam.findByIdAndDelete(id);

		return res.json({ message: 'Exam deleted successfully' });
	} catch (error) {
		console.error('Delete exam error:', error);
		return res.status(500).json({ message: 'Failed to delete exam' });
	}
};

module.exports;

