// Admin Authentication Service
// Handles admin role verification and access control

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    canManageUsers: boolean;
    canManageDiscounts: boolean;
    canManageOrders: boolean;
    canViewAnalytics: boolean;
    canManageAdmins: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

class AdminAuthService {
  private db = getFirestore();
  private adminsCollection = 'admins';
  private adminCache = new Map<string, AdminUser>();

  /**
   * Check if user is admin
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // Check cache first
      if (this.adminCache.has(userId)) {
        const admin = this.adminCache.get(userId);
        return admin?.isAdmin || false;
      }

      const adminRef = doc(this.db, this.adminsCollection, userId);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        const data = adminSnap.data() as AdminUser;
        this.adminCache.set(userId, data);
        return data.isAdmin;
      }

      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get admin user data
   */
  async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      // Check cache first
      if (this.adminCache.has(userId)) {
        return this.adminCache.get(userId) || null;
      }

      const adminRef = doc(this.db, this.adminsCollection, userId);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        const data = adminSnap.data() as AdminUser;
        this.adminCache.set(userId, data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permission: keyof AdminUser['permissions']
  ): Promise<boolean> {
    try {
      const admin = await this.getAdminUser(userId);
      if (!admin) return false;

      return admin.permissions[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Create admin user
   */
  async createAdmin(
    userId: string,
    email: string,
    displayName: string,
    role: 'super_admin' | 'admin' | 'moderator' = 'admin'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const permissions = this.getPermissionsForRole(role);

      const adminData: AdminUser = {
        uid: userId,
        email,
        displayName,
        isAdmin: true,
        role,
        permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const adminRef = doc(this.db, this.adminsCollection, userId);
      await setDoc(adminRef, adminData);

      this.adminCache.set(userId, adminData);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating admin:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update admin role
   */
  async updateAdminRole(
    userId: string,
    newRole: 'super_admin' | 'admin' | 'moderator'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const permissions = this.getPermissionsForRole(newRole);

      const adminRef = doc(this.db, this.adminsCollection, userId);
      await updateDoc(adminRef, {
        role: newRole,
        permissions,
        updatedAt: serverTimestamp(),
      });

      // Clear cache
      this.adminCache.delete(userId);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating admin role:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Remove admin access
   */
  async removeAdminAccess(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const adminRef = doc(this.db, this.adminsCollection, userId);
      await updateDoc(adminRef, {
        isAdmin: false,
        updatedAt: serverTimestamp(),
      });

      // Clear cache
      this.adminCache.delete(userId);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error removing admin access:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update admin last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const adminRef = doc(this.db, this.adminsCollection, userId);
      await updateDoc(adminRef, {
        lastLogin: serverTimestamp(),
      });

      // Clear cache to force refresh
      this.adminCache.delete(userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const adminsRef = collection(this.db, this.adminsCollection);
      const q = query(adminsRef, where('isAdmin', '==', true));
      const snapshot = await getDocs(q);

      const admins: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as AdminUser;
        admins.push(data);
      });

      return admins;
    } catch (error) {
      console.error('Error getting all admins:', error);
      return [];
    }
  }

  /**
   * Get admins by role
   */
  async getAdminsByRole(role: 'super_admin' | 'admin' | 'moderator'): Promise<AdminUser[]> {
    try {
      const adminsRef = collection(this.db, this.adminsCollection);
      const q = query(adminsRef, where('role', '==', role));
      const snapshot = await getDocs(q);

      const admins: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as AdminUser;
        admins.push(data);
      });

      return admins;
    } catch (error) {
      console.error('Error getting admins by role:', error);
      return [];
    }
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(
    role: 'super_admin' | 'admin' | 'moderator'
  ): AdminUser['permissions'] {
    switch (role) {
      case 'super_admin':
        return {
          canManageUsers: true,
          canManageDiscounts: true,
          canManageOrders: true,
          canViewAnalytics: true,
          canManageAdmins: true,
        };
      case 'admin':
        return {
          canManageUsers: true,
          canManageDiscounts: true,
          canManageOrders: true,
          canViewAnalytics: true,
          canManageAdmins: false,
        };
      case 'moderator':
        return {
          canManageUsers: true,
          canManageDiscounts: false,
          canManageOrders: false,
          canViewAnalytics: false,
          canManageAdmins: false,
        };
      default:
        return {
          canManageUsers: false,
          canManageDiscounts: false,
          canManageOrders: false,
          canViewAnalytics: false,
          canManageAdmins: false,
        };
    }
  }

  /**
   * Clear cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.adminCache.delete(userId);
    } else {
      this.adminCache.clear();
    }
  }
}

export const adminAuthService = new AdminAuthService();
