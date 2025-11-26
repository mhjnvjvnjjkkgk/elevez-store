import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Eye, Edit2, Trash2, Plus, Download, Filter } from 'lucide-react';
import { userManagementService, UserProfile, UserStats } from '../services/userManagementService';
import { UserListView } from './UserListView';
import { UserDetailView } from './UserDetailView';

interface AdminUserPortalProps {
  adminId: string;
}

export const AdminUserPortal: React.FC<AdminUserPortalProps> = ({ adminId }) => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userManagementService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await userManagementService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await userManagementService.searchUsers(term);
        setUsers(results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      loadUsers();
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedUser(null);
    loadUsers();
    loadStats();
  };

  const filteredUsers = filterStatus === 'all' 
    ? users 
    : users.filter(u => u.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading user portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">User Management Portal</h2>
                  <p className="text-gray-400">Manage all users, their activities, and points</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
                >
                  <Download size={20} />
                  Export Users
                </motion.button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Inactive Users</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.inactiveUsers}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Avg Points/User</p>
                    <p className="text-2xl font-bold text-blue-400">{Math.round(stats.averagePointsPerUser)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 space-y-4"
            >
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'active', 'inactive', 'suspended'] as const).map(status => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterStatus === status
                          ? 'bg-[#00ff88] text-black'
                          : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* User List */}
            <UserListView 
              users={filteredUsers} 
              onViewUser={handleViewUser}
              onRefresh={loadUsers}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {selectedUser && (
              <UserDetailView 
                user={selectedUser} 
                adminId={adminId}
                onBack={handleBackToList}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
