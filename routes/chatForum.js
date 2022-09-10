const router = require('express').Router();
const { verifyToken } = require('./verify');

router.post('/', verifyToken, (req, res) => {
	const io = req.io;
	io.on('connection', (socket) => {
		socket.join(req.body.room);
		console.log(
			`DEBUG: ${user.username} connected to ${socket.id} at room ${req.body.room}`,
		);
		socket.on('disconnect', (reason) => {
			console.log(
				`DEBUG: ${user.username} disconnected from due to ${reason}`,
			);
		});
		socket.on('sent', ({ message }) => {
			console.log(message);
			io.to(req.body.room).emit('recieve', {
				message: message,
				sender: user.username,
				timestamp: new Date().getTime(),
			});
		});
	});
	res.send(`See you in ${req.body.room}`);
});

module.exports = router;
