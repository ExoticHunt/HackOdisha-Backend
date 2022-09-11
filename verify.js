const jwt = require('jsonwebtoken');

function verifyToken(token) {
	jwt.verify(token, process.env.JWT_SEC, (err, user) => {
		if (err) {
			console.log(`ERROR: ${err}`);
			return null;
		} else {
			console.log(`User: ${user}`);
			return user;
		}
	});
}

function verifyTokenAndAuth(token, username) {
	const user = verifyToken(token);
	if (user) {
		if (user.username === username || user.isAdmin) {
			return user;
		} else {
			return null;
		}
	} else {
		return null;
	}
}

module.exports = {
	verifyToken,
	verifyTokenAndAuth,
};
