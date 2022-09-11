const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
	{
		sender: {
			type: String,
			required: true,
			unique: true,
		},
		timeStamp: {
			type: Date,
			default: new Date(),
		},
		message: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Chat', ChatSchema);
