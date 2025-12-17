// Loyalty Rules Notification Banner Component
// Shows users when loyalty rules change

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { loyaltyRulesNotificationService, RulesChangeNotification } from '../services/loyaltyRulesNotificationService';

export const LoyaltyRulesNotificationBanner: React.FC = () => {
  const [notifications, setNotifications] = useState<RulesChangeNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Subscribe to rule change notifications
    const unsubscribe = loyaltyRulesNotificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep last 5
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (index: number) => {
    setDismissed(prev => new Set(prev).add(index));
  };

  const visibleNotifications = notifications.filter((_, index) => !dismissed.has(index));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={`${notification.timestamp.getTime()}-${index}`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              relative overflow-hidden rounded-lg shadow-2xl border-2
              ${notification.impact === 'positive' ? 'bg-green-900/90 border-green-500/50' : ''}
              ${notification.impact === 'negative' ? 'bg-red-900/90 border-red-500/50' : ''}
              ${notification.impact === 'neutral' ? 'bg-blue-900/90 border-blue-500/50' : ''}
              backdrop-blur-xl
            `}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-full h-full"
              />
            </div>

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${notification.impact === 'positive' ? 'bg-green-500/20' : ''}
                  ${notification.impact === 'negative' ? 'bg-red-500/20' : ''}
                  ${notification.impact === 'neutral' ? 'bg-blue-500/20' : ''}
                `}>
                  {notification.impact === 'positive' && <TrendingUp className="text-green-400" size={20} />}
                  {notification.impact === 'negative' && <TrendingDown className="text-red-400" size={20} />}
                  {notification.impact === 'neutral' && <Info className="text-blue-400" size={20} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell size={14} className="text-white/70" />
                    <p className="text-xs text-white/70 uppercase tracking-wider font-bold">
                      Loyalty Program Update
                    </p>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-white/80 text-sm">
                    {notification.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => handleDismiss(index)}
                  className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} className="text-white/70" />
                </button>
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
                onAnimationComplete={() => handleDismiss(index)}
                className={`
                  absolute bottom-0 left-0 h-1
                  ${notification.impact === 'positive' ? 'bg-green-500' : ''}
                  ${notification.impact === 'negative' ? 'bg-red-500' : ''}
                  ${notification.impact === 'neutral' ? 'bg-blue-500' : ''}
                `}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
