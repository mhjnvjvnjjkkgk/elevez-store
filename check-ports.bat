@echo off
echo.
echo ========================================
echo   ELEVEZ - Port Status Check
echo ========================================
echo.
echo Checking which ports are in use...
echo.

echo Checking Port 5173 (Website):
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ✅ Port 5173 is ACTIVE
) else (
    echo ❌ Port 5173 is NOT running
    echo    Run: npm run dev
)
echo.

echo Checking Port 3001 (Admin Server):
netstat -ano | findstr :3001
if %errorlevel% equ 0 (
    echo ✅ Port 3001 is ACTIVE
) else (
    echo ❌ Port 3001 is NOT running
    echo    Run: node scripts\admin-server.js
)
echo.

echo Checking Port 3002 (Hot-Reload):
netstat -ano | findstr :3002
if %errorlevel% equ 0 (
    echo ✅ Port 3002 is ACTIVE
) else (
    echo ⚠️ Port 3002 is NOT running (optional)
)
echo.

echo Checking Port 3000:
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo ⚠️ Port 3000 is ACTIVE (not used by ELEVEZ)
) else (
    echo ℹ️ Port 3000 is not in use
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.
echo Required ports:
echo  - 5173: Website (npm run dev)
echo  - 3001: Admin Server (node scripts\admin-server.js)
echo.
echo Optional:
echo  - 3002: Hot-Reload (auto-started by admin server)
echo.
echo If port 5173 is not running, run:
echo   START-ALL-SERVERS.bat
echo.
pause
