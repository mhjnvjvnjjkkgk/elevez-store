@echo off
echo ========================================
echo   OPEN FIREBASE CONSOLE
echo ========================================
echo.
echo Opening Firebase Console to create indexes...
echo.
echo IMPORTANT: You need to create 3 indexes:
echo.
echo 1. Orders Index:
echo    - Collection: orders
echo    - Fields: userId (Ascending) + createdAt (Descending)
echo.
echo 2. Discount Codes Index:
echo    - Collection: discountCodes
echo    - Fields: userId (Ascending) + createdAt (Descending)
echo.
echo 3. Points Transactions Index:
echo    - Collection: pointsTransactions
echo    - Fields: userId (Ascending) + timestamp (Descending)
echo.
echo Opening Firebase Console...
echo.

start "" "https://console.firebase.google.com/project/elevez-ed97f/firestore/indexes"

echo.
echo Firebase Console opened!
echo.
echo Instructions:
echo 1. Click "Create Index" button
echo 2. Create each of the 3 indexes listed above
echo 3. Wait 2-5 minutes for indexes to build
echo 4. Test orders on website
echo.
pause
