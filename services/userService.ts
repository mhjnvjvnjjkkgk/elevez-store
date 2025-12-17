// Comprehensive User Management Service
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { loyaltyRulesService } from './loyaltyRulesService';

export interface User {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  totalPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  orderCount: number;
  totalSpent: number;
  createdAt: any;
  lastLogin: any;
  source: 'exit-intent' | 'signup' | 'order' | 'manual';
  subscribed?: boolean;
}

export interface PointsTransaction {
  id?: string;
  userId: string;
  type: 'earn' | 'redeem' | 'admin-adjustment';
  points: number;
  reason: string;
  orderId?: string;
  timestamp: any;
  adminNote?: string;
}

// Calculate tier based on total points
// ✅ NOW USES DYNAMIC LOYALTY RULES - DEPRECATED
// @deprecated Use loyaltyRulesService.calculateTier() instead
export async function calculateTier(points: number): Promise<User['tier']> {
  const tierConfig = await loyaltyRulesService.calculateTier(points);
  return tierConfig.id as User['tier'];
}

// Get tier multiplier for points earning
// ✅ NOW USES DYNAMIC LOYALTY RULES - DEPRECATED
// @deprecated Use loyaltyRulesService.getTierBenefits() instead
export async function getTierMultiplier(tier: User['tier']): Promise<number> {
  const benefits = await loyaltyRulesService.getTierBenefits(tier);
  return benefits?.earningMultiplier || 1;
}

// Ensure user exists in database (create if not exists)
export async function ensureUserExists(
  email: string,
  uid?: string,
  additionalData?: Partial<User>
): Promise<User> {
  try {
    // Try to find existing user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // User exists, update lastLogin
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User;
      
      await updateDoc(doc(db, 'users', userDoc.id), {
        lastLogin: serverTimestamp(),
        ...additionalData
      });

      return { ...userData, uid: userDoc.id };
    }

    // User doesn't exist, create new user
    const newUser: Omit<User, 'uid'> = {
      email,
      totalPoints: 0,
      tier: 'bronze',
      orderCount: 0,
      totalSpent: 0,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      source: 'signup',
      subscribed: false,
      ...additionalData
    };

    if (uid) {
      // Use provided UID as document ID
      await setDoc(doc(db, 'users', uid), newUser);
      return { ...newUser, uid, createdAt: new Date(), lastLogin: new Date() };
    } else {
      // Auto-generate ID
      const docRef = await addDoc(collection(db, 'users'), newUser);
      return { ...newUser, uid: docRef.id, createdAt: new Date(), lastLogin: new Date() };
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { ...userDoc.data(), uid: userDoc.id } as User;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Get user by UID
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return { ...userDoc.data(), uid: userDoc.id } as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Update user points (with transaction logging)
export async function updateUserPoints(
  userId: string,
  pointsChange: number,
  reason: string,
  type: 'earn' | 'redeem' | 'admin-adjustment' = 'earn',
  orderId?: string,
  adminNote?: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentPoints = userDoc.data().totalPoints || 0;
    const newPoints = Math.max(0, currentPoints + pointsChange);
    // ✅ Use dynamic loyalty rules for tier calculation
    const tierConfig = await loyaltyRulesService.calculateTier(newPoints);
    const newTier = tierConfig.id as User['tier'];

    // Update user points and tier
    await updateDoc(userRef, {
      totalPoints: newPoints,
      tier: newTier,
      lastUpdated: serverTimestamp()
    });

    // Log transaction
    await addDoc(collection(db, 'pointsTransactions'), {
      userId,
      type,
      points: pointsChange,
      reason,
      orderId,
      adminNote,
      timestamp: serverTimestamp()
    });

    console.log(`Updated user ${userId} points: ${currentPoints} → ${newPoints}`);
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
}

// Award points for order
export async function awardOrderPoints(
  userId: string,
  orderTotal: number,
  orderId: string
): Promise<number> {
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // ✅ Calculate points using dynamic loyalty rules with tier multiplier
    const pointsEarned = await loyaltyRulesService.calculatePointsEarned(orderTotal, user.tier);

    // Award points
    await updateUserPoints(
      userId,
      pointsEarned,
      `Order #${orderId} - ₹${orderTotal}`,
      'earn',
      orderId
    );

    // Update order count and total spent
    await updateDoc(doc(db, 'users', userId), {
      orderCount: increment(1),
      totalSpent: increment(orderTotal)
    });

    return pointsEarned;
  } catch (error) {
    console.error('Error awarding order points:', error);
    throw error;
  }
}

// Get all users (for admin panel)
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    })) as User[];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Get user's points history
export async function getUserPointsHistory(userId: string): Promise<PointsTransaction[]> {
  try {
    const transactionsRef = collection(db, 'pointsTransactions');
    const q = query(transactionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as PointsTransaction[];
  } catch (error) {
    console.error('Error getting points history:', error);
    return [];
  }
}

// Admin: Manually adjust user points
export async function adminAdjustPoints(
  userId: string,
  pointsChange: number,
  adminNote: string
): Promise<void> {
  await updateUserPoints(
    userId,
    pointsChange,
    'Admin adjustment',
    'admin-adjustment',
    undefined,
    adminNote
  );
}

// Get user profile (for App.tsx compatibility)
export async function getUserProfile(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

// Get user orders (for App.tsx compatibility)
export async function getUserOrders(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: orders };
  } catch (error: any) {
    console.error('Error getting user orders:', error);
    return { success: false, error: error.message };
  }
}
