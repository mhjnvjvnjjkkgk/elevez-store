// Firebase Real-Time Sync Service
// Ensures all user data is properly synced to Firebase with real user values

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { CartItem } from '../types';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isActive: boolean;
}

export interface UserCart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}

export interface UserOrder {
  id: string;
  userId: string;
  orderNumber: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  pointsEarned?: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  userId: string;
  type: 'login' | 'purchase' | 'view' | 'add_to_cart' | 'remove_from_cart' | 'redeem_points' | 'claim_reward';
  description: string;
  metadata?: any;
  timestamp: string;
}

class FirebaseSyncService {
  private db = getFirestore();
  private usersCollection = 'users';
  private cartsCollection = 'carts';
  private ordersCollection = 'orders';
  private activitiesCollection = 'activities';
  private pointsCollection = 'userPoints';
  private discountsCollection = 'discounts';

  /**
   * Initialize or update user profile with real data
   */
  async syncUserProfile(userId: string, userData: Partial<UserProfile>): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return false;

      const userRef = doc(this.db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      const profileData: UserProfile = {
        userId,
        email: currentUser.email || userData.email || '',
        displayName: currentUser.displayName || userData.displayName || 'User',
        phoneNumber: userData.phoneNumber || null,
        profileImage: currentUser.photoURL || userData.profileImage || null,
        createdAt: userSnap.exists() ? (userSnap.data() as any).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      await setDoc(userRef, profileData, { merge: true });
      console.log('User profile synced:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing user profile:', error);
      return false;
    }
  }

  /**
   * Sync cart to Firebase
   */
  async syncCart(userId: string, items: CartItem[]): Promise<boolean> {
    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const cartRef = doc(this.db, this.cartsCollection, userId);
      const cartData: UserCart = {
        userId,
        items,
        subtotal,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(cartRef, cartData, { merge: true });
      console.log('Cart synced for user:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing cart:', error);
      return false;
    }
  }

  /**
   * Get synced cart from Firebase
   */
  async getCart(userId: string): Promise<UserCart | null> {
    try {
      const cartRef = doc(this.db, this.cartsCollection, userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        return cartSnap.data() as UserCart;
      }
      return null;
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  }

  /**
   * Sync order to Firebase with real user data
   */
  async syncOrder(
    userId: string,
    orderData: Omit<UserOrder, 'id' | 'userId'>
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const ordersRef = collection(this.db, this.ordersCollection);
      const orderRef = doc(ordersRef);

      const fullOrderData: UserOrder = {
        id: orderRef.id,
        userId,
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(orderRef, fullOrderData);
      
      // Log activity
      await this.logActivity(userId, 'purchase', `Order placed: ${orderData.orderNumber}`, {
        orderId: orderRef.id,
        orderNumber: orderData.orderNumber,
        total: orderData.total,
      });

      console.log('Order synced:', orderRef.id);
      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('Error syncing order:', error);
      return { success: false, error: 'Failed to sync order' };
    }
  }

  /**
   * Get user orders from Firebase
   */
  async getUserOrders(userId: string): Promise<UserOrder[]> {
    try {
      const q = query(
        collection(this.db, this.ordersCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const orders: UserOrder[] = [];
      snapshot.forEach((doc) => {
        orders.push(doc.data() as UserOrder);
      });

      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    type: UserActivity['type'],
    description: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const activitiesRef = collection(this.db, this.activitiesCollection);
      
      const activity: UserActivity = {
        userId,
        type,
        description,
        metadata,
        timestamp: new Date().toISOString(),
      };

      await setDoc(doc(activitiesRef), activity);
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(this.db, this.activitiesCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const activities: UserActivity[] = [];
      snapshot.forEach((doc) => {
        activities.push(doc.data() as UserActivity);
      });

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  /**
   * Sync user points with real values
   */
  async syncUserPoints(
    userId: string,
    points: number,
    tier: string,
    totalPointsEarned: number
  ): Promise<boolean> {
    try {
      const pointsRef = doc(this.db, this.pointsCollection, userId);
      
      const pointsData = {
        userId,
        points,
        tier,
        totalPointsEarned,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(pointsRef, pointsData, { merge: true });
      console.log('User points synced:', userId, points);
      return true;
    } catch (error) {
      console.error('Error syncing user points:', error);
      return false;
    }
  }

  /**
   * Get user points from Firebase
   */
  async getUserPoints(userId: string): Promise<any | null> {
    try {
      const pointsRef = doc(this.db, this.pointsCollection, userId);
      const pointsSnap = await getDoc(pointsRef);

      if (pointsSnap.exists()) {
        return pointsSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user points:', error);
      return null;
    }
  }

  /**
   * Sync discount usage
   */
  async syncDiscountUsage(
    userId: string,
    discountCode: string,
    discountAmount: number,
    orderId: string
  ): Promise<boolean> {
    try {
      const discountsRef = collection(this.db, this.discountsCollection);
      
      const usageData = {
        userId,
        discountCode,
        discountAmount,
        orderId,
        usedAt: new Date().toISOString(),
      };

      await setDoc(doc(discountsRef), usageData);
      
      // Log activity
      await this.logActivity(
        userId,
        'redeem_points',
        `Applied discount: ${discountCode}`,
        { discountCode, discountAmount, orderId }
      );

      return true;
    } catch (error) {
      console.error('Error syncing discount usage:', error);
      return false;
    }
  }

  /**
   * Real-time listener for user profile
   */
  onUserProfileChange(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    try {
      const userRef = doc(this.db, this.usersCollection, userId);
      
      const unsubscribe = onSnapshot(userRef, (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as UserProfile);
        } else {
          callback(null);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up profile listener:', error);
      return () => {};
    }
  }

  /**
   * Real-time listener for user cart
   */
  onCartChange(userId: string, callback: (cart: UserCart | null) => void): () => void {
    try {
      const cartRef = doc(this.db, this.cartsCollection, userId);
      
      const unsubscribe = onSnapshot(cartRef, (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as UserCart);
        } else {
          callback(null);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up cart listener:', error);
      return () => {};
    }
  }

  /**
   * Real-time listener for user points
   */
  onPointsChange(userId: string, callback: (points: any | null) => void): () => void {
    try {
      const pointsRef = doc(this.db, this.pointsCollection, userId);
      
      const unsubscribe = onSnapshot(pointsRef, (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        } else {
          callback(null);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up points listener:', error);
      return () => {};
    }
  }

  /**
   * Real-time listener for user orders
   */
  onOrdersChange(userId: string, callback: (orders: UserOrder[]) => void): () => void {
    try {
      const q = query(
        collection(this.db, this.ordersCollection),
        where('userId', '==', userId)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
        const orders: UserOrder[] = [];
        snapshot.forEach((doc) => {
          orders.push(doc.data() as UserOrder);
        });
        callback(orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up orders listener:', error);
      return () => {};
    }
  }

  /**
   * Sync all user data on login
   */
  async syncAllUserData(userId: string, userData: Partial<UserProfile>): Promise<boolean> {
    try {
      // Sync profile
      await this.syncUserProfile(userId, userData);

      // Log login activity
      await this.logActivity(userId, 'login', 'User logged in');

      console.log('All user data synced on login:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing all user data:', error);
      return false;
    }
  }

  /**
   * Get comprehensive user dashboard data
   */
  async getUserDashboardData(userId: string): Promise<{
    profile: UserProfile | null;
    cart: UserCart | null;
    orders: UserOrder[];
    points: any | null;
    recentActivity: UserActivity[];
  } | null> {
    try {
      const [profile, cart, orders, points, recentActivity] = await Promise.all([
        this.getUserProfile(userId),
        this.getCart(userId),
        this.getUserOrders(userId),
        this.getUserPoints(userId),
        this.getUserActivity(userId, 10),
      ]);

      return {
        profile,
        cart,
        orders,
        points,
        recentActivity,
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Clear user cart after order
   */
  async clearCart(userId: string): Promise<boolean> {
    try {
      const cartRef = doc(this.db, this.cartsCollection, userId);
      await setDoc(cartRef, {
        userId,
        items: [],
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }
}

export const firebaseSyncService = new FirebaseSyncService();
