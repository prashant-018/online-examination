# 🔐 Security Implementation Guide

This document outlines the comprehensive security features implemented in the Online Examination System.

## 🛡️ **Security Overview**

The system implements multiple layers of security to protect user data, prevent unauthorized access, and ensure system integrity.

## 🔑 **Authentication & Authorization**

### **Password Security**
- **Hashing**: bcrypt with 12 salt rounds for maximum security
- **Strength Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Validation**: Real-time password strength checking

### **JWT Token Management**
- **Token Expiry**: 7 days (configurable)
- **Token Blacklisting**: Invalidated tokens are blacklisted
- **Refresh Tokens**: Secure token refresh mechanism
- **Token Validation**: Database verification on each request

### **Account Protection**
- **Login Attempts**: Account locked after 5 failed attempts
- **Lock Duration**: 2 hours automatic unlock
- **Account Status**: Active/Inactive account management
- **Session Management**: Secure session handling

## 🚫 **Rate Limiting**

### **Authentication Rate Limiting**
- **Window**: 15 minutes
- **Max Attempts**: 5 login attempts
- **Message**: Clear error messages with retry information

### **General API Rate Limiting**
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window
- **Per-IP**: Rate limiting applied per IP address

### **Exam Submission Rate Limiting**
- **Window**: 1 minute
- **Max Submissions**: 3 submissions per minute
- **Prevents**: Rapid-fire exam submissions

## 🛡️ **Input Validation & Sanitization**

### **Request Sanitization**
- **XSS Prevention**: HTML tag removal
- **Email Normalization**: Lowercase and trim
- **String Sanitization**: Remove malicious characters
- **Input Length Limits**: Prevent oversized requests

### **Data Validation**
- **Email Format**: Regex validation
- **Role Validation**: Enum-based role checking
- **Required Fields**: Comprehensive field validation
- **Type Checking**: Data type validation

## 🔒 **Security Headers**

### **Helmet Configuration**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://accounts.google.com"]
    }
  }
}));
```

### **Additional Security Headers**
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `1; mode=block`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restrict browser features

## 👥 **Role-Based Access Control (RBAC)**

### **User Roles**
1. **Student**
   - Read own exams
   - Submit exam answers
   - View own results
   - Update own profile

2. **Teacher**
   - Create and manage own exams
   - View student results for own exams
   - Manage questions
   - Create questions
   - Update own profile

3. **Admin**
   - Full system access
   - Manage all users
   - Manage all exams
   - System configuration
   - View all results

### **Permission System**
```javascript
const permissions = {
  'Student': ['read_own_exams', 'submit_exam_answers', 'view_own_results'],
  'Teacher': ['create_exams', 'manage_own_exams', 'view_student_results'],
  'Admin': ['full_system_access', 'manage_users', 'manage_all_exams']
};
```

## 🔍 **Resource Ownership**

### **Exam Access Control**
- **Students**: Can only access exams they're enrolled in
- **Teachers**: Can only modify their own exams
- **Admins**: Can access and modify all exams

### **Question Management**
- **Teachers**: Can only manage their own questions
- **Admins**: Can manage all questions
- **Students**: Cannot access question management

### **Results Access**
- **Students**: Can only view their own results
- **Teachers**: Can view results for their own exams
- **Admins**: Can view all results

## 📊 **Request Logging & Monitoring**

### **Security Event Logging**
- **Failed Authentication**: Logged with IP and user agent
- **Rate Limit Violations**: Tracked and logged
- **Permission Denials**: Detailed logging with context
- **System Errors**: Comprehensive error tracking

### **Request Monitoring**
```javascript
const logData = {
  method: req.method,
  url: req.url,
  status: res.statusCode,
  duration: `${duration}ms`,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
};
```

## 🚨 **Error Handling**

### **Security-Focused Error Messages**
- **No Information Leakage**: Generic messages in production
- **Error Codes**: Standardized error codes for frontend handling
- **Development Mode**: Detailed errors only in development

### **Error Response Format**
```javascript
{
  message: 'User-friendly message',
  code: 'STANDARDIZED_ERROR_CODE',
  details: 'Additional context (development only)'
}
```

## 🔧 **CORS Configuration**

### **Secure CORS Setup**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
```

## 🛡️ **Database Security**

### **MongoDB Security**
- **Connection Security**: Encrypted connections
- **Query Validation**: Mongoose schema validation
- **Injection Prevention**: ODM protection against NoSQL injection
- **Connection Pooling**: Optimized connection management

### **Data Protection**
- **Password Hashing**: Never store plain text passwords
- **Sensitive Data**: Encrypted storage for sensitive information
- **Data Sanitization**: Input sanitization before storage

## 🔄 **Token Management**

### **JWT Security**
- **Secret Management**: Environment variable configuration
- **Token Expiry**: Automatic expiration handling
- **Token Refresh**: Secure refresh mechanism
- **Token Blacklisting**: Invalidate compromised tokens

### **Session Security**
- **Secure Headers**: Prevent caching of sensitive routes
- **Session Validation**: Database verification
- **Role Changes**: Automatic token invalidation on role change

## 🚪 **Access Control Middleware**

### **Authentication Middleware**
```javascript
const auth = async (req, res, next) => {
  // Token validation
  // User verification
  // Account status check
  // Role verification
};
```

### **Role-Based Middleware**
```javascript
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    // Role verification
    // Permission checking
  };
};
```

### **Resource Ownership Middleware**
```javascript
const checkResourceOwnership = (resourceModel) => {
  return async (req, res, next) => {
    // Resource existence check
    // Ownership verification
    // Admin bypass
  };
};
```

## 🔐 **Environment Security**

### **Environment Variables**
```bash
# Required Environment Variables
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
MONGO_URI=your-mongodb-connection-string
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### **Production Security Checklist**
- [ ] Strong JWT secrets
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Error logging configured
- [ ] Backup strategy implemented

## 🚨 **Security Best Practices**

### **For Developers**
1. **Never log sensitive data**
2. **Use environment variables for secrets**
3. **Validate all inputs**
4. **Implement proper error handling**
5. **Use HTTPS in production**
6. **Regular security audits**

### **For Administrators**
1. **Monitor security logs**
2. **Regular password policy updates**
3. **Keep dependencies updated**
4. **Implement backup strategies**
5. **Monitor rate limiting**
6. **Regular security assessments**

## 📋 **Security Testing**

### **Recommended Tests**
- [ ] Authentication bypass attempts
- [ ] SQL/NoSQL injection tests
- [ ] XSS vulnerability tests
- [ ] CSRF protection tests
- [ ] Rate limiting tests
- [ ] Role escalation tests
- [ ] Token manipulation tests

### **Security Headers Test**
```bash
curl -I https://your-domain.com
# Check for security headers in response
```

## 🔍 **Monitoring & Alerts**

### **Security Monitoring**
- **Failed Login Attempts**: Alert on multiple failures
- **Rate Limit Violations**: Monitor for abuse
- **Permission Denials**: Track access attempts
- **System Errors**: Monitor for security-related errors

### **Log Analysis**
- **Real-time Monitoring**: Live security event tracking
- **Pattern Recognition**: Identify attack patterns
- **Anomaly Detection**: Detect unusual behavior
- **Incident Response**: Automated response to threats

## 📚 **Additional Resources**

### **Security Libraries Used**
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT management
- `helmet`: Security headers
- `express-rate-limit`: Rate limiting
- `cors`: Cross-origin resource sharing

### **Security Standards**
- OWASP Top 10 compliance
- JWT best practices
- Password security standards
- API security guidelines

---

**Note**: This security implementation follows industry best practices and should be regularly reviewed and updated to address emerging threats.