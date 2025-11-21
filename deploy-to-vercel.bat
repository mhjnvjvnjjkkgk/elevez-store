
@echo off
title Vercel Deployment for Elevez Store

echo 🚀 Vercel Deployment for Elevez Store
echo ===================================
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
echo Step 2: Checking Vercel CLI...
echo ----------------------------
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI.
        echo    Try manually:
        echo    1. Open PowerShell as Administrator
        echo    2. Run: npm install -g vercel
        pause
        exit /b 1
    ) else (
        echo ✅ Vercel CLI installed successfully!
    )
) else (
    for /f "tokens=*" %%i in ('vercel --version') do set VERCEL_VERSION=%%i
    echo ✅ Vercel CLI is installed (Version: %VERCEL_VERSION%)
)

echo.
echo Step 3: Login to Vercel
echo ----------------------
echo Please login to Vercel in your browser when prompted...
vercel login
if %errorlevel% neq 0 (
    echo ⚠️  Vercel login may have failed or was cancelled.
    echo    You can manually run 'vercel login' and then continue.
    echo    Press any key to continue...
    pause >nul
)

echo.
echo Step 4: Building and Deploying to Vercel
echo --------------------------------------
echo Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Project build failed.
    echo    Check the error messages above for details.
    pause
    exit /b 1
) else (
    echo ✅ Project built successfully!
)

echo.
echo Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed.
    echo    Check the error messages above for details.
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Vercel Deployment Completed Successfully!
    echo ==========================================
    echo Your site is now live on Vercel!
)

echo.
echo Press any key to exit...
pause >nul
