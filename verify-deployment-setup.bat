@echo off
echo.
echo ========================================
echo   ELEVEZ - Verify Deployment Setup
echo ========================================
echo.
echo Checking your deployment configuration...
echo.

REM Check Git
echo [1/4] Checking Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git is installed
) else (
    echo ❌ Git is NOT installed
    echo    Install from: https://git-scm.com
)
echo.

REM Check Git Remote
echo [2/4] Checking Git Remote...
git remote -v 2>nul | findstr "github.com/mhjnvjvnjjkkgk/elevez-store" >nul
if %errorlevel% equ 0 (
    echo ✅ GitHub remote is configured
    git remote -v
) else (
    echo ❌ GitHub remote NOT configured
    echo.
    echo Run this command:
    echo git remote add origin https://github.com/mhjnvjvnjjkkgk/elevez-store.git
)
echo.

REM Check GitHub Config
echo [3/4] Checking GitHub Config...
if exist "github-config.json" (
    echo ✅ github-config.json exists
    type github-config.json
) else (
    echo ❌ github-config.json NOT found
)
echo.

REM Check Node Modules
echo [4/4] Checking Dependencies...
if exist "node_modules" (
    echo ✅ Dependencies installed
) else (
    echo ❌ Dependencies NOT installed
    echo    Run: npm install
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo Your GitHub Repository:
echo https://github.com/mhjnvjvnjjkkgk/elevez-store
echo.
echo Next Steps:
echo 1. Make sure all checks above are ✅
echo 2. Connect your repo to Vercel
echo 3. Run START-SIMPLE.bat
echo 4. Click "Sync & Deploy" in admin panel
echo 5. Check Vercel dashboard for deployment
echo.
echo Vercel Dashboard:
echo https://vercel.com/dashboard
echo.
pause
