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
  REDEMPTION_OPTIONS,
  POINTS_RULES
} from '../services/loyaltyService';

export function useLoyalty() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load loyalty profile
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let userProfile = await getLoyaltyProfile(user.uid);
      
      // Create profile if doesn't exist
      if (!userProfile) {
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

  // Get tier info
  const tierInfo = profile ? getTierConfig(profile.tier) : null;
  const nextTier = profile ? getNextTier(profile.tier) : null;
  const pointsToNextTier = profile ? getPointsToNextTier(profile.totalPointsEarned, profile.tier) : 0;
  const tierProgress = nextTier 
    ? ((profile!.totalPointsEarned - tierInfo!.minPoints) / (nextTier.minPoints - tierInfo!.minPoints)) * 100
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
    redemptionOptions: REDEMPTION_OPTIONS,
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
