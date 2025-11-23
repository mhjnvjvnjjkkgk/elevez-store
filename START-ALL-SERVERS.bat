@echo off
REM Get the directory where this batch file is located
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo ========================================
echo   ELEVEZ - START ALL SERVERS
echo ========================================
echo.
echo Project directory: %PROJECT_DIR%
echo Current directory: %CD%
echo.

REM Verify we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from your project directory.
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Starting servers in 2 seconds...
timeout /t 2 /nobreak >nul
echo.

REM Start Vite dev server in new window
echo [1/3] Starting Website Server (Port 5173)...
start "ELEVEZ Website" cmd /k "cd /d "%PROJECT_DIR%" && npm run dev"
timeout /t 3 /nobreak >nul

REM Start admin server in new window
echo [2/3] Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "cd /d "%PROJECT_DIR%" && node scripts\admin-server.js"
timeout /t 2 /nobreak >nul

REM Skip auto-deploy monitor for now (optional)
echo [3/3] Servers started (auto-deploy monitor skipped)
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo   ALL SERVERS STARTED!
echo ========================================
echo.
echo Website: http://localhost:5173
echo Admin Server: http://localhost:3001
echo.
echo Opening admin panel in 3 seconds...
timeout /t 3 /nobreak >nul

REM Open admin panel
start "" "admin-panel\index.html"

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Admin panel opened!
echo Keep the server windows open.
echo.
echo This window will close in 5 seconds...
timeout /t 5 /nobreak >nul
