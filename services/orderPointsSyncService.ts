// Order Points Sync Service - Ensures points from orders are properly synced to user account
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface OrderPointsSync {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  totalPointsFromOrders: number;
  lastSyncedAt: Date;
}

/**
 * Calculate total points earned from all user orders
 */
export async function calculateTotalPointsFromOrders(userId: string): Promise<number> {
  try {
    console.log('📊 Calculating total points from orders for user:', userId);
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    let totalPoints = 0;
    let orderCount = 0;
    
    snapshot.forEach((doc) => {
      const order = doc.data();
      const pointsEarned = order.pointsEarned || Math.floor(order.total / 10);
      totalPoints += pointsEarned;
      orderCount++;
    });
    
    console.log(`✅ Calculated ${totalPoints} points from ${orderCount} orders`);
    return totalPoints;
  } catch (error) {
    console.error('❌ Error calculating points from orders:', error);
    return 0;
  }
}

/**
 * Sync user's total points from all orders
 */
export async function syncUserPointsFromOrders(userId: string): Promise<{
  success: boolean;
  totalPoints: number;
  totalOrders: number;
  totalSpent: number;
}> {
  try {
    console.log('🔄 Syncing user points from orders:', userId);
    
    // Get all user orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    let totalPoints = 0;
    let totalSpent = 0;
    let orderCount = 0;
    
    snapshot.forEach((doc) => {
      const order = doc.data();
      const pointsEarned = order.pointsEarned || Math.floor(order.total / 10);
      totalPoints += pointsEarned;
      totalSpent += order.total || 0;
      orderCount++;
    });
    
    console.log(`📊 Order stats: ${orderCount} orders, ₹${totalSpent} spent, ${totalPoints} points`);
    
    // Update user points in userPoints collection
    const userPointsRef = doc(db, 'userPoints', userId);
    const userPointsDoc = await getDoc(userPointsRef);
    
    if (userPointsDoc.exists()) {
      const currentData = userPointsDoc.data();
      const currentPoints = currentData.points || 0;
      
      // Only update if calculated points are higher (to preserve manually added points)
      if (totalPoints > currentPoints) {
        await updateDoc(userPointsRef, {
          points: totalPoints,
          totalPointsEarned: totalPoints,
          totalOrders: orderCount,
          totalSpent: totalSpent,
          lastSyncedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Updated user points: ${currentPoints} → ${totalPoints}`);
      } else {
        console.log(`✅ User points already up to date: ${currentPoints}`);
      }
    } else {
      // Create new user points record
      const tier = totalPoints >= 3000 ? 'platinum' : 
                   totalPoints >= 1500 ? 'gold' : 
                   totalPoints >= 500 ? 'silver' : 'bronze';
      
      await setDoc(userPointsRef, {
        userId,
        points: totalPoints,
        totalPointsEarned: totalPoints,
        tier,
        totalOrders: orderCount,
        totalSpent: totalSpent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString()
      });
      console.log(`✅ Created user points record: ${totalPoints} points, tier: ${tier}`);
    }
    
    return {
      success: true,
      totalPoints,
      totalOrders: orderCount,
      totalSpent
    };
  } catch (error) {
    console.error('❌ Error syncing user points from orders:', error);
    return {
      success: false,
      totalPoints: 0,
      totalOrders: 0,
      totalSpent: 0
    };
  }
}

/**
 * Get user's order statistics
 */
export async function getUserOrderStats(userId: string): Promise<{
  totalOrders: number;
  totalSpent: number;
  totalPointsEarned: number;
  averageOrderValue: number;
}> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    let totalPoints = 0;
    let totalSpent = 0;
    let orderCount = 0;
    
    snapshot.forEach((doc) => {
      const order = doc.data();
      const pointsEarned = order.pointsEarned || Math.floor(order.total / 10);
      totalPoints += pointsEarned;
      totalSpent += order.total || 0;
      orderCount++;
    });
    
    return {
      totalOrders: orderCount,
      totalSpent,
      totalPointsEarned: totalPoints,
      averageOrderValue: orderCount > 0 ? totalSpent / orderCount : 0
    };
  } catch (error) {
    console.error('Error getting user order stats:', error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      totalPointsEarned: 0,
      averageOrderValue: 0
    };
  }
}

/**
 * Verify and fix any missing points from orders
 */
export async function verifyAndFixUserPoints(userId: string): Promise<{
  success: boolean;
  message: string;
  pointsAdded: number;
}> {
  try {
    console.log('🔍 Verifying user points for:', userId);
    
    // Calculate points from orders
    const pointsFromOrders = await calculateTotalPointsFromOrders(userId);
    
    // Get current points
    const userPointsRef = doc(db, 'userPoints', userId);
    const userPointsDoc = await getDoc(userPointsRef);
    
    if (!userPointsDoc.exists()) {
      // No points record, create one
      await syncUserPointsFromOrders(userId);
      return {
        success: true,
        message: `Created points record with ${pointsFromOrders} points`,
        pointsAdded: pointsFromOrders
      };
    }
    
    const currentPoints = userPointsDoc.data().points || 0;
    
    if (pointsFromOrders > currentPoints) {
      // Missing points, fix it
      const pointsToAdd = pointsFromOrders - currentPoints;
      await syncUserPointsFromOrders(userId);
      return {
        success: true,
        message: `Added ${pointsToAdd} missing points`,
        pointsAdded: pointsToAdd
      };
    }
    
    return {
      success: true,
      message: 'Points are correct',
      pointsAdded: 0
    };
  } catch (error) {
    console.error('Error verifying user points:', error);
    return {
      success: false,
      message: 'Failed to verify points',
      pointsAdded: 0
    };
  }
}

export const orderPointsSyncService = {
  calculateTotalPointsFromOrders,
  syncUserPointsFromOrders,
  getUserOrderStats,
  verifyAndFixUserPoints
};
