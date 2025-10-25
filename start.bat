@echo off
echo Starting Multiplayer Grid Game...
echo.
echo Starting Backend Server...
start cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Server...
start cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo Both servers are starting!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
pause
