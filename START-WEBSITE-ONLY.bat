@echo off
echo.
echo ========================================
echo   ELEVEZ - Start Website Only
echo ========================================
echo.
echo Starting website server...
echo.

start "ELEVEZ Website" cmd /k "npm run dev"

echo.
echo ✅ Website server starting...
echo.
echo Wait for: "Local: http://localhost:5173/"
echo.
echo Then open: http://localhost:5173
echo.
echo Note: Admin features (image upload, sync) won't work
echo       without the admin server.
echo.
echo To start admin server separately:
echo   node scripts\admin-server.js
echo.
pause
