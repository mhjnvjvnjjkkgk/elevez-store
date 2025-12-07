@echo off
color 0C
echo ========================================
echo   FIX FIREBASE PERMISSIONS
echo ========================================
echo.
echo ERROR: Permission Denied
echo.
echo Your Firestore Security Rules are blocking access.
echo You need to update them to allow reading data.
echo.
echo Opening Firebase Console Rules page...
echo.

start "" "https://console.firebase.google.com/project/elevez-ed97f/firestore/rules"

echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo 1. Firebase Console will open in your browser
echo 2. You'll see the Rules editor
echo 3. Replace the rules with this:
echo.
echo rules_version = '2';
echo service cloud.firestore {
echo   match /databases/{database}/documents {
echo     match /{document=**} {
echo       allow read: if true;
echo       allow write: if request.auth != null;
echo     }
echo   }
echo }
echo.
echo 4. Click "Publish" button
echo 5. Wait 30 seconds
echo 6. Refresh your admin panel
echo 7. Users should now load!
echo.
echo ========================================
echo.
echo See FIX-FIREBASE-PERMISSIONS.md for details
echo.
pause
