# User Management Guide

This guide covers the comprehensive user management system implemented in the Online Examination System, including registration, login, profile management, and administrative functions.

## 🔐 **Authentication Endpoints**

### **1. User Registration**
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "Student"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **2. User Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

## 👤 **Profile Management**

### **3. Get User Profile**
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

### **4. Update User Profile**
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### **5. Upload Profile Picture**
```http
POST /api/users/profile/picture
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

avatar: [image_file]
```

**File Requirements:**
- **Format**: JPG, PNG, GIF, WebP
- **Size**: Maximum 5MB
- **Field Name**: `avatar`

**Response:**
```json
{
  "message": "Profile picture uploaded successfully",
  "avatar": "profile-1234567890-123456789.jpg",
  "avatarUrl": "/uploads/profile-1234567890-123456789.jpg"
}
```

### **6. Get Profile Picture**
```http
GET /api/users/profile/picture
Authorization: Bearer <jwt_token>
```

**Response:** Image file or error message

## 👨‍💼 **Administrative Functions (Admin Only)**

### **7. Get All Users**
```http
GET /api/users/all?page=1&limit=10&role=Student&search=john
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 10)
- `role`: Filter by role (Student, Teacher, Admin)
- `search`: Search by name or email

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "usersPerPage": 10
  }
}
```

### **8. Change User Role**
```http
PUT /api/users/role
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "user_id_here",
  "newRole": "Teacher"
}
```

### **9. Toggle User Status**
```http
PUT /api/users/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

### **10. Delete User**
```http
DELETE /api/users/delete
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "userId": "user_id_here"
}
```

### **11. Get User Statistics**
```http
GET /api/users/stats
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "totalUsers": 150,
  "activeUsers": 145,
  "lockedUsers": 3,
  "roleStats": [
    { "_id": "Student", "count": 100 },
    { "_id": "Teacher", "count": 40 },
    { "_id": "Admin", "count": 10 }
  ],
  "recentRegistrations": [...]
}
```

## 👨‍🏫 **Teacher Functions**

### **12. Get Students (Teachers Only)**
```http
GET /api/users/students?page=1&limit=20&search=john
Authorization: Bearer <teacher_jwt_token>
```

## 🛡️ **Security Features**

### **Password Requirements**
- Minimum 6 characters
- Automatically hashed with bcrypt (12 rounds)
- Password confirmation required for registration

### **Account Protection**
- **Login Attempts**: Account locked after 5 failed attempts
- **Lock Duration**: 2 hours automatic unlock
- **Account Status**: Active/Inactive management
- **Role Validation**: Strict role checking

### **File Upload Security**
- **File Type Validation**: Only image files allowed
- **Size Limits**: Maximum 5MB per file
- **Unique Naming**: Timestamp-based unique filenames
- **Old File Cleanup**: Automatic deletion of old profile pictures

## 🔧 **Frontend Implementation Examples**

### **Registration Form**
```javascript
const handleRegister = async (formData) => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to dashboard
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Registration failed');
  }
};
```

### **Profile Picture Upload**
```javascript
const handleProfilePictureUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch('/api/users/profile/picture', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await response.json();
    if (response.ok) {
      setAvatar(data.avatarUrl);
      setMessage('Profile picture updated successfully');
    } else {
      setError(data.message);
    }
  } catch (error) {
    setError('Upload failed');
  }
};
```

### **Protected Route Component**
```javascript
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <div>Access Denied</div>;
  }
  
  return children;
};

// Usage
<ProtectedRoute requiredRole="Admin">
  <UserManagementPanel />
</ProtectedRoute>
```

## 📋 **Environment Variables**

```env
# Required
PORT=5000
MONGO_URI=mongodb://localhost:27017/online_exam
JWT_SECRET=your_super_secret_jwt_key_here

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
cd online-exam/server
npm install
```

### **2. Create Uploads Directory**
```bash
mkdir uploads
```

### **3. Test User Management**
```bash
# Start server
npm run dev

# Test registration
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123","role":"Student"}'

# Test login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔍 **Error Handling**

### **Common Error Responses**

```json
// Validation Error
{
  "message": "All fields are required",
  "required": ["name", "email", "password", "role"]
}

// Authentication Error
{
  "message": "Access denied. No token provided."
}

// Permission Error
{
  "message": "Access denied. Insufficient permissions.",
  "requiredRoles": ["Admin"],
  "userRole": "Teacher"
}

// File Upload Error
{
  "message": "Only image files are allowed!"
}
```

## 📚 **Best Practices**

1. **Token Management**
   - Store JWT in localStorage or secure cookie
   - Implement token refresh mechanism
   - Clear tokens on logout

2. **File Uploads**
   - Validate file types on frontend and backend
   - Implement file size limits
   - Use unique filenames to prevent conflicts

3. **Security**
   - Always validate user permissions
   - Sanitize user inputs
   - Implement rate limiting for sensitive endpoints

4. **Error Handling**
   - Provide meaningful error messages
   - Log errors for debugging
   - Handle network failures gracefully

## 🔗 **Related Documentation**

- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [API Documentation](./README.md)
- [Database Models](./models/)
- [Middleware](./middleware/) 