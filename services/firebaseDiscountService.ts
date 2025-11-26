// Firebase-backed Discount Code Service with Real-Time Tracking
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  increment,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FirebaseDiscountCode {
  id?: string;
  code: string;
  percentage: number;
  type: 'newsletter' | 'exit-intent' | 'loyalty' | 'referral' | 'admin';
  createdBy: string; // Admin UID
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  metadata?: {
    campaign?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface DiscountCodeUsage {
  id?: string;
  codeId: string;
  code: string;
  userId: string;
  usedAt: Timestamp | Date;
  orderTotal: number;
  discountAmount: number;
  orderId?: string;
  metadata?: any;
}

export interface DiscountAnalytics {
  totalCodesCreated: number;
  totalCodesActive: number;
  totalCodesExpired: number;
  totalUsages: number;
  totalDiscountGiven: number;
  averageDiscountPerCode: number;
  mostUsedCode: string | null;
  codesByType: {
    newsletter: number;
    'exit-intent': number;
    loyalty: number;
    referral: number;
    admin: number;
  };
}

// ============================================
// DISCOUNT CODE MANAGEMENT
// ============================================

/**
 * Create a new discount code in Firebase
 */
export const createDiscountCode = async (
  code: string,
  percentage: number,
  type: FirebaseDiscountCode['type'],
  adminId: string,
  maxUses: number = 1,
  expiryDays: number = 30,
  description?: string,
  metadata?: any
): Promise<FirebaseDiscountCode> => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const discountCode: FirebaseDiscountCode = {
      code: code.toUpperCase(),
      percentage,
      type,
      createdBy: adminId,
      createdAt: serverTimestamp(),
      expiresAt,
      maxUses,
      usedCount: 0,
      isActive: true,
      description,
      metadata
    };

    const codesRef = collection(db, 'discountCodes');
    const docRef = await addDoc(codesRef, discountCode);

    return { ...discountCode, id: docRef.id };
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
};

/**
 * Get a discount code by ID
 */
export const getDiscountCode = async (codeId: string): Promise<FirebaseDiscountCode | null> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    const codeSnap = await getDoc(codeRef);

    if (codeSnap.exists()) {
      return { id: codeSnap.id, ...codeSnap.data() } as FirebaseDiscountCode;
    }
    return null;
  } catch (error) {
    console.error('Error getting discount code:', error);
    throw error;
  }
};

/**
 * Get a discount code by code string
 */
export const getDiscountCodeByCode = async (code: string): Promise<FirebaseDiscountCode | null> => {
  try {
    const codesRef = collection(db, 'discountCodes');
    const q = query(codesRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirebaseDiscountCode;
    }
    return null;
  } catch (error) {
    console.error('Error getting discount code by code:', error);
    throw error;
  }
};

/**
 * Update a discount code
 */
export const updateDiscountCode = async (
  codeId: string,
  updates: Partial<FirebaseDiscountCode>
): Promise<void> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    await updateDoc(codeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
};

/**
 * Delete a discount code
 */
export const deleteDiscountCode = async (codeId: string): Promise<void> => {
  try {
    const codeRef = doc(db, 'discountCodes', codeId);
    await deleteDoc(codeRef);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
};

/**
 * Get all discount codes with optional filters
 */
export const getAllDiscountCodes = async (
  filters?: {
    type?: FirebaseDiscountCode['type'];
    isActive?: boolean;
    createdBy?: string;
  }
): Promise<FirebaseDiscountCode[]> => {
  try {
    let q = query(collection(db, 'discountCodes'));

    if (filters) {
      const conditions = [];
      if (filters.type) conditions.push(where('type', '==', filters.type));
      if (filters.isActive !== undefined) conditions.push(where('isActive', '==', filters.isActive));
      if (filters.createdBy) conditions.push(where('createdBy', '==', filters.createdBy));

      if (conditions.length > 0) {
        q = query(collection(db, 'discountCodes'), ...conditions, orderBy('createdAt', 'desc'));
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseDiscountCode));
  } catch (error) {
    console.error('Error getting all discount codes:', error);
    throw error;
  }
};

/**
 * Validate and use a discount code
 */
export const validateAndUseDiscountCode = async (
  code: string,
  userId: string,
  orderTotal: number
): Promise<{ valid: boolean; percentage: number; message: string; codeId?: string }> => {
  try {
    const discountCode = await getDiscountCodeByCode(code);

    if (!discountCode) {
      return { valid: false, percentage: 0, message: 'Invalid discount code' };
    }

    if (!discountCode.isActive) {
      return { valid: false, percentage: 0, message: 'Discount code is inactive' };
    }

    const expiryDate = new Date(discountCode.expiresAt);
    if (expiryDate < new Date()) {
      return { valid: false, percentage: 0, message: 'Discount code has expired' };
    }

    if (discountCode.usedCount >= discountCode.maxUses) {
      return { valid: false, percentage: 0, message: 'Discount code has reached maximum uses' };
    }

    // Record usage
    const discountAmount = (orderTotal * discountCode.percentage) / 100;
    await recordCodeUsage(discountCode.id!, code, userId, orderTotal, discountAmount);

    // Increment usage count
    await updateDiscountCode(discountCode.id!, {
      usedCount: increment(1)
    });

    return {
      valid: true,
      percentage: discountCode.percentage,
      message: `${discountCode.percentage}% discount applied!`,
      codeId: discountCode.id
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { valid: false, percentage: 0, message: 'Error validating code' };
  }
};

// ============================================
// USAGE TRACKING
// ============================================

/**
 * Record a discount code usage
 */
export const recordCodeUsage = async (
  codeId: string,
  code: string,
  userId: string,
  orderTotal: number,
  discountAmount: number,
  orderId?: string
): Promise<string> => {
  try {
    const usage: DiscountCodeUsage = {
      codeId,
      code,
      userId,
      usedAt: serverTimestamp(),
      orderTotal,
      discountAmount,
      orderId
    };

    const usageRef = collection(db, 'discountCodeUsage');
    const docRef = await addDoc(usageRef, usage);
    return docRef.id;
  } catch (error) {
    console.error('Error recording code usage:', error);
    throw error;
  }
};

/**
 * Get usage history for a discount code
 */
export const getCodeUsageHistory = async (codeId: string): Promise<DiscountCodeUsage[]> => {
  try {
    const usageRef = collection(db, 'discountCodeUsage');
    const q = query(usageRef, where('codeId', '==', codeId), orderBy('usedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountCodeUsage));
  } catch (error) {
    console.error('Error getting code usage history:', error);
    throw error;
  }
};

/**
 * Get usage history for a user
 */
export const getUserCodeUsageHistory = async (userId: string): Promise<DiscountCodeUsage[]> => {
  try {
    const usageRef = collection(db, 'discountCodeUsage');
    const q = query(usageRef, where('userId', '==', userId), orderBy('usedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountCodeUsage));
  } catch (error) {
    console.error('Error getting user code usage history:', error);
    throw error;
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get discount analytics
 */
export const getDiscountAnalytics = async (): Promise<DiscountAnalytics> => {
  try {
    const codes = await getAllDiscountCodes();
    const usageRef = collection(db, 'discountCodeUsage');
    const usageSnapshot = await getDocs(usageRef);

    const totalUsages = usageSnapshot.size;
    const totalDiscountGiven = usageSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().discountAmount || 0);
    }, 0);

    const codesByType = {
      newsletter: 0,
      'exit-intent': 0,
      loyalty: 0,
      referral: 0,
      admin: 0
    };

    codes.forEach(code => {
      codesByType[code.type]++;
    });

    const now = new Date();
    const activeCount = codes.filter(c => c.isActive && new Date(c.expiresAt) > now).length;
    const expiredCount = codes.filter(c => new Date(c.expiresAt) <= now).length;

    // Find most used code
    const codeUsageCounts: { [key: string]: number } = {};
    usageSnapshot.docs.forEach(doc => {
      const code = doc.data().code;
      codeUsageCounts[code] = (codeUsageCounts[code] || 0) + 1;
    });

    const mostUsedCode = Object.entries(codeUsageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalCodesCreated: codes.length,
      totalCodesActive: activeCount,
      totalCodesExpired: expiredCount,
      totalUsages,
      totalDiscountGiven,
      averageDiscountPerCode: codes.length > 0 ? totalDiscountGiven / codes.length : 0,
      mostUsedCode,
      codesByType
    };
  } catch (error) {
    console.error('Error getting discount analytics:', error);
    throw error;
  }
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

/**
 * Subscribe to real-time discount code updates
 */
export const subscribeToDiscountCodes = (
  callback: (codes: FirebaseDiscountCode[]) => void,
  filters?: {
    type?: FirebaseDiscountCode['type'];
    isActive?: boolean;
  }
): (() => void) => {
  try {
    let q = query(collection(db, 'discountCodes'), orderBy('createdAt', 'desc'));

    if (filters) {
      const conditions = [];
      if (filters.type) conditions.push(where('type', '==', filters.type));
      if (filters.isActive !== undefined) conditions.push(where('isActive', '==', filters.isActive));

      if (conditions.length > 0) {
        q = query(collection(db, 'discountCodes'), ...conditions, orderBy('createdAt', 'desc'));
      }
    }

    const unsubscribe = onSnapshot(q, snapshot => {
      const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirebaseDiscountCode));
      callback(codes);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to discount codes:', error);
    return () => {};
  }
};

/**
 * Subscribe to real-time usage updates for a code
 */
export const subscribeToCodeUsage = (
  codeId: string,
  callback: (usage: DiscountCodeUsage[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'discountCodeUsage'),
      where('codeId', '==', codeId),
      orderBy('usedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const usage = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountCodeUsage));
      callback(usage);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to code usage:', error);
    return () => {};
  }
};

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Generate and create bulk discount codes
 */
export const generateBulkDiscountCodes = async (
  count: number,
  percentage: number,
  type: FirebaseDiscountCode['type'],
  adminId: string,
  maxUses: number = 1,
  expiryDays: number = 30,
  prefix: string = 'BULK'
): Promise<FirebaseDiscountCode[]> => {
  try {
    const codes: FirebaseDiscountCode[] = [];

    for (let i = 0; i < count; i++) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomCode = '';
      for (let j = 0; j < 8; j++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const code = `${prefix}${randomCode}`;
      const discountCode = await createDiscountCode(
        code,
        percentage,
        type,
        adminId,
        maxUses,
        expiryDays,
        `Bulk generated code ${i + 1} of ${count}`
      );

      codes.push(discountCode);
    }

    return codes;
  } catch (error) {
    console.error('Error generating bulk discount codes:', error);
    throw error;
  }
};

/**
 * Deactivate all codes of a certain type
 */
export const deactivateCodesByType = async (type: FirebaseDiscountCode['type']): Promise<number> => {
  try {
    const codes = await getAllDiscountCodes({ type });
    let count = 0;

    for (const code of codes) {
      if (code.id) {
        await updateDiscountCode(code.id, { isActive: false });
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error('Error deactivating codes by type:', error);
    throw error;
  }
};
