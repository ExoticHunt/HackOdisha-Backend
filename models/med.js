const mongoose = require('mongoose');

const MedSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		time: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Med', MedSchema);
