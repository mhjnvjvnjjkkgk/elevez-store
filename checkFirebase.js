// Simple script to check if Firebase is properly installed
try {
  const firebase = await import('firebase/app');
  console.log('Firebase is properly installed');
  console.log('Firebase version:', firebase.version);
} catch (error) {
  console.log('Firebase is not properly installed');
  console.error(error);
}

// Also check if we can import specific Firebase modules
try {
  const firestore = await import('firebase/firestore');
  console.log('Firebase Firestore module is accessible');
} catch (error) {
  console.log('Firebase Firestore module is not accessible');
  console.error(error);
}