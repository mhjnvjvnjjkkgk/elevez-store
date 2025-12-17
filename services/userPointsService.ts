// User Points Service - Real Loyalty Points Management
// Handles persistent user points with Firebase integration
// ✅ NOW USES DYNAMIC LOYALTY RULES - NO HARDCODED VALUES

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { loyaltyRulesService } from './loyaltyRulesService';

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
  private pointsCollection = 'userPoints'; // Changed from 'users' to 'userPoints'
  private pointsSubcollection = 'points';

  /**
   * Get or create user points record
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const pointsRef = doc(this.db, this.pointsCollection, userId);
      const pointsSnap = await getDoc(pointsRef);

      if (pointsSnap.exists()) {
        return pointsSnap.data() as UserPoints;
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

      await setDoc(pointsRef, newUserPoints);
      console.log('✅ Created new user points record in userPoints collection:', userId);
      return newUserPoints;
    } catch (error) {
      console.error('Error getting user points:', error);
      return null;
    }
  }

  /**
   * Add points from purchase
   * ✅ NOW USES DYNAMIC LOYALTY RULES
   */
  async addPointsFromPurchase(
    userId: string,
    orderAmount: number,
    orderId: string
  ): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints) {
        console.error('❌ Could not get user points for:', userId);
        return false;
      }

      // ✅ Calculate points using dynamic rules with tier multiplier
      const pointsToAdd = await loyaltyRulesService.calculatePointsEarned(
        orderAmount,
        userPoints.tier
      );

      const balanceBefore = userPoints.totalPoints;
      const balanceAfter = balanceBefore + pointsToAdd;

      const transaction: PointsTransaction = {
        id: `purchase_${orderId}_${Date.now()}`,
        type: 'purchase',
        amount: pointsToAdd,
        description: `Points earned from order #${orderId} (${userPoints.tier} tier)`,
        orderId,
        timestamp: new Date().toISOString(),
        balanceBefore,
        balanceAfter,
      };

      // ✅ Calculate new tier using dynamic rules
      const newTier = await loyaltyRulesService.calculateTier(balanceAfter);

      const pointsRef = doc(this.db, this.pointsCollection, userId);
      await updateDoc(pointsRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: newTier.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        updatedAt: new Date().toISOString(),
        lastPurchaseDate: new Date().toISOString(),
        orderCount: (userPoints.orderCount || 0) + 1,
      });

      // ALSO sync to loyaltyProfiles collection for website consistency
      try {
        const loyaltyRef = doc(this.db, 'loyaltyProfiles', userId);
        const loyaltySnap = await getDoc(loyaltyRef);

        if (loyaltySnap.exists()) {
          const tierCapitalized = newTier.id.charAt(0).toUpperCase() + newTier.id.slice(1);
          await updateDoc(loyaltyRef, {
            points: balanceAfter,
            totalPointsEarned: balanceAfter,
            tier: tierCapitalized as 'Bronze' | 'Silver' | 'Gold' | 'Platinum',
            orderCount: increment(1),
            lastUpdated: serverTimestamp()
          });
          console.log(`📊 Also synced points to loyaltyProfiles: ${balanceAfter} points`);
        }
      } catch (loyaltySyncError) {
        console.warn('Could not sync to loyaltyProfiles:', loyaltySyncError);
        // Not critical, continue
      }

      console.log(`✅ Added ${pointsToAdd} points to user ${userId} (${userPoints.tier} → ${newTier.id}). New balance: ${balanceAfter}`);
      return true;
    } catch (error) {
      console.error('Error adding purchase points:', error);
      return false;
    }
  }

  /**
   * Admin: Add points to user
   * ✅ NOW USES DYNAMIC LOYALTY RULES FOR TIER CALCULATION
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

      // ✅ Calculate new tier using dynamic rules
      const newTier = await loyaltyRulesService.calculateTier(balanceAfter);

      const pointsRef = doc(this.db, this.pointsCollection, userId);
      await updateDoc(pointsRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: newTier.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Admin added ${pointsToAdd} points to user ${userId}. New tier: ${newTier.id}`);
      return true;
    } catch (error) {
      console.error('Error adding admin points:', error);
      return false;
    }
  }

  /**
   * Admin: Deduct points from user
   * ✅ NOW USES DYNAMIC LOYALTY RULES FOR TIER CALCULATION
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

      // ✅ Calculate new tier using dynamic rules
      const newTier = await loyaltyRulesService.calculateTier(balanceAfter);

      const pointsRef = doc(this.db, this.pointsCollection, userId);
      await updateDoc(pointsRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: newTier.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ Admin deducted ${pointsToDeduct} points from user ${userId}. New tier: ${newTier.id}`);
      return true;
    } catch (error) {
      console.error('Error deducting admin points:', error);
      return false;
    }
  }

  /**
   * Redeem points
   * ✅ NOW USES DYNAMIC LOYALTY RULES FOR TIER CALCULATION
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

      // ✅ Calculate new tier using dynamic rules
      const newTier = await loyaltyRulesService.calculateTier(balanceAfter);

      const pointsRef = doc(this.db, this.pointsCollection, userId);
      await updateDoc(pointsRef, {
        totalPoints: balanceAfter,
        pointsHistory: [...userPoints.pointsHistory, transaction],
        tier: newTier.id as 'bronze' | 'silver' | 'gold' | 'platinum',
        updatedAt: new Date().toISOString(),
      });

      console.log(`✅ User ${userId} redeemed ${pointsToRedeem} points. New tier: ${newTier.id}`);
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
      const pointsRef = collection(this.db, this.pointsCollection);
      const querySnapshot = await getDocs(pointsRef);

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
   * ✅ NOW USES DYNAMIC LOYALTY RULES - DEPRECATED, USE loyaltyRulesService.calculateTier()
   * @deprecated Use loyaltyRulesService.calculateTier() instead
   */
  private async calculateTier(points: number): Promise<'bronze' | 'silver' | 'gold' | 'platinum'> {
    const tier = await loyaltyRulesService.calculateTier(points);
    return tier.id as 'bronze' | 'silver' | 'gold' | 'platinum';
  }

  /**
   * Get tier benefits
   * ✅ NOW USES DYNAMIC LOYALTY RULES
   */
  async getTierBenefits(tierId: string) {
    const benefits = await loyaltyRulesService.getTierBenefits(tierId);
    if (!benefits) {
      // Fallback to default bronze
      const rules = await loyaltyRulesService.getRules();
      return rules.tiers[0];
    }
    return benefits;
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(email: string): Promise<UserPoints[]> {
    try {
      const pointsRef = collection(this.db, this.pointsCollection);
      const q = query(pointsRef, where('email', '==', email));
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
