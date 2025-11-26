@echo off
echo.
echo ========================================
echo   ELEVEZ - Orders Status Checker
echo ========================================
echo.
echo Opening diagnostic tool...
echo.

start http://localhost:5173/admin-panel/check-orders-status.html

echo.
echo Tool opened in your browser!
echo.
echo This tool will show you:
echo - LocalStorage orders count
echo - Firebase orders count  
echo - Sync status
echo - All orders with their source
echo.
pause
