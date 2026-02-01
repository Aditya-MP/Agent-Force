@echo off
echo 🔍 Agent Forces Health Check
echo.

echo Checking backend health...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 3001
) else (
    echo ❌ Backend is not responding on port 3001
    echo    Try running: cd backend && npm start
)

echo.
echo Checking frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on port 5173
) else (
    echo ❌ Frontend is not responding on port 5173
    echo    Try running: cd frontend && npm run dev
)

echo.
echo 🌐 Access Points:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo    Health:   http://localhost:3001/health
echo.

pause