// Admin Points Management Service
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getLoyaltyProfile, logPointsTransaction, calculateTier } from './loyaltyService';
import { loyaltyRulesService } from './loyaltyRulesService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AdminPointsAction {
  id?: string;
  adminId: string;
  userId: string;
  action: 'add' | 'remove' | 'reset';
  points: number;
  reason: string;
  notes?: string;
  timestamp: Timestamp | Date;
  metadata?: any;
}

export interface AdminAuditLog {
  id?: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  targetCodeId?: string;
  changes: {
    [key: string]: {
      before: any;
      after: any;
    };
  };
  timestamp: any;
  metadata?: any;
}

export interface PointsAllocationResult {
  success: boolean;
  message: string;
  previousPoints: number;
  newPoints: number;
  tierChanged: boolean;
  previousTier?: string;
  newTier?: string;
}

// ============================================
// POINTS ALLOCATION
// ============================================

/**
 * Add points to a user (admin action)
 */
export const adminAddPoints = async (
  adminId: string,
  userId: string,
  points: number,
  reason: string,
  notes?: string
): Promise<PointsAllocationResult> => {
  try {
    const profile = await getLoyaltyProfile(userId);
    if (!profile) {
      return {
        success: false,
        message: 'User loyalty profile not found',
        previousPoints: 0,
        newPoints: 0,
        tierChanged: false
      };
    }

    const previousPoints = profile.points;
    const previousTier = profile.tier;
    const newPoints = previousPoints + points;
    const newTotalPoints = profile.totalPointsEarned + points;
    // ✅ Use dynamic loyalty rules for tier calculation
    const tierConfig = await loyaltyRulesService.calculateTier(newTotalPoints);
    const newTier = tierConfig.name;

    // Update loyalty profile
    const profileRef = doc(db, 'loyaltyProfiles', userId);
    await updateDoc(profileRef, {
      points: newPoints,
      totalPointsEarned: newTotalPoints,
      tier: newTier,
      lastUpdated: serverTimestamp()
    });

    // Log transaction
    await logPointsTransaction({
      userId,
      type: 'earn',
      points,
      reason: `[ADMIN] ${reason}`,
      timestamp: serverTimestamp(),
      metadata: {
        adminId,
        notes,
        isAdminAction: true
      }
    });

    // Log admin action
    await logAdminAction(adminId, 'ADD_POINTS', userId, {
      points: { before: previousPoints, after: newPoints },
      tier: { before: previousTier, after: newTier }
    }, { reason, notes });

    return {
      success: true,
      message: `Successfully added ${points} points to user`,
      previousPoints,
      newPoints,
      tierChanged: previousTier !== newTier,
      previousTier,
      newTier
    };
  } catch (error) {
    console.error('Error adding points:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      previousPoints: 0,
      newPoints: 0,
      tierChanged: false
    };
  }
};

/**
 * Remove points from a user (admin action)
 */
export const adminRemovePoints = async (
  adminId: string,
  userId: string,
  points: number,
  reason: string,
  notes?: string
): Promise<PointsAllocationResult> => {
  try {
    const profile = await getLoyaltyProfile(userId);
    if (!profile) {
      return {
        success: false,
        message: 'User loyalty profile not found',
        previousPoints: 0,
        newPoints: 0,
        tierChanged: false
      };
    }

    const previousPoints = profile.points;
    const previousTier = profile.tier;
    const newPoints = Math.max(0, previousPoints - points);
    const pointsRemoved = previousPoints - newPoints;
    const newTotalPoints = Math.max(0, profile.totalPointsEarned - pointsRemoved);
    // ✅ Use dynamic loyalty rules for tier calculation
    const tierConfig = await loyaltyRulesService.calculateTier(newTotalPoints);
    const newTier = tierConfig.name;

    // Update loyalty profile
    const profileRef = doc(db, 'loyaltyProfiles', userId);
    await updateDoc(profileRef, {
      points: newPoints,
      totalPointsEarned: newTotalPoints,
      tier: newTier,
      lastUpdated: serverTimestamp()
    });

    // Log transaction
    await logPointsTransaction({
      userId,
      type: 'redeem',
      points: pointsRemoved,
      reason: `[ADMIN] ${reason}`,
      timestamp: serverTimestamp(),
      metadata: {
        adminId,
        notes,
        isAdminAction: true
      }
    });

    // Log admin action
    await logAdminAction(adminId, 'REMOVE_POINTS', userId, {
      points: { before: previousPoints, after: newPoints },
      tier: { before: previousTier, after: newTier }
    }, { reason, notes });

    return {
      success: true,
      message: `Successfully removed ${pointsRemoved} points from user`,
      previousPoints,
      newPoints,
      tierChanged: previousTier !== newTier,
      previousTier,
      newTier
    };
  } catch (error) {
    console.error('Error removing points:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      previousPoints: 0,
      newPoints: 0,
      tierChanged: false
    };
  }
};

/**
 * Reset points for a user (admin action)
 */
export const adminResetPoints = async (
  adminId: string,
  userId: string,
  reason: string,
  notes?: string
): Promise<PointsAllocationResult> => {
  try {
    const profile = await getLoyaltyProfile(userId);
    if (!profile) {
      return {
        success: false,
        message: 'User loyalty profile not found',
        previousPoints: 0,
        newPoints: 0,
        tierChanged: false
      };
    }

    const previousPoints = profile.points;
    const previousTier = profile.tier;
    const newPoints = 0;
    const newTier = 'Bronze';

    // Update loyalty profile
    const profileRef = doc(db, 'loyaltyProfiles', userId);
    await updateDoc(profileRef, {
      points: newPoints,
      tier: newTier,
      lastUpdated: serverTimestamp()
    });

    // Log transaction
    await logPointsTransaction({
      userId,
      type: 'redeem',
      points: previousPoints,
      reason: `[ADMIN] ${reason}`,
      timestamp: serverTimestamp(),
      metadata: {
        adminId,
        notes,
        isAdminAction: true,
        resetAction: true
      }
    });

    // Log admin action
    await logAdminAction(adminId, 'RESET_POINTS', userId, {
      points: { before: previousPoints, after: newPoints },
      tier: { before: previousTier, after: newTier }
    }, { reason, notes });

    return {
      success: true,
      message: `Successfully reset points for user`,
      previousPoints,
      newPoints,
      tierChanged: previousTier !== newTier,
      previousTier,
      newTier
    };
  } catch (error) {
    console.error('Error resetting points:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      previousPoints: 0,
      newPoints: 0,
      tierChanged: false
    };
  }
};

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log an admin action
 */
export const logAdminAction = async (
  adminId: string,
  action: string,
  targetUserId?: string,
  changes?: AdminAuditLog['changes'],
  metadata?: any
): Promise<string> => {
  try {
    const auditLog: AdminAuditLog = {
      adminId,
      action,
      targetUserId,
      changes: changes || {},
      timestamp: serverTimestamp(),
      metadata
    };

    const logsRef = collection(db, 'adminAuditLog');
    const docRef = await addDoc(logsRef, auditLog);
    return docRef.id;
  } catch (error) {
    console.error('Error logging admin action:', error);
    throw error;
  }
};

/**
 * Get audit logs for a specific admin
 */
export const getAdminAuditLogs = async (adminId: string, limit: number = 100): Promise<AdminAuditLog[]> => {
  try {
    const logsRef = collection(db, 'adminAuditLog');
    const q = query(
      logsRef,
      where('adminId', '==', adminId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as AdminAuditLog));
  } catch (error) {
    console.error('Error getting admin audit logs:', error);
    throw error;
  }
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (userId: string, limit: number = 100): Promise<AdminAuditLog[]> => {
  try {
    const logsRef = collection(db, 'adminAuditLog');
    const q = query(
      logsRef,
      where('targetUserId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as AdminAuditLog));
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    throw error;
  }
};

/**
 * Get all audit logs (admin only)
 */
export const getAllAuditLogs = async (limit: number = 500): Promise<AdminAuditLog[]> => {
  try {
    const logsRef = collection(db, 'adminAuditLog');
    const q = query(logsRef, orderBy('timestamp', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as AdminAuditLog));
  } catch (error) {
    console.error('Error getting all audit logs:', error);
    throw error;
  }
};

// ============================================
// ADMIN ANALYTICS
// ============================================

export interface AdminPointsAnalytics {
  totalPointsAllocated: number;
  totalPointsRemoved: number;
  totalAdminActions: number;
  actionsByType: {
    [key: string]: number;
  };
  topAdmins: Array<{
    adminId: string;
    actionCount: number;
  }>;
  recentActions: AdminAuditLog[];
}

/**
 * Get admin points analytics
 */
export const getAdminPointsAnalytics = async (): Promise<AdminPointsAnalytics> => {
  try {
    const logsRef = collection(db, 'adminAuditLog');
    const snapshot = await getDocs(logsRef);

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminAuditLog));

    const actionsByType: { [key: string]: number } = {};
    const adminActionCounts: { [key: string]: number } = {};
    let totalPointsAllocated = 0;
    let totalPointsRemoved = 0;

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      adminActionCounts[log.adminId] = (adminActionCounts[log.adminId] || 0) + 1;

      if (log.changes.points) {
        const before = log.changes.points.before || 0;
        const after = log.changes.points.after || 0;
        if (after > before) {
          totalPointsAllocated += (after - before);
        } else {
          totalPointsRemoved += (before - after);
        }
      }
    });

    const topAdmins = Object.entries(adminActionCounts)
      .map(([adminId, count]) => ({ adminId, actionCount: count }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    const recentActions = logs.slice(0, 20);

    return {
      totalPointsAllocated,
      totalPointsRemoved,
      totalAdminActions: logs.length,
      actionsByType,
      topAdmins,
      recentActions
    };
  } catch (error) {
    console.error('Error getting admin points analytics:', error);
    throw error;
  }
};
