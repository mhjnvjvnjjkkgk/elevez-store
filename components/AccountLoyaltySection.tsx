// SECTION 5: Account Integration - Loyalty Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../hooks/useLoyalty';
import { Gift, Award, TrendingUp, Clock, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

export const AccountLoyaltySection: React.FC = () => {
  const {
    profile,
    availableCodes,
    transactions,
    tierInfo,
    nextTier,
    pointsToNextTier,
    tierProgress
  } = useLoyalty();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);

  // Fetch actual order count from Firebase
  useEffect(() => {
    const fetchOrderCount = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const db = getFirestore();
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        setOrderCount(ordersSnapshot.size);
      } catch (error) {
        console.error('Error fetching order count:', error);
        setOrderCount(0);
      }
    };

    fetchOrderCount();
  }, [profile]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Gift className="w-8 h-8 text-[#00ff88]" />
          Rewards & Loyalty
        </h2>
        <Link
          to="/rewards"
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full 
                   text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          View All Rewards
        </Link>
      </div>

      {/* Points & Tier Card */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl 
                    rounded-2xl p-6 border border-white/20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Points Balance */}
          <div>
            <p className="text-white/70 text-sm mb-2">Available Points</p>
            <p className="text-5xl font-bold text-white mb-4">{profile.points}</p>
            <p className="text-white/70 text-sm">
              Total Earned: <span className="text-white font-semibold">{profile.totalPointsEarned}</span>
            </p>
          </div>

          {/* Current Tier */}
          <div>
            <p className="text-white/70 text-sm mb-2">Current Tier</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{tierInfo?.icon}</span>
              <span className="text-3xl font-bold text-white">{tierInfo?.name}</span>
            </div>
            {nextTier && (
              <>
                <p className="text-white/70 text-sm mb-2">
                  {pointsToNextTier} points to {nextTier.name}
                </p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 text-center">
          <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{availableCodes.length}</p>
          <p className="text-xs text-white/70">Active Codes</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{profile.totalPointsEarned}</p>
          <p className="text-xs text-white/70">Total Earned</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 text-center">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{orderCount}</p>
          <p className="text-xs text-white/70">Orders</p>
        </div>
      </div>

      {/* Active Discount Codes */}
      {availableCodes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Your Discount Codes</h3>
          <div className="space-y-3">
            {availableCodes.slice(0, 3).map((code) => (
              <div
                key={code.id}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 
                         hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-white mb-1">{code.code}</p>
                    <p className="text-sm text-white/70">
                      ₹{code.discountAmount} off • Expires {new Date(code.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyCode(code.code)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg
                             text-white font-semibold hover:shadow-lg transition-all duration-300 
                             flex items-center gap-2"
                  >
                    {copiedCode === code.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {availableCodes.length > 3 && (
              <Link
                to="/rewards"
                className="block text-center text-[#00ff88] hover:underline"
              >
                View all {availableCodes.length} codes
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white/5 backdrop-blur-xl rounded-lg p-3 border border-white/10
                       flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">{transaction.reason}</p>
                <p className="text-xs text-white/50">
                  {transaction.timestamp?.toDate?.()?.toLocaleDateString() || 'Recent'}
                </p>
              </div>
              <p className={`font-bold ${transaction.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
              </p>
            </div>
          ))}
          {transactions.length > 5 && (
            <Link
              to="/rewards"
              className="block text-center text-[#00ff88] hover:underline pt-2"
            >
              View all transactions
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
