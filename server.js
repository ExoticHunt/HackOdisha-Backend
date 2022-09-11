const express = require('express');
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const app = express();
const server = require('http').createServer(app);
const { verifyToken, verifyTokenAndAuth } = require('./verify');
const { NotesMail, MedMail } = require('./mail');

const io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});

const PORT = process.env.PORT || 2202;

require('dotenv').config();
app.use(require('cors')());
app.use(express.json());

mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.v1,
	})
	.then(() => console.log('DEBUG: DataBase Connection Successful!'))
	.catch((err) => {
		console.log(`ERROR: ${err}`);
	});

const User = require('./models/user.js');
const Notes = require('./models/notes.js');
const Med = require('./models/med.js');
// console.log(User);

io.on('connection', (socket) => {
	socket.on('join-room', async (room) => {
		socket.join(room);
	})
	socket.join(socket.id);
	socket.on('verifyToken', async ({ token }) => {
		// console.log('verifyToken: ', token);
		if (!token) {
			io.to(socket.id).emit('verifyToken', {
				res: false,
				user: null,
				message: 'login first',
			});
		} else {
			const user = verifyToken({ token, io, socket });
			if (user === null) {
				console.log('token is invalid');
				io.to(socket.id).emit('verifyToken', {
					res: false,
					user: null,
					message: 'In valid Token',
				});
			} else {
				console.log('token is valid');
				io.to(socket.id).emit('verifyToken', {
					res: true,
					user: user,
					message: 'Token Validation Successful',
				});
			}
			// console.log('USER: ', user);
		}
	});
	socket.on('register', async ({ username, email, password }) => {
		console.log('register');
		const user = await User.findOne({ username: username });
		if (user) {
			io.to(socket.id).emit('register', {
				res: false,
				message: 'Username already exists!',
				user: null,
			});
		} else {
			const user = await User.findOne({ email: email });
			if (user) {
				io.to(socket.id).emit('register', {
					res: false,
					message: 'Email already exists!',
					user: null,
				});
			} else {
				const newUser = new User({
					username: username,
					email: email,
					password: CryptoJS.AES.encrypt(
						password,
						process.env.PASS_SEC,
					).toString(),
				});
				try {
					const savedUser = await newUser.save();
					console.log(savedUser);
					const accessToken = jwt.sign(
						{
							id: user._id,
							isAdmin: user.isAdmin,
						},
						process.env.JWT_SEC,
						{ expiresIn: '3d' },
					);
					io.to(socket.id).emit('register', {
						res: true,
						user: savedUser,
						message: 'User created successfully!',
						token: accessToken,
					});
				} catch (err) {
					io.to(socket.id).emit('register', {
						res: false,
						message: err,
						user: null,
					});
				}
			}
		}
	});
	socket.on('login', async ({ email, password }) => {
		console.log('login');
		if (!email || !password) {
			io.to(socket.id).emit('login', {
				res: false,
				user: null,
				message: 'Please enter all fields!',
			});
		} else {
			const user = await User.findOne({ email: email });
			if (!user) {
				io.to(socket.id).emit('login', {
					res: false,
					user: null,
					message: 'User not found!',
				});
			} else {
				const hashedPassword = CryptoJS.AES.decrypt(
					user.password,
					process.env.PASS_SEC,
				);
				const OriginalPassword = hashedPassword.toString(
					CryptoJS.enc.Utf8,
				);
				if (OriginalPassword !== password) {
					io.to(socket.id).emit('login', {
						res: false,
						user: null,
						message: 'wrong credentials!',
					});
				} else {
					const accessToken = jwt.sign(
						{
							id: user._id,
							isAdmin: user.isAdmin,
						},
						process.env.JWT_SEC,
						{ expiresIn: '3d' },
					);
					io.to(socket.id).emit('login', {
						res: true,
						user: user,
						token: accessToken,
						message: 'login successful',
					});
				}
			}
		}
	});
	socket.on('remainder', async ({ user, message, date, time }) => {
		console.log('remainder');
		const remainder = new Notes({
			username: user,
			message: message,
			date: date,
			time: time,
		});
		const savedNote = await remainder.save();
		console.log(savedNote);
		io.to(socket.id).emit('remainder', {
			res: true,
			remainder: savedNote,
			message: 'remainder added successfully',
		});
	});
	socket.on('med', async ({ user, title, date, time }) => {
		console.log('med');
		const med = new Med({
			username: user,
			title: title,
			date: date,
			time: time,
		});
		const savedMed = await med.save();
		console.log(savedMed);
		io.to(socket.id).emit('med', {
			res: true,
			med: savedMed,
			message: 'medicine added successfully',
		});
	});
});

NotesMail();
MedMail();
server.listen(PORT, () => {
	console.log(`DEBUG: Server is running at http://localhost:${PORT}`);
});
