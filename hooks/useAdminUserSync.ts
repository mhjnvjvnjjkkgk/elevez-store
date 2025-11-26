// Admin User Sync Hook
// Provides real-time sync for admin user management

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { adminUserManagementService, AdminUser, AdminLog } from '../services/adminUserManagementService';

export interface AdminUserState {
  users: AdminUser[];
  selectedUser: AdminUser | null;
  logs: AdminLog[];
  statistics: {
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    tierDistribution: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
}

/**
 * Hook for admin user management
 */
export function useAdminUserSync() {
  const [state, setState] = useState<AdminUserState>({
    users: [],
    selectedUser: null,
    logs: [],
    statistics: {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      tierDistribution: {},
    },
    loading: true,
    error: null,
    isAdmin: false,
  });

  // Check if user is admin and load data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // TODO: Check if user is admin (implement admin check)
        // For now, assume authenticated user is admin
        setState((prev) => ({ ...prev, isAdmin: true }));

        // Load all users
        const users = await adminUserManagementService.getAllUsers();
        const logs = await adminUserManagementService.getAdminLogs();
        const statistics = await adminUserManagementService.getUserStatistics();

        setState((prev) => ({
          ...prev,
          users,
          logs,
          statistics,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isAdmin: false,
          loading: false,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Select user
  const selectUser = useCallback((userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    setState((prev) => ({ ...prev, selectedUser: user || null }));
  }, [state.users]);

  // Search users
  const searchUsers = useCallback(async (email: string) => {
    const users = await adminUserManagementService.searchUsersByEmail(email);
    setState((prev) => ({ ...prev, users }));
  }, []);

  // Update user points
  const updateUserPoints = useCallback(
    async (userId: string, newPoints: number, reason?: string) => {
      const result = await adminUserManagementService.updateUserPoints(
        userId,
        newPoints,
        reason
      );

      if (result.success) {
        // Refresh user data
        const user = await adminUserManagementService.getUserById(userId);
        if (user) {
          setState((prev) => ({
            ...prev,
            selectedUser: user,
            users: prev.users.map((u) => (u.id === userId ? user : u)),
          }));
        }
        return true;
      } else {
        setState((prev) => ({ ...prev, error: result.error }));
        return false;
      }
    },
    []
  );

  // Update user tier
  const updateUserTier = useCallback(
    async (userId: string, newTier: string, reason?: string) => {
      const result = await adminUserManagementService.updateUserTier(
        userId,
        newTier,
        reason
      );

      if (result.success) {
        // Refresh user data
        const user = await adminUserManagementService.getUserById(userId);
        if (user) {
          setState((prev) => ({
            ...prev,
            selectedUser: user,
            users: prev.users.map((u) => (u.id === userId ? user : u)),
          }));
        }
        return true;
      } else {
        setState((prev) => ({ ...prev, error: result.error }));
        return false;
      }
    },
    []
  );

  // Update user notes
  const updateUserNotes = useCallback(
    async (userId: string, notes: string) => {
      const result = await adminUserManagementService.updateUserNotes(userId, notes);

      if (result.success) {
        // Refresh user data
        const user = await adminUserManagementService.getUserById(userId);
        if (user) {
          setState((prev) => ({
            ...prev,
            selectedUser: user,
            users: prev.users.map((u) => (u.id === userId ? user : u)),
          }));
        }
        return true;
      } else {
        setState((prev) => ({ ...prev, error: result.error }));
        return false;
      }
    },
    []
  );

  // Refresh data
  const refreshData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const users = await adminUserManagementService.getAllUsers();
    const logs = await adminUserManagementService.getAdminLogs();
    const statistics = await adminUserManagementService.getUserStatistics();

    setState((prev) => ({
      ...prev,
      users,
      logs,
      statistics,
      loading: false,
    }));
  }, []);

  // Get user logs
  const getUserLogs = useCallback(async (userId: string) => {
    const logs = await adminUserManagementService.getUserLogs(userId);
    setState((prev) => ({ ...prev, logs }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    selectUser,
    searchUsers,
    updateUserPoints,
    updateUserTier,
    updateUserNotes,
    refreshData,
    getUserLogs,
    clearError,
  };
}

/**
 * Hook for listening to specific user changes
 */
export function useAdminUserListener(userId: string | null) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      const userData = await adminUserManagementService.getUserById(userId);
      setUser(userData);
      setLoading(false);
    };

    loadUser();

    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadUser, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  return { user, loading };
}
