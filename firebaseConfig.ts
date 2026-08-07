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

// Initialize Firebase safely
let app: any;
let db: any;
let auth: any;
let analytics: any;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase App initialized successfully');
} catch (e) {
  console.error('Firebase App initialization failed:', e);
}

if (app) {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('Firestore initialized with native multi-tab persistent local cache');
  } catch (e) {
    console.error('Firestore initialization with persistent cache failed, falling back:', e);
    try {
      db = initializeFirestore(app, {});
    } catch (err) {
      console.error('Firestore fallback failed:', err);
    }
  }

  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized');
  } catch (e) {
    console.error('Firebase Auth initialization failed:', e);
  }

  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('Analytics initialized');
    } catch (e) {
      console.log('Analytics not available in this environment');
    }
  }
}

export { db, analytics, auth };
export default app;