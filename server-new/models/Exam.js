const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		subject: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

