import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Save, X, Plus, Minus } from 'lucide-react';
import { UserProfile } from '../services/userManagementService';
import { UserActivityLog } from './UserActivityLog';
import { UserPointsEditor } from './UserPointsEditor';
import { userPointsManagementService, UserPointsData } from '../services/userPointsManagementService';

interface UserDetailViewProps {
  user: UserProfile;
  adminId: string;
  onBack: () => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({ user, adminId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'points'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [userPoints, setUserPoints] = useState<UserPointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPoints();
  }, [user.userId]);

  const loadUserPoints = async () => {
    try {
      setLoading(true);
      const points = await userPointsManagementService.getUserPoints(user.userId);
      setUserPoints(points);
    } catch (error) {
      console.error('Error loading user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Update user profile
      // await userManagementService.updateUser(user.userId, editedUser);
      setIsEditing(false);
      onBack();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#00ff88] hover:text-[#00dd77] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{user.name || user.email}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
          >
            {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            {isEditing ? 'Cancel' : 'Edit'}
          </motion.button>
        </div>
      </motion.div>

      {/* User Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className="text-lg font-bold text-white capitalize">{user.status}</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Joined</p>
          <p className="text-lg font-bold text-white">
            {user.createdAt instanceof Date 
              ? user.createdAt.toLocaleDateString() 
              : new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Last Login</p>
          <p className="text-lg font-bold text-white">
            {user.lastLogin instanceof Date 
              ? user.lastLogin.toLocaleDateString() 
              : new Date(user.lastLogin).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total Purchases</p>
          <p className="text-lg font-bold text-white">{user.totalPurchases}</p>
        </div>
      </motion.div>

      {/* Points Summary */}
      {userPoints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 border border-[#00ff88]/30 rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-[#00ff88]">{userPoints.currentBalance}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-green-400">{userPoints.totalEarned}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-red-400">{userPoints.totalSpent}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Tier</p>
              <p className="text-3xl font-bold text-yellow-400 capitalize">{userPoints.tier}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex gap-4 border-b border-white/10">
          {(['overview', 'activities', 'points'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === tab
                  ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {activeTab === 'overview' && (
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">User Information</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editedUser.name || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Status</label>
                  <select
                    value={editedUser.status}
                    onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value as any })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-6 py-2 rounded-lg transition-colors"
                >
                  <Save size={16} />
                  Save Changes
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white capitalize">{user.status}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <UserActivityLog userId={user.userId} />
        )}

        {activeTab === 'points' && (
          <UserPointsEditor 
            userId={user.userId} 
            adminId={adminId}
            onPointsUpdated={loadUserPoints}
          />
        )}
      </motion.div>
    </div>
  );
};
