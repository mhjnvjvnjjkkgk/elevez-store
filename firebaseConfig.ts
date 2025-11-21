// Firebase configuration for Elevez
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain || '✗ Missing',
  projectId: firebaseConfig.projectId || '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase App initialized successfully');

// Initialize Firestore
const db = getFirestore(app);
console.log('Firestore initialized');

// Initialize Firebase Authentication
const auth = getAuth(app);
console.log('Firebase Auth initialized');

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('Analytics initialized');
  } catch (e) {
    console.log('Analytics not available in this environment');
  }
}

export { db, analytics, auth };
export default app;