# Authentication & Authorization Guide

This guide explains the comprehensive authentication and authorization system implemented in the Online Examination System.

## 🔐 **Authentication Methods**

### 1. **Traditional Email/Password Authentication**
- **Registration**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Password Requirements**: Minimum 6 characters, automatically hashed with bcrypt (12 rounds)

### 2. **Google OAuth Authentication**
- **Initiate Flow**: `GET /api/auth/google`
- **Callback**: `GET /api/auth/google/callback`
- **API Login**: `POST /api/auth/google/success`

### 3. **JWT Token Management**
- **Token Generation**: Automatic on successful authentication
- **Token Expiry**: 7 days (configurable)
- **Token Refresh**: `POST /api/auth/refresh`
- **Token Verification**: `GET /api/auth/verify`

## 👥 **User Roles & Permissions**

### **Student Role**
- ✅ Access exams they're enrolled in
- ✅ Take exams and submit answers
- ✅ View their own profile and results
- ❌ Cannot create/modify exams
- ❌ Cannot access other users' data

### **Teacher Role**
- ✅ Create and manage their own exams
- ✅ Add questions to exams
- ✅ View student results for their exams
- ✅ Access question bank
- ❌ Cannot access other teachers' exams
- ❌ Cannot modify user roles

### **Admin Role**
- ✅ Full system access
- ✅ Manage all users and roles
- ✅ Access all exams and questions
- ✅ System configuration
- ✅ User account management

## 🛡️ **Security Features**

### **Account Protection**
- **Login Attempts**: Account locked after 5 failed attempts
- **Lock Duration**: 2 hours automatic unlock
- **Account Status**: Active/Inactive account management
- **Email Verification**: Optional email verification system

### **Token Security**
- **JWT Secret**: Environment variable configuration
- **Token Expiry**: Automatic expiration handling
- **Token Validation**: Database verification on each request
- **Secure Headers**: Bearer token authentication

### **Data Protection**
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive request validation
- **SQL Injection**: Mongoose ODM protection
- **XSS Protection**: Input sanitization

## 🔧 **Implementation Examples**

### **Frontend Authentication Flow**

```javascript
// Login with email/password
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Google OAuth login
const googleLogin = async (googleId, name, email, avatar) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleId, name, email, avatar })
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};

// Authenticated API calls
const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  return fetch(url, config);
};
```

### **Role-Based Route Protection**

```javascript
// React component with role-based access
const ProtectedComponent = ({ requiredRole, children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !['Admin', 'Teacher'].includes(user.role)) {
    return <div>Access Denied</div>;
  }
  
  return children;
};

// Usage
<ProtectedComponent requiredRole="Teacher">
  <ExamCreationForm />
</ProtectedComponent>
```

## 📋 **Environment Variables**

```env
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/online_exam
JWT_SECRET=your_super_secret_jwt_key_here

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## 🚀 **Getting Started**

### **1. Setup Google OAuth (Optional)**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Secret to `.env` file

### **2. Test Authentication**
```bash
# Start server
npm run dev

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"Student"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **3. Test Protected Routes**
```bash
# Get user profile (requires token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Invalid Token" Error**
   - Check if token is expired
   - Verify JWT_SECRET in .env
   - Ensure token format: `Bearer <token>`

2. **"Access Denied" Error**
   - Verify user role permissions
   - Check if account is active
   - Ensure proper authentication headers

3. **Google OAuth Issues**
   - Verify Google credentials in .env
   - Check redirect URI configuration
   - Ensure Google+ API is enabled

### **Debug Mode**
```javascript
// Enable detailed logging
console.log('User:', req.user);
console.log('Token:', req.header('Authorization'));
console.log('Role:', req.user?.role);
```

## 📚 **Additional Resources**

- [JWT.io](https://jwt.io/) - JWT token debugger
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Official documentation
- [bcrypt](https://github.com/dcodeIO/bcrypt.js) - Password hashing library
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM documentation 