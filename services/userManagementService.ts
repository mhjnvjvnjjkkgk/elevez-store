import { collection, query, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc, where, orderBy, limit, startAfter, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLogin: Date;
  status: 'active' | 'inactive' | 'suspended';
  totalPurchases: number;
  totalSpent: number;
  avatar?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPointsDistributed: number;
  averagePointsPerUser: number;
}

class UserManagementService {
  /**
   * Get all users
   */
  async getAllUsers(pageSize: number = 50, startAfterDoc?: any): Promise<UserProfile[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }
      
      constraints.push(limit(pageSize));
      
      const q = query(collection(db, 'users'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          userId: docSnap.id,
          ...docSnap.data()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Search users by email or name
   */
  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'active',
        totalPurchases: 0,
        totalSpent: 0
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      
      const activeUsers = users.filter(u => u.status === 'active').length;
      const inactiveUsers = users.filter(u => u.status === 'inactive').length;
      const totalSpent = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
      
      return {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        totalPointsDistributed: 0, // Will be calculated from points service
        averagePointsPerUser: users.length > 0 ? totalSpent / users.length : 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get users by status
   */
  async getUsersByStatus(status: 'active' | 'inactive' | 'suspended'): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('status', '==', status),
        orderBy('lastLogin', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error getting users by status:', error);
      throw error;
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updates: Partial<UserProfile>): Promise<void> {
    try {
      for (const userId of userIds) {
        await this.updateUser(userId, updates);
      }
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
