@echo off
echo.
echo ========================================
echo Testing Sync ^& Deploy Endpoint
echo ========================================
echo.

echo Step 1: Testing server connection...
curl -s http://localhost:3001/load-products > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Server is running on port 3001
) else (
    echo [ERROR] Cannot connect to server!
    echo Make sure to run: npm run admin
    pause
    exit /b 1
)

echo.
echo Step 2: Testing sync-deploy endpoint...
curl -X POST http://localhost:3001/sync-deploy -H "Content-Type: application/json" -d "{\"timestamp\":\"test\",\"products\":6,\"collections\":3\"}"

echo.
echo ========================================
echo Test complete!
echo ========================================
echo.
echo If you see "success: true" above, the endpoint works!
echo.
pause
