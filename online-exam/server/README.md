# Online Examination System - Server

This is the backend server for the Online Examination System built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Role-based access control (Student, Teacher, Admin)
- Exam management
- Question management
- User management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/online_exam
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /google` - Google OAuth login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - User logout
- `GET /verify` - Verify JWT token

### Google OAuth (`/api`)
- `GET /auth/google` - Get Google OAuth URL
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/google/success` - Handle Google OAuth success

### Users (`/api/users`)
- `GET /profile` - Get user profile (authenticated)
- `PUT /profile` - Update user profile (authenticated)
- `GET /all` - Get all users (admin only)
- `DELETE /:id` - Delete user (admin only)

### Exams (`/api/exams`)
- `GET /` - Get all active exams
- `GET /:id` - Get exam by ID
- `POST /` - Create new exam (authenticated)
- `PUT /:id` - Update exam (creator/admin only)
- `DELETE /:id` - Delete exam (creator/admin only)
- `POST /:id/questions` - Add questions to exam (creator/admin only)

### Questions (`/api/questions`)
- `GET /` - Get all active questions
- `GET /subject/:subject` - Get questions by subject
- `GET /:id` - Get question by ID
- `POST /` - Create new question (authenticated)
- `PUT /:id` - Update question (creator/admin only)
- `DELETE /:id` - Delete question (creator/admin only)

## Database Models

### User
- name, email, password, role, timestamps

### Exam
- title, description, subject, duration, totalMarks, passingMarks
- startTime, endTime, isActive, createdBy, questions, allowedRoles
- instructions, maxAttempts, timestamps

### Question
- questionText, questionType, options, correctAnswer, marks
- explanation, difficulty, subject, createdBy, isActive, timestamps

## Middleware

- `authMiddleware.js` - JWT authentication
- `roleMiddleware.js` - Role-based access control

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication (7-day expiry)
- Role-based authorization (Student, Teacher, Admin)
- Account lockout after 5 failed login attempts
- Email verification support
- Google OAuth integration
- Input validation and sanitization
- Token refresh mechanism
- Account status monitoring 