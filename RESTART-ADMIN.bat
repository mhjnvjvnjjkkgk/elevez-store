@echo off
echo.
echo ========================================
echo Restarting Admin Server
echo ========================================
echo.

echo Step 1: Killing any process on port 3001...
npx kill-port 3001 2>nul
if %errorlevel% equ 0 (
    echo [OK] Port 3001 is now free
) else (
    echo [INFO] No process was running on port 3001
)

echo.
echo Step 2: Starting admin server...
echo.
echo ========================================
echo Admin Server Starting...
echo ========================================
echo.
echo The server will start now.
echo.
echo IMPORTANT:
echo - Keep this window open
echo - Open browser to: http://localhost:3001
echo - Click "Sync ^& Deploy" button
echo.
echo Press Ctrl+C to stop the server when done.
echo.
echo ========================================
echo.

npm run admin
