import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, TrendingUp, Award, Zap, AlertCircle, Download, Filter, Users, Gift } from 'lucide-react';
import { getLoyaltyProfile } from '../services/loyaltyService';
import { getUserCodeUsageHistory } from '../services/firebaseDiscountService';
import { getPointsHistory } from '../services/loyaltyService';

interface UserData {
  userId: string;
  displayName?: string;
  email?: string;
  points: number;
  totalPointsEarned: number;
  tier: string;
  joinedAt: any;
  phoneNumber?: string;
}

interface AdminUserManagementProps {
  adminId: string;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ adminId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [discountHistory, setDiscountHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'points' | 'joined' | 'name'>('points');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Mock user data for demo (in production, fetch from Firebase)
  const mockUsers: UserData[] = useMemo(() => [
    {
      userId: 'user001',
      displayName: 'John Doe',
      email: 'john@example.com',
      points: 2500,
      totalPointsEarned: 5000,
      tier: 'Gold',
      joinedAt: new Date('2024-01-15'),
      phoneNumber: '+91 98765 43210'
    },
    {
      userId: 'user002',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      points: 1200,
      totalPointsEarned: 2000,
      tier: 'Silver',
      joinedAt: new Date('2024-03-20'),
      phoneNumber: '+91 98765 43211'
    },
    {
      userId: 'user003',
      displayName: 'Mike Johnson',
      email: 'mike@example.com',
      points: 450,
      totalPointsEarned: 800,
      tier: 'Bronze',
      joinedAt: new Date('2024-06-10'),
      phoneNumber: '+91 98765 43212'
    },
    {
      userId: 'user004',
      displayName: 'Sarah Williams',
      email: 'sarah@example.com',
      points: 5000,
      totalPointsEarned: 10000,
      tier: 'Platinum',
      joinedAt: new Date('2023-12-01'),
      phoneNumber: '+91 98765 43213'
    },
    {
      userId: 'user005',
      displayName: 'Alex Brown',
      email: 'alex@example.com',
      points: 800,
      totalPointsEarned: 1500,
      tier: 'Silver',
      joinedAt: new Date('2024-04-05'),
      phoneNumber: '+91 98765 43214'
    }
  ], []);

  const filteredUsers = useMemo(() => {
    let filtered = mockUsers;

    // Filter by tier
    if (filterTier !== 'all') {
      filtered = filtered.filter(u => u.tier === filterTier);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.displayName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.userId.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'joined':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockUsers, filterTier, searchQuery, sortBy]);

  const handleSelectUser = async (user: UserData) => {
    setLoading(true);
    try {
      setSelectedUser(user);
      // In production, fetch real data from Firebase
      setUserHistory([
        { type: 'earn', points: 100, reason: 'Sign-up bonus', date: new Date() },
        { type: 'earn', points: 50, reason: 'Purchase', date: new Date(Date.now() - 86400000) },
        { type: 'redeem', points: 200, reason: 'Discount code', date: new Date(Date.now() - 172800000) }
      ]);
      setDiscountHistory([
        { code: 'GOLD2024', discount: 15, used: true, date: new Date() },
        { code: 'SILVER100', discount: 10, used: false, date: new Date(Date.now() - 86400000) }
      ]);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return 'from-amber-600 to-amber-700';
      case 'Silver':
        return 'from-gray-400 to-gray-500';
      case 'Gold':
        return 'from-yellow-400 to-yellow-500';
      case 'Platinum':
        return 'from-purple-400 to-purple-500';
      default:
        return 'from-gray-600 to-gray-700';
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
          <h1 className="text-4xl font-bold font-syne text-white mb-2">User Management</h1>
          <p className="text-gray-400">View and manage user loyalty profiles</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Users</h2>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">Tier</label>
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 px-3 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors text-sm"
                  >
                    <option value="all">All Tiers</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 px-3 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors text-sm"
                  >
                    <option value="points">Points (High to Low)</option>
                    <option value="joined">Recently Joined</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.button
                      key={user.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedUser?.userId === user.userId
                          ? 'bg-[#00ff88]/20 border border-[#00ff88]/50'
                          : 'bg-black/50 border border-white/10 hover:border-[#00ff88]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate text-sm">{user.displayName}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className={`bg-gradient-to-br ${getTierColor(user.tier)} px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap ml-2`}>
                          {user.tier}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[#00ff88] font-bold text-sm">{user.points} pts</span>
                        <span className="text-gray-500 text-xs">{user.totalPointsEarned} total</span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {!selectedUser ? (
              <div className="bg-zinc-900 border border-white/10 rounded-lg p-12 text-center">
                <Users size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Select a user to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${getTierColor(selectedUser.tier)} rounded-lg p-6 text-white`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedUser.displayName}</h2>
                      <p className="text-sm opacity-90">{selectedUser.email}</p>
                    </div>
                    <div className="text-4xl">{selectedUser.tier === 'Bronze' ? '🥉' : selectedUser.tier === 'Silver' ? '🥈' : selectedUser.tier === 'Gold' ? '🥇' : '💎'}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Current Points</p>
                      <p className="text-2xl font-bold">{selectedUser.points}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75 mb-1">Total Earned</p>
                      <p className="text-2xl font-bold">{selectedUser.totalPointsEarned}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75 mb-1">Member Since</p>
                      <p className="text-sm font-bold">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Points History */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-zinc-900 border border-white/10 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#00ff88]" />
                    Points History
                  </h3>

                  <div className="space-y-3">
                    {userHistory.length === 0 ? (
                      <p className="text-gray-400 text-sm">No points history</p>
                    ) : (
                      userHistory.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5"
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{entry.reason}</p>
                            <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`font-bold text-sm ${entry.type === 'earn' ? 'text-[#00ff88]' : 'text-red-400'}`}>
                            {entry.type === 'earn' ? '+' : '-'}{entry.points}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Discount Codes */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-zinc-900 border border-white/10 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gift size={20} className="text-[#00ff88]" />
                    Discount Codes
                  </h3>

                  <div className="space-y-3">
                    {discountHistory.length === 0 ? (
                      <p className="text-gray-400 text-sm">No discount codes</p>
                    ) : (
                      discountHistory.map((code, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5"
                        >
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm">{code.code}</p>
                            <p className="text-xs text-gray-400">{code.discount}% discount</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${code.used ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {code.used ? 'Used' : 'Active'}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* User Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-zinc-900 border border-white/10 rounded-lg p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">User Information</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID</span>
                      <span className="text-white font-mono text-sm">{selectedUser.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-white">{selectedUser.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member Since</span>
                      <span className="text-white">{new Date(selectedUser.joinedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tier</span>
                      <span className={`font-bold bg-gradient-to-r ${getTierColor(selectedUser.tier)} bg-clip-text text-transparent`}>
                        {selectedUser.tier}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
