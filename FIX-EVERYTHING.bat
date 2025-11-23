@echo off
echo.
echo ========================================
echo   ELEVEZ - Complete Fix Script
echo ========================================
echo.
echo This will:
echo  1. Stop all running servers
echo  2. Clear old data
echo  3. Start fresh with trial products
echo  4. Launch everything correctly
echo.
pause
echo.

echo [1/5] Stopping old servers...
taskkill /F /FI "WINDOWTITLE eq ELEVEZ*" 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Cleaning up...
echo Clearing localStorage will happen when you open admin panel
echo.

echo [3/5] Starting servers...
echo.
echo Starting Website Server (Port 5173)...
start "ELEVEZ Website" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "node scripts\admin-server.js"
timeout /t 2 /nobreak >nul

echo.
echo [4/5] Opening debug tool...
timeout /t 2 /nobreak >nul
start "" "debug-products.html"

echo.
echo [5/5] Opening admin panel...
timeout /t 2 /nobreak >nul
start "" "admin-panel\index.html"

echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo In the debug tool that just opened:
echo  1. Click "Load Trial Products" to add sample products
echo  2. Click "Sync to constants.ts" to update website
echo  3. Go to http://localhost:5173 to see products
echo.
echo In the admin panel:
echo  - Your products are there
echo  - Trial products are added
echo  - Edit any product and click "Sync & Deploy"
echo.
echo Website: http://localhost:5173
echo Admin Panel: admin-panel\index.html
echo.
pause
