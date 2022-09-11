const mongoose = require('mongoose');
const NotesSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			default: '',
		},
		date: {
			type: Date,
			default: new Date(),
		},
		time: {
			type: String,
			default: new Date(),
		}
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Note', NotesSchema);
