// Admin User Management Service
// Handles user management operations for admin panel

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  points: number;
  tier: string;
  totalPointsEarned: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  orders?: number;
  adminNotes?: string;
}

export interface AdminLog {
  id?: string;
  adminId: string;
  adminEmail: string;
  userId: string;
  userEmail: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  reason?: string;
}

class AdminUserManagementService {
  private db = getFirestore();
  private usersCollection = 'users';
  private adminLogsCollection = 'adminLogs';

  /**
   * Get all users
   */
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const usersRef = collection(this.db, this.usersCollection);
      const snapshot = await getDocs(usersRef);

      const users: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          points: data.points || 0,
          tier: data.tier || 'Bronze',
          totalPointsEarned: data.totalPointsEarned || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          lastLogin: data.lastLogin,
          adminNotes: data.adminNotes,
        });
      });

      // Sort by email
      return users.sort((a, b) => a.email.localeCompare(b.email));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(email: string): Promise<AdminUser[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter((user) =>
        user.email.toLowerCase().includes(email.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AdminUser | null> {
    try {
      const userRef = doc(this.db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data.email || '',
        displayName: data.displayName || 'Unknown',
        points: data.points || 0,
        tier: data.tier || 'Bronze',
        totalPointsEarned: data.totalPointsEarned || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLogin: data.lastLogin,
        adminNotes: data.adminNotes,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AdminUser | null> {
    try {
      const usersRef = collection(this.db, this.usersCollection);
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        displayName: data.displayName || 'Unknown',
        points: data.points || 0,
        tier: data.tier || 'Bronze',
        totalPointsEarned: data.totalPointsEarned || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        lastLogin: data.lastLogin,
        adminNotes: data.adminNotes,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user points
   */
  async updateUserPoints(
    userId: string,
    newPoints: number,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const adminUser = auth.currentUser;
      if (!adminUser) {
        return { success: false, error: 'Admin not authenticated' };
      }

      // Get current user data
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const oldPoints = user.points;

      // Update user points
      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        points: newPoints,
        updatedAt: serverTimestamp(),
      });

      // Log the change
      await this.logAdminAction({
        adminId: adminUser.uid,
        adminEmail: adminUser.email || 'unknown',
        userId,
        userEmail: user.email,
        action: 'updated_points',
        oldValue: oldPoints,
        newValue: newPoints,
        timestamp: new Date().toISOString(),
        reason,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating user points:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update user tier
   */
  async updateUserTier(
    userId: string,
    newTier: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const adminUser = auth.currentUser;
      if (!adminUser) {
        return { success: false, error: 'Admin not authenticated' };
      }

      // Get current user data
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const oldTier = user.tier;

      // Update user tier
      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        tier: newTier,
        updatedAt: serverTimestamp(),
      });

      // Log the change
      await this.logAdminAction({
        adminId: adminUser.uid,
        adminEmail: adminUser.email || 'unknown',
        userId,
        userEmail: user.email,
        action: 'updated_tier',
        oldValue: oldTier,
        newValue: newTier,
        timestamp: new Date().toISOString(),
        reason,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating user tier:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update user admin notes
   */
  async updateUserNotes(
    userId: string,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const adminUser = auth.currentUser;
      if (!adminUser) {
        return { success: false, error: 'Admin not authenticated' };
      }

      // Get current user data
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update user notes
      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        adminNotes: notes,
        updatedAt: serverTimestamp(),
      });

      // Log the change
      await this.logAdminAction({
        adminId: adminUser.uid,
        adminEmail: adminUser.email || 'unknown',
        userId,
        userEmail: user.email,
        action: 'updated_notes',
        oldValue: user.adminNotes,
        newValue: notes,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating user notes:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Batch update users
   */
  async batchUpdateUsers(
    updates: Array<{ userId: string; points?: number; tier?: string; notes?: string }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const adminUser = auth.currentUser;
      if (!adminUser) {
        return { success: false, error: 'Admin not authenticated' };
      }

      for (const update of updates) {
        const user = await this.getUserById(update.userId);
        if (!user) continue;

        const userRef = doc(this.db, this.usersCollection, update.userId);
        const updateData: any = { updatedAt: serverTimestamp() };

        if (update.points !== undefined) {
          updateData.points = update.points;
          await this.logAdminAction({
            adminId: adminUser.uid,
            adminEmail: adminUser.email || 'unknown',
            userId: update.userId,
            userEmail: user.email,
            action: 'updated_points',
            oldValue: user.points,
            newValue: update.points,
            timestamp: new Date().toISOString(),
          });
        }

        if (update.tier !== undefined) {
          updateData.tier = update.tier;
          await this.logAdminAction({
            adminId: adminUser.uid,
            adminEmail: adminUser.email || 'unknown',
            userId: update.userId,
            userEmail: user.email,
            action: 'updated_tier',
            oldValue: user.tier,
            newValue: update.tier,
            timestamp: new Date().toISOString(),
          });
        }

        if (update.notes !== undefined) {
          updateData.adminNotes = update.notes;
        }

        await updateDoc(userRef, updateData);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in batch update:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Log admin action
   */
  private async logAdminAction(log: AdminLog): Promise<void> {
    try {
      const logsRef = collection(this.db, this.adminLogsCollection);
      await addDoc(logsRef, {
        ...log,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin logs
   */
  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    try {
      const logsRef = collection(this.db, this.adminLogsCollection);
      const q = query(logsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      const logs: AdminLog[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          adminId: data.adminId,
          adminEmail: data.adminEmail,
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          oldValue: data.oldValue,
          newValue: data.newValue,
          timestamp: data.timestamp || new Date().toISOString(),
          reason: data.reason,
        });
      });

      return logs.slice(0, limit);
    } catch (error) {
      console.error('Error getting admin logs:', error);
      return [];
    }
  }

  /**
   * Get logs for specific user
   */
  async getUserLogs(userId: string): Promise<AdminLog[]> {
    try {
      const logsRef = collection(this.db, this.adminLogsCollection);
      const q = query(
        logsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);

      const logs: AdminLog[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          adminId: data.adminId,
          adminEmail: data.adminEmail,
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          oldValue: data.oldValue,
          newValue: data.newValue,
          timestamp: data.timestamp || new Date().toISOString(),
          reason: data.reason,
        });
      });

      return logs;
    } catch (error) {
      console.error('Error getting user logs:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    tierDistribution: Record<string, number>;
  }> {
    try {
      const users = await this.getAllUsers();

      const tierDistribution: Record<string, number> = {
        Bronze: 0,
        Silver: 0,
        Gold: 0,
        Platinum: 0,
      };

      let totalPoints = 0;

      users.forEach((user) => {
        totalPoints += user.points;
        tierDistribution[user.tier] = (tierDistribution[user.tier] || 0) + 1;
      });

      return {
        totalUsers: users.length,
        totalPoints,
        averagePoints: users.length > 0 ? Math.floor(totalPoints / users.length) : 0,
        tierDistribution,
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        tierDistribution: {},
      };
    }
  }
}

export const adminUserManagementService = new AdminUserManagementService();
