import React from 'react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { TIER_CONFIGS } from '../../services/loyaltyService';
import { Check, Lock } from 'lucide-react';

export const TiersBenefitsSection: React.FC = () => {
  const { profile, tierInfo } = useLoyalty();

  return (
    <section className="py-20 px-4 bg-black/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Membership Tiers</h2>
          <p className="text-xl text-white/70">Unlock better rewards as you progress</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIER_CONFIGS.map((tier, index) => {
            const isCurrentTier = tierInfo?.name === tier.name;
            const isUnlocked = profile && profile.totalPointsEarned >= tier.minPoints;

            return (
              <motion.div
                key={tier.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 h-full
                              transition-all duration-300 ${
                                isCurrentTier 
                                  ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105' 
                                  : 'border-white/20 hover:border-white/40'
                              }`}>
                  
                  {/* Current Tier Badge */}
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 
                                  bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full 
                                  text-xs font-bold text-white shadow-lg">
                      CURRENT TIER
                    </div>
                  )}

                  {/* Lock Badge */}
                  {!isUnlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-white/30" />
                    </div>
                  )}

                  {/* Tier Icon */}
                  <div className="text-6xl mb-4 text-center">{tier.icon}</div>

                  {/* Tier Name */}
                  <h3 className="text-2xl font-bold text-white text-center mb-2">{tier.name}</h3>
                  
                  {/* Min Points */}
                  <p className="text-center text-white/70 text-sm mb-6">
                    {tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints}+ points`}
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isUnlocked ? 'text-green-400' : 'text-white/30'
                        }`} />
                        <p className={`text-sm ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress to this tier */}
                  {!isUnlocked && profile && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-xs text-white/70 mb-2">
                        {tier.minPoints - profile.totalPointsEarned} points to unlock
                      </p>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (profile.totalPointsEarned / tier.minPoints) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
