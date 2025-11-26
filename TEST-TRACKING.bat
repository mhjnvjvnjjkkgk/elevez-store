@echo off
echo.
echo ========================================
echo   Complete Order Tracking Test
echo ========================================
echo.
echo Opening test tool...
echo.

start http://localhost:3001/TEST-ORDER-TRACKING-COMPLETE.html

echo.
echo Test tool opened!
echo.
echo This will:
echo   1. Test Firebase connection
echo   2. Load all orders with correct IDs
echo   3. Test shipping with tracking links
echo   4. Test marking as delivered
echo.
echo Follow the steps in the browser!
echo.
pause
