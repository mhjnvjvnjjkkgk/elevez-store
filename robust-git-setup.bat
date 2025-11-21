@echo off
title Robust Git Setup for Elevez Store

echo 🚀 Robust Git Setup for Elevez Store
echo =================================
echo.

echo Step 1: Finding Git installation...
echo --------------------------------
where git >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git found in PATH
    set GIT_CMD=git
) else (
    echo ⚠️  Git not found in PATH, trying common locations...
    
    if exist "C:\Program Files\Git\bin\git.exe" (
        echo ✅ Git found at "C:\Program Files\Git\bin\git.exe"
        set GIT_CMD="C:\Program Files\Git\bin\git.exe"
    ) else if exist "C:\Program Files (x86)\Git\bin\git.exe" (
        echo ✅ Git found at "C:\Program Files (x86)\Git\bin\git.exe"
        set GIT_CMD="C:\Program Files (x86)\Git\bin\git.exe"
    ) else (
        echo ❌ Git not found in common locations
        echo    Please make sure Git is installed from https://git-scm.com/download/win
        echo    During installation, check "Add Git to PATH"
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Navigating to project directory...
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

echo Step 3: Fixing Git ownership issue...
echo ---------------------------------
%GIT_CMD% config --global --add safe.directory "d:/wbeiste/elevez (1)"
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Could not fix ownership issue (this might not be a problem)
) else (
    echo ✅ Git ownership issue fixed
)

echo.
echo Step 4: Initializing Git repository...
echo -----------------------------------
%GIT_CMD% init
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
) else (
    echo ✅ Git repository initialized
)

echo.
echo Step 5: Adding files to repository...
echo ----------------------------------
%GIT_CMD% add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files to repository
    pause
    exit /b 1
) else (
    echo ✅ All files added to repository
)

echo.
echo Step 6: Making initial commit...
echo -----------------------------
%GIT_CMD% commit -m "Initial commit"
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
echo    %GIT_CMD% remote add origin https://github.com/YOUR_USERNAME/elevez-store.git
echo 3. Push to GitHub:
echo    %GIT_CMD% push -u origin main
echo.
echo After that, connect to Vercel for automatic deployments!
echo.
pause