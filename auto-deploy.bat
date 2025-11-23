@echo off
echo.
echo ================================
echo Auto Deploy - Git + Vercel
echo ================================
echo.

echo [1/5] Adding files to Git...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo SUCCESS: Files added
echo.

echo [2/5] Committing changes...
git commit -m "Auto-deploy: Updates from %date% %time%"
echo.

echo [3/5] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo WARNING: Push failed, continuing anyway...
)
echo.

echo [4/5] Building project...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo SUCCESS: Build completed
echo.

echo [5/5] Deploying to Vercel...
call vercel --prod --yes
if errorlevel 1 (
    echo ERROR: Vercel deployment failed
    pause
    exit /b 1
)

echo.
echo ================================
echo Deployment Complete!
echo ================================
echo.
echo Your site is now live on Vercel
pause
