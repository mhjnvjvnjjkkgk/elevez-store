// User Points Service - Real Loyalty Points Management
// Handles persistent user points with Firebase integration

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  increment,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export interface UserPoints {
  userId: string;
  email: string;
  displayName: string;
  totalPoints: number;
  pointsHistory: PointsTransaction[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  updatedAt: string;
  lastPurchaseDate?: string;
  orderCount?: number; // Track total number of orders
}

export interface PointsTransaction {
  id: string;
  type: 'purchase' | 'admin_add' | 'admin_deduct' | 'redemption' | 'bonus';
  amount: number;
  description: string;
  orderId?: string;
  adminId?: string;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
}

class UserPointsService {
  private db = getFirestore();
  private usersCollection = 'users';
  private pointsSubcollection = 'points';

  /**
   * Get or create user points record
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const userRef = doc(this.db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserPoints;
      }

      // Create new user points record
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const newUserPoints: UserPoints = {
        userId,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'User',
        totalPoints: 0,
        pointsHistory: [],
        tier: 'bronze',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderCount: 0,
      };

      await setDoc(userRef, newUserPoints);
      return newUserPoints;
    } catch (error) {
      console.error('Error getting user points:', error);
      return null;
    }
  }

  /**
   * Add points from purchase
   */
  async addPointsFromPurchase(
    userId: string,
    orderAmount: number,
    orderId: string,
    pointsPerRupee: number = 1 // 1 point per rupee
  ): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) return false;

      const pointsToAdd = Math.floor(orderAmount * pointsPerRupee);
      const balanceBefore = userPoints.totalPoints;
      const balanceAfter = balanceBefore + pointsToAdd;

      const transaction: PointsTransaction = {
        id: `purchase_${orderId}_${Date.now()}`,
        type: 'purchase',
        amount: pointsToAdd,
        description: `Points earned from order #${orderId}`,
        orderId,
        timestamp: new Date().toISOString(),
        balanceBefore,
        balanceAfter,
      };

      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: this.calculateTier(balanceAfter),
        updatedAt: new Date().toISOString(),
        lastPurchaseDate: new Date().toISOString(),
        orderCount: (userPoints.orderCount || 0) + 1, // Increment order count
      });

      return true;
    } catch (error) {
      console.error('Error adding purchase points:', error);
      return false;
    }
  }

  /**
   * Admin: Add points to user
   */
  async adminAddPoints(
    userId: string,
    pointsToAdd: number,
    reason: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) return false;

      const balanceBefore = userPoints.totalPoints;
      const balanceAfter = balanceBefore + pointsToAdd;

      const transaction: PointsTransaction = {
        id: `admin_add_${userId}_${Date.now()}`,
        type: 'admin_add',
        amount: pointsToAdd,
        description: reason,
        adminId,
        timestamp: new Date().toISOString(),
        balanceBefore,
        balanceAfter,
      };

      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: this.calculateTier(balanceAfter),
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error adding admin points:', error);
      return false;
    }
  }

  /**
   * Admin: Deduct points from user
   */
  async adminDeductPoints(
    userId: string,
    pointsToDeduct: number,
    reason: string,
    adminId: string
  ): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) return false;

      if (userPoints.totalPoints < pointsToDeduct) {
        console.error('Insufficient points');
        return false;
      }

      const balanceBefore = userPoints.totalPoints;
      const balanceAfter = balanceBefore - pointsToDeduct;

      const transaction: PointsTransaction = {
        id: `admin_deduct_${userId}_${Date.now()}`,
        type: 'admin_deduct',
        amount: pointsToDeduct,
        description: reason,
        adminId,
        timestamp: new Date().toISOString(),
        balanceBefore,
        balanceAfter,
      };

      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: this.calculateTier(balanceAfter),
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error deducting admin points:', error);
      return false;
    }
  }

  /**
   * Redeem points
   */
  async redeemPoints(
    userId: string,
    pointsToRedeem: number,
    description: string
  ): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) return false;

      if (userPoints.totalPoints < pointsToRedeem) {
        console.error('Insufficient points to redeem');
        return false;
      }

      const balanceBefore = userPoints.totalPoints;
      const balanceAfter = balanceBefore - pointsToRedeem;

      const transaction: PointsTransaction = {
        id: `redemption_${userId}_${Date.now()}`,
        type: 'redemption',
        amount: pointsToRedeem,
        description,
        timestamp: new Date().toISOString(),
        balanceBefore,
        balanceAfter,
      };

      const userRef = doc(this.db, this.usersCollection, userId);
      await updateDoc(userRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: this.calculateTier(balanceAfter),
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      return false;
    }
  }

  /**
   * Get all users with points (for admin)
   */
  async getAllUsersPoints(): Promise<UserPoints[]> {
    try {
      const usersRef = collection(this.db, this.usersCollection);
      const querySnapshot = await getDocs(usersRef);
      
      const users: UserPoints[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserPoints);
      });

      return users.sort((a, b) => b.totalPoints - a.totalPoints);
    } catch (error) {
      console.error('Error getting all users points:', error);
      return [];
    }
  }

  /**
   * Get user points history
   */
  async getUserPointsHistory(userId: string): Promise<PointsTransaction[]> {
    try {
      const userPoints = await this.getUserPoints(userId);
      return userPoints?.pointsHistory || [];
    } catch (error) {
      console.error('Error getting points history:', error);
      return [];
    }
  }

  /**
   * Calculate tier based on points
   */
  private calculateTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (points >= 5000) return 'platinum';
    if (points >= 2500) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
  }

  /**
   * Get tier benefits
   */
  getTierBenefits(tier: string) {
    const benefits: Record<string, any> = {
      bronze: {
        name: 'Bronze',
        pointsRequired: 0,
        discountPercentage: 0,
        freeShippingThreshold: 500,
        description: 'Entry level member',
      },
      silver: {
        name: 'Silver',
        pointsRequired: 1000,
        discountPercentage: 5,
        freeShippingThreshold: 300,
        description: 'Loyal member',
      },
      gold: {
        name: 'Gold',
        pointsRequired: 2500,
        discountPercentage: 10,
        freeShippingThreshold: 100,
        description: 'VIP member',
      },
      platinum: {
        name: 'Platinum',
        pointsRequired: 5000,
        discountPercentage: 15,
        freeShippingThreshold: 0,
        description: 'Elite member - Free shipping always',
      },
    };

    return benefits[tier] || benefits.bronze;
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(email: string): Promise<UserPoints[]> {
    try {
      const usersRef = collection(this.db, this.usersCollection);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      const users: UserPoints[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserPoints);
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const allUsers = await this.getAllUsersPoints();
      
      return {
        totalUsers: allUsers.length,
        totalPointsDistributed: allUsers.reduce((sum, u) => sum + u.totalPoints, 0),
        averagePointsPerUser: allUsers.length > 0 
          ? Math.floor(allUsers.reduce((sum, u) => sum + u.totalPoints, 0) / allUsers.length)
          : 0,
        tierDistribution: {
          bronze: allUsers.filter(u => u.tier === 'bronze').length,
          silver: allUsers.filter(u => u.tier === 'silver').length,
          gold: allUsers.filter(u => u.tier === 'gold').length,
          platinum: allUsers.filter(u => u.tier === 'platinum').length,
        },
        topUsers: allUsers.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }
}

export const userPointsService = new UserPointsService();
