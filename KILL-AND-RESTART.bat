@echo off
echo ========================================
echo  KILLING OLD SERVERS AND RESTARTING
echo ========================================
echo.

echo Killing processes on port 3001 (Admin Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo.

echo Killing processes on port 5173 (Website)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo.

echo Killing processes on port 3000 (Admin Panel)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
echo.

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul
echo.

echo ========================================
echo  STARTING SERVERS
echo ========================================
echo.

echo Starting Admin Server (Port 3001)...
start "Admin Server" cmd /k "node scripts/admin-server.js"
timeout /t 2 /nobreak >nul
echo.

echo Starting Website (Port 5173)...
start "Website Dev Server" cmd /k "npm run dev"
echo.

echo ========================================
echo  SERVERS STARTED!
echo ========================================
echo.
echo Admin Server: http://localhost:3001
echo Website: http://localhost:5173
echo Admin Panel: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
