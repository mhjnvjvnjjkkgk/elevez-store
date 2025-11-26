import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type ActivityType = 'login' | 'purchase' | 'points_earned' | 'points_spent' | 'admin_change' | 'profile_update';

export interface UserActivity {
  activityId: string;
  userId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  details?: {
    amount?: number;
    productName?: string;
    orderId?: string;
    reason?: string;
    adminId?: string;
    oldValue?: any;
    newValue?: any;
  };
}

class UserActivityService {
  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    type: ActivityType,
    description: string,
    details?: any
  ): Promise<string> {
    try {
      const activitiesRef = collection(db, `users/${userId}/activities`);
      
      const docRef = await addDoc(activitiesRef, {
        userId,
        type,
        description,
        timestamp: Timestamp.now(),
        details: details || {}
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  /**
   * Get user activities
   */
  async getUserActivities(userId: string, limit: number = 100): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, `users/${userId}/activities`),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.slice(0, limit).map(doc => ({
        activityId: doc.id,
        userId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as UserActivity));
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(userId: string, type: ActivityType): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, `users/${userId}/activities`),
        where('type', '==', type),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        activityId: doc.id,
        userId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as UserActivity));
    } catch (error) {
      console.error('Error getting activities by type:', error);
      throw error;
    }
  }

  /**
   * Get activities by date range
   */
  async getActivitiesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, `users/${userId}/activities`),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        activityId: doc.id,
        userId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as UserActivity));
    } catch (error) {
      console.error('Error getting activities by date range:', error);
      throw error;
    }
  }

  /**
   * Log login activity
   */
  async logLogin(userId: string): Promise<void> {
    await this.logActivity(userId, 'login', 'User signed in', {
      timestamp: new Date()
    });
  }

  /**
   * Log purchase activity
   */
  async logPurchase(
    userId: string,
    orderId: string,
    amount: number,
    productName: string
  ): Promise<void> {
    await this.logActivity(userId, 'purchase', `Purchased ${productName}`, {
      orderId,
      amount,
      productName
    });
  }

  /**
   * Log points earned
   */
  async logPointsEarned(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    await this.logActivity(userId, 'points_earned', `Earned ${amount} points`, {
      amount,
      reason
    });
  }

  /**
   * Log points spent
   */
  async logPointsSpent(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    await this.logActivity(userId, 'points_spent', `Spent ${amount} points`, {
      amount,
      reason
    });
  }

  /**
   * Log admin change
   */
  async logAdminChange(
    userId: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    adminId: string,
    reason: string
  ): Promise<void> {
    await this.logActivity(
      userId,
      'admin_change',
      `Admin changed ${fieldName} from ${oldValue} to ${newValue}`,
      {
        fieldName,
        oldValue,
        newValue,
        adminId,
        reason
      }
    );
  }

  /**
   * Delete activity
   */
  async deleteActivity(userId: string, activityId: string): Promise<void> {
    try {
      const activityRef = doc(db, `users/${userId}/activities`, activityId);
      await deleteDoc(activityRef);
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  /**
   * Get all activities for all users (admin only)
   */
  async getAllActivities(limit: number = 1000): Promise<UserActivity[]> {
    try {
      // This would need to be implemented differently in production
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting all activities:', error);
      throw error;
    }
  }

  /**
   * Clear old activities (older than days)
   */
  async clearOldActivities(userId: string, daysOld: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const activities = await this.getActivitiesByDateRange(
        userId,
        new Date(0),
        cutoffDate
      );
      
      for (const activity of activities) {
        await this.deleteActivity(userId, activity.activityId);
      }
    } catch (error) {
      console.error('Error clearing old activities:', error);
      throw error;
    }
  }
}

export const userActivityService = new UserActivityService();
