@echo off
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         ELEVEZ ADMIN PANEL - STARTUP                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Kill any existing processes on ports 3001 and 3002
echo 🔄 Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1

REM Start the admin server
echo.
echo 🚀 Starting Admin Server on port 3001...
echo.
start "Admin Server" cmd /k "node scripts/admin-server.js"

REM Wait for server to start
timeout /t 2 /nobreak

REM Open the admin panel in browser
echo.
echo 🌐 Opening Admin Panel in browser...
timeout /t 1 /nobreak
start http://localhost:3001/admin-panel/index.html

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ Admin Panel is starting!                                   ║
echo ║                                                                ║
echo ║  📍 Admin Panel: http://localhost:3001/admin-panel/index.html  ║
echo ║  📡 Server: http://localhost:3001                             ║
echo ║  🔥 Hot-Reload: ws://localhost:3002                           ║
echo ║                                                                ║
echo ║  ⚠️  IMPORTANT:                                                ║
echo ║  - Do NOT close this window while using the admin panel       ║
echo ║  - The server window will open in a new terminal              ║
echo ║  - Keep both windows open for full functionality              ║
echo ║                                                                ║
echo ║  🔄 To refresh: Press F5 in the browser                       ║
echo ║  🛑 To stop: Close both terminal windows                      ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
