// SECTION 3: Enhanced Rewards Modal with Cyberpunk Aesthetic
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useLoyalty } from '../hooks/useLoyalty';
import { X, Gift, TrendingUp, Award, Clock, Copy, Check, Zap, Star, Crown } from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    transactions,
    availableCodes,
    tierInfo,
    nextTier,
    pointsToNextTier,
    tierProgress,
    loading
  } = useLoyalty();

  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Animate points counter
  useEffect(() => {
    if (profile && isOpen) {
      const duration = 1000;
      const steps = 50;
      const increment = profile.points / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= profile.points) {
          setAnimatedPoints(profile.points);
          clearInterval(timer);
        } else {
          setAnimatedPoints(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [profile, isOpen]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with Scan Lines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(0, 255, 136, 0.03) 0px,
                  transparent 1px,
                  transparent 2px,
                  rgba(0, 255, 136, 0.03) 3px
                )
              `
            }}
          />

          {/* Modal with Holographic Effect - FIXED SCROLLING */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[5vh] left-1/2 -translate-x-1/2 w-[95%] max-w-3xl h-[85vh] z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Holographic Container */}
            <div className="relative w-full h-full bg-gradient-to-br from-black via-zinc-900 to-black 
                          rounded-2xl border-2 border-[#00ff88]/30 shadow-2xl flex flex-col">
              
              {/* Static Neon Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}
                />
              </div>

              {/* Static Corner Accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#00ff88]/20 blur-3xl rounded-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
              
              {/* Static Border Glow */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 30px rgba(0, 255, 136, 0.1)'
                }}
              />

              {/* Enhanced Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-[#00ff88] 
                         backdrop-blur-xl border-2 border-[#00ff88]/50 transition-all duration-300 group
                         shadow-lg shadow-[#00ff88]/20"
              >
                <X className="w-6 h-6 text-[#00ff88] group-hover:text-black transition-colors" />
              </motion.button>

              {/* Scrollable Content - FIXED */}
              <div className="relative flex-1 overflow-y-auto p-4 md:p-6"
                   style={{
                     scrollbarWidth: 'thin',
                     scrollbarColor: '#00ff88 #1a1a1a'
                   }}
              >
                
                {/* Compact Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-cyan-500 
                                  flex items-center justify-center shadow-lg border-2 border-black">
                      <Gift className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-white font-syne"
                        style={{ textShadow: '0 0 15px rgba(0, 255, 136, 0.4)' }}>
                      YOUR REWARDS
                    </h2>
                  </div>
                  <p className="text-[#00ff88]/70 text-xs uppercase tracking-wider">
                    Earn • Unlock • Redeem
                  </p>
                </div>

                {/* Compact Points Card */}
                <div className="relative bg-black/60 backdrop-blur-xl rounded-xl p-4 border border-[#00ff88]/30 mb-4
                              shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Available Points</p>
                      <p className="text-4xl font-black text-[#00ff88]">
                        {animatedPoints.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tierInfo?.icon}</span>
                        <div>
                          <p className="text-lg font-bold text-white">{tierInfo?.name}</p>
                          {nextTier && (
                            <p className="text-xs text-white/60">
                              {pointsToNextTier} to {nextTier.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Progress Bar */}
                  {nextTier && (
                    <div className="mt-3">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00ff88] to-cyan-500 rounded-full transition-all duration-1000"
                          style={{ width: `${tierProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Compact Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                    <TrendingUp className="w-4 h-4 text-[#00ff88] mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{profile?.totalPointsEarned || 0}</p>
                    <p className="text-[10px] text-white/60">Earned</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                    <Award className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{availableCodes.length}</p>
                    <p className="text-[10px] text-white/60">Codes</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                    <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{transactions.length}</p>
                    <p className="text-[10px] text-white/60">Activity</p>
                  </div>
                </div>

                {/* Compact Discount Codes */}
                {availableCodes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[#00ff88]" />
                      Your Codes
                    </h3>
                    <div className="space-y-2">
                      {availableCodes.slice(0, 3).map((code) => (
                        <div
                          key={code.id}
                          className="bg-white/5 rounded-lg p-3 border border-white/10 
                                   hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#00ff88] truncate">{code.code}</p>
                              <p className="text-xs text-white/60">
                                ₹{code.discountAmount} off
                              </p>
                            </div>
                            <button
                              onClick={() => copyCode(code.code)}
                              className="px-3 py-1.5 bg-[#00ff88] rounded-lg text-black text-xs font-bold
                                       hover:bg-cyan-400 transition-all flex items-center gap-1 flex-shrink-0"
                            >
                              {copiedCode === code.code ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                      {availableCodes.length > 3 && (
                        <p className="text-xs text-center text-white/50">
                          +{availableCodes.length - 3} more codes
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Compact Activity */}
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-2">Recent Activity</h3>
                  <div className="space-y-1.5">
                    {transactions.slice(0, 4).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-white/5 rounded-lg p-2 border border-white/10
                                 flex items-center justify-between text-xs"
                      >
                        <p className="text-white/80 truncate flex-1 mr-2">{transaction.reason}</p>
                        <p className={`font-bold flex-shrink-0 ${transaction.type === 'earn' ? 'text-[#00ff88]' : 'text-red-400'}`}>
                          {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <a
                    href="/#/rewards"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = '/rewards';
                      onClose();
                    }}
                    className="block w-full py-3 bg-gradient-to-r from-[#00ff88] to-cyan-500 
                             rounded-xl text-black font-bold text-center hover:shadow-lg 
                             hover:shadow-[#00ff88]/30 transition-all transform hover:scale-[1.02]
                             border-2 border-black"
                  >
                    View All Rewards →
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Optimized Floating Rewards Button
export const FloatingRewardsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { profile } = useLoyalty();

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-[#00ff88] to-cyan-500
               shadow-xl shadow-[#00ff88]/40 flex items-center justify-center overflow-hidden
               border-3 border-black"
    >
      {/* Single Pulse Ring */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[#00ff88] rounded-full"
      />
      
      {/* Inner Circle */}
      <div className="absolute inset-1.5 bg-black rounded-full" />
      
      {/* Icon */}
      <div className="relative z-10">
        <Gift className="w-8 h-8 text-[#00ff88]" />
      </div>
      
      {/* Optimized Points Badge */}
      {profile && profile.points > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-gradient-to-br from-[#00ff88] to-cyan-500 
                   text-black font-bold rounded-full min-w-[1.75rem] h-7 px-1.5
                   flex items-center justify-center border-2 border-black
                   shadow-lg"
        >
          <span className="text-[10px] leading-none">
            {profile.points > 999 ? '999+' : profile.points}
          </span>
        </motion.div>
      )}
    </motion.button>
  );
};
