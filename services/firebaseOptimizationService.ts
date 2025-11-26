// Firebase Optimization Service
// Handles data persistence, real-time updates, and automatic synchronization

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
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

class FirebaseOptimizationService {
  private db = getFirestore();
  private cache = new Map<string, CachedData>();
  private listeners = new Map<string, () => void>();
  private syncQueue: Array<{ operation: string; data: any }> = [];
  private isSyncing = false;

  /**
   * Initialize cache from localStorage
   */
  initializeCache() {
    try {
      const cached = localStorage.getItem('firebase_cache');
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          this.cache.set(key, value);
        });
        console.log('Cache initialized from localStorage');
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private persistCache() {
    try {
      const cacheData: Record<string, CachedData> = {};
      this.cache.forEach((value, key) => {
        cacheData[key] = value;
      });
      localStorage.setItem('firebase_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error persisting cache:', error);
    }
  }

  /**
   * Get cached data
   */
  getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache has expired
    if (cached.ttl && Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.persistCache();
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached data
   */
  setCachedData(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.persistCache();
  }

  /**
   * Clear specific cache
   */
  clearCache(key: string) {
    this.cache.delete(key);
    this.persistCache();
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
    localStorage.removeItem('firebase_cache');
  }

  /**
   * Set up real-time listener with automatic updates
   */
  setupRealtimeListener(
    collectionName: string,
    userId: string,
    callback: (data: any) => void,
    cacheKey: string
  ): () => void {
    try {
      const docRef = doc(this.db, collectionName, userId);

      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          this.setCachedData(cacheKey, data);
          callback(data);
        }
      });

      // Store listener for cleanup
      this.listeners.set(cacheKey, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up listener:', error);
      return () => {};
    }
  }

  /**
   * Set up query listener
   */
  setupQueryListener(
    collectionName: string,
    whereField: string,
    whereValue: string,
    callback: (data: any[]) => void,
    cacheKey: string
  ): () => void {
    try {
      const q = query(
        collection(this.db, collectionName),
        where(whereField, '==', whereValue)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        this.setCachedData(cacheKey, data);
        callback(data);
      });

      this.listeners.set(cacheKey, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up query listener:', error);
      return () => {};
    }
  }

  /**
   * Remove listener
   */
  removeListener(cacheKey: string) {
    const unsubscribe = this.listeners.get(cacheKey);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(cacheKey);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Batch sync operations
   */
  async batchSync(operations: Array<{ collection: string; docId: string; data: any; operation: 'set' | 'update' }>) {
    try {
      const batch = writeBatch(this.db);

      operations.forEach(({ collection: collectionName, docId, data, operation }) => {
        const docRef = doc(this.db, collectionName, docId);
        if (operation === 'set') {
          batch.set(docRef, data, { merge: true });
        } else if (operation === 'update') {
          batch.update(docRef, data);
        }
      });

      await batch.commit();
      console.log('Batch sync completed');
      return true;
    } catch (error) {
      console.error('Error in batch sync:', error);
      return false;
    }
  }

  /**
   * Queue sync operation
   */
  queueSyncOperation(operation: string, data: any) {
    this.syncQueue.push({ operation, data });
    this.processSyncQueue();
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;

    try {
      while (this.syncQueue.length > 0) {
        const { operation, data } = this.syncQueue.shift()!;

        switch (operation) {
          case 'updateProfile':
            await this.updateUserProfile(data);
            break;
          case 'updateCart':
            await this.updateCart(data);
            break;
          case 'createOrder':
            await this.createOrder(data);
            break;
          case 'updatePoints':
            await this.updatePoints(data);
            break;
          default:
            console.warn('Unknown operation:', operation);
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Update user profile
   */
  private async updateUserProfile(data: any) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(this.db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      this.setCachedData(`user_${user.uid}`, data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  /**
   * Update cart
   */
  private async updateCart(data: any) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const cartRef = doc(this.db, 'carts', user.uid);
      await setDoc(cartRef, {
        userId: user.uid,
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      this.setCachedData(`cart_${user.uid}`, data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  /**
   * Create order
   */
  private async createOrder(data: any) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const ordersRef = collection(this.db, 'orders');
      const orderRef = doc(ordersRef);

      await setDoc(orderRef, {
        userId: user.uid,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update cache
      const cacheKey = `orders_${user.uid}`;
      const existingOrders = this.getCachedData(cacheKey) || [];
      this.setCachedData(cacheKey, [...existingOrders, { id: orderRef.id, ...data }]);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  }

  /**
   * Update points
   */
  private async updatePoints(data: any) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const pointsRef = doc(this.db, 'userPoints', user.uid);
      await setDoc(pointsRef, {
        userId: user.uid,
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      this.setCachedData(`points_${user.uid}`, data);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }

  /**
   * Get data with cache fallback
   */
  async getDataWithCache(
    collectionName: string,
    docId: string,
    cacheKey: string
  ): Promise<any | null> {
    // Try cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Fetch from Firestore
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.setCachedData(cacheKey, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting data:', error);
      return cached || null;
    }
  }

  /**
   * Sync data immediately
   */
  async syncDataImmediately(
    collectionName: string,
    docId: string,
    data: any,
    cacheKey: string
  ): Promise<boolean> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      this.setCachedData(cacheKey, data);
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    }
  }

  /**
   * Get all user data
   */
  async getAllUserData(userId: string): Promise<{
    profile: any | null;
    cart: any | null;
    orders: any[];
    points: any | null;
  }> {
    try {
      const [profile, cart, orders, points] = await Promise.all([
        this.getDataWithCache('users', userId, `user_${userId}`),
        this.getDataWithCache('carts', userId, `cart_${userId}`),
        this.getQueryData('orders', 'userId', userId, `orders_${userId}`),
        this.getDataWithCache('userPoints', userId, `points_${userId}`),
      ]);

      return { profile, cart, orders, points };
    } catch (error) {
      console.error('Error getting all user data:', error);
      return { profile: null, cart: null, orders: [], points: null };
    }
  }

  /**
   * Get query data with cache
   */
  private async getQueryData(
    collectionName: string,
    whereField: string,
    whereValue: string,
    cacheKey: string
  ): Promise<any[]> {
    // Try cache first
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Fetch from Firestore
    try {
      const q = query(
        collection(this.db, collectionName),
        where(whereField, '==', whereValue)
      );
      const snapshot = await getDocs(q);

      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting query data:', error);
      return cached || [];
    }
  }

  /**
   * Optimize data for storage
   */
  optimizeData(data: any): any {
    const optimized: any = {};

    Object.entries(data).forEach(([key, value]) => {
      // Skip undefined values
      if (value === undefined) return;

      // Convert dates to ISO strings
      if (value instanceof Date) {
        optimized[key] = value.toISOString();
      }
      // Skip large objects
      else if (typeof value === 'object' && value !== null) {
        const size = JSON.stringify(value).length;
        if (size < 10000) {
          optimized[key] = value;
        }
      } else {
        optimized[key] = value;
      }
    });

    return optimized;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    totalSize: number;
  } {
    let totalSize = 0;
    const keys: string[] = [];

    this.cache.forEach((value, key) => {
      keys.push(key);
      totalSize += JSON.stringify(value).length;
    });

    return {
      size: this.cache.size,
      keys,
      totalSize,
    };
  }

  /**
   * Clear expired cache
   */
  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;

    this.cache.forEach((value, key) => {
      if (value.ttl && now - value.timestamp > value.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    });

    if (cleared > 0) {
      this.persistCache();
      console.log(`Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Prefetch user data
   */
  async prefetchUserData(userId: string) {
    try {
      await this.getAllUserData(userId);
      console.log('User data prefetched');
    } catch (error) {
      console.error('Error prefetching user data:', error);
    }
  }
}

export const firebaseOptimizationService = new FirebaseOptimizationService();
