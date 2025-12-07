@echo off
color 0A
cls
echo ========================================
echo   CREATE FIREBASE INDEXES
echo ========================================
echo.
echo Opening visual guide...
echo.

start "" "create-firebase-indexes.html"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   QUICK INSTRUCTIONS
echo ========================================
echo.
echo The visual guide has opened in your browser.
echo.
echo Follow these 3 simple steps:
echo.
echo 1. Click "Open Firebase Console" button
echo 2. Create 3 indexes (follow the guide)
echo 3. Wait 2-5 minutes for indexes to build
echo.
echo That's it! Your orders will then work.
echo.
echo ========================================
echo.
pause
