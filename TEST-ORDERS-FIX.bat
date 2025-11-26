@echo off
echo.
echo ========================================
echo   ELEVEZ - Test Orders Fix
echo ========================================
echo.
echo This will test the orders display fix
echo.
echo Step 1: Opening diagnostic tool...
start http://localhost:5173/admin-panel/check-orders-status.html
timeout /t 3 /nobreak >nul

echo.
echo Step 2: Opening admin panel...
start http://localhost:5173/admin-panel/
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Testing Instructions
echo ========================================
echo.
echo In the DIAGNOSTIC TOOL window:
echo   1. Check if Firebase shows orders
echo   2. Check if LocalStorage shows orders
echo   3. If Firebase has orders but LocalStorage doesn't:
echo      - Click "Sync from Firebase" button
echo.
echo In the ADMIN PANEL window:
echo   1. Wait 2 seconds for auto-fix to run
echo   2. Click "Orders" tab
echo   3. Orders should display with full details
echo.
echo If orders still don't show:
echo   1. Press F12 in admin panel
echo   2. Type: forceOrdersSync()
echo   3. Press Enter
echo   4. Refresh the page
echo.
echo ========================================
echo   Expected Results
echo ========================================
echo.
echo Diagnostic Tool should show:
echo   - Firebase Orders: X (green)
echo   - LocalStorage Orders: X (green)
echo   - Firebase Connection: Connected (green)
echo.
echo Admin Panel should show:
echo   - Orders badge with count
echo   - Order cards with customer info
echo   - Product details with images
echo   - Status and actions
echo.
echo ========================================
echo.
pause
