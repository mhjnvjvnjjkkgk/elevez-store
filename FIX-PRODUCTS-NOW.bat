@echo off
echo ========================================
echo   EMERGENCY PRODUCT FIX
echo ========================================
echo.
echo Opening fix page...
echo.

start http://localhost:5173/EMERGENCY-FIX-PRODUCTS.html

echo.
echo The fix page will:
echo 1. Load 5 products into localStorage
echo 2. Automatically open admin panel
echo 3. Products will be visible immediately
echo.
echo If it doesn't open automatically:
echo Open: http://localhost:5173/EMERGENCY-FIX-PRODUCTS.html
echo.
pause
