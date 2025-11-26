// Admin Change Notification Component
// Displays notifications when admin changes user data

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp, Award, Check } from 'lucide-react';
import { useUserChangeNotification, useRealtimeUserSync, usePointsChangeTracker, useTierChangeTracker } from '../hooks/useRealtimeUserSync';

export const AdminChangeNotification: React.FC = () => {
  const notification = useUserChangeNotification();

  if (!notification || !notification.show) {
    return null;
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'points':
        return <TrendingUp size={24} className="text-[#00ff88]" />;
      case 'tier':
        return <Award size={24} className="text-yellow-500" />;
      case 'both':
        return <Check size={24} className="text-[#00ff88]" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'points':
        return 'from-[#00ff88]/20 to-[#00ff88]/5 border-[#00ff88]';
      case 'tier':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500';
      case 'both':
        return 'from-purple-500/20 to-purple-500/5 border-purple-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-4 right-4 z-50 bg-gradient-to-r ${getColor()} border rounded-lg p-4 flex items-center gap-3 max-w-sm shadow-2xl`}
      >
        {getIcon()}
        <div className="flex-1">
          <p className="font-bold text-white">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">Updated by admin</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Component for displaying points change
 */
export const PointsChangeIndicator: React.FC<{ showAnimation?: boolean }> = ({
  showAnimation = true,
}) => {
  const { value, changed } = useRealtimeUserSync();

  return (
    <motion.div
      animate={changed && showAnimation ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      <span className={`font-bold ${changed ? 'text-[#00ff88]' : 'text-white'}`}>
        {value}
      </span>
    </motion.div>
  );
};

/**
 * Component for displaying tier change
 */
export const TierChangeIndicator: React.FC<{ showAnimation?: boolean }> = ({
  showAnimation = true,
}) => {
  const { tier, changed } = useRealtimeUserSync();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return 'text-amber-700';
      case 'Silver':
        return 'text-gray-400';
      case 'Gold':
        return 'text-yellow-500';
      case 'Platinum':
        return 'text-purple-400';
      default:
        return 'text-white';
    }
  };

  return (
    <motion.div
      animate={changed && showAnimation ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      <span className={`font-bold ${getTierColor(tier)}`}>{tier}</span>
    </motion.div>
  );
};

/**
 * Component for displaying points history
 */
export const PointsHistoryWidget: React.FC = () => {
  const { currentPoints, history } = useRealtimeUserSync();

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Recent Changes</h3>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {history.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-400">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={entry.change > 0 ? 'text-[#00ff88]' : 'text-red-500'}>
              {entry.change > 0 ? '+' : ''}{entry.change}
            </span>
            <span className="text-white font-bold">{entry.points}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Component for displaying tier history
 */
export const TierHistoryWidget: React.FC = () => {
  const { currentTier, history } = useRealtimeUserSync();

  if (history.length === 0) {
    return null;
  }

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return '🥉';
      case 'Silver':
        return '🥈';
      case 'Gold':
        return '🥇';
      case 'Platinum':
        return '💎';
      default:
        return '⭐';
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Tier History</h3>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {history.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-400">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-white font-bold">
              {getTierEmoji(entry.tier)} {entry.tier}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full change notification with details
 */
export const DetailedChangeNotification: React.FC = () => {
  const notification = useUserChangeNotification();
  const { points, tier } = useRealtimeUserSync();

  if (!notification || !notification.show) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-lg p-6 max-w-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00ff88]/20 rounded-full flex items-center justify-center">
              <Check size={24} className="text-[#00ff88]" />
            </div>
            <div>
              <h3 className="font-bold">Account Updated</h3>
              <p className="text-sm text-gray-400">By admin</p>
            </div>
          </div>

          <div className="space-y-2 bg-zinc-800/50 p-4 rounded-lg">
            {notification.type === 'points' || notification.type === 'both' ? (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Points</span>
                <span className="font-bold text-[#00ff88]">{points}</span>
              </div>
            ) : null}

            {notification.type === 'tier' || notification.type === 'both' ? (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tier</span>
                <span className="font-bold text-yellow-500">{tier}</span>
              </div>
            ) : null}
          </div>

          <p className="text-sm text-gray-400 text-center">{notification.message}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
