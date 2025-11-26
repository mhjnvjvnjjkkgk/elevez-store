@echo off
echo.
echo ========================================
echo   ELEVEZ - Fix Orders Display NOW
echo ========================================
echo.
echo Opening quick fix tool...
echo.

start http://localhost:3001/check-orders-quick.html

echo.
echo Tool opened in your browser!
echo.
echo Follow these steps:
echo   1. Click "Sync from Firebase" button
echo   2. Wait for success message
echo   3. Click "Open Admin Panel" button
echo   4. Click "Orders" tab
echo   5. Orders will display!
echo.
pause
