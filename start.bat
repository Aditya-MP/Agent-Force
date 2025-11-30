@echo off
echo 🚀 Starting Agent Forces - Cardano AI Assistant
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo.
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

REM Check for .env file
if not exist "backend\.env" (
    echo ⚠️  No .env file found in backend folder
    echo Creating sample .env file...
    echo BLOCKFROST_KEY=your_blockfrost_api_key_here > backend\.env
    echo GEMINI_API_KEY=your_gemini_api_key_here >> backend\.env
    echo PORT=3001 >> backend\.env
    echo.
    echo 🔧 Please edit backend\.env with your API keys:
    echo    - Get Blockfrost key: https://blockfrost.io
    echo    - Get Gemini key: https://aistudio.google.com
    echo.
)

echo 🚀 Starting servers...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers using npm start (which uses concurrently)
npm start

pause