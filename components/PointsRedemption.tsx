// Points Redemption Component
// Allows users to redeem points for discounts

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, AlertCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { userPointsService, UserPoints } from '../services/userPointsService';

interface RedemptionOption {
  id: string;
  pointsRequired: number;
  discountAmount: number;
  discountCode: string;
  description: string;
}

export const PointsRedemption: React.FC = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionOption | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const redemptionOptions: RedemptionOption[] = [
    {
      id: '1',
      pointsRequired: 100,
      discountAmount: 50,
      discountCode: 'POINTS50',
      description: '₹50 discount on your next purchase',
    },
    {
      id: '2',
      pointsRequired: 250,
      discountAmount: 150,
      discountCode: 'POINTS150',
      description: '₹150 discount on your next purchase',
    },
    {
      id: '3',
      pointsRequired: 500,
      discountAmount: 350,
      discountCode: 'POINTS350',
      description: '₹350 discount on your next purchase',
    },
    {
      id: '4',
      pointsRequired: 1000,
      discountAmount: 800,
      discountCode: 'POINTS800',
      description: '₹800 discount on your next purchase',
    },
  ];

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

  const handleRedeem = async (option: RedemptionOption) => {
    if (!user || !userPoints) return;

    if (userPoints.totalPoints < option.pointsRequired) {
      setMessage({
        type: 'error',
        text: `You need ${option.pointsRequired - userPoints.totalPoints} more points`,
      });
      return;
    }

    setRedeeming(true);
    try {
      // Redeem points
      const success = await userPointsService.redeemPoints(
        user.uid,
        option.pointsRequired,
        `Redeemed ${option.pointsRequired} points for ${option.discountCode}`
      );

      if (success) {
        // Refresh user points
        const updatedPoints = await userPointsService.getUserPoints(user.uid);
        setUserPoints(updatedPoints);

        setMessage({
          type: 'success',
          text: `Successfully redeemed! Your discount code is: ${option.discountCode}`,
        });

        // Copy code to clipboard
        navigator.clipboard.writeText(option.discountCode);

        setSelectedRedemption(null);

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      setMessage({
        type: 'error',
        text: 'Error redeeming points. Please try again.',
      });
    } finally {
      setRedeeming(false);
    }
  };

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
        Please sign in to redeem points
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#00ff88]/10 to-[#00ff88]/5 border border-[#00ff88]/30 rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold mb-2">Redeem Your Points</h2>
        <p className="text-gray-400">
          You have <span className="text-[#00ff88] font-bold">{userPoints.totalPoints.toLocaleString()}</span> points available
        </p>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}
        >
          {message.type === 'success' ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </motion.div>
      )}

      {/* Redemption Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {redemptionOptions.map((option, idx) => {
          const canRedeem = userPoints.totalPoints >= option.pointsRequired;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border rounded-xl p-6 transition-all cursor-pointer ${
                canRedeem
                  ? 'border-[#00ff88]/30 bg-zinc-900/50 hover:border-[#00ff88] hover:bg-zinc-900'
                  : 'border-gray-700/30 bg-zinc-900/30 opacity-60'
              }`}
              onClick={() => canRedeem && setSelectedRedemption(option)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift size={24} className={canRedeem ? 'text-[#00ff88]' : 'text-gray-500'} />
                  <div>
                    <p className="font-bold">{option.pointsRequired} Points</p>
                    <p className="text-sm text-gray-400">Required</p>
                  </div>
                </div>
                {canRedeem && (
                  <span className="px-3 py-1 bg-[#00ff88]/20 text-[#00ff88] rounded-full text-xs font-bold">
                    Available
                  </span>
                )}
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-[#00ff88]">₹{option.discountAmount}</p>
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canRedeem) handleRedeem(option);
                }}
                disabled={!canRedeem || redeeming}
                className={`w-full py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                  canRedeem
                    ? 'bg-[#00ff88] text-black hover:bg-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {redeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/50 border border-white/10 rounded-xl p-6"
      >
        <h3 className="font-bold mb-3">How Redemption Works</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-[#00ff88] font-bold">1.</span>
            <span>Select a redemption option above</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00ff88] font-bold">2.</span>
            <span>Your points will be deducted immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00ff88] font-bold">3.</span>
            <span>You'll receive a discount code to use at checkout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00ff88] font-bold">4.</span>
            <span>The code will be copied to your clipboard automatically</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};
