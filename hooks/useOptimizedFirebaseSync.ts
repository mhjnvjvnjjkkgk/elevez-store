// Optimized Firebase Sync Hook
// Provides automatic data persistence, real-time updates, and cache management

import { useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { firebaseOptimizationService } from '../services/firebaseOptimizationService';

export interface OptimizedUserData {
  profile: any | null;
  cart: any | null;
  orders: any[];
  points: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Main optimized Firebase sync hook
 */
export function useOptimizedFirebaseSync() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<OptimizedUserData>({
    profile: null,
    cart: null,
    orders: [],
    points: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Initialize cache on mount
  useEffect(() => {
    firebaseOptimizationService.initializeCache();
  }, []);

  // Set up auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // Prefetch all user data
        await firebaseOptimizationService.prefetchUserData(user.uid);

        // Set up real-time listeners
        const profileUnsub = firebaseOptimizationService.setupRealtimeListener(
          'users',
          user.uid,
          (profile) => {
            setUserData((prev) => ({
              ...prev,
              profile,
              lastUpdated: Date.now(),
            }));
          },
          `user_${user.uid}`
        );

        const cartUnsub = firebaseOptimizationService.setupRealtimeListener(
          'carts',
          user.uid,
          (cart) => {
            setUserData((prev) => ({
              ...prev,
              cart,
              lastUpdated: Date.now(),
            }));
          },
          `cart_${user.uid}`
        );

        const pointsUnsub = firebaseOptimizationService.setupRealtimeListener(
          'userPoints',
          user.uid,
          (points) => {
            setUserData((prev) => ({
              ...prev,
              points,
              lastUpdated: Date.now(),
            }));
          },
          `points_${user.uid}`
        );

        const ordersUnsub = firebaseOptimizationService.setupQueryListener(
          'orders',
          'userId',
          user.uid,
          (orders) => {
            setUserData((prev) => ({
              ...prev,
              orders,
              lastUpdated: Date.now(),
            }));
          },
          `orders_${user.uid}`
        );

        unsubscribesRef.current = [profileUnsub, cartUnsub, pointsUnsub, ordersUnsub];

        // Load initial data
        const allData = await firebaseOptimizationService.getAllUserData(user.uid);
        setUserData((prev) => ({
          ...prev,
          ...allData,
          loading: false,
          lastUpdated: Date.now(),
        }));
      } else {
        setUserId(null);
        setUserData({
          profile: null,
          cart: null,
          orders: [],
          points: null,
          loading: false,
          error: null,
          lastUpdated: null,
        });
      }
    });

    return () => {
      unsubscribe();
      unsubscribesRef.current.forEach((unsub) => unsub());
    };
  }, []);

  // Sync profile
  const syncProfile = useCallback(
    async (profileData: any) => {
      if (!userId) return false;
      return firebaseOptimizationService.syncDataImmediately(
        'users',
        userId,
        profileData,
        `user_${userId}`
      );
    },
    [userId]
  );

  // Sync cart
  const syncCart = useCallback(
    async (cartData: any) => {
      if (!userId) return false;
      return firebaseOptimizationService.syncDataImmediately(
        'carts',
        userId,
        cartData,
        `cart_${userId}`
      );
    },
    [userId]
  );

  // Sync points
  const syncPoints = useCallback(
    async (pointsData: any) => {
      if (!userId) return false;
      return firebaseOptimizationService.syncDataImmediately(
        'userPoints',
        userId,
        pointsData,
        `points_${userId}`
      );
    },
    [userId]
  );

  // Queue operation
  const queueOperation = useCallback((operation: string, data: any) => {
    firebaseOptimizationService.queueSyncOperation(operation, data);
  }, []);

  // Clear cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      firebaseOptimizationService.clearCache(key);
    } else {
      firebaseOptimizationService.clearAllCache();
    }
  }, []);

  return {
    ...userData,
    userId,
    syncProfile,
    syncCart,
    syncPoints,
    queueOperation,
    clearCache,
  };
}

/**
 * Hook for syncing specific data type
 */
export function useOptimizedDataSync(
  collectionName: string,
  userId: string | null,
  cacheKey: string
) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setLoading(false);
      return;
    }

    // Try cache first
    const cached = firebaseOptimizationService.getCachedData(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
    }

    // Set up listener
    unsubscribeRef.current = firebaseOptimizationService.setupRealtimeListener(
      collectionName,
      userId,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      cacheKey
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, collectionName, cacheKey]);

  const syncData = useCallback(
    async (newData: any) => {
      if (!userId) return false;
      return firebaseOptimizationService.syncDataImmediately(
        collectionName,
        userId,
        newData,
        cacheKey
      );
    },
    [userId, collectionName, cacheKey]
  );

  return { data, loading, syncData };
}

/**
 * Hook for managing cart with automatic sync
 */
export function useOptimizedCart(userId: string | null) {
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setCart(null);
      setLoading(false);
      return;
    }

    const cacheKey = `cart_${userId}`;
    const cached = firebaseOptimizationService.getCachedData(cacheKey);
    if (cached) {
      setCart(cached);
      setLoading(false);
    }

    unsubscribeRef.current = firebaseOptimizationService.setupRealtimeListener(
      'carts',
      userId,
      (newCart) => {
        setCart(newCart);
        setLoading(false);
      },
      cacheKey
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  const updateCart = useCallback(
    async (items: any[], subtotal: number) => {
      if (!userId) return false;

      const cartData = {
        userId,
        items,
        subtotal,
        updatedAt: new Date().toISOString(),
      };

      return firebaseOptimizationService.syncDataImmediately(
        'carts',
        userId,
        cartData,
        `cart_${userId}`
      );
    },
    [userId]
  );

  const clearCart = useCallback(async () => {
    if (!userId) return false;

    return firebaseOptimizationService.syncDataImmediately(
      'carts',
      userId,
      { items: [], subtotal: 0 },
      `cart_${userId}`
    );
  }, [userId]);

  return { cart, loading, updateCart, clearCart };
}

/**
 * Hook for managing points with automatic sync
 */
export function useOptimizedPoints(userId: string | null) {
  const [points, setPoints] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setPoints(null);
      setLoading(false);
      return;
    }

    const cacheKey = `points_${userId}`;
    const cached = firebaseOptimizationService.getCachedData(cacheKey);
    if (cached) {
      setPoints(cached);
      setLoading(false);
    }

    unsubscribeRef.current = firebaseOptimizationService.setupRealtimeListener(
      'userPoints',
      userId,
      (newPoints) => {
        setPoints(newPoints);
        setLoading(false);
      },
      cacheKey
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  const updatePoints = useCallback(
    async (pointsValue: number, tier: string, totalEarned: number) => {
      if (!userId) return false;

      const pointsData = {
        userId,
        points: pointsValue,
        tier,
        totalPointsEarned: totalEarned,
        updatedAt: new Date().toISOString(),
      };

      return firebaseOptimizationService.syncDataImmediately(
        'userPoints',
        userId,
        pointsData,
        `points_${userId}`
      );
    },
    [userId]
  );

  return { points, loading, updatePoints };
}

/**
 * Hook for managing orders with automatic sync
 */
export function useOptimizedOrders(userId: string | null) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const cacheKey = `orders_${userId}`;
    const cached = firebaseOptimizationService.getCachedData(cacheKey);
    if (cached) {
      setOrders(cached);
      setLoading(false);
    }

    unsubscribeRef.current = firebaseOptimizationService.setupQueryListener(
      'orders',
      'userId',
      userId,
      (newOrders) => {
        setOrders(newOrders);
        setLoading(false);
      },
      cacheKey
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  return { orders, loading };
}
