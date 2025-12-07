@echo off
echo ========================================
echo   ADD PRODUCTION COSTS TO PRODUCTS
echo ========================================
echo.
echo This tool will:
echo   1. Check all products in your system
echo   2. Add realistic production costs to products without them
echo   3. Preserve existing production costs
echo   4. Sync everything to Firebase
echo   5. Verify dashboard calculations
echo.
echo Opening tool in browser...
echo.

start "" "admin-panel/add-production-costs.html"

echo.
echo Tool opened!
echo.
echo Instructions:
echo   1. Click "Check Products" to see current status
echo   2. Click "Add Production Costs" to add costs
echo   3. Click "Sync to Firebase" to save to cloud
echo   4. Click "Test Dashboard Calculations" to verify
echo.
pause
