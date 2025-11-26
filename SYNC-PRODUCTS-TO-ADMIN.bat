@echo off
echo ========================================
echo   SYNC PRODUCTS TO ADMIN PANEL
echo ========================================
echo.
echo This will sync products from your website
echo to the admin panel localStorage.
echo.
echo Opening sync page...
echo.

start http://localhost:5173/admin-panel/sync-from-constants.html

echo.
echo If the page doesn't open:
echo 1. Make sure your dev server is running
echo 2. Open: http://localhost:5173/admin-panel/sync-from-constants.html
echo.
pause
