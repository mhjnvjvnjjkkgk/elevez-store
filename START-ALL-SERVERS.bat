@echo off
echo.
echo ========================================
echo   ELEVEZ - START ALL SERVERS
echo ========================================
echo.
echo Starting all required servers...
echo.

REM Start admin server in new window
echo [1/2] Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "node scripts\admin-server.js"
timeout /t 2 /nobreak >nul

REM Start auto-deploy monitor in new window
echo [2/2] Starting Auto-Deploy Monitor...
start "ELEVEZ Auto-Deploy" cmd /k "powershell -ExecutionPolicy Bypass -File scripts\auto-deploy-monitor.ps1"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ALL SERVERS STARTED!
echo ========================================
echo.
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
