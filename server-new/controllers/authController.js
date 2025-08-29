const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createToken(user) {
	return jwt.sign(
		{ userId: user._id.toString(), role: user.role },
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
}

function splitName(name) {
	if (!name) return { firstName: '', lastName: '' };
	const parts = String(name).trim().split(/\s+/);
	return {
		firstName: parts[0] || '',
		lastName: parts.slice(1).join(' ') || '',
	};
}

exports.register = async (req, res) => {
	try {
		const { name, firstName, lastName, email, password, role } = req.body;
		if (!email || !password || !(name || (firstName && lastName))) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}

		const existing = await User.findOne({ email: String(email).toLowerCase() });
		if (existing) {
			return res.status(409).json({ message: 'Email already registered' });
		}

		const derived = splitName(name);
		const user = new User({
			firstName: firstName || derived.firstName,
			lastName: lastName || derived.lastName,
			name,
			email: String(email).toLowerCase(),
			password,
			role: role === 'Teacher' ? 'Teacher' : 'Student',
			google: false,
		});

		await user.save();

		const token = createToken(user);
		const safeUser = user.toObject();
		delete safeUser.password;

		return res.status(201).json({
			message: 'Registration successful',
			user: safeUser,
			token,
			expiresIn: 7 * 24 * 60 * 60,
		});
	} catch (error) {
		console.error('Register error:', error);
		return res.status(500).json({ message: 'Registration failed' });
	}
};

exports.login = async (req, res) => {
	try {
		// Debug: verify request body is parsed correctly
		console.log('Login body:', req.body);
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		let user = await User.findOne({ email: String(email).toLowerCase() });
		if (!user || !user.password) {
			// Optionally auto-register for local testing when user doesn't exist
			const allowAutoCreate = process.env.AUTO_REGISTER_ON_LOGIN === 'true' || process.env.NODE_ENV !== 'production';
			if (allowAutoCreate) {
				const name = String(email).split('@')[0];
				user = new User({ name, email: String(email).toLowerCase(), password, role: 'Student' });
				await user.save();
			} else {
				return res.status(401).json({ message: 'Invalid credentials' });
			}
		}

		const ok = await user.comparePassword(password);
		if (!ok) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = createToken(user);
		const safeUser = user.toObject();
		delete safeUser.password;

		return res.json({
			message: 'Login successful',
			user: safeUser,
			token,
			expiresIn: 7 * 24 * 60 * 60,
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ message: 'Login failed' });
	}
};

exports.verify = async (req, res) => {
	try {
		const auth = req.headers.authorization || '';
		const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
		if (!token) {
			return res.status(401).json({ message: 'Missing token' });
		}
		const payload = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(payload.userId).lean();
		if (!user) return res.status(401).json({ message: 'Invalid token' });
		delete user.password;
		return res.json({ user });
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

module.exports;

