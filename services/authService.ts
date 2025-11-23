// Mock authentication service for development
// In a real application, this would integrate with Firebase Authentication

interface User {
  uid: string;
  email: string;
  displayName: string;
}

export const signInWithEmailAndPassword = async (email: string, password: string): Promise<{ user: User }> => {
  // Mock implementation - in a real app, this would call Firebase Auth
  console.log('Signing in with email:', email);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock user data
  return {
    user: {
      uid: 'mock-user-id-' + Date.now(),
      email,
      displayName: email.split('@')[0]
    }
  };
};

export const createUserWithEmailAndPassword = async (email: string, password: string): Promise<{ user: User }> => {
  // Mock implementation - in a real app, this would call Firebase Auth
  console.log('Creating user with email:', email);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock user data
  return {
    user: {
      uid: 'mock-user-id-' + Date.now(),
      email,
      displayName: email.split('@')[0]
    }
  };
};

export const signOut = async (): Promise<void> => {
  // Mock implementation
  console.log('Signing out user');
  await new Promise(resolve => setTimeout(resolve, 200));
};