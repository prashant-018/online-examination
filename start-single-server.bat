@echo off
echo Starting Online Exam System (Single Server Mode)
echo.

REM Kill any existing Node.js processes to avoid conflicts
taskkill /f /im node.exe >nul 2>&1
echo Stopped any existing servers...

REM Set environment variables
set PORT=5000
set NODE_ENV=development
set MONGO_URI=mongodb://localhost:27017/online_exam_db
set JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
set JWT_EXPIRES_IN=7d
set FRONTEND_URL=http://localhost:5173
set RATE_LIMIT_WINDOW_MS=900000
set RATE_LIMIT_MAX_REQUESTS=100

echo Environment variables set for port %PORT%
echo.

REM Navigate to the correct server directory
cd server-new

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the server
echo Starting server on port %PORT%...
echo.
npm run dev

pause
