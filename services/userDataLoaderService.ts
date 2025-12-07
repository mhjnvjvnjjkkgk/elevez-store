// User Data Loader Service - Automatically loads all user data on login
import { collection, doc, getDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { orderPointsSyncService } from './orderPointsSyncService';

export interface UserData {
  profile: any;
  points: any;
  orders: any[];
  wishlist: any[];
  tier: string;
  totalSpent: number;
  orderCount: number;
  lastUpdated: Date;
}

class UserDataLoaderService {
  private listeners: (() => void)[] = [];
  private currentUserId: string | null = null;

  /**
   * Load all user data automatically
   */
  async loadAllUserData(userId: string): Promise<UserData> {
    console.log('🔄 Loading all user data for:', userId);
    this.currentUserId = userId;

    try {
      // Load everything in parallel for speed
      const [profile, points, orders, wishlist] = await Promise.all([
        this.loadUserProfile(userId),
        this.loadUserPoints(userId),
        this.loadUserOrders(userId),
        this.loadUserWishlist(userId)
      ]);

      // Sync points from orders (in case any are missing)
      await orderPointsSyncService.syncUserPointsFromOrders(userId);

      // Reload points after sync
      const updatedPoints = await this.loadUserPoints(userId);

      const userData: UserData = {
        profile,
        points: updatedPoints,
        orders,
        wishlist,
        tier: updatedPoints?.tier || 'bronze',
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        orderCount: orders.length,
        lastUpdated: new Date()
      };

      console.log('✅ User data loaded:', {
        orders: userData.orderCount,
        points: userData.points?.points || 0,
        tier: userData.tier,
        wishlist: userData.wishlist.length
      });

      return userData;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      throw error;
    }
  }

  /**
   * Load user profile
   */
  private async loadUserProfile(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Load user points
   */
  private async loadUserPoints(userId: string): Promise<any> {
    try {
      const pointsRef = doc(db, 'userPoints', userId);
      const pointsSnap = await getDoc(pointsRef);
      
      if (pointsSnap.exists()) {
        return { id: pointsSnap.id, ...pointsSnap.data() };
      }
      return { points: 0, tier: 'bronze', totalPointsEarned: 0 };
    } catch (error) {
      console.error('Error loading user points:', error);
      return { points: 0, tier: 'bronze', totalPointsEarned: 0 };
    }
  }

  /**
   * Load user orders
   */
  private async loadUserOrders(userId: string): Promise<any[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      const orders: any[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      return orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error loading user orders:', error);
      return [];
    }
  }

  /**
   * Load user wishlist
   */
  private async loadUserWishlist(userId: string): Promise<any[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().wishlist || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading user wishlist:', error);
      return [];
    }
  }

  /**
   * Set up real-time listeners for all user data
   */
  setupRealtimeListeners(
    userId: string,
    callbacks: {
      onPointsUpdate?: (points: any) => void;
      onOrdersUpdate?: (orders: any[]) => void;
      onProfileUpdate?: (profile: any) => void;
    }
  ): () => void {
    console.log('🔄 Setting up real-time listeners for user:', userId);

    // Points listener
    if (callbacks.onPointsUpdate) {
      const pointsRef = doc(db, 'userPoints', userId);
      const unsubPoints = onSnapshot(pointsRef, (snapshot) => {
        if (snapshot.exists()) {
          const points = { id: snapshot.id, ...snapshot.data() };
          console.log('🔄 Points updated:', points.points);
          callbacks.onPointsUpdate!(points);
        }
      });
      this.listeners.push(unsubPoints);
    }

    // Orders listener
    if (callbacks.onOrdersUpdate) {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId));
      const unsubOrders = onSnapshot(q, (snapshot) => {
        const orders: any[] = [];
        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        console.log('🔄 Orders updated:', orders.length);
        callbacks.onOrdersUpdate!(orders);
      });
      this.listeners.push(unsubOrders);
    }

    // Profile listener
    if (callbacks.onProfileUpdate) {
      const userRef = doc(db, 'users', userId);
      const unsubProfile = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const profile = { id: snapshot.id, ...snapshot.data() };
          console.log('🔄 Profile updated');
          callbacks.onProfileUpdate!(profile);
        }
      });
      this.listeners.push(unsubProfile);
    }

    // Return cleanup function
    return () => {
      console.log('🔌 Cleaning up real-time listeners');
      this.listeners.forEach(unsub => unsub());
      this.listeners = [];
    };
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];
    this.currentUserId = null;
  }

  /**
   * Refresh user data
   */
  async refreshUserData(userId: string): Promise<UserData> {
    console.log('🔄 Refreshing user data...');
    return this.loadAllUserData(userId);
  }
}

export const userDataLoaderService = new UserDataLoaderService();
