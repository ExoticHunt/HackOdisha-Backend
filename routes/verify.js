const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.token;
	if (authHeader) {
		const token = authHeader.split(' ')[0];
		console.log(`Token: ${token}`);
		jwt.verify(token, process.env.JWT_SEC, (err, user) => {
			if (err) {
				res.status(403).json('Token is not valid!');
				console.log(`ERROR: ${err}`);
			} else {
				req.user = user;
				console.log(`User: ${user}`);
				next();
			}
		});
	} else {
		return res.status(401).json('You are not authenticated!');
	}
};

const verifyTokenAndAuthorization = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.username === req.params.username || req.user.isAdmin) {
			next();
		} else {
			res.status(403).json('You are not alowed to do that!');
		}
	});
};

const verifyTokenAndAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.isAdmin) {
			next();
		} else {
			res.status(403).json('You are not alowed to do that!');
		}
	});
};

module.exports = {
	verifyToken,
	verifyTokenAndAuthorization,
	verifyTokenAndAdmin,
};
