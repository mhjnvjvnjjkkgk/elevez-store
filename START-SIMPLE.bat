@echo off
echo.
echo ========================================
echo   ELEVEZ - Simple Start
echo ========================================
echo.
echo Starting servers...
echo.

echo [1/2] Starting Website (Port 5173)...
start "ELEVEZ Website" cmd /k "npm run dev"
echo Wait for: "Local: http://localhost:5173/"
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Admin Server (Port 3001)...
start "ELEVEZ Admin Server" cmd /k "node scripts\admin-server.js"
echo Wait for: "Admin Server Running!"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Website: http://localhost:5173
echo Admin Panel: Open admin-panel\index.html
echo.
echo Next steps:
echo 1. Open admin-panel\index.html in browser
echo 2. Add/edit products
echo 3. Click "Sync & Deploy"
echo 4. Go to http://localhost:5173
echo.
echo Opening fix tool in 3 seconds...
timeout /t 3 /nobreak >nul
start "" "fix-all-products.html"
echo.
echo ✅ Fix tool opened!
echo Use it to:
echo  - Fix all image URLs
echo  - Add trial products
echo  - Sync to website
echo.
pause
