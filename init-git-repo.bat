@echo off
title Initialize Git Repository for Elevez Store

echo 🚀 Initializing Git Repository for Elevez Store
echo =============================================
echo.

echo Step 1: Checking Git installation...
echo ----------------------------------
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Git not found in PATH. Trying direct execution...
    "C:\Program Files\Git\bin\git.exe" --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Git is not properly installed or not in PATH.
        echo    Please make sure Git is installed and added to your system PATH.
        echo    You can:
        echo    1. Reinstall Git and check "Add to PATH" during installation
        echo    2. Or restart your computer after Git installation
        echo    3. Or manually add Git to your PATH environment variable
        pause
        exit /b 1
    ) else (
        echo ✅ Git found at C:\Program Files\Git\bin\git.exe
        set GIT_PATH="C:\Program Files\Git\bin\git.exe"
    )
) else (
    echo ✅ Git is properly installed and in PATH
    set GIT_PATH=git
)

echo.
echo Step 2: Initializing Git repository...
echo -----------------------------------
%GIT_PATH% init
if %errorlevel% neq 0 (
    echo ❌ Failed to initialize Git repository
    pause
    exit /b 1
) else (
    echo ✅ Git repository initialized
)

echo.
echo Step 3: Adding files to repository...
echo ----------------------------------
%GIT_PATH% add .
if %errorlevel% neq 0 (
    echo ❌ Failed to add files to repository
    pause
    exit /b 1
) else (
    echo ✅ All files added to repository
)

echo.
echo Step 4: Making initial commit...
echo -----------------------------
%GIT_PATH% commit -m "Initial commit"
if %errorlevel% neq 0 (
    echo ❌ Failed to make initial commit
    pause
    exit /b 1
) else (
    echo ✅ Initial commit created
)

echo.
echo 🎉 Git repository successfully initialized!
echo ==========================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub (https://github.com/)
echo 2. Add the remote origin:
echo    %GIT_PATH% remote add origin https://github.com/YOUR_USERNAME/elevez-store.git
echo 3. Push to GitHub:
echo    %GIT_PATH% push -u origin main
echo.
echo After that, connect to Vercel for automatic deployments!
echo.
pause