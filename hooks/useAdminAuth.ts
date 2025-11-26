// Admin Authentication Hook
// Provides admin authentication and authorization

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { adminAuthService, AdminUser } from '../services/adminAuthService';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
}

/**
 * Hook for admin authentication
 */
export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isAdmin: false,
    adminUser: null,
    loading: true,
    error: null,
    userId: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setState((prev) => ({ ...prev, isAuthenticated: true, userId: user.uid }));

        // Check if user is admin
        const adminUser = await adminAuthService.getAdminUser(user.uid);

        if (adminUser && adminUser.isAdmin) {
          // Update last login
          await adminAuthService.updateLastLogin(user.uid);

          setState((prev) => ({
            ...prev,
            isAdmin: true,
            adminUser,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isAdmin: false,
            adminUser: null,
            loading: false,
          }));
        }
      } else {
        setState({
          isAuthenticated: false,
          isAdmin: false,
          adminUser: null,
          loading: false,
          error: null,
          userId: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Check permission
  const hasPermission = useCallback(
    (permission: keyof AdminUser['permissions']): boolean => {
      if (!state.adminUser) return false;
      return state.adminUser.permissions[permission] || false;
    },
    [state.adminUser]
  );

  // Check if super admin
  const isSuperAdmin = useCallback((): boolean => {
    return state.adminUser?.role === 'super_admin' || false;
  }, [state.adminUser]);

  // Check if admin
  const isAdminRole = useCallback((): boolean => {
    return state.adminUser?.role === 'admin' || false;
  }, [state.adminUser]);

  // Check if moderator
  const isModerator = useCallback((): boolean => {
    return state.adminUser?.role === 'moderator' || false;
  }, [state.adminUser]);

  return {
    ...state,
    hasPermission,
    isSuperAdmin,
    isAdminRole,
    isModerator,
  };
}

/**
 * Hook for checking specific permission
 */
export function useAdminPermission(permission: keyof AdminUser['permissions']) {
  const { adminUser, loading } = useAdminAuth();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (adminUser) {
      setHasPermission(adminUser.permissions[permission] || false);
    } else {
      setHasPermission(false);
    }
  }, [adminUser, permission]);

  return { hasPermission, loading };
}

/**
 * Hook for checking admin role
 */
export function useAdminRole() {
  const { adminUser, loading } = useAdminAuth();
  const [role, setRole] = useState<'super_admin' | 'admin' | 'moderator' | null>(null);

  useEffect(() => {
    if (adminUser) {
      setRole(adminUser.role);
    } else {
      setRole(null);
    }
  }, [adminUser]);

  return { role, loading };
}

/**
 * Hook for requiring admin access
 */
export function useRequireAdmin() {
  const { isAdmin, loading, userId } = useAdminAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      setAuthorized(isAdmin);
    }
  }, [isAdmin, loading]);

  return { authorized, loading, userId };
}

/**
 * Hook for requiring specific permission
 */
export function useRequirePermission(permission: keyof AdminUser['permissions']) {
  const { adminUser, loading } = useAdminAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && adminUser) {
      setAuthorized(adminUser.permissions[permission] || false);
    } else {
      setAuthorized(false);
    }
  }, [adminUser, loading, permission]);

  return { authorized, loading };
}
