import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to add a test document
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection successful!',
      timestamp: new Date()
    });
    
    console.log('Document written with ID: ', docRef.id);
    
    // Try to read documents
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('Documents in test collection:');
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    
    return { success: true, message: 'Firebase connection test passed!' };
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
    return { success: false, error: error.message };
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  testFirebaseConnection().then(result => {
    console.log('Test result:', result);
  });
}