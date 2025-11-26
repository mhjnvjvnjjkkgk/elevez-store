// useUserPoints Hook
// Real-time sync of user points across all pages

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { userPointsService, UserPoints } from '../services/userPointsService';

interface UseUserPointsReturn {
  userPoints: UserPoints | null;
  loading: boolean;
  error: string | null;
  refreshPoints: () => Promise<void>;
  addPoints: (amount: number, reason: string) => Promise<boolean>;
  redeemPoints: (amount: number, reason: string) => Promise<boolean>;
}

export const useUserPoints = (): UseUserPointsReturn => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch user points
  const fetchUserPoints = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const points = await userPointsService.getUserPoints(userId);
      setUserPoints(points);
      setError(null);
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError('Failed to load points');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserPoints(currentUser.uid);
      } else {
        setUserPoints(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserPoints]);

  // Set up real-time listener for points updates
  useEffect(() => {
    if (!user) return;

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchUserPoints(user.uid);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchUserPoints]);

  // Refresh points manually
  const refreshPoints = useCallback(async () => {
    if (!user) return;
    await fetchUserPoints(user.uid);
  }, [user, fetchUserPoints]);

  // Add points (for admin use)
  const addPoints = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const success = await userPointsService.adminAddPoints(
          user.uid,
          amount,
          reason,
          'user'
        );

        if (success) {
          await refreshPoints();
        }

        return success;
      } catch (err) {
        console.error('Error adding points:', err);
        return false;
      }
    },
    [user, refreshPoints]
  );

  // Redeem points
  const redeemPoints = useCallback(
    async (amount: number, reason: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const success = await userPointsService.redeemPoints(
          user.uid,
          amount,
          reason
        );

        if (success) {
          await refreshPoints();
        }

        return success;
      } catch (err) {
        console.error('Error redeeming points:', err);
        return false;
      }
    },
    [user, refreshPoints]
  );

  return {
    userPoints,
    loading,
    error,
    refreshPoints,
    addPoints,
    redeemPoints,
  };
};
