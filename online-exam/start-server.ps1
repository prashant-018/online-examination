# Online Exam Server Startup Script
Write-Host "Starting Online Exam Server..." -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:PORT = "5000"
$env:NODE_ENV = "development"
$env:MONGO_URI = "mongodb://localhost:27017/online_exam_db"
$env:JWT_SECRET = "your_super_secret_jwt_key_change_this_in_production"
$env:JWT_EXPIRES_IN = "7d"
$env:FRONTEND_URL = "http://localhost:5173"
$env:RATE_LIMIT_WINDOW_MS = "900000"
$env:RATE_LIMIT_MAX_REQUESTS = "100"

Write-Host "Environment variables set:" -ForegroundColor Yellow
Write-Host "PORT: $env:PORT"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "MONGO_URI: $env:MONGO_URI"
Write-Host ""

# Navigate to server directory
Set-Location -Path "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting server on port $env:PORT..." -ForegroundColor Green
npm run dev

Read-Host "Press Enter to exit"
