import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Gift, Calendar, Award, History } from 'lucide-react';
import { pointsHistoryManager, UserPointsHistory } from '../services/pointsHistoryService';
import { useAuth } from '../hooks/useAuth';

interface UserPointsHistoryDisplayProps {
  userId?: string;
}

export const UserPointsHistoryDisplay: React.FC<UserPointsHistoryDisplayProps> = ({ userId }) => {
  const { user } = useAuth();
  const [pointsHistory, setPointsHistory] = useState<UserPointsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30' | '90' | '365'>('all');

  const currentUserId = userId || user?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const loadPointsHistory = async () => {
      try {
        setLoading(true);
        const history = await pointsHistoryManager.getUserPointsHistory(currentUserId);
        setPointsHistory(history);
      } catch (error) {
        console.error('Error loading points history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPointsHistory();

    // Subscribe to real-time updates
    const unsubscribe = pointsHistoryManager.subscribeToUserPoints(currentUserId, (history) => {
      setPointsHistory(history);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const getFilteredTransactions = () => {
    if (!pointsHistory || selectedPeriod === 'all') {
      return pointsHistory?.transactions || [];
    }

    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return pointsHistory.transactions.filter(tx => tx.timestamp >= cutoffDate);
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-400';
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-300';
      default: return 'text-orange-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading your points...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pointsHistory) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
        <p className="text-gray-400 text-center">No points history found</p>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 border border-[#00ff88]/30 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Points</h2>
            <p className="text-gray-400 text-sm">Earn points with every purchase</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#00ff88]">{pointsHistory.currentBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Available Points</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-400" />
              <p className="text-xs text-gray-400">Total Earned</p>
            </div>
            <p className="text-lg font-bold text-green-400">{pointsHistory.totalEarned.toLocaleString()}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gift size={16} className="text-red-400" />
              <p className="text-xs text-gray-400">Total Redeemed</p>
            </div>
            <p className="text-lg font-bold text-red-400">{pointsHistory.totalRedeemed.toLocaleString()}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award size={16} className={getTierColor(pointsHistory.tier)} />
              <p className="text-xs text-gray-400">Tier</p>
            </div>
            <p className={`text-lg font-bold ${getTierColor(pointsHistory.tier)}`}>
              {getTierIcon(pointsHistory.tier)} {pointsHistory.tier}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Period Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 flex-wrap"
      >
        {[
          { id: 'all', label: 'All Time' },
          { id: '30', label: 'Last 30 Days' },
          { id: '90', label: 'Last 3 Months' },
          { id: '365', label: 'Last Year' }
        ].map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPeriod === period.id
                ? 'bg-[#00ff88] text-black'
                : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
            }`}
          >
            {period.label}
          </button>
        ))}
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-[#00ff88]" />
          <h3 className="text-xl font-bold text-white">Transaction History</h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found for this period</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">
                      {transaction.type === 'purchase' ? '🛍️' :
                       transaction.type === 'redemption' ? '🎁' :
                       transaction.type === 'admin_adjustment' ? '⚙️' : '🎉'}
                    </span>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {transaction.metadata && (
                    <div className="ml-8 mt-2">
                      {transaction.metadata.productName && (
                        <p className="text-xs text-gray-500">Product: {transaction.metadata.productName}</p>
                      )}
                      {transaction.metadata.reason && (
                        <p className="text-xs text-gray-500">Reason: {transaction.metadata.reason}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: {transaction.balanceAfter.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Points Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-lg font-bold text-white mb-3">How Points Work</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• Earn 1 point for every ₹1 spent</p>
          <p>• Points are added automatically after purchase</p>
          <p>• Use points for discounts on future orders</p>
          <p>• Points never expire</p>
          <p>• Higher tiers unlock better rewards</p>
        </div>
      </motion.div>
    </div>
  );
};
