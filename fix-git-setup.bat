@echo off
title Fix Git Setup for Elevez Store

echo 🚀 Fixing Git Setup for Elevez Store
echo ==================================
echo.

echo Step 1: Navigating to project directory...
echo -------------------------------------
cd /d "d:\wbeiste\elevez (1)"
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to project directory
    echo    Make sure the path "d:\wbeiste\elevez (1)" exists
    pause
    exit /b 1
) else (
    echo ✅ Successfully navigated to project directory
    echo    Current directory: %cd%
    echo.
)

echo Step 2: Fixing Git ownership issue...
echo ---------------------------------
git config --global --add safe.directory "d:/wbeiste/elevez (1)"
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Could not fix ownership issue (this might not be a problem)
) else (
    echo ✅ Git ownership issue fixed
)

echo.
echo Step 3: Initializing Git repository...
echo -----------------------------------
git init
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
) else (
    echo ✅ Git repository initialized
)

echo.
echo Step 4: Adding files to repository...
echo ----------------------------------
git add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files to repository
    pause
    exit /b 1
) else (
    echo ✅ All files added to repository
)

echo.
echo Step 5: Making initial commit...
echo -----------------------------
git commit -m "Initial commit"
if %errorlevel% neq 0 (
    echo ❌ Failed to make initial commit
    pause
    exit /b 1
) else (
    echo ✅ Initial commit created
)

echo.
echo 🎉 Git setup completed successfully!
echo =================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub (https://github.com/)
echo 2. Add the remote origin:
echo    git remote add origin https://github.com/YOUR_USERNAME/elevez-store.git
echo 3. Push to GitHub:
echo    git push -u origin main
echo.
echo After that, connect to Vercel for automatic deployments!
echo.
pause