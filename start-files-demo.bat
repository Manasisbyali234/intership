@echo off
echo Starting AI Student Assistant - Files Demo
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3

echo Starting Frontend on port 3001...
start "Frontend" cmd /k "cd frontend && set PORT=3001 && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul