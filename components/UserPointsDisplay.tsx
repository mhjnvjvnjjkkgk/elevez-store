// User Points Display Component
// Shows user's loyalty points, tier, and benefits

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Gift, Zap } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { userPointsService, UserPoints } from '../services/userPointsService';

export const UserPointsDisplay: React.FC = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const points = await userPointsService.getUserPoints(currentUser.uid);
        setUserPoints(points);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  if (!userPoints) {
    return (
      <div className="text-center p-8 text-gray-400">
        Please sign in to view your points
      </div>
    );
  }

  const tierBenefits = userPointsService.getTierBenefits(userPoints.tier);
  const pointsToNextTier = this.getPointsToNextTier(userPoints.totalPoints);

  return (
    <div className="space-y-6">
      {/* Main Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#00ff88]/10 to-[#00ff88]/5 border border-[#00ff88]/30 rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Your Loyalty Points</p>
            <h2 className="text-5xl font-bold text-[#00ff88]">{userPoints.totalPoints.toLocaleString()}</h2>
          </div>
          <div className="text-6xl">⭐</div>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-wider ${
            userPoints.tier === 'bronze' ? 'bg-[#cd7f32]/20 text-[#cd7f32]' :
            userPoints.tier === 'silver' ? 'bg-[#c0c0c0]/20 text-[#c0c0c0]' :
            userPoints.tier === 'gold' ? 'bg-[#ffd700]/20 text-[#ffd700]' :
            'bg-[#e5e4e2]/20 text-[#e5e4e2]'
          }`}>
            {userPoints.tier.toUpperCase()} MEMBER
          </div>
          <span className="text-gray-400 text-sm">
            {pointsToNextTier > 0 
              ? `${pointsToNextTier.toLocaleString()} points to next tier`
              : 'Highest tier reached!'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((userPoints.totalPoints / 5000) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#00ff88] to-[#00dd77]"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {Math.min(userPoints.totalPoints, 5000)} / 5000 points to Platinum
        </p>
      </motion.div>

      {/* Tier Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Gift size={20} className="text-[#00ff88]" />
          {tierBenefits.name} Tier Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Discount</p>
            <p className="text-2xl font-bold text-[#00ff88]">{tierBenefits.discountPercentage}%</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Free Shipping on Orders Over</p>
            <p className="text-2xl font-bold text-[#00ff88]">
              {tierBenefits.freeShippingThreshold === 0 ? 'Always Free' : `₹${tierBenefits.freeShippingThreshold}`}
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-sm mt-4">{tierBenefits.description}</p>
      </motion.div>

      {/* How to Earn Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#00ff88]" />
          How to Earn Points
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-[#00ff88] font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-semibold">Make a Purchase</p>
              <p className="text-gray-400 text-sm">Earn 1 point for every rupee spent</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-[#00ff88] font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-semibold">Accumulate Points</p>
              <p className="text-gray-400 text-sm">Points are added automatically to your account</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-[#00ff88] font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-semibold">Unlock Tier Benefits</p>
              <p className="text-gray-400 text-sm">Reach higher tiers for better discounts and perks</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-[#00ff88] font-bold text-sm">4</span>
            </div>
            <div>
              <p className="font-semibold">Redeem Rewards</p>
              <p className="text-gray-400 text-sm">Use points for discounts on future purchases</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      {userPoints.pointsHistory && userPoints.pointsHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-[#00ff88]" />
            Recent Activity
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {userPoints.pointsHistory.slice(-5).reverse().map((transaction, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="font-semibold text-sm">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-bold ${transaction.amount > 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  // Helper function to calculate points to next tier
  getPointsToNextTier(currentPoints: number): number {
    if (currentPoints < 1000) return 1000 - currentPoints;
    if (currentPoints < 2500) return 2500 - currentPoints;
    if (currentPoints < 5000) return 5000 - currentPoints;
    return 0;
  }
};
