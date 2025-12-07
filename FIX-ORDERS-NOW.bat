@echo off
color 0A
echo ========================================
echo   FIX ORDERS - QUICK START
echo ========================================
echo.
echo STEP 1: Create Firebase Indexes
echo --------------------------------
echo.
echo The main issue is MISSING FIREBASE INDEXES.
echo.
echo You need to create 3 indexes in Firebase Console:
echo.
echo   1. orders (userId + createdAt)
echo   2. discountCodes (userId + createdAt)
echo   3. pointsTransactions (userId + timestamp)
echo.
echo Press any key to open Firebase Console...
pause >nul
echo.
echo Opening Firebase Console...
start "" "https://console.firebase.google.com/project/elevez-ed97f/firestore/indexes"
echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo In Firebase Console:
echo.
echo 1. Click "Create Index" button
echo.
echo 2. Create Index #1:
echo    - Collection ID: orders
echo    - Add field: userId (Ascending)
echo    - Add field: createdAt (Descending)
echo    - Click "Create"
echo.
echo 3. Create Index #2:
echo    - Collection ID: discountCodes
echo    - Add field: userId (Ascending)
echo    - Add field: createdAt (Descending)
echo    - Click "Create"
echo.
echo 4. Create Index #3:
echo    - Collection ID: pointsTransactions
echo    - Add field: userId (Ascending)
echo    - Add field: timestamp (Descending)
echo    - Click "Create"
echo.
echo 5. Wait 2-5 minutes for indexes to build
echo    (Status will change from "Building" to "Enabled")
echo.
echo ========================================
echo   STEP 2: Test Orders
echo ========================================
echo.
echo After indexes are created, press any key to test...
pause >nul
echo.
echo Opening debug tool...
start "" "debug-user-orders.html"
echo.
echo In the debug tool:
echo 1. Sign in with your test user
echo 2. Click "Query Orders"
echo 3. Orders should appear without errors
echo.
echo ========================================
echo   STEP 3: Test on Website
echo ========================================
echo.
echo 1. Go to your website
echo 2. Sign in
echo 3. Go to My Account - Orders tab
echo 4. Orders should appear!
echo.
echo ========================================
echo   TROUBLESHOOTING
echo ========================================
echo.
echo If orders still don't show:
echo - Check indexes are "Enabled" (green) in Firebase
echo - Wait a few more minutes for indexes to build
echo - Clear browser cache and refresh
echo - Check browser console for errors
echo.
echo ========================================
echo.
echo All done! Your orders should now be visible.
echo.
pause
