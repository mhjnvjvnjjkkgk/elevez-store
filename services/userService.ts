import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs, orderBy } from 'firebase/firestore';

// User data interface
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  wishlist: number[]; // Array of product IDs
  createdAt: Date;
  updatedAt: Date;
}

// Create or update user profile
export const createUserProfile = async (user: any) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      const newUser: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(userRef, newUser);
      return { success: true, data: newUser };
    } else {
      // Update existing user profile
      await updateDoc(userRef, {
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        updatedAt: new Date()
      });
      return { success: true, data: userSnap.data() };
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() as UserProfile };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

// Add product to wishlist
export const addToWishlist = async (userId: string, productId: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      wishlist: arrayUnion(productId),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: error.message };
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (userId: string, productId: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      wishlist: arrayRemove(productId),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: error.message };
  }
};

// Get user's orders
export const getUserOrders = async (userId: string) => {
  try {
    console.log('📦 Fetching orders for user:', userId);
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('orderDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: data.orderId || doc.id,
        ...data,
        // Convert Firestore Timestamp to ISO string for display
        orderDate: data.orderDate?.toDate?.()?.toISOString() || data.orderDate,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      };
    });
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    return { success: true, data: orders };
  } catch (error) {
    console.error('❌ Error getting user orders:', error);
    
    // If orderBy fails (no index), try without ordering
    try {
      console.log('⚠️ Retrying without orderBy...');
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId || doc.id,
          ...data,
          orderDate: data.orderDate?.toDate?.()?.toISOString() || data.orderDate,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        };
      });
      
      // Sort manually
      orders.sort((a, b) => {
        const dateA = new Date(a.orderDate || a.createdAt || 0);
        const dateB = new Date(b.orderDate || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`✅ Found ${orders.length} orders (manual sort)`);
      return { success: true, data: orders };
    } catch (retryError) {
      console.error('❌ Retry failed:', retryError);
      return { success: false, error: retryError.message };
    }
  }
};
