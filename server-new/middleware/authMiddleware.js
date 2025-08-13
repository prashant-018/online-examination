const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function extractBearerToken(req) {
	const header = req.headers.authorization || '';
	if (header && header.startsWith('Bearer ')) {
		return header.slice(7).trim();
	}
	return null;
}

const auth = async (req, res, next) => {
	try {
		const token = extractBearerToken(req);
		if (!token) return res.status(401).json({ message: 'Unauthorized' });

		const payload = jwt.verify(token, JWT_SECRET);
		req.auth = payload;

		// Attach user (without password) for convenience
		const user = await User.findById(payload.userId).select('-password').lean();
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		req.user = user;
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
};

const optionalAuth = async (req, res, next) => {
	try {
		const token = extractBearerToken(req);
		if (!token) return next();
		const payload = jwt.verify(token, JWT_SECRET);
		req.auth = payload;
		const user = await User.findById(payload.userId).select('-password').lean();
		if (user) req.user = user;
		return next();
	} catch {
		return next();
	}
};

module.exports = { auth, optionalAuth };







