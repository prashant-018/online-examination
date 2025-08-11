const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
        requiredPermissions: getRequiredPermissions(allowedRoles)
      });
    }

    next();
  };
};

// Get required permissions for roles
const getRequiredPermissions = (roles) => {
  const permissions = {
    'Student': ['read_own_exams', 'submit_exam_answers', 'view_own_results'],
    'Teacher': ['create_exams', 'manage_own_exams', 'view_student_results', 'manage_questions'],
    'Admin': ['full_system_access', 'manage_users', 'manage_all_exams', 'system_configuration']
  };

  return roles.flatMap(role => permissions[role] || []);
};

// Specific role checks
const isTeacher = roleCheck(['Teacher', 'Admin']);
const isAdmin = roleCheck(['Admin']);
const isStudent = roleCheck(['Student', 'Teacher', 'Admin']);

// Resource ownership middleware
const checkResourceOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Access denied. No token provided.',
          code: 'NO_TOKEN'
        });
      }

      // Admins can access all resources
      if (req.user.role === 'Admin') {
        return next();
      }

      const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
      if (!resourceId) {
        return res.status(400).json({
          message: 'Resource ID is required.',
          code: 'MISSING_RESOURCE_ID'
        });
      }

      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({
          message: 'Resource not found.',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user owns the resource
      const ownerField = resource.createdBy ? 'createdBy' : 'userId';
      if (resource[ownerField].toString() !== req.user.id) {
        return res.status(403).json({
          message: 'Access denied. You can only modify your own resources.',
          code: 'NOT_RESOURCE_OWNER'
        });
      }

      // Add resource to request for potential use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({
        message: 'Server error during authorization check.',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

// Check if user can access exam (Student can only access exams they're allowed for)
const canAccessExam = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Teachers and Admins can access all exams
    if (['Teacher', 'Admin'].includes(req.user.role)) {
      return next();
    }

    // For students, check if they're enrolled in the exam
    const examId = req.params.id || req.params.examId;
    if (!examId) {
      return res.status(400).json({
        message: 'Exam ID is required.',
        code: 'MISSING_EXAM_ID'
      });
    }

    const Exam = require('../models/Exam');
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: 'Exam not found.',
        code: 'EXAM_NOT_FOUND'
      });
    }

    // Check if exam is active and within time window
    if (!exam.isActive) {
      return res.status(403).json({
        message: 'This exam is not currently active.',
        code: 'EXAM_INACTIVE'
      });
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      return res.status(403).json({
        message: 'Exam is not available at this time.',
        code: 'EXAM_TIME_RESTRICTED',
        startTime: exam.startTime,
        endTime: exam.endTime
      });
    }

    // Check if student role is allowed
    if (!exam.allowedRoles.includes('Student')) {
      return res.status(403).json({
        message: 'Students are not allowed to take this exam.',
        code: 'STUDENT_NOT_ALLOWED'
      });
    }

    // Add exam to request for potential use
    req.exam = exam;
    next();
  } catch (error) {
    console.error('Exam access check error:', error);
    res.status(500).json({
      message: 'Server error during exam access check.',
      code: 'EXAM_ACCESS_ERROR'
    });
  }
};

// Check if user can modify exam (only creator or admin)
const canModifyExam = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Admins can modify any exam
    if (req.user.role === 'Admin') {
      return next();
    }

    // Teachers can only modify their own exams
    if (req.user.role === 'Teacher') {
      const examId = req.params.id || req.params.examId;
      if (!examId) {
        return res.status(400).json({
          message: 'Exam ID is required.',
          code: 'MISSING_EXAM_ID'
        });
      }

      const Exam = require('../models/Exam');
      const exam = await Exam.findById(examId);

      if (!exam) {
        return res.status(404).json({
          message: 'Exam not found.',
          code: 'EXAM_NOT_FOUND'
        });
      }

      if (exam.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          message: 'Access denied. You can only modify your own exams.',
          code: 'NOT_EXAM_OWNER'
        });
      }

      // Check if exam has already started
      if (new Date() >= exam.startTime) {
        return res.status(400).json({
          message: 'Cannot modify exam that has already started.',
          code: 'EXAM_ALREADY_STARTED'
        });
      }

      req.exam = exam;
      return next();
    }

    // Students cannot modify exams
    return res.status(403).json({
      message: 'Access denied. Students cannot modify exams.',
      code: 'STUDENT_MODIFICATION_DENIED'
    });
  } catch (error) {
    console.error('Exam modification check error:', error);
    res.status(500).json({
      message: 'Server error during exam modification check.',
      code: 'EXAM_MODIFICATION_ERROR'
    });
  }
};

// Check if user can view results
const canViewResults = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Admins can view all results
    if (req.user.role === 'Admin') {
      return next();
    }

    // Teachers can view results for their own exams
    if (req.user.role === 'Teacher') {
      const examId = req.params.examId || req.query.examId;
      if (examId) {
        const Exam = require('../models/Exam');
        const exam = await Exam.findById(examId);

        if (exam && exam.createdBy.toString() !== req.user.id) {
          return res.status(403).json({
            message: 'Access denied. You can only view results for your own exams.',
            code: 'NOT_EXAM_OWNER'
          });
        }
      }
      return next();
    }

    // Students can only view their own results
    if (req.user.role === 'Student') {
      const resultId = req.params.id || req.params.resultId;
      if (resultId) {
        const ExamResult = require('../models/ExamResult');
        const result = await ExamResult.findById(resultId);

        if (result && result.student.toString() !== req.user.id) {
          return res.status(403).json({
            message: 'Access denied. You can only view your own results.',
            code: 'NOT_RESULT_OWNER'
          });
        }
      }
      return next();
    }

    next();
  } catch (error) {
    console.error('Results access check error:', error);
    res.status(500).json({
      message: 'Server error during results access check.',
      code: 'RESULTS_ACCESS_ERROR'
    });
  }
};

// Permission-based middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const userPermissions = getUserPermissions(req.user.role);

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        message: `Access denied. Permission '${permission}' is required.`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userPermissions
      });
    }

    next();
  };
};

// Get permissions for a role
const getUserPermissions = (role) => {
  const permissions = {
    'Student': [
      'read_own_exams',
      'submit_exam_answers',
      'view_own_results',
      'update_own_profile'
    ],
    'Teacher': [
      'create_exams',
      'manage_own_exams',
      'view_student_results',
      'manage_questions',
      'create_questions',
      'update_own_profile',
      'view_own_exam_results'
    ],
    'Admin': [
      'full_system_access',
      'manage_users',
      'manage_all_exams',
      'system_configuration',
      'view_all_results',
      'manage_roles',
      'system_analytics'
    ]
  };

  return permissions[role] || [];
};

module.exports = {
  roleCheck,
  isTeacher,
  isAdmin,
  isStudent,
  checkResourceOwnership,
  canAccessExam,
  canModifyExam,
  canViewResults,
  requirePermission,
  getUserPermissions,
  getRequiredPermissions
}; 