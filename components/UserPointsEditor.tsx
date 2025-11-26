import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Save } from 'lucide-react';
import { userPointsManagementService, UserPointsData, PointsTransaction } from '../services/userPointsManagementService';

interface UserPointsEditorProps {
  userId: string;
  adminId: string;
  onPointsUpdated: () => void;
}

export const UserPointsEditor: React.FC<UserPointsEditorProps> = ({ userId, adminId, onPointsUpdated }) => {
  const [userPoints, setUserPoints] = useState<UserPointsData | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const points = await userPointsManagementService.getUserPoints(userId);
      setUserPoints(points);
      
      const txs = await userPointsManagementService.getPointsTransactions(userId);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!amount || !reason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      const numAmount = parseInt(amount);

      if (action === 'add') {
        await userPointsManagementService.addPoints(userId, numAmount, reason, adminId);
      } else if (action === 'subtract') {
        await userPointsManagementService.subtractPoints(userId, numAmount, reason, adminId);
      } else {
        await userPointsManagementService.setPoints(userId, numAmount, reason, adminId);
      }

      setAmount('');
      setReason('');
      loadData();
      onPointsUpdated();
      alert('Points updated successfully!');
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Failed to update points');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Manage Points</h3>

        <div className="space-y-4">
          {/* Action Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Action</label>
            <div className="flex gap-2">
              {(['add', 'subtract', 'set'] as const).map(act => (
                <motion.button
                  key={act}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAction(act)}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                    action === act
                      ? 'bg-[#00ff88] text-black'
                      : 'bg-black/50 text-gray-400 border border-white/10 hover:border-[#00ff88]'
                  }`}
                >
                  {act === 'add' ? '➕ Add' : act === 'subtract' ? '➖ Subtract' : '🎯 Set'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              {action === 'set' ? 'New Balance' : 'Amount'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
            />
          </div>

          {/* Reason Input */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you making this change?"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Current Points */}
      {userPoints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 border border-[#00ff88]/30 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Current Points</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Balance</p>
              <p className="text-2xl font-bold text-[#00ff88]">{userPoints.currentBalance}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Earned</p>
              <p className="text-2xl font-bold text-green-400">{userPoints.totalEarned}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Spent</p>
              <p className="text-2xl font-bold text-red-400">{userPoints.totalSpent}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Tier</p>
              <p className="text-2xl font-bold text-yellow-400 capitalize">{userPoints.tier}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.transactionId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-bold">{tx.reason}</p>
                  <p className="text-xs text-gray-500">{tx.timestamp.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.balanceBefore} → {tx.balanceAfter}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
