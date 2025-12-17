// SECTION 2: Points Engine & Business Logic (React Hooks)
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  LoyaltyProfile,
  PointsTransaction,
  DiscountCode,
  TierLevel,
  getLoyaltyProfile,
  createLoyaltyProfile,
  getPointsHistory,
  awardPoints,
  awardOrderPoints,
  claimSocialSharePoints,
  claimPhoneNumberPoints,
  redeemPointsForDiscount,
  validateDiscountCode,
  applyDiscountCode,
  getUserDiscountCodes,
  getTierConfig,
  getNextTier,
  getPointsToNextTier,
  POINTS_RULES
} from '../services/loyaltyService';
import { loyaltyRulesService, RedemptionRule } from '../services/loyaltyRulesService';

export function useLoyalty() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [redemptionOptions, setRedemptionOptions] = useState<RedemptionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dynamic redemption options from Firebase
  useEffect(() => {
    const loadRedemptionOptions = async () => {
      const rules = await loyaltyRulesService.getRules();
      setRedemptionOptions(rules.redemption);
    };
    loadRedemptionOptions();

    // Subscribe to real-time updates
    const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
      setRedemptionOptions(rules.redemption);
    });

    return () => unsubscribe();
  }, []);

  // Load loyalty profile with real-time updates
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading loyalty profile for:', user.uid);

      let userProfile = await getLoyaltyProfile(user.uid);

      // Create profile if doesn't exist
      if (!userProfile) {
        console.log('Creating new loyalty profile...');
        userProfile = await createLoyaltyProfile(user.uid, user.email || '');
      }

      setProfile(userProfile);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading loyalty profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load transactions history
  const loadTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const history = await getPointsHistory(user.uid);
      setTransactions(history);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
    }
  }, [user]);

  // Load discount codes
  const loadDiscountCodes = useCallback(async () => {
    if (!user) return;

    try {
      const codes = await getUserDiscountCodes(user.uid);
      setDiscountCodes(codes);
    } catch (err: any) {
      console.error('Error loading discount codes:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      loadTransactions();
      loadDiscountCodes();
    }
  }, [profile, loadTransactions, loadDiscountCodes]);

  // Real-time listener for points updates
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up real-time points listener for:', user.uid);

    // Import Firebase dynamically
    const setupListener = async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('../firebaseConfig');

      // ✅ CRITICAL: Listen to loyaltyProfiles (central source of truth)
      const profileRef = doc(db, 'loyaltyProfiles', user.uid);

      const unsubscribe = onSnapshot(profileRef, (snapshot) => {
        if (snapshot.exists()) {
          const profileData = snapshot.data();
          console.log('🔄 Real-time points update from loyaltyProfiles:', profileData.totalPoints || profileData.points);

          // Update profile with new points
          setProfile(prev => prev ? {
            ...prev,
            points: profileData.totalPoints || profileData.points || 0,
            tier: profileData.tier || prev.tier,
            totalPointsEarned: profileData.totalPoints || profileData.points || prev.totalPointsEarned
          } : null);
        }
      });

      return unsubscribe;
    };

    let cleanup: (() => void) | undefined;
    setupListener().then(unsub => { cleanup = unsub; });

    return () => {
      if (cleanup) cleanup();
    };
  }, [user]);

  // Claim social share points
  const claimSocialPoints = useCallback(async (platform: 'instagram' | 'whatsapp' | 'facebook') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const claimed = await claimSocialSharePoints(user.uid, platform);
      if (claimed) {
        await loadProfile();
        await loadTransactions();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadProfile, loadTransactions]);

  // Claim phone number points
  const claimPhonePoints = useCallback(async (phoneNumber: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const claimed = await claimPhoneNumberPoints(user.uid, phoneNumber);
      if (claimed) {
        await loadProfile();
        await loadTransactions();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadProfile, loadTransactions]);

  // Award custom points
  const awardCustomPoints = useCallback(async (points: number, reason: string, metadata?: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await awardPoints(user.uid, points, reason, metadata);
      await loadProfile();
      await loadTransactions();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadProfile, loadTransactions]);

  // Award order points
  const awardOrderPointsHook = useCallback(async (orderTotal: number, orderId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const pointsEarned = await awardOrderPoints(user.uid, orderTotal, orderId);
      await loadProfile();
      await loadTransactions();
      return pointsEarned;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadProfile, loadTransactions]);

  // Redeem points for discount
  const redeemPoints = useCallback(async (pointsCost: number, discountAmount: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const discountCode = await redeemPointsForDiscount(user.uid, pointsCost, discountAmount);
      await loadProfile();
      await loadTransactions();
      await loadDiscountCodes();
      return discountCode;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadProfile, loadTransactions, loadDiscountCodes]);

  // Validate and apply discount code
  const validateAndApplyCode = useCallback(async (code: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const discountCode = await validateDiscountCode(code, user.uid);
      if (!discountCode) {
        throw new Error('Invalid or expired discount code');
      }
      return discountCode;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  const markCodeAsUsed = useCallback(async (codeId: string) => {
    try {
      await applyDiscountCode(codeId);
      await loadDiscountCodes();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadDiscountCodes]);

  // Get tier info (async, so we need to handle it properly)
  const [tierInfo, setTierInfo] = useState<any>(null);
  const [nextTier, setNextTier] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      getTierConfig(profile.tier).then(setTierInfo);
      getNextTier(profile.tier).then(setNextTier);
    }
  }, [profile]);

  const pointsToNextTier = profile && nextTier ? nextTier.pointsRequired - profile.totalPointsEarned : 0;
  const tierProgress = nextTier && tierInfo
    ? ((profile!.totalPointsEarned - tierInfo.pointsRequired) / (nextTier.pointsRequired - tierInfo.pointsRequired)) * 100
    : 100;

  // Get available discount codes (unused and not expired)
  const availableCodes = discountCodes.filter(code => {
    if (code.isUsed || !code.isActive) return false;
    const expiryDate = new Date(code.expiresAt);
    return expiryDate > new Date();
  });

  return {
    profile,
    transactions,
    discountCodes,
    availableCodes,
    loading,
    error,
    tierInfo,
    nextTier,
    pointsToNextTier,
    tierProgress,
    redemptionOptions: redemptionOptions.map(opt => ({
      points: opt.pointsRequired,
      discount: opt.dollarValue,
      label: opt.name
    })),
    pointsRules: POINTS_RULES,
    claimSocialPoints,
    claimPhonePoints,
    awardCustomPoints,
    awardOrderPoints: awardOrderPointsHook,
    redeemPoints,
    validateAndApplyCode,
    markCodeAsUsed,
    refresh: loadProfile
  };
}
