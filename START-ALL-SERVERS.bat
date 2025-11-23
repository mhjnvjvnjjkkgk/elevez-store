@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   ELEVEZ - START ALL SERVERS
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo Starting all required servers...
echo.

REM Start Vite dev server in new window
echo [1/3] Starting Website Server (Port 5173)...
start "ELEVEZ Website" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 3 /nobreak >nul

REM Start admin server in new window
echo [2/3] Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "cd /d "%~dp0" && node scripts\admin-server.js"
timeout /t 2 /nobreak >nul

REM Start auto-deploy monitor in new window
echo [3/3] Starting Auto-Deploy Monitor...
start "ELEVEZ Auto-Deploy" cmd /k "cd /d "%~dp0" && powershell -ExecutionPolicy Bypass -File scripts\auto-deploy-monitor.ps1"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ALL SERVERS STARTED!
echo ========================================
echo.
echo Website: http://localhost:5173
echo Admin Server: http://localhost:3001
echo Auto-Deploy: Monitoring constants.ts
echo.
echo You can now:
echo 1. Open admin-panel\index.html
echo 2. Upload images - they save to public/images/products/
echo 3. Add/edit products
echo 4. Click "Sync & Deploy"
echo 5. Everything updates automatically!
echo.
echo Press any key to open admin panel...
pause >nul

REM Open admin panel
start "" "admin-panel\index.html"

echo.
echo Admin panel opened!
echo Keep this window and the server windows open.
echo.
pause
