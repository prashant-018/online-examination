@echo off
echo Starting Online Exam Server...
echo.

REM Set environment variables
set PORT=5000
set NODE_ENV=development
set MONGO_URI=mongodb://localhost:27017/online_exam_db
set JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
set JWT_EXPIRES_IN=7d
set FRONTEND_URL=http://localhost:5173
set RATE_LIMIT_WINDOW_MS=900000
set RATE_LIMIT_MAX_REQUESTS=100

echo Environment variables set:
echo PORT=%PORT%
echo NODE_ENV=%NODE_ENV%
echo MONGO_URI=%MONGO_URI%
echo.

REM Navigate to server directory
cd server-new

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the server
echo Starting server on port %PORT%...
npm run dev

pause
