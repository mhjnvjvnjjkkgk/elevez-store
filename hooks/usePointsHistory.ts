import { useState, useEffect } from 'react';
import { pointsHistoryManager, UserPointsHistory, PointsTransaction } from '../services/pointsHistoryService';
import { useAuth } from './useAuth';

export const usePointsHistory = (userId?: string) => {
  const { user } = useAuth();
  const [pointsHistory, setPointsHistory] = useState<UserPointsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userId || user?.uid;

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const loadPointsHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await pointsHistoryManager.getUserPointsHistory(currentUserId);
        setPointsHistory(history);
      } catch (err) {
        console.error('Error loading points history:', err);
        setError('Failed to load points history');
      } finally {
        setLoading(false);
      }
    };

    loadPointsHistory();

    // Subscribe to real-time updates
    const unsubscribe = pointsHistoryManager.subscribeToUserPoints(currentUserId, (history) => {
      setPointsHistory(history);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const getCurrentBalance = async (): Promise<number> => {
    if (!currentUserId) return 0;
    return await pointsHistoryManager.getUserCurrentBalance(currentUserId);
  };

  const getTransactionsByDateRange = async (startDate: Date, endDate: Date): Promise<PointsTransaction[]> => {
    if (!currentUserId) return [];
    return await pointsHistoryManager.getPointsByDateRange(currentUserId, startDate, endDate);
  };

  return {
    pointsHistory,
    loading,
    error,
    getCurrentBalance,
    getTransactionsByDateRange,
    refresh: () => {
      if (currentUserId) {
        pointsHistoryManager.getUserPointsHistory(currentUserId).then(setPointsHistory);
      }
    }
  };
};

export const useAllUsersPointsHistory = () => {
  const [usersHistory, setUsersHistory] = useState<UserPointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllUsersHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await pointsHistoryManager.getAllUsersPointsHistory();
        setUsersHistory(history);
      } catch (err) {
        console.error('Error loading all users points history:', err);
        setError('Failed to load users points history');
      } finally {
        setLoading(false);
      }
    };

    loadAllUsersHistory();
  }, []);

  const adjustUserPoints = async (userId: string, amount: number, reason: string, adminId: string) => {
    try {
      await pointsHistoryManager.recordAdminAdjustment(userId, amount, reason, adminId);
      // Refresh data
      const history = await pointsHistoryManager.getAllUsersPointsHistory();
      setUsersHistory(history);
    } catch (err) {
      console.error('Error adjusting user points:', err);
      throw err;
    }
  };

  return {
    usersHistory,
    loading,
    error,
    adjustUserPoints,
    refresh: async () => {
      const history = await pointsHistoryManager.getAllUsersPointsHistory();
      setUsersHistory(history);
    }
  };
};
