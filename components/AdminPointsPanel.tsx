import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, RotateCcw, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { adminAddPoints, adminRemovePoints, adminResetPoints, getAdminPointsAnalytics, AdminPointsAnalytics } from '../services/adminPointsService';
import { getLoyaltyProfile } from '../services/loyaltyService';

interface AdminPointsPanelProps {
  adminId: string;
}

export const AdminPointsPanel: React.FC<AdminPointsPanelProps> = ({ adminId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AdminPointsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'add' | 'remove' | 'reset' | null>(null);
  const [formData, setFormData] = useState({
    points: 0,
    reason: '',
    notes: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getAdminPointsAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      // In a real app, you'd search by email or UID
      // For now, we'll assume searchQuery is a UID
      const profile = await getLoyaltyProfile(searchQuery);
      if (profile) {
        setSelectedUser(profile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'User not found' });
        setSelectedUser(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error searching user' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !action) return;

    try {
      setLoading(true);
      let result;

      switch (action) {
        case 'add':
          result = await adminAddPoints(adminId, selectedUser.userId, formData.points, formData.reason, formData.notes);
          break;
        case 'remove':
          result = await adminRemovePoints(adminId, selectedUser.userId, formData.points, formData.reason, formData.notes);
          break;
        case 'reset':
          result = await adminResetPoints(adminId, selectedUser.userId, formData.reason, formData.notes);
          break;
      }

      if (result?.success) {
        setMessage({ type: 'success', text: result.message });
        setFormData({ points: 0, reason: '', notes: '' });
        setAction(null);
        // Refresh user data
        const updated = await getLoyaltyProfile(selectedUser.userId);
        if (updated) setSelectedUser(updated);
        await loadAnalytics();
      } else {
        setMessage({ type: 'error', text: result?.message || 'Action failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error performing action' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-syne text-white mb-2">Points Management</h1>
          <p className="text-gray-400">Manually allocate and manage user loyalty points</p>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Allocated</p>
                  <p className="text-3xl font-bold text-[#00ff88]">{analytics.totalPointsAllocated}</p>
                </div>
                <Plus className="text-[#00ff88]" size={32} />
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Removed</p>
                  <p className="text-3xl font-bold text-red-500">{analytics.totalPointsRemoved}</p>
                </div>
                <Minus className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Actions</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalAdminActions}</p>
                </div>
                <Activity className="text-blue-500" size={32} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and User Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Find User</h2>

              <form onSubmit={handleSearchUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">User ID / Email</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter user ID"
                      className="flex-1 bg-black/50 border border-white/10 px-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="bg-[#00ff88] text-black px-4 py-2 rounded font-bold hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <Search size={20} />
                    </motion.button>
                  </div>
                </div>
              </form>

              {/* Selected User Info */}
              {selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-black/50 border border-[#00ff88]/30 rounded-lg"
                >
                  <h3 className="font-bold text-white mb-3">User Profile</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">UID:</span>
                      <span className="text-white font-mono">{selectedUser.userId.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Points:</span>
                      <span className="text-[#00ff88] font-bold">{selectedUser.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tier:</span>
                      <span className="text-white font-bold">{selectedUser.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Earned:</span>
                      <span className="text-white">{selectedUser.totalPointsEarned}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Action Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Manage Points</h2>

              {!selectedUser ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Search for a user to manage their points</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'add', label: 'Add Points', icon: Plus, color: 'bg-green-500/20 text-green-400 hover:bg-green-500/40' },
                      { id: 'remove', label: 'Remove Points', icon: Minus, color: 'bg-red-500/20 text-red-400 hover:bg-red-500/40' },
                      { id: 'reset', label: 'Reset Points', icon: RotateCcw, color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40' }
                    ].map(btn => (
                      <motion.button
                        key={btn.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAction(btn.id as any)}
                        className={`p-4 rounded-lg font-bold flex flex-col items-center gap-2 transition-colors ${btn.color} ${
                          action === btn.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <btn.icon size={24} />
                        <span className="text-sm">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Action Form */}
                  <AnimatePresence>
                    {action && (
                      <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleAction}
                        className="space-y-4 p-4 bg-black/50 border border-white/10 rounded-lg"
                      >
                        {action !== 'reset' && (
                          <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Points</label>
                            <input
                              type="number"
                              value={formData.points}
                              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                              min="1"
                              className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Reason</label>
                          <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="e.g., Customer service compensation"
                            className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Notes (Optional)</label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes"
                            className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Confirm Action'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setAction(null)}
                            className="flex-1 bg-zinc-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 transition-colors"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Message */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-lg ${
                          message.type === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
