// Firebase Configuration for Admin Panel
// Copy your Firebase config from .env or firebaseConfig.ts

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Instructions:
// 1. Go to Firebase Console: https://console.firebase.google.com
// 2. Select your project
// 3. Go to Project Settings → General
// 4. Scroll to "Your apps" → Web app
// 5. Copy the config values above
// 6. Replace the values in this file
// 7. Save and restart admin panel

console.log('Firebase Config loaded for admin panel');
