
# Firebase Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. PowerShell Execution Policy Errors
**Error**: "cannot be loaded because running scripts is disabled"
**Solution**: 
   - Open PowerShell as Administrator
   - Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   - Press 'Y' and Enter to confirm

### 2. Firebase CLI Not Found
**Error**: "'firebase' is not recognized as an internal or external command"
**Solution**:
   - Open PowerShell as Administrator
   - Run: npm install -g firebase-tools
   - Restart PowerShell

### 3. Firebase Login Issues
**Issue**: Browser doesn't open or login fails
**Solution**:
   - Manually run: firebase login
   - Try using a different browser
   - Check your internet connection

### 4. Firebase Initialization Issues
**Issue**: Problems during firebase init hosting
**Solution**:
   - Make sure you're in the correct project directory
   - Manually run: firebase init hosting
   - When prompted:
     * Select "Hosting: Configure files for Firebase Hosting" (use spacebar)
     * Public directory: dist
     * Configure as a single-page app: Yes
     * Set up automatic builds and deploys with GitHub: No

### 5. Build Errors
**Issue**: npm run build fails
**Solution**:
   - Check for TypeScript/JavaScript errors in your code
   - Run: npm run build manually to see detailed error messages
   - Make sure all dependencies are installed: npm install

### 6. Deployment Errors
**Issue**: firebase deploy fails
**Solution**:
   - Check your Firebase project permissions
   - Verify you're logged into the correct Firebase account
   - Make sure your Firebase project has Hosting enabled

## Manual Deployment Steps

If the automated script continues to fail, you can deploy manually:

1. Open PowerShell in your project directory
2. Run: firebase login
3. Run: firebase init hosting (if not already done)
4. Run: npm run build
5. Run: firebase deploy --only hosting

## Need More Help?

1. Check the Firebase Console for any project-specific issues
2. Verify your Firebase configuration in the .env file
3. Look at the detailed error messages in PowerShell
4. Try running each command individually to isolate the issue
