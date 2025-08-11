const roleCheck = () => (req, res, next) => next();
const canAccessExam = (req, res, next) => next();
const canModifyExam = (req, res, next) => next();

module.exports = { roleCheck, canAccessExam, canModifyExam };