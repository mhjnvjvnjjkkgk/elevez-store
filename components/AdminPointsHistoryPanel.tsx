import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Edit2, Save, X, Calendar, User, DollarSign, Search } from 'lucide-react';
import { pointsHistoryManager, UserPointsHistory } from '../services/pointsHistoryService';

interface AdminPointsHistoryPanelProps {
  adminId: string;
}

export const AdminPointsHistoryPanel: React.FC<AdminPointsHistoryPanelProps> = ({ adminId }) => {
  const [usersHistory, setUsersHistory] = useState<UserPointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPointsHistory | null>(null);

  useEffect(() => {
    loadAllUsersHistory();
  }, []);

  const loadAllUsersHistory = async () => {
    try {
      setLoading(true);
      const history = await pointsHistoryManager.getAllUsersPointsHistory();
      setUsersHistory(history);
    } catch (error) {
      console.error('Error loading users history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (userId: string) => {
    if (!editAmount || !editReason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await pointsHistoryManager.recordAdminAdjustment(
        userId,
        parseInt(editAmount),
        editReason,
        adminId
      );

      // Refresh data
      await loadAllUsersHistory();
      setEditingUserId(null);
      setEditAmount('');
      setEditReason('');
    } catch (error) {
      console.error('Error adjusting points:', error);
      alert('Failed to adjust points');
    }
  };

  const filteredUsers = usersHistory.filter(user =>
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-400';
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-300';
      default: return 'text-orange-400';
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-500/20';
      case 'gold': return 'bg-yellow-500/20';
      case 'silver': return 'bg-gray-500/20';
      default: return 'bg-orange-500/20';
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(usersHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `points-history-${new Date().toISOString()}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading points history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Points History</h2>
              <p className="text-gray-400">Manage and monitor user points</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportData}
              className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
            >
              <Download size={20} />
              Export Data
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Users</p>
              <p className="text-2xl font-bold text-white">{usersHistory.length}</p>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Points Allocated</p>
              <p className="text-2xl font-bold text-green-400">
                {usersHistory.reduce((sum, u) => sum + u.currentBalance, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-blue-400">
                {usersHistory.reduce((sum, u) => sum + u.totalEarned, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Redeemed</p>
              <p className="text-2xl font-bold text-red-400">
                {usersHistory.reduce((sum, u) => sum + u.totalRedeemed, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
            />
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00ff88]/20 rounded-lg flex items-center justify-center">
                      <User size={24} className="text-[#00ff88]" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{user.userId}</p>
                      <p className="text-xs text-gray-400">Last updated: {user.lastUpdated.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${getTierBg(user.tier)}`}>
                    <p className={`font-bold ${getTierColor(user.tier)}`}>{user.tier.toUpperCase()}</p>
                  </div>
                </div>

                {/* Points Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Current Balance</p>
                    <p className="text-xl font-bold text-[#00ff88]">{user.currentBalance.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                    <p className="text-xl font-bold text-green-400">{user.totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Redeemed</p>
                    <p className="text-xl font-bold text-red-400">{user.totalRedeemed.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Calendar size={16} />
                    View History
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingUserId(user.userId)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 text-[#00ff88] px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Adjust Points
                  </motion.button>
                </div>

                {/* Edit Form */}
                {editingUserId === user.userId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Points Amount</label>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Reason</label>
                        <input
                          type="text"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="Enter reason for adjustment"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAdjustPoints(user.userId)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Save size={16} />
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingUserId(null);
                            setEditAmount('');
                            setEditReason('');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Transaction History Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="sticky top-0 bg-zinc-900 border-b border-white/10 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </motion.button>
              </div>

              <div className="p-6 space-y-3">
                {selectedUser.transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No transactions found</p>
                ) : (
                  selectedUser.transactions.map((tx, index) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-400">{tx.timestamp.toLocaleDateString()}</p>
                      </div>
                      <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
