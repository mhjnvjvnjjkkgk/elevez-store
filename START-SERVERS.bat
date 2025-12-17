@echo off
echo ====================================
echo   ELEVEZ - Starting All Servers
echo ====================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "node scripts/admin-server.js"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Website Dev Server (Port 5173)...
start "ELEVEZ Website" cmd /k "npm run dev"

echo.
echo ====================================
echo   Servers are starting...
echo ====================================
echo.
echo Admin Panel: http://localhost:3001
echo Website: http://localhost:5173
echo.
echo Press any key to exit this window...
echo (Server windows will stay open)
pause >nul
