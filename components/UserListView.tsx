import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, AlertCircle } from 'lucide-react';
import { UserProfile, userManagementService } from '../services/userManagementService';

interface UserListViewProps {
  users: UserProfile[];
  onViewUser: (user: UserProfile) => void;
  onRefresh: () => void;
}

export const UserListView: React.FC<UserListViewProps> = ({ users, onViewUser, onRefresh }) => {
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userManagementService.deleteUser(userId);
        onRefresh();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20';
      case 'inactive': return 'bg-yellow-500/20';
      case 'suspended': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  if (users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No users found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/50">
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Last Login</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Purchases</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{user.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {user.createdAt instanceof Date 
                    ? user.createdAt.toLocaleDateString() 
                    : new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {user.lastLogin instanceof Date 
                    ? user.lastLogin.toLocaleDateString() 
                    : new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBg(user.status)} ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white">{user.totalPurchases}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onViewUser(user)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                      title="View details"
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user.userId)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
