import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  createdAt: any;
  updatedAt: any;
}

class UserProfileSyncService {
  /**
   * Create or update user profile from order data
   */
  async syncUserFromOrder(
    userId: string,
    shippingAddress: any,
    orderTotal: number
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const firstName = shippingAddress?.firstName || '';
      const lastName = shippingAddress?.lastName || '';
      const email = shippingAddress?.email || '';
      const phone = shippingAddress?.phone || '';

      if (userDoc.exists()) {
        // Update existing user
        const currentData = userDoc.data();
        await updateDoc(userRef, {
          firstName: firstName || currentData.firstName,
          lastName: lastName || currentData.lastName,
          email: email || currentData.email,
          phone: phone || currentData.phone,
          totalSpent: (currentData.totalSpent || 0) + orderTotal,
          orderCount: (currentData.orderCount || 0) + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new user profile
        await setDoc(userRef, {
          userId,
          firstName,
          lastName,
          email,
          phone,
          totalSpent: orderTotal,
          orderCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      console.log(`✅ User profile synced for ${userId}`);
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user's total spent (for manual adjustments)
   */
  async updateTotalSpent(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentData = userDoc.data();
        await updateDoc(userRef, {
          totalSpent: (currentData.totalSpent || 0) + amount,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating total spent:', error);
      throw error;
    }
  }
}

export const userProfileSyncService = new UserProfileSyncService();
