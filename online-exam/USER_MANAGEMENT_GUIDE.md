# User Management System Guide

This guide explains how to use the user management features implemented in the online examination system.

## Features Implemented

### 1. User Registration
- **Endpoint**: `POST /api/users/register`
- **Fields**: name, email, password, confirmPassword, role
- **Roles**: Student, Teacher, Admin
- **Validation**: Password confirmation, minimum length (6 characters)
- **Response**: User data + JWT token

### 2. User Login
- **Endpoint**: `POST /api/users/login`
- **Fields**: email, password
- **Authentication**: JWT token-based
- **Response**: User data + JWT token

### 3. Google OAuth Login
- **Endpoint**: `POST /api/auth/google`
- **Integration**: Google Sign-In button
- **Auto-registration**: Creates account if user doesn't exist
- **Response**: User data + JWT token

### 4. Profile Management
- **View Profile**: `/profile` route (protected)
- **Edit Profile**: Inline editing of name, email, and role
- **Profile Picture**: Upload and manage avatar images
- **File Validation**: Image files only, max 5MB

### 5. Authentication & Authorization
- **JWT Tokens**: Stored in localStorage
- **Protected Routes**: Automatic redirect to login if not authenticated
- **Role-based Access**: Teachers can access exam creation, students cannot
- **Token Verification**: Automatic validation on app load

## Frontend Components

### Core Components
- `RegistrationForm`: User registration with role selection
- `LoginForm`: Login with email/password and Google OAuth
- `Profile`: Profile management and picture upload
- `ProtectedRoute`: Route protection based on authentication
- `ExamContext`: Global authentication state management

### Navigation
- `Header`: Top navigation with user dropdown
- `Sidebar`: Left sidebar with user info and navigation
- Role-based menu items (e.g., "Add Exam" only for teachers)

## Backend Integration

### API Endpoints
- User registration and login
- Profile updates
- Profile picture upload
- Token verification
- Google OAuth integration

### File Upload
- Profile pictures stored in `/uploads` directory
- Automatic file type and size validation
- Unique filename generation

## Usage Flow

### 1. New User Registration
1. Navigate to `/` (Role Selection)
2. Choose role (Student/Teacher)
3. Fill registration form
4. Submit to create account
5. Automatically logged in and redirected to `/home`

### 2. Existing User Login
1. Navigate to `/login`
2. Enter email and password
3. Or use Google Sign-In button
4. Redirected to `/home` upon success

### 3. Profile Management
1. Navigate to `/profile`
2. Click "Edit Profile" to modify information
3. Upload new profile picture if desired
4. Save changes

### 4. Logout
1. Click user avatar in header
2. Select "Logout" from dropdown
3. Redirected to role selection page

## Security Features

- **Password Hashing**: Backend handles secure password storage
- **JWT Tokens**: Secure authentication without storing sensitive data
- **Role-based Access**: Different permissions for different user types
- **Input Validation**: Frontend and backend validation
- **File Upload Security**: Type and size restrictions

## Error Handling

- **Form Validation**: Real-time feedback for form errors
- **API Error Messages**: Clear error messages from backend
- **Loading States**: Visual feedback during operations
- **Success Messages**: Confirmation of successful operations

## Technical Implementation

### State Management
- React Context for global authentication state
- Local storage for token persistence
- Automatic token validation on app load

### Routing
- Protected routes with automatic redirects
- Role-based route access
- Clean URL structure

### UI/UX
- Responsive design with Tailwind CSS
- Loading states and error handling
- Intuitive navigation and user feedback
- Avatar fallbacks for users without profile pictures

## Troubleshooting

### Common Issues
1. **Token Expired**: Automatically redirected to login
2. **Invalid File**: Check file type and size requirements
3. **Role Access**: Ensure user has required role for specific features
4. **Network Errors**: Check backend server status

### Development Notes
- Backend runs on `http://localhost:5000`
- Frontend runs on Vite dev server
- Ensure uploads directory exists in backend
- Google OAuth requires valid client ID configuration 