@echo off
echo.
echo ========================================
echo   ELEVEZ Builder.io Workflow
echo ========================================
echo.
echo Starting all required services...
echo.

REM Start admin server
echo [1/3] Starting Admin Server...
start "Admin Server" cmd /k "node scripts/admin-server.js"
timeout /t 2 /nobreak >nul

REM Start Builder.io webhook handler
echo [2/3] Starting Builder.io Webhook Handler...
start "Builder Webhook" cmd /k "npm run builder:webhook"
timeout /t 2 /nobreak >nul

REM Start dev server
echo [3/3] Starting Dev Server...
start "Dev Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Admin Panel:  http://localhost:3001/admin-panel/
echo Website:      http://localhost:5173/
echo Webhook:      http://localhost:3003/health
echo.
echo Builder.io:   https://builder.io/content
echo.
echo Press any key to open Builder.io editor...
pause >nul

start https://builder.io/content

echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
