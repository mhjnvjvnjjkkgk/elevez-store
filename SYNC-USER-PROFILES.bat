@echo off
color 0A
cls
echo ========================================
echo   SYNC USER PROFILES FROM ORDERS
echo ========================================
echo.
echo This will:
echo ✅ Scan all existing orders
echo ✅ Extract user information
echo ✅ Create/update user profiles in database
echo ✅ Calculate total spent per user
echo ✅ Store order counts
echo.
echo Opening sync tool...
echo.
start "" "admin-panel/sync-user-profiles.html"
echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo 1. Click "Start Sync" button
echo 2. Wait for sync to complete
echo 3. Check the log for any errors
echo 4. Refresh user management panel
echo.
echo After sync, all user data should display properly!
echo.
pause
