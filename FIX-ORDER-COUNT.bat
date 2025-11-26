@echo off
echo.
echo ========================================
echo   FIX ORDER COUNT TOOL
echo ========================================
echo.
echo Opening order count fix tool...
echo.
echo This tool will:
echo  - Count all orders in Firebase
echo  - Update user profiles with correct counts
echo  - Fix the "0 orders" display issue
echo.
echo Press any key to open the tool...
pause >nul

start "" "fix-order-count.html"

echo.
echo Tool opened in your browser!
echo.
echo Follow the instructions on the page to fix order counts.
echo.
pause
