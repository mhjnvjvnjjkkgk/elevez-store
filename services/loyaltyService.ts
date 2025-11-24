// SECTION 1: Data Architecture & Firebase Backend
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyProfile {
  userId: string;
  points: number;
  totalPointsEarned: number;
  tier: TierLevel;
  joinedAt: any;
  lastUpdated: any;
  phoneNumber?: string;
  socialShares: {
    instagram: boolean;
    whatsapp: boolean;
    facebook: boolean;
  };
}

export interface PointsTransaction {
  id?: string;
  userId: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string;
  orderId?: string;
  discountCodeId?: string;
  timestamp: any;
  metadata?: any;
}

export interface DiscountCode {
  id?: string;
  code: string;
  userId: string;
  pointsCost: number;
  discountAmount: number;
  discountType: 'fixed' | 'percentage';
  isActive: boolean;
  isUsed: boolean;
  createdAt: any;
  expiresAt: any;
  usedAt?: any;
}

export interface TierConfig {
  name: TierLevel;
  minPoints: number;
  color: string;
  gradient: string;
  benefits: string[];
  icon: string;
}

// ============================================
// TIER CONFIGURATION
// ============================================

export const TIER_CONFIGS: TierConfig[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
    benefits: ['Earn 1 point per ₹10 spent', 'Birthday bonus: 50 points', 'Early sale access'],
    icon: '🥉'
  },
  {
    name: 'Silver',
    minPoints: 500,
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)',
    benefits: ['Earn 1.5 points per ₹10 spent', 'Birthday bonus: 100 points', 'Free shipping on orders above ₹999', 'Exclusive deals'],
    icon: '🥈'
  },
  {
    name: 'Gold',
    minPoints: 1500,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    benefits: ['Earn 2 points per ₹10 spent', 'Birthday bonus: 200 points', 'Free shipping on all orders', 'Priority support', '10% extra discount on sales'],
    icon: '🥇'
  },
  {
    name: 'Platinum',
    minPoints: 3000,
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B9B9B9 100%)',
    benefits: ['Earn 3 points per ₹10 spent', 'Birthday bonus: 500 points', 'Free express shipping', 'VIP support', '15% extra discount on sales', 'Exclusive products access'],
    icon: '💎'
  }
];

// ============================================
// POINTS EARNING RULES
// ============================================

export const POINTS_RULES = {
  SIGNUP: 100,
  PHONE_NUMBER: 100,
  INSTAGRAM_SHARE: 50,
  WHATSAPP_SHARE: 50,
  FACEBOOK_SHARE: 50,
  ORDER_BASE: 1, // 1 point per ₹10 spent (multiplied by tier)
  REVIEW: 25,
  REFERRAL: 200
};

// ============================================
// DISCOUNT REDEMPTION OPTIONS
// ============================================

export const REDEMPTION_OPTIONS = [
  { points: 200, discount: 10, type: 'fixed' as const },
  { points: 500, discount: 30, type: 'fixed' as const },
  { points: 1000, discount: 75, type: 'fixed' as const },
  { points: 1500, discount: 125, type: 'fixed' as const },
  { points: 2000, discount: 200, type: 'fixed' as const },
  { points: 3000, discount: 350, type: 'fixed' as const }
];

// ============================================
// LOYALTY PROFILE MANAGEMENT
// ============================================

export async function createLoyaltyProfile(userId: string, email: string): Promise<LoyaltyProfile> {
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  
  const profile: LoyaltyProfile = {
    userId,
    points: POINTS_RULES.SIGNUP,
    totalPointsEarned: POINTS_RULES.SIGNUP,
    tier: 'Bronze',
    joinedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
    socialShares: {
      instagram: false,
      whatsapp: false,
      facebook: false
    }
  };

  await setDoc(profileRef, profile);
  
  // Log signup bonus
  await logPointsTransaction({
    userId,
    type: 'earn',
    points: POINTS_RULES.SIGNUP,
    reason: 'Sign-up bonus',
    timestamp: serverTimestamp()
  });

  return profile;
}

export async function getLoyaltyProfile(userId: string): Promise<LoyaltyProfile | null> {
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  const profileSnap = await getDoc(profileRef);
  
  if (profileSnap.exists()) {
    return profileSnap.data() as LoyaltyProfile;
  }
  
  return null;
}

// ============================================
// POINTS TRANSACTIONS
// ============================================

export async function logPointsTransaction(transaction: PointsTransaction): Promise<string> {
  const transactionsRef = collection(db, 'pointsTransactions');
  const docRef = await addDoc(transactionsRef, transaction);
  return docRef.id;
}

export async function getPointsHistory(userId: string, limit: number = 50): Promise<PointsTransaction[]> {
  const transactionsRef = collection(db, 'pointsTransactions');
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointsTransaction));
}

// ============================================
// TIER CALCULATION
// ============================================

export function calculateTier(totalPoints: number): TierLevel {
  for (let i = TIER_CONFIGS.length - 1; i >= 0; i--) {
    if (totalPoints >= TIER_CONFIGS[i].minPoints) {
      return TIER_CONFIGS[i].name;
    }
  }
  return 'Bronze';
}

export function getTierConfig(tier: TierLevel): TierConfig {
  return TIER_CONFIGS.find(t => t.name === tier) || TIER_CONFIGS[0];
}

export function getNextTier(currentTier: TierLevel): TierConfig | null {
  const currentIndex = TIER_CONFIGS.findIndex(t => t.name === currentTier);
  if (currentIndex < TIER_CONFIGS.length - 1) {
    return TIER_CONFIGS[currentIndex + 1];
  }
  return null;
}

export function getPointsToNextTier(currentPoints: number, currentTier: TierLevel): number {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 0;
  return Math.max(0, nextTier.minPoints - currentPoints);
}

// ============================================
// POINTS EARNING
// ============================================

export async function awardPoints(
  userId: string,
  points: number,
  reason: string,
  metadata?: any
): Promise<void> {
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  const profile = await getLoyaltyProfile(userId);
  
  if (!profile) throw new Error('Loyalty profile not found');

  const newPoints = profile.points + points;
  const newTotalPoints = profile.totalPointsEarned + points;
  const newTier = calculateTier(newTotalPoints);

  await updateDoc(profileRef, {
    points: newPoints,
    totalPointsEarned: newTotalPoints,
    tier: newTier,
    lastUpdated: serverTimestamp()
  });

  await logPointsTransaction({
    userId,
    type: 'earn',
    points,
    reason,
    timestamp: serverTimestamp(),
    metadata
  });
}

export async function awardOrderPoints(
  userId: string,
  orderTotal: number,
  orderId: string
): Promise<number> {
  const profile = await getLoyaltyProfile(userId);
  if (!profile) throw new Error('Loyalty profile not found');

  const tierConfig = getTierConfig(profile.tier);
  const tierMultiplier = TIER_CONFIGS.findIndex(t => t.name === profile.tier) + 1;
  
  // Calculate points: 1 point per ₹10 spent, multiplied by tier
  const basePoints = Math.floor(orderTotal / 10);
  const points = basePoints * tierMultiplier;

  await awardPoints(userId, points, `Order #${orderId}`, { orderId, orderTotal });
  
  return points;
}

// ============================================
// SOCIAL SHARING POINTS
// ============================================

export async function claimSocialSharePoints(
  userId: string,
  platform: 'instagram' | 'whatsapp' | 'facebook'
): Promise<boolean> {
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  const profile = await getLoyaltyProfile(userId);
  
  if (!profile) throw new Error('Loyalty profile not found');
  
  if (profile.socialShares[platform]) {
    return false; // Already claimed
  }

  const points = POINTS_RULES[`${platform.toUpperCase()}_SHARE` as keyof typeof POINTS_RULES] as number;
  
  await updateDoc(profileRef, {
    [`socialShares.${platform}`]: true
  });

  await awardPoints(userId, points, `Shared on ${platform}`);
  
  return true;
}

// ============================================
// PHONE NUMBER POINTS
// ============================================

export async function claimPhoneNumberPoints(userId: string, phoneNumber: string): Promise<boolean> {
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  const profile = await getLoyaltyProfile(userId);
  
  if (!profile) throw new Error('Loyalty profile not found');
  
  if (profile.phoneNumber) {
    return false; // Already claimed
  }

  await updateDoc(profileRef, {
    phoneNumber
  });

  await awardPoints(userId, POINTS_RULES.PHONE_NUMBER, 'Added phone number');
  
  return true;
}

// ============================================
// DISCOUNT CODE MANAGEMENT
// ============================================

export async function generateDiscountCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REWARD${random}${timestamp.substring(timestamp.length - 4)}`.toUpperCase();
}

export async function redeemPointsForDiscount(
  userId: string,
  pointsCost: number,
  discountAmount: number
): Promise<DiscountCode> {
  const profile = await getLoyaltyProfile(userId);
  
  if (!profile) throw new Error('Loyalty profile not found');
  if (profile.points < pointsCost) throw new Error('Insufficient points');

  // Deduct points
  const profileRef = doc(db, 'loyaltyProfiles', userId);
  await updateDoc(profileRef, {
    points: profile.points - pointsCost,
    lastUpdated: serverTimestamp()
  });

  // Generate discount code
  const code = await generateDiscountCode(userId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

  const discountCode: DiscountCode = {
    code,
    userId,
    pointsCost,
    discountAmount,
    discountType: 'fixed',
    isActive: true,
    isUsed: false,
    createdAt: serverTimestamp(),
    expiresAt: expiresAt.toISOString()
  };

  const codesRef = collection(db, 'discountCodes');
  const docRef = await addDoc(codesRef, discountCode);

  // Log transaction
  await logPointsTransaction({
    userId,
    type: 'redeem',
    points: pointsCost,
    reason: `Redeemed for ₹${discountAmount} discount`,
    discountCodeId: docRef.id,
    timestamp: serverTimestamp()
  });

  return { ...discountCode, id: docRef.id };
}

export async function validateDiscountCode(code: string, userId: string): Promise<DiscountCode | null> {
  const codesRef = collection(db, 'discountCodes');
  const q = query(
    codesRef,
    where('code', '==', code),
    where('userId', '==', userId),
    where('isActive', '==', true),
    where('isUsed', '==', false)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;

  const discountData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as DiscountCode;
  
  // Check expiry
  const expiryDate = new Date(discountData.expiresAt);
  if (expiryDate < new Date()) {
    return null;
  }

  return discountData;
}

export async function applyDiscountCode(codeId: string): Promise<void> {
  const codeRef = doc(db, 'discountCodes', codeId);
  await updateDoc(codeRef, {
    isUsed: true,
    usedAt: serverTimestamp()
  });
}

export async function getUserDiscountCodes(userId: string): Promise<DiscountCode[]> {
  const codesRef = collection(db, 'discountCodes');
  const q = query(
    codesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountCode));
}
