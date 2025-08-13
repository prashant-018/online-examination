// Ensure `auth` middleware runs before this to populate req.user
const roleCheck = (allowedRoles) => {
	const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		return next();
	};
};

// Convenience guards (adjust as needed)
const canAccessExam = roleCheck(['Teacher']);
const canModifyExam = roleCheck(['Teacher']);

module.exports = { roleCheck, canAccessExam, canModifyExam };







