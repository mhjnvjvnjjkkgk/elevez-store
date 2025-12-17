import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { Gift, Sparkles, Check, Loader, Copy, X, ShoppingBag, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const colors = ['#00ff88', '#ff00ff', '#00ffff', '#ffff00', '#ff8800', '#ff0088'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100;
  const duration = 2 + Math.random() * 2;

  return (
    <motion.div
      initial={{ y: -20, x: x + '%', opacity: 1, scale: 0 }}
      animate={{
        y: 400,
        x: `${x + (Math.random() - 0.5) * 50}%`,
        opacity: [1, 1, 0],
        scale: [0, 1, 1],
        rotate: Math.random() * 720 - 360
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
      className="absolute top-0 w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
};

export const RedeemRewardsSection: React.FC = () => {
  const navigate = useNavigate();
  const { profile, redemptionOptions, redeemPoints } = useLoyalty();
  const [loading, setLoading] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedAmount, setRedeemedAmount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<number[]>([]);

  const handleRedeem = async (pointsCost: number, discount: number) => {
    if (!profile || profile.points < pointsCost) return;

    setLoading(true);
    try {
      const code = await redeemPoints(pointsCost, discount);
      setRedeemedCode(code.code);
      setRedeemedAmount(discount);
      setShowModal(true);
      // Create confetti particles
      setConfettiParticles(Array.from({ length: 50 }, (_, i) => i));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (redeemedCode) {
      navigator.clipboard.writeText(redeemedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setRedeemedCode(null);
    setConfettiParticles([]);
  };

  const goToShop = () => {
    closeModal();
    navigate('/#shop');
  };

  return (
    <section className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Redeem Your Points</h2>
          <p className="text-xl text-white/70">Convert points into discount codes</p>
        </motion.div>

        {/* Beautiful Animated Success Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              onClick={closeModal}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              {/* Confetti Container */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {confettiParticles.map((i) => (
                  <ConfettiParticle key={i} delay={i * 0.02} />
                ))}
              </div>

              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-3xl p-8 md:p-12 border-2 border-green-500/50 
                         max-w-lg w-full shadow-2xl shadow-green-500/20 text-center overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white/60" />
                </button>

                {/* Animated Success Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="relative mx-auto mb-6"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 
                                flex items-center justify-center shadow-2xl shadow-green-500/50">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Check className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>
                  </div>
                  {/* Pulsing ring effect */}
                  <motion.div
                    animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500/30"
                  />
                </motion.div>

                {/* Celebration Icons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <PartyPopper className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-3xl md:text-4xl font-bold text-white">Congratulations!</h3>
                  <PartyPopper className="w-6 h-6 text-yellow-400 scale-x-[-1]" />
                </motion.div>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70 text-lg mb-8"
                >
                  You've successfully redeemed <span className="text-green-400 font-bold">₹{redeemedAmount}</span> discount!
                </motion.p>

                {/* Discount Code Display */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl 
                           rounded-2xl p-6 mb-6 border border-purple-500/30"
                >
                  <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">Your Discount Code</p>
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="text-4xl md:text-5xl font-bold text-white tracking-widest mb-4"
                  >
                    {redeemedCode}
                  </motion.p>
                  <button
                    onClick={copyCode}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                              flex items-center gap-2 mx-auto ${copiedCode
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Auto-apply Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-emerald-500/10 rounded-xl p-4 mb-6 border border-emerald-500/30"
                >
                  <p className="text-emerald-300 text-sm">
                    ✨ <strong>Auto-Apply:</strong> This code will appear in your checkout page automatically!
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <button
                    onClick={goToShop}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl 
                             text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 
                             transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Now & Use Code
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 py-4 bg-white/10 rounded-xl text-white font-semibold 
                             hover:bg-white/20 transition-all duration-300"
                  >
                    Redeem More
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redemption Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redemptionOptions.map((option, index) => {
            const canAfford = profile && profile.points >= option.points;
            const savingsPercent = Math.round((option.discount / option.points) * 100);

            return (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={canAfford ? { y: -10, scale: 1.02 } : {}}
                className="relative group"
              >
                <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 h-full
                              transition-all duration-300 ${canAfford
                    ? 'border-white/20 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/30'
                    : 'border-white/10 opacity-60'
                  }`}>

                  {/* Best Value Badge */}
                  {index === 2 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 
                                  bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full 
                                  text-xs font-bold text-white shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      BEST VALUE
                    </div>
                  )}

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 
                                flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>

                  {/* Discount Amount */}
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-white mb-2">₹{option.discount}</p>
                    <p className="text-white/70">Discount Code</p>
                  </div>

                  {/* Points Cost */}
                  <div className="bg-white/10 rounded-xl p-3 mb-4 text-center">
                    <p className="text-2xl font-bold text-white">{option.points} Points</p>
                  </div>

                  {/* Value Indicator */}
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-green-500/20 rounded-full 
                                   text-green-300 text-sm font-semibold">
                      {savingsPercent}% value
                    </span>
                  </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeem(option.points, option.discount)}
                    disabled={!canAfford || loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 
                              flex items-center justify-center gap-2 ${canAfford
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                      }`}
                  >
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : canAfford ? (
                      'Redeem Now'
                    ) : (
                      `Need ${option.points - (profile?.points || 0)} more`
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
        >
          <p className="text-white/90 text-center">
            💡 <strong>Pro Tip:</strong> Discount codes are valid for 30 days and will auto-appear at checkout.
            Higher point redemptions offer better value!
          </p>
        </motion.div>
      </div>
    </section>
  );
};
