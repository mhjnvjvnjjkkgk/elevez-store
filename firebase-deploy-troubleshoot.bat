@echo off
title Firebase Deployment Troubleshooter for Elevez Store

echo 🚀 Firebase Deployment Troubleshooter for Elevez Store
echo =====================================================
echo.

echo This script will help you deploy your website to Firebase Hosting.
echo.

echo Step 1: Checking prerequisites...
echo --------------------------------
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed.
    echo    Please download and install Node.js from https://nodejs.org/
    echo    Then run this script again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js is installed (Version: %NODE_VERSION%)
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    echo    Please download and install Node.js (which includes npm) from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm is installed (Version: %NPM_VERSION%)
)

echo.
echo Step 2: Checking Firebase CLI...
echo -------------------------------
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Firebase CLI not found. Installing...
    npm install -g firebase-tools
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Firebase CLI.
        echo    Try manually:
        echo    1. Open PowerShell as Administrator
        echo    2. Run: npm install -g firebase-tools
        pause
        exit /b 1
    ) else (
        echo ✅ Firebase CLI installed successfully!
    )
) else (
    for /f "tokens=*" %%i in ('firebase --version') do set FIREBASE_VERSION=%%i
    echo ✅ Firebase CLI is installed (Version: %FIREBASE_VERSION%)
)

echo.
echo Step 3: Login to Firebase
echo ------------------------
echo Please login to Firebase in your browser when prompted...
firebase login
if %errorlevel% neq 0 (
    echo ⚠️  Firebase login may have failed or was cancelled.
    echo    You can manually run 'firebase login' and then continue.
    echo    Press any key to continue...
    pause >nul
)

echo.
echo Step 4: Initializing Firebase Hosting (if needed)
echo ------------------------------------------------
if not exist firebase.json (
    echo ⚠️  Firebase Hosting not initialized.
    echo    You'll need to answer some questions:
    echo    - Select 'Hosting: Configure files for Firebase Hosting' (use spacebar to select)
    echo    - Public directory: dist
    echo    - Configure as a single-page app: Yes
    echo    - Set up automatic builds and deploys with GitHub: No
    echo.
    echo    Initializing Firebase Hosting...
    firebase init hosting
    if %errorlevel% neq 0 (
        echo ❌ Firebase Hosting initialization failed.
        echo    You can manually run 'firebase init hosting' and then run this script again.
        pause
        exit /b 1
    ) else (
        echo ✅ Firebase Hosting initialized!
    )
) else (
    echo ✅ Firebase Hosting already initialized.
)

echo.
echo Step 5: Building the project
echo --------------------------
npm run build
if %errorlevel% neq 0 (
    echo ❌ Project build failed.
    echo    Check the error messages above for details.
    echo    You can manually run 'npm run build' to see detailed error information.
    pause
    exit /b 1
) else (
    echo ✅ Project built successfully!
)

echo.
echo Step 6: Deploying to Firebase
echo ----------------------------
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ Deployment failed.
    echo    Check the error messages above for details.
    echo.
    echo    Common issues and solutions:
    echo    1. Make sure you've completed Firebase initialization
    echo    2. Check your Firebase project permissions
    echo    3. Ensure you have an internet connection
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Firebase Deployment Completed Successfully!
    echo ==============================================
    echo Your site is now live on Firebase Hosting!
)

echo.
echo Press any key to exit...
pause >nul