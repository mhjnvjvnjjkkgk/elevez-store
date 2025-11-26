// Points History Service - Complete points tracking with order history
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PointsTransaction {
  id: string;
  userId: string;
  orderId?: string;
  amount: number;
  type: 'purchase' | 'redemption' | 'admin_adjustment' | 'bonus';
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  metadata?: {
    productName?: string;
    productPrice?: number;
    quantity?: number;
    adminId?: string;
    reason?: string;
  };
}

export interface UserPointsHistory {
  userId: string;
  userName: string;
  userEmail: string;
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: string;
  transactions: PointsTransaction[];
  lastUpdated: Date;
}

export interface OrderWithPoints {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderDate: Date;
  orderTotal: number;
  pointsEarned: number;
  pointsRate: number; // points per rupee
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

// ============================================
// POINTS HISTORY MANAGER
// ============================================

class PointsHistoryManager {
  private pointsPerRupee = 1; // 1 point per rupee spent

  /**
   * Record points transaction
   */
  async recordTransaction(transaction: Omit<PointsTransaction, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'pointsTransactions'), {
        ...transaction,
        timestamp: Timestamp.fromDate(transaction.timestamp)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  /**
   * Record purchase points
   */
  async recordPurchasePoints(
    userId: string,
    orderId: string,
    orderAmount: number,
    orderDetails: any
  ): Promise<void> {
    try {
      const pointsEarned = Math.floor(orderAmount * this.pointsPerRupee);
      const currentBalance = await this.getUserCurrentBalance(userId);

      await this.recordTransaction({
        userId,
        orderId,
        amount: pointsEarned,
        type: 'purchase',
        description: `Points earned from order #${orderId}`,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance + pointsEarned,
        timestamp: new Date(),
        metadata: {
          productName: orderDetails.productName,
          productPrice: orderAmount,
          quantity: orderDetails.quantity
        }
      });

      // Update user's total points
      await this.updateUserPoints(userId, currentBalance + pointsEarned);
    } catch (error) {
      console.error('Error recording purchase points:', error);
      throw error;
    }
  }

  /**
   * Record admin adjustment
   */
  async recordAdminAdjustment(
    userId: string,
    amount: number,
    reason: string,
    adminId: string
  ): Promise<void> {
    try {
      const currentBalance = await this.getUserCurrentBalance(userId);
      const newBalance = currentBalance + amount;

      await this.recordTransaction({
        userId,
        amount,
        type: 'admin_adjustment',
        description: `Admin adjustment: ${reason}`,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        timestamp: new Date(),
        metadata: {
          adminId,
          reason
        }
      });

      // Update user's total points
      await this.updateUserPoints(userId, newBalance);
    } catch (error) {
      console.error('Error recording admin adjustment:', error);
      throw error;
    }
  }

  /**
   * Get user's current points balance
   */
  async getUserCurrentBalance(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'pointsTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return 0;

      const latestTransaction = snapshot.docs[0].data();
      return latestTransaction.balanceAfter || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  /**
   * Get user's complete points history
   */
  async getUserPointsHistory(userId: string): Promise<UserPointsHistory> {
    try {
      const q = query(
        collection(db, 'pointsTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const transactions: PointsTransaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as PointsTransaction[];

      // Get user info
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', userId))
      );

      const userData = userDoc.docs[0]?.data() || {};
      const currentBalance = transactions.length > 0 ? transactions[0].balanceAfter : 0;

      // Calculate totals
      const totalEarned = transactions
        .filter(t => t.type === 'purchase' || t.type === 'bonus')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalRedeemed = transactions
        .filter(t => t.type === 'redemption')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        userId,
        userName: userData.name || 'Unknown',
        userEmail: userData.email || 'Unknown',
        currentBalance,
        totalEarned,
        totalRedeemed,
        tier: userData.tier || 'Bronze',
        transactions,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting user points history:', error);
      throw error;
    }
  }

  /**
   * Get all users' points history
   */
  async getAllUsersPointsHistory(): Promise<UserPointsHistory[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const histories: UserPointsHistory[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const history = await this.getUserPointsHistory(userDoc.data().uid);
        histories.push(history);
      }

      return histories.sort((a, b) => b.currentBalance - a.currentBalance);
    } catch (error) {
      console.error('Error getting all users points history:', error);
      return [];
    }
  }

  /**
   * Get orders with points
   */
  async getOrdersWithPoints(): Promise<OrderWithPoints[]> {
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders: OrderWithPoints[] = [];

      for (const orderDoc of ordersSnapshot.docs) {
        const orderData = orderDoc.data();
        const pointsEarned = Math.floor(orderData.total * this.pointsPerRupee);

        orders.push({
          orderId: orderDoc.id,
          userId: orderData.userId,
          userName: orderData.userName || 'Unknown',
          userEmail: orderData.userEmail || 'Unknown',
          orderDate: orderData.createdAt?.toDate() || new Date(),
          orderTotal: orderData.total,
          pointsEarned,
          pointsRate: this.pointsPerRupee,
          status: orderData.status || 'pending',
          items: orderData.items || []
        });
      }

      return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    } catch (error) {
      console.error('Error getting orders with points:', error);
      return [];
    }
  }

  /**
   * Subscribe to user points updates
   */
  subscribeToUserPoints(userId: string, callback: (history: UserPointsHistory) => void): Unsubscribe {
    const q = query(
      collection(db, 'pointsTransactions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const history = await this.getUserPointsHistory(userId);
      callback(history);
    });
  }

  /**
   * Update user points (internal)
   */
  private async updateUserPoints(userId: string, newBalance: number): Promise<void> {
    try {
      const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDocRef = doc(db, 'users', userSnapshot.docs[0].id);
        await updateDoc(userDocRef, {
          points: newBalance,
          lastPointsUpdate: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }

  /**
   * Get points by date range
   */
  async getPointsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<PointsTransaction[]> {
    try {
      const q = query(
        collection(db, 'pointsTransactions'),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as PointsTransaction[];
    } catch (error) {
      console.error('Error getting points by date range:', error);
      return [];
    }
  }
}

export const pointsHistoryManager = new PointsHistoryManager();
