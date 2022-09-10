const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});

require('dotenv').config();
app.use(require('cors')());
app.use(express.json());

app.use((req, res, next) => {
	req.io = io;
	return next();
});

const PORT = process.env.PORT || 2202;

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => console.log('DEBUG: DataBase Connection Successful!'))
	.catch((err) => {
		console.log(`ERROR: ${err}`);
	});

const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);

const notesRoute = require('./routes/notes');
app.use('/api/notes', notesRoute);

const chatRoute = require('./routes/chatForum');
app.use('/api/chat', chatRoute);

server.listen(PORT, () => {
	console.log(`DEBUG: Server is running at http://localhost:${PORT}`);
});
