// Admin User Management Panel
// Allows admins to view and edit user data

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Save, X, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { useAdminUserSync } from '../hooks/useAdminUserSync';

export const AdminUserManagementPanel: React.FC = () => {
  const {
    users,
    selectedUser,
    logs,
    statistics,
    loading,
    error,
    isAdmin,
    selectUser,
    searchUsers,
    updateUserPoints,
    updateUserTier,
    updateUserNotes,
    refreshData,
    getUserLogs,
    clearError,
  } = useAdminUserSync();

  const [searchEmail, setSearchEmail] = useState('');
  const [editingPoints, setEditingPoints] = useState<number | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAdmin) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg">
        <p className="text-red-500">You don't have permission to access this panel.</p>
      </div>
    );
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setSearchEmail(email);
    if (email.trim()) {
      await searchUsers(email);
    } else {
      await refreshData();
    }
  };

  const handleSavePoints = async () => {
    if (!selectedUser || editingPoints === null) return;

    setSaving(true);
    const success = await updateUserPoints(selectedUser.id, editingPoints);
    setSaving(false);

    if (success) {
      setEditingPoints(null);
      setSuccessMessage('Points updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSaveTier = async () => {
    if (!selectedUser || editingTier === null) return;

    setSaving(true);
    const success = await updateUserTier(selectedUser.id, editingTier);
    setSaving(false);

    if (success) {
      setEditingTier(null);
      setSuccessMessage('Tier updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser || editingNotes === null) return;

    setSaving(true);
    const success = await updateUserNotes(selectedUser.id, editingNotes);
    setSaving(false);

    if (success) {
      setEditingNotes(null);
      setSuccessMessage('Notes updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSelectUser = (userId: string) => {
    selectUser(userId);
    setEditingPoints(null);
    setEditingTier(null);
    setEditingNotes(null);
    getUserLogs(userId);
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-900 rounded-lg border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={refreshData}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-800 p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-[#00ff88]">{statistics.totalUsers}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm">Total Points</p>
          <p className="text-2xl font-bold text-[#00ff88]">{statistics.totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm">Average Points</p>
          <p className="text-2xl font-bold text-[#00ff88]">{statistics.averagePoints}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg border border-white/10">
          <p className="text-gray-400 text-sm">Platinum Users</p>
          <p className="text-2xl font-bold text-[#00ff88]">{statistics.tierDistribution.Platinum || 0}</p>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-500 hover:text-red-400">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#00ff88]/10 border border-[#00ff88] rounded-lg p-4 flex items-center gap-2"
          >
            <Check size={20} className="text-[#00ff88]" />
            <p className="text-[#00ff88]">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchEmail}
          onChange={handleSearch}
          className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Users List */}
        <div className="col-span-1 space-y-2 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Users ({users.length})</h3>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No users found</div>
          ) : (
            users.map((user) => (
              <motion.button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedUser?.id === user.id
                    ? 'bg-[#00ff88]/20 border-[#00ff88]'
                    : 'bg-zinc-800 border-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-bold text-sm truncate">{user.email}</p>
                <p className="text-xs text-gray-400">{user.displayName}</p>
                <p className="text-xs text-[#00ff88]">{user.points} pts • {user.tier}</p>
              </motion.button>
            ))
          )}
        </div>

        {/* User Details */}
        <div className="col-span-2 space-y-4">
          {selectedUser ? (
            <>
              <div className="bg-zinc-800 border border-white/10 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.displayName}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Points</label>
                  <div className="flex gap-2">
                    {editingPoints !== null ? (
                      <>
                        <input
                          type="number"
                          value={editingPoints}
                          onChange={(e) => setEditingPoints(parseInt(e.target.value) || 0)}
                          className="flex-1 bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                        />
                        <button
                          onClick={handleSavePoints}
                          disabled={saving}
                          className="px-4 py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingPoints(null)}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white font-bold">
                          {selectedUser.points}
                        </div>
                        <button
                          onClick={() => setEditingPoints(selectedUser.points)}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tier */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Tier</label>
                  <div className="flex gap-2">
                    {editingTier !== null ? (
                      <>
                        <select
                          value={editingTier}
                          onChange={(e) => setEditingTier(e.target.value)}
                          className="flex-1 bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88]"
                        >
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                        <button
                          onClick={handleSaveTier}
                          disabled={saving}
                          className="px-4 py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingTier(null)}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white font-bold">
                          {selectedUser.tier}
                        </div>
                        <button
                          onClick={() => setEditingTier(selectedUser.tier)}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Admin Notes</label>
                  <div className="flex gap-2">
                    {editingNotes !== null ? (
                      <>
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          className="flex-1 bg-zinc-700 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ff88] resize-none"
                          rows={3}
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleSaveNotes}
                            disabled={saving}
                            className="px-4 py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white min-h-12">
                          {selectedUser.adminNotes || 'No notes'}
                        </div>
                        <button
                          onClick={() => setEditingNotes(selectedUser.adminNotes || '')}
                          className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Other Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-gray-400">Total Points Earned</p>
                    <p className="font-bold">{selectedUser.totalPointsEarned}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="font-bold text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Logs */}
              <motion.button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between p-4 bg-zinc-800 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
              >
                <span className="font-bold">Activity Logs</span>
                {showLogs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </motion.button>

              <AnimatePresence>
                {showLogs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-800 border border-white/10 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto"
                  >
                    {logs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No activity logs</p>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                          <p className="font-bold text-[#00ff88]">{log.action}</p>
                          <p className="text-gray-400">
                            {log.oldValue} → {log.newValue}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="bg-zinc-800 border border-white/10 rounded-lg p-6 text-center text-gray-500">
              Select a user to view and edit their details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
