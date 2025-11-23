@echo off
echo.
echo ========================================
echo   ELEVEZ AUTO-DEPLOY MONITOR
echo ========================================
echo.
echo Starting auto-deploy monitor...
echo This will watch for changes and deploy automatically.
echo.
powershell -ExecutionPolicy Bypass -File auto-deploy-monitor.ps1
pause
