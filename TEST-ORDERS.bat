@echo off
echo.
echo ========================================
echo   Test Orders Connection
echo ========================================
echo.
echo Opening test page...
echo.

start http://localhost:3001/test-orders-now.html

echo.
echo Test page opened!
echo.
echo Instructions:
echo   1. Click "Test Connection" button
echo   2. Click "Load Orders" button
echo   3. See if orders are found
echo.
echo If NO orders found:
echo   - You need to place an order first
echo   - Go to website and complete checkout
echo.
echo If orders ARE found:
echo   - Click "Open Admin Panel"
echo   - Go to Orders tab
echo   - Orders should display!
echo.
pause
