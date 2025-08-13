const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
	{
		exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
		text: { type: String, required: true, trim: true },
		options: {
			type: [String],
			required: true,
			validate: {
				validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.every((s) => typeof s === 'string' && s.trim().length > 0),
				message: 'Options must be an array of at least 2 non-empty strings',
			},
		},
		correctIndex: {
			type: Number,
			required: true,
			min: 0,
			validate: {
				validator: function (val) {
					return Array.isArray(this.options) && val < this.options.length;
				},
				message: 'correctIndex must be a valid index within options array',
			},
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);

