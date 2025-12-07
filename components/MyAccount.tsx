// My Account Page - User profile, orders, and points
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Star, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLoyalty } from '../hooks/useLoyalty';
import { useUserOrders } from '../hooks/useUserOrders';
import { OrderHistory } from './OrderHistory';
import { UserPointsHistoryDisplay } from './UserPointsHistoryDisplay';
import { useNavigate } from 'react-router-dom';
import { orderPointsSyncService } from '../services/orderPointsSyncService';

type TabType = 'profile' | 'orders' | 'points';

export const MyAccount: React.FC = () => {
  const { user } = useAuth();
  const { profile, tierInfo } = useLoyalty();
  const { orders, orderCount } = useUserOrders();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  // Sync points from orders when component mounts
  useEffect(() => {
    if (user) {
      const syncPoints = async () => {
        setSyncing(true);
        console.log('🔄 Syncing user points from orders...');
        const result = await orderPointsSyncService.syncUserPointsFromOrders(user.uid);
        if (result.success) {
          console.log('✅ Points synced:', result.totalPoints);
        }
        setSyncing(false);
      };
      syncPoints();
    }
  }, [user]);

  if (!user) {
    navigate('/');
    return null;
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'orders' as TabType, label: 'Orders', icon: Package, badge: orderCount },
    { id: 'points' as TabType, label: 'Points & Rewards', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#00ff88]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-[#00ff88] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">User ID</label>
                  <p className="text-white font-mono text-sm">{user.uid}</p>
                </div>

                {profile && (
                  <>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Loyalty Tier</label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tierInfo?.icon}</span>
                        <span className="text-white font-bold">{tierInfo?.name}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Total Points</label>
                      <p className="text-[#00ff88] text-2xl font-bold">{profile.points}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Total Orders</label>
                      <p className="text-white">{orderCount}</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && <OrderHistory />}

          {activeTab === 'points' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <UserPointsHistoryDisplay />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
