@echo off
echo Firebase Deployment Script for Elevez Store
echo ========================================
echo.

echo 1. Building the project...
echo -------------------------
node ./node_modules/vite/bin/vite.js build
if %errorlevel% neq 0 (
    echo Build failed. Please check the errors above.
    pause
    exit /b %errorlevel%
)
echo Build completed successfully!
echo.

echo 2. Deploying to Firebase...
echo --------------------------
echo Please make sure you have Firebase CLI installed globally.
echo If not, install it by running in a new PowerShell window:
echo    npm install -g firebase-tools
echo.
echo Then login to Firebase:
echo    firebase login
echo.
echo Finally, deploy your app:
echo    firebase deploy --only hosting
echo.
echo For PowerShell execution policy issues, run in a new PowerShell window:
echo    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
echo.
pause