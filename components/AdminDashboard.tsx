import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, Gift, TrendingUp, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AdminDiscountPanel } from './AdminDiscountPanel';
import { AdminPointsPanel } from './AdminPointsPanel';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { RealtimeAnalyticsDashboard } from './RealtimeAnalyticsDashboard';
import { Phase5Dashboard } from './Phase5Dashboard';
import { AdminPointsHistoryPanel } from './AdminPointsHistoryPanel';
import { AdminUserPortal } from './AdminUserPortal';
import { AdminCollectionsPanel } from './AdminCollectionsPanel';

interface AdminDashboardProps {
  adminId: string;
  onLogout?: () => void;
}

type AdminTab = 'overview' | 'discounts' | 'points' | 'users' | 'analytics' | 'advanced-analytics' | 'realtime-analytics' | 'phase5' | 'points-history' | 'user-management' | 'collections';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      onLogout?.();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'collections', label: 'Collections', icon: <Gift size={20} /> },
    { id: 'user-management', label: 'User Management', icon: <Users size={20} /> },
    { id: 'discounts', label: 'Discounts', icon: <Gift size={20} /> },
    { id: 'points', label: 'Points', icon: <TrendingUp size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'advanced-analytics', label: 'Advanced', icon: <TrendingUp size={20} /> },
    { id: 'realtime-analytics', label: 'Real-time', icon: <TrendingUp size={20} /> },
    { id: 'phase5', label: 'Phase 5', icon: <TrendingUp size={20} /> },
    { id: 'points-history', label: 'Points History', icon: <TrendingUp size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff88] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-400">Elevez Management</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-400">ID: {adminId.substring(0, 8)}...</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`fixed md:relative w-64 h-[calc(100vh-80px)] bg-zinc-900/50 border-r border-white/10 overflow-y-auto transition-all ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-6 space-y-2">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#00ff88] text-black font-bold'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Mobile Logout */}
          <div className="md:hidden p-6 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-screen bg-black pt-20 pb-20 px-6"
              >
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Total Users', value: '1,234', icon: '👥', color: 'from-blue-500 to-blue-600' },
                      { label: 'Active Codes', value: '45', icon: '🎟️', color: 'from-green-500 to-green-600' },
                      { label: 'Points Allocated', value: '50K', icon: '⭐', color: 'from-yellow-500 to-yellow-600' },
                      { label: 'Revenue Impact', value: '₹2.5L', icon: '💰', color: 'from-purple-500 to-purple-600' }
                    ].map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-br ${card.color} rounded-lg p-6 text-white`}
                      >
                        <div className="text-4xl mb-2">{card.icon}</div>
                        <p className="text-sm opacity-90">{card.label}</p>
                        <p className="text-3xl font-bold">{card.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-zinc-900 border border-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Create Discount Code', action: () => setActiveTab('discounts') },
                          { label: 'Allocate Points', action: () => setActiveTab('points') },
                          { label: 'View Analytics', action: () => setActiveTab('analytics') },
                          { label: 'Manage Users', action: () => setActiveTab('users') }
                        ].map((action, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={action.action}
                            className="w-full text-left px-4 py-3 bg-black/50 hover:bg-[#00ff88]/20 border border-white/10 hover:border-[#00ff88]/50 rounded-lg text-white transition-all"
                          >
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-zinc-900 border border-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {[
                          { action: 'Code created', time: '2 min ago', user: 'ADMIN001' },
                          { action: 'Points allocated', time: '15 min ago', user: 'USER123' },
                          { action: 'Code used', time: '1 hour ago', user: 'USER456' },
                          { action: 'User registered', time: '3 hours ago', user: 'USER789' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{activity.action}</p>
                              <p className="text-xs text-gray-400">{activity.user}</p>
                            </div>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'discounts' && (
              <motion.div
                key="discounts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminDiscountPanel adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'points' && (
              <motion.div
                key="points"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminPointsPanel adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminUserManagement adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminAnalyticsDashboard adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'advanced-analytics' && (
              <motion.div
                key="advanced-analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdvancedAnalyticsDashboard adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'realtime-analytics' && (
              <motion.div
                key="realtime-analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RealtimeAnalyticsDashboard adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'phase5' && (
              <motion.div
                key="phase5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Phase5Dashboard adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'points-history' && (
              <motion.div
                key="points-history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminPointsHistoryPanel adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'user-management' && (
              <motion.div
                key="user-management"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminUserPortal adminId={adminId} />
              </motion.div>
            )}

            {activeTab === 'collections' && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminCollectionsPanel adminId={adminId} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
