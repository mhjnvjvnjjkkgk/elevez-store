// Firebase configuration for Elevez
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

const sanitizeEnv = (val: any): string => {
  if (typeof val === 'string') {
    return val.replace(/[\r\n\t]/g, '').trim();
  }
  return val || '';
};

const firebaseConfig = {
  apiKey: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_APP_ID),
  measurementId: sanitizeEnv((import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID)
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

// Initialize Firestore with Native Multi-Tab Caching
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
console.log('Firestore initialized with native multi-tab persistent local cache');

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