import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { Gift, Sparkles, Check, Loader, Copy } from 'lucide-react';

export const RedeemRewardsSection: React.FC = () => {
  const { profile, redemptionOptions, redeemPoints } = useLoyalty();
  const [loading, setLoading] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRedeem = async (pointsCost: number, discount: number) => {
    if (!profile || profile.points < pointsCost) return;

    setLoading(true);
    try {
      const code = await redeemPoints(pointsCost, discount);
      setRedeemedCode(code.code);
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

        {/* Success Modal */}
        {redeemedCode && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl 
                     rounded-3xl p-8 border-2 border-green-500/50 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 
                          flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/50">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Code Generated!</h3>
            <p className="text-white/70 mb-6">Your discount code is ready to use</p>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-4 inline-block">
              <p className="text-4xl font-bold text-white tracking-wider">{redeemedCode}</p>
            </div>

            <button
              onClick={copyCode}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl 
                       text-white font-semibold hover:shadow-lg transition-all duration-300 
                       flex items-center gap-2 mx-auto"
            >
              {copiedCode ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Code
                </>
              )}
            </button>
          </motion.div>
        )}

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
                              transition-all duration-300 ${
                                canAfford 
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
                              flex items-center justify-center gap-2 ${
                                canAfford
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
            💡 <strong>Pro Tip:</strong> Discount codes are valid for 30 days and can be used at checkout. 
            Higher point redemptions offer better value!
          </p>
        </motion.div>
      </div>
    </section>
  );
};
