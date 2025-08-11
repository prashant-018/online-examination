const auth = (req, res, next) => next();
const optionalAuth = (req, res, next) => next();

module.exports = { auth, optionalAuth };