# Complete Firebase Integration Guide for Elevez

Congratulations! Your Elevez project already has Firebase properly installed and configured. Here's what we've verified:

## ✅ Current Status

1. **Firebase SDK**: Installed (v11.0.1)
2. **Configuration File**: [firebaseConfig.ts](file:///d:/wbeiste/elevez%20(1)/firebaseConfig.ts) exists
3. **Environment File**: [.env](file:///d:/wbeiste/elevez%20(1)/.env) exists
4. **Dependencies**: All Firebase packages installed in node_modules

## 🚀 Next Steps

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Click the gear icon → Project Settings
4. In the "General" tab, find your web app configuration
5. If you don't have a web app, click the web icon (</>) to register one

### Step 2: Update Your Environment Variables

Replace the placeholder values in your [.env](file:///d:/wbeiste/elevez%20(1)/.env) file with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 3: Enable Firestore Database

1. In Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location
5. Click "Enable"

### Step 4: Test Order Saving

1. Start your development server: `npm run dev`
2. Open the preview browser
3. Add items to cart and go through checkout
4. Orders should now be saved to your Firestore database

### Step 5: Deploy with Firebase Hosting (Optional)

If you want to deploy using Firebase Hosting instead of Vercel:

1. Open a terminal outside this IDE
2. Run: `firebase login`
3. Run: `firebase init hosting`
4. Configure with these settings:
   - Public directory: `dist`
   - Single-page app: `Yes`
5. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

### Alternative: Automated Deployment Script

We've created a PowerShell script that automates the Firebase deployment process:

1. Right-click on `deploy-to-firebase.ps1` in your project folder
2. Select "Run with PowerShell"
3. Follow the on-screen instructions

Note: You may need to temporarily change the PowerShell execution policy:
   - Open PowerShell as Administrator
   - Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Press 'Y' and Enter to confirm

## 🛠️ Helpful Scripts

We've added these helpful scripts to your package.json:

- `npm run firebase:setup` - Shows Firebase setup instructions
- `npm run dev` - Starts development server
- `npm run build` - Builds for production
- `npm run deploy` - Shows deployment instructions

## 🧪 Testing Firebase Connection

To verify your Firebase connection is working:

1. Update your [.env](file:///d:/wbeiste/elevez%20(1)/.env) with real values
2. Start the development server
3. Open browser console and look for any Firebase-related errors
4. Place a test order and check Firestore for saved data

## 🎯 You're All Set!

Your Elevez app is now ready to:
- Save orders to Firebase Firestore
- Work with your custom Firebase configuration
- Deploy to Firebase Hosting or other platforms

The order data saving functionality is already implemented in your Checkout component. When users place orders, the data will automatically be saved to your Firebase database.