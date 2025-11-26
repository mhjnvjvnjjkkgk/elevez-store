// Firebase Real-Time Sync Hook
// Provides real-time synchronization of user data from Firebase

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { firebaseSyncService, UserProfile, UserCart, UserOrder, UserActivity } from '../services/firebaseSyncService';

export interface UserDashboardData {
  profile: UserProfile | null;
  cart: UserCart | null;
  orders: UserOrder[];
  points: any | null;
  recentActivity: UserActivity[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for real-time Firebase sync
 */
export function useFirebaseSync() {
  const [userId, setUserId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<UserDashboardData>({
    profile: null,
    cart: null,
    orders: [],
    points: null,
    recentActivity: [],
    loading: true,
    error: null,
  });

  // Set up auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // Sync user profile on login
        firebaseSyncService.syncUserProfile(user.uid, {
          email: user.email || '',
          displayName: user.displayName || 'User',
        });
      } else {
        setUserId(null);
        setDashboardData({
          profile: null,
          cart: null,
          orders: [],
          points: null,
          recentActivity: [],
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    if (!userId) return;

    const unsubscribers: (() => void)[] = [];

    // Profile listener
    const profileUnsubscribe = firebaseSyncService.onUserProfileChange(userId, (profile) => {
      setDashboardData((prev) => ({ ...prev, profile }));
    });
    unsubscribers.push(profileUnsubscribe);

    // Cart listener
    const cartUnsubscribe = firebaseSyncService.onCartChange(userId, (cart) => {
      setDashboardData((prev) => ({ ...prev, cart }));
    });
    unsubscribers.push(cartUnsubscribe);

    // Points listener
    const pointsUnsubscribe = firebaseSyncService.onPointsChange(userId, (points) => {
      setDashboardData((prev) => ({ ...prev, points }));
    });
    unsubscribers.push(pointsUnsubscribe);

    // Orders listener
    const ordersUnsubscribe = firebaseSyncService.onOrdersChange(userId, (orders) => {
      setDashboardData((prev) => ({ ...prev, orders }));
    });
    unsubscribers.push(ordersUnsubscribe);

    // Load initial data
    firebaseSyncService.getUserDashboardData(userId).then((data) => {
      if (data) {
        setDashboardData((prev) => ({
          ...prev,
          ...data,
          loading: false,
        }));
      }
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [userId]);

  // Sync cart
  const syncCart = useCallback(
    async (items: any[]) => {
      if (!userId) return false;
      return firebaseSyncService.syncCart(userId, items);
    },
    [userId]
  );

  // Sync order
  const syncOrder = useCallback(
    async (orderData: any) => {
      if (!userId) return { success: false };
      return firebaseSyncService.syncOrder(userId, orderData);
    },
    [userId]
  );

  // Log activity
  const logActivity = useCallback(
    async (type: any, description: string, metadata?: any) => {
      if (!userId) return false;
      return firebaseSyncService.logActivity(userId, type, description, metadata);
    },
    [userId]
  );

  // Sync points
  const syncPoints = useCallback(
    async (points: number, tier: string, totalPointsEarned: number) => {
      if (!userId) return false;
      return firebaseSyncService.syncUserPoints(userId, points, tier, totalPointsEarned);
    },
    [userId]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!userId) return false;
    return firebaseSyncService.clearCart(userId);
  }, [userId]);

  return {
    ...dashboardData,
    userId,
    syncCart,
    syncOrder,
    logActivity,
    syncPoints,
    clearCart,
  };
}

/**
 * Hook for syncing specific user data
 */
export function useUserSync(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseSyncService.onUserProfileChange(userId, (data) => {
      setProfile(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { profile, loading, error };
}

/**
 * Hook for syncing user cart
 */
export function useCartSync(userId: string | null) {
  const [cart, setCart] = useState<UserCart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCart(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseSyncService.onCartChange(userId, (data) => {
      setCart(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const syncCart = useCallback(
    async (items: any[]) => {
      if (!userId) return false;
      return firebaseSyncService.syncCart(userId, items);
    },
    [userId]
  );

  return { cart, loading, syncCart };
}

/**
 * Hook for syncing user points
 */
export function usePointsSync(userId: string | null) {
  const [points, setPoints] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPoints(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseSyncService.onPointsChange(userId, (data) => {
      setPoints(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const syncPoints = useCallback(
    async (pointsValue: number, tier: string, totalPointsEarned: number) => {
      if (!userId) return false;
      return firebaseSyncService.syncUserPoints(userId, pointsValue, tier, totalPointsEarned);
    },
    [userId]
  );

  return { points, loading, syncPoints };
}

/**
 * Hook for syncing user orders
 */
export function useOrdersSync(userId: string | null) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = firebaseSyncService.onOrdersChange(userId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const syncOrder = useCallback(
    async (orderData: any) => {
      if (!userId) return { success: false };
      return firebaseSyncService.syncOrder(userId, orderData);
    },
    [userId]
  );

  return { orders, loading, syncOrder };
}
