// Real-Time User Sync Hook
// Listens for admin changes and updates user's view automatically

import { useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { firebaseOptimizationService } from '../services/firebaseOptimizationService';

export interface UserSyncState {
  points: number;
  tier: string;
  totalPointsEarned: number;
  lastUpdated: number | null;
  hasChanged: boolean;
  changeType?: 'points' | 'tier' | 'both';
}

/**
 * Hook for real-time user sync with admin changes
 * Automatically updates when admin changes user data
 */
export function useRealtimeUserSync() {
  const [userId, setUserId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<UserSyncState>({
    points: 0,
    tier: 'Bronze',
    totalPointsEarned: 0,
    lastUpdated: null,
    hasChanged: false,
  });

  const previousStateRef = useRef<UserSyncState>(syncState);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Set up auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listener for user points
  useEffect(() => {
    if (!userId) return;

    const cacheKey = `points_${userId}`;

    // Set up real-time listener
    unsubscribeRef.current = firebaseOptimizationService.setupRealtimeListener(
      'userPoints',
      userId,
      (data) => {
        if (data) {
          const newState: UserSyncState = {
            points: data.points || 0,
            tier: data.tier || 'Bronze',
            totalPointsEarned: data.totalPointsEarned || 0,
            lastUpdated: Date.now(),
            hasChanged: false,
            changeType: undefined,
          };

          // Detect what changed
          if (previousStateRef.current.points !== newState.points) {
            newState.hasChanged = true;
            newState.changeType = 'points';
          }
          if (previousStateRef.current.tier !== newState.tier) {
            newState.hasChanged = true;
            newState.changeType = newState.changeType === 'points' ? 'both' : 'tier';
          }

          previousStateRef.current = newState;
          setSyncState(newState);

          // Log the change
          if (newState.hasChanged) {
            console.log('User data updated:', {
              changeType: newState.changeType,
              points: newState.points,
              tier: newState.tier,
            });
          }
        }
      },
      cacheKey
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  // Clear change flag after a delay
  useEffect(() => {
    if (syncState.hasChanged) {
      const timer = setTimeout(() => {
        setSyncState((prev) => ({
          ...prev,
          hasChanged: false,
          changeType: undefined,
        }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [syncState.hasChanged]);

  return {
    ...syncState,
    userId,
  };
}

/**
 * Hook for showing change notifications
 */
export function useUserChangeNotification() {
  const { hasChanged, changeType, points, tier } = useRealtimeUserSync();
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'points' | 'tier' | 'both';
  } | null>(null);

  useEffect(() => {
    if (hasChanged && changeType) {
      let message = '';

      switch (changeType) {
        case 'points':
          message = `Your points have been updated to ${points}!`;
          break;
        case 'tier':
          message = `You've been promoted to ${tier} tier!`;
          break;
        case 'both':
          message = `Your account has been updated! New tier: ${tier}, Points: ${points}`;
          break;
      }

      setNotification({
        show: true,
        message,
        type: changeType,
      });

      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasChanged, changeType, points, tier]);

  return notification;
}

/**
 * Hook for listening to specific user field changes
 */
export function useUserFieldListener(field: 'points' | 'tier') {
  const { points, tier, lastUpdated } = useRealtimeUserSync();
  const previousValueRef = useRef<number | string | null>(null);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    const currentValue = field === 'points' ? points : tier;

    if (previousValueRef.current !== null && previousValueRef.current !== currentValue) {
      setChanged(true);
      const timer = setTimeout(() => setChanged(false), 2000);
      return () => clearTimeout(timer);
    }

    previousValueRef.current = currentValue;
  }, [field, points, tier]);

  return {
    value: field === 'points' ? points : tier,
    changed,
    lastUpdated,
  };
}

/**
 * Hook for tracking points changes
 */
export function usePointsChangeTracker() {
  const { points, lastUpdated } = useRealtimeUserSync();
  const [pointsHistory, setPointsHistory] = useState<
    Array<{ points: number; timestamp: number; change: number }>
  >([]);
  const previousPointsRef = useRef(points);

  useEffect(() => {
    if (previousPointsRef.current !== points && lastUpdated) {
      const change = points - previousPointsRef.current;
      setPointsHistory((prev) => [
        {
          points,
          timestamp: lastUpdated,
          change,
        },
        ...prev.slice(0, 9), // Keep last 10 changes
      ]);
      previousPointsRef.current = points;
    }
  }, [points, lastUpdated]);

  return {
    currentPoints: points,
    history: pointsHistory,
    lastChange: pointsHistory[0],
  };
}

/**
 * Hook for tier change tracking
 */
export function useTierChangeTracker() {
  const { tier, lastUpdated } = useRealtimeUserSync();
  const [tierHistory, setTierHistory] = useState<
    Array<{ tier: string; timestamp: number }>
  >([]);
  const previousTierRef = useRef(tier);

  useEffect(() => {
    if (previousTierRef.current !== tier && lastUpdated) {
      setTierHistory((prev) => [
        {
          tier,
          timestamp: lastUpdated,
        },
        ...prev.slice(0, 9), // Keep last 10 changes
      ]);
      previousTierRef.current = tier;
    }
  }, [tier, lastUpdated]);

  return {
    currentTier: tier,
    history: tierHistory,
    lastChange: tierHistory[0],
  };
}
