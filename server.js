const express = require('express');
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const CryptoJS = require('crypto-js');
// const jwt = require('jsonwebtoken');
const app = express();
const server = require('http').createServer(app);
const { verifyToken, verifyTokenAndAuth } = require('./verify');

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
// console.log(User);

io.on('connection', (socket) => {
	socket.join(socket.id);
	socket.on('verifyToken', async ({ token }) => {
		console.log('verifyToken');
		if (!token) {
			io.to(socket.id).emit('verifyToken', {
				res: false,
				user: null,
				message: 'login first',
			});
		} else {
			const user = await verifyToken(token);
			if (user) {
				io.to(socket.id).emit('verifyToken', {
					res: true,
					user: user,
					error: '',
				});
			} else {
				io.to(socket.id).emit('verifyToken', {
					res: false,
					user: null,
					message: 'in valid token',
				});
			}
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
					io.to(socket.id).emit('register', {
						res: true,
						user: savedUser,
						message: 'User created successfully!',
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
					io.to(socket.id).emit('login', {
						res: true,
						user: user,
						message: 'login successful',
					});
				}
			}
		}
	});
});

server.listen(PORT, () => {
	console.log(`DEBUG: Server is running at http://localhost:${PORT}`);
});
