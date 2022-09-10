const router = require('express').Router();
const Note = require('../models/notes');
const { verifyToken, verifyTokenAndAuthorization } = require('./verify');

//CREATE
router.post('/', verifyToken, async (req, res) => {
	const newNote = new Note(req.body);
	try {
		const savedNote = await newNote.save();
		res.status(200).json(savedNote);
	} catch (err) {
		console.log(`ERROR: ${err}`);
		res.status(500).json(err);
	}
});

//GET
router.get('/', verifyTokenAndAuthorization, async (req, res) => {
	console.log(`DEBUG: ${req.body.username}`);
	try {
		const notes = await Note.find({ username: req.body.username });
		res.status(200).json(notes);
	} catch (err) {
		console.log(`ERROR: ${err}`);
		res.status(500).json(err);
	}
});

//DELETE
router.delete('/', verifyTokenAndAuthorization, async (req, res) => {
	try {
		await Order.findByIdAndDelete(req.body._id);
		res.status(200).json('Order has been deleted...');
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
