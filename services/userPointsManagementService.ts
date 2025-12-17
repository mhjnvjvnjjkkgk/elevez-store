import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { userActivityService } from './userActivityService';
import { loyaltyRulesService } from './loyaltyRulesService';

export interface UserPointsData {
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastUpdated: Date;
}

export interface PointsTransaction {
  transactionId: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'admin_adjustment';
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  adminId?: string;
}

class UserPointsManagementService {
  /**
   * Get user points
   */
  async getUserPoints(userId: string): Promise<UserPointsData> {
    try {
      const pointsRef = doc(db, `users/${userId}/points`, 'data');
      const docSnap = await getDoc(pointsRef);
      
      if (docSnap.exists()) {
        return {
          userId,
          ...docSnap.data()
        } as UserPointsData;
      }
      
      // Create default points if doesn't exist
      const defaultPoints: UserPointsData = {
        userId,
        currentBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        tier: 'bronze',
        lastUpdated: new Date()
      };
      
      await setDoc(pointsRef, defaultPoints);
      return defaultPoints;
    } catch (error) {
      console.error('Error getting user points:', error);
      throw error;
    }
  }

  /**
   * Add points to user
   */
  async addPoints(
    userId: string,
    amount: number,
    reason: string,
    adminId?: string
  ): Promise<void> {
    try {
      const currentPoints = await this.getUserPoints(userId);
      const newBalance = currentPoints.currentBalance + amount;
      
      // ✅ Use dynamic loyalty rules for tier calculation
      const tierConfig = await loyaltyRulesService.calculateTier(newBalance);
      
      const pointsRef = doc(db, `users/${userId}/points`, 'data');
      await updateDoc(pointsRef, {
        currentBalance: newBalance,
        totalEarned: currentPoints.totalEarned + amount,
        tier: tierConfig.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        lastUpdated: new Date()
      });
      
      // Log transaction
      await this.logPointsTransaction(
        userId,
        amount,
        'earn',
        reason,
        currentPoints.currentBalance,
        newBalance,
        adminId
      );
      
      // Log activity
      await userActivityService.logPointsEarned(userId, amount, reason);
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  /**
   * Subtract points from user
   */
  async subtractPoints(
    userId: string,
    amount: number,
    reason: string,
    adminId?: string
  ): Promise<void> {
    try {
      const currentPoints = await this.getUserPoints(userId);
      
      if (currentPoints.currentBalance < amount) {
        throw new Error('Insufficient points');
      }
      
      const newBalance = currentPoints.currentBalance - amount;
      
      // ✅ Use dynamic loyalty rules for tier calculation
      const tierConfig = await loyaltyRulesService.calculateTier(newBalance);
      
      const pointsRef = doc(db, `users/${userId}/points`, 'data');
      await updateDoc(pointsRef, {
        currentBalance: newBalance,
        totalSpent: currentPoints.totalSpent + amount,
        tier: tierConfig.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        lastUpdated: new Date()
      });
      
      // Log transaction
      await this.logPointsTransaction(
        userId,
        -amount,
        'spend',
        reason,
        currentPoints.currentBalance,
        newBalance,
        adminId
      );
      
      // Log activity
      await userActivityService.logPointsSpent(userId, amount, reason);
    } catch (error) {
      console.error('Error subtracting points:', error);
      throw error;
    }
  }

  /**
   * Set points directly (admin only)
   */
  async setPoints(
    userId: string,
    newBalance: number,
    reason: string,
    adminId: string
  ): Promise<void> {
    try {
      const currentPoints = await this.getUserPoints(userId);
      const difference = newBalance - currentPoints.currentBalance;
      
      // ✅ Use dynamic loyalty rules for tier calculation
      const tierConfig = await loyaltyRulesService.calculateTier(newBalance);
      
      const pointsRef = doc(db, `users/${userId}/points`, 'data');
      await updateDoc(pointsRef, {
        currentBalance: newBalance,
        totalEarned: currentPoints.totalEarned + (difference > 0 ? difference : 0),
        totalSpent: currentPoints.totalSpent + (difference < 0 ? Math.abs(difference) : 0),
        tier: tierConfig.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        lastUpdated: new Date()
      });
      
      // Log transaction
      await this.logPointsTransaction(
        userId,
        difference,
        'admin_adjustment',
        reason,
        currentPoints.currentBalance,
        newBalance,
        adminId
      );
      
      // Log activity
      await userActivityService.logAdminChange(
        userId,
        'points',
        currentPoints.currentBalance,
        newBalance,
        adminId,
        reason
      );
    } catch (error) {
      console.error('Error setting points:', error);
      throw error;
    }
  }

  /**
   * Get points transactions
   */
  async getPointsTransactions(userId: string): Promise<PointsTransaction[]> {
    try {
      const q = query(
        collection(db, `users/${userId}/points/transactions`),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        transactionId: doc.id,
        userId,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as PointsTransaction));
    } catch (error) {
      console.error('Error getting points transactions:', error);
      throw error;
    }
  }

  /**
   * Calculate tier based on points
   * ✅ NOW USES DYNAMIC LOYALTY RULES - DEPRECATED
   * @deprecated Use loyaltyRulesService.calculateTier() instead
   */
  private async calculateTier(points: number): Promise<'bronze' | 'silver' | 'gold' | 'platinum'> {
    const tierConfig = await loyaltyRulesService.calculateTier(points);
    return tierConfig.id as 'bronze' | 'silver' | 'gold' | 'platinum';
  }

  /**
   * Log points transaction
   */
  private async logPointsTransaction(
    userId: string,
    amount: number,
    type: 'earn' | 'spend' | 'admin_adjustment',
    reason: string,
    balanceBefore: number,
    balanceAfter: number,
    adminId?: string
  ): Promise<void> {
    try {
      const transactionsRef = collection(db, `users/${userId}/points/transactions`);
      
      await setDoc(doc(transactionsRef), {
        userId,
        amount,
        type,
        reason,
        balanceBefore,
        balanceAfter,
        timestamp: new Date(),
        adminId: adminId || null
      });
    } catch (error) {
      console.error('Error logging points transaction:', error);
    }
  }

  /**
   * Get all users' points (admin only)
   */
  async getAllUsersPoints(): Promise<UserPointsData[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const allPoints: UserPointsData[] = [];
      
      for (const userDoc of snapshot.docs) {
        const points = await this.getUserPoints(userDoc.id);
        allPoints.push(points);
      }
      
      return allPoints;
    } catch (error) {
      console.error('Error getting all users points:', error);
      throw error;
    }
  }

  /**
   * Get total points distributed
   */
  async getTotalPointsDistributed(): Promise<number> {
    try {
      const allPoints = await this.getAllUsersPoints();
      return allPoints.reduce((sum, p) => sum + p.currentBalance, 0);
    } catch (error) {
      console.error('Error getting total points distributed:', error);
      throw error;
    }
  }
}

export const userPointsManagementService = new UserPointsManagementService();
