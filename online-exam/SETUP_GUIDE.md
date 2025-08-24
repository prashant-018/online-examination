# Online Exam System - Setup Guide

## Quick Start (Windows)

### Option 1: Using Batch Script (Recommended)
1. Double-click `start-server.bat` in the root directory
2. The script will automatically:
   - Set all required environment variables
   - Install dependencies if needed
   - Start the server on port 5000

### Option 2: Using PowerShell Script
1. Right-click `start-server.ps1` and select "Run with PowerShell"
2. Or open PowerShell and run: `.\start-server.ps1`

### Option 3: Manual Setup
1. Open Command Prompt or PowerShell
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Set environment variables (see below)
5. Start the server: `npm run dev`

## Environment Variables

Create a `.env` file in the `server` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/online_exam_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The server will automatically connect to `mongodb://localhost:27017/online_exam_db`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGO_URI` in your `.env` file with the Atlas connection string

## Frontend Setup

1. Open a new terminal/command prompt
2. Navigate to the root directory: `cd online-exam`
3. Install dependencies: `npm install`
4. Start the frontend: `npm run dev`
5. The frontend will run on `http://localhost:5173`

## Troubleshooting

### Connection Refused Error
- Make sure the server is running on port 5000
- Check if MongoDB is running
- Verify the `.env` file exists in the server directory
- Check if the port 5000 is not being used by another application

### MongoDB Connection Issues
- Ensure MongoDB is installed and running
- Check if the connection string is correct
- For Atlas, make sure your IP is whitelisted

### Port Already in Use
- Change the PORT in the `.env` file to another port (e.g., 5001)
- Update the frontend API calls accordingly

## Security Notes

- Change the `JWT_SECRET` to a strong, unique secret in production
- Use environment variables for sensitive data
- Never commit `.env` files to version control
- Use HTTPS in production

## Development Workflow

1. Start the backend server first (using any of the methods above)
2. Start the frontend development server
3. Both should be running simultaneously:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper MongoDB connection
4. Set up HTTPS
5. Use a process manager like PM2
6. Configure proper CORS settings
