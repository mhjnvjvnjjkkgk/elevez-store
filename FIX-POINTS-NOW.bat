@echo off
echo ========================================
echo   FIX POINTS ISSUE NOW
echo ========================================
echo.
echo This tool will:
echo   1. Check all Firebase collections
echo   2. Find users with orders
echo   3. Calculate expected points from orders
echo   4. Create/update userPoints documents
echo   5. Verify the fix worked
echo.
echo Opening diagnostic tool...
echo.

start "" "%~dp0admin-panel\diagnose-points-issue.html"

echo.
echo Tool opened!
echo.
echo Instructions:
echo   1. Wait for auto-check to complete
echo   2. Click "Check User Orders" to see the problem
echo   3. Click "Fix All User Points" to fix it
echo   4. Click "Verify Points Are Fixed" to confirm
echo   5. Refresh Users Management page
echo.
pause
