import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { loyaltyRulesService, TierConfig } from '../../services/loyaltyRulesService';
import { Check, Lock } from 'lucide-react';

export const TiersBenefitsSection: React.FC = () => {
  const { profile, tierInfo } = useLoyalty();
  const [tiers, setTiers] = useState<TierConfig[]>([]);

  // Load dynamic tiers from Firebase
  useEffect(() => {
    const loadTiers = async () => {
      const rules = await loyaltyRulesService.getRules();
      setTiers(rules.tiers);
    };
    loadTiers();

    // Subscribe to real-time updates
    const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
      setTiers(rules.tiers);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-24 px-6 bg-white border-y-[8px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Hierarchy
          </div>
          <h2 className="text-6xl md:text-8xl font-black font-syne text-black uppercase leading-none tracking-tighter">
            MEMBERSHIP <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>TIERS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(tiers || []).map((tier, index) => {
            if (!tier) return null;
            const isCurrentTier = tierInfo?.name === tier.name;
            const isUnlocked = (tier.pointsRequired || 0) === 0 || (profile && (profile.totalPointsEarned ?? 0) >= (tier.pointsRequired || 0));

            return (
              <motion.div
                key={tier.name || index}
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: isCurrentTier ? -16 : -8 }}
                className={`bg-white border-[6px] border-black p-10 transition-all relative group h-full flex flex-col ${
                  isCurrentTier 
                    ? 'shadow-[16px_16px_0px_0px_#00ff88] -translate-y-4' 
                    : isUnlocked
                      ? 'shadow-[12px_12px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88]'
                      : 'shadow-[12px_12px_0px_0px_#000] opacity-60 grayscale'
                }`}
              >
                {/* Status Badge */}
                {isCurrentTier && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#00ff88] px-6 py-2 border-[4px] border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] z-20 whitespace-nowrap">
                    ACTIVE STATUS
                  </div>
                )}

                {/* Lock Icon */}
                {!isUnlocked && (
                  <div className="absolute top-4 right-4 bg-black p-2 text-white border-[2px] border-black">
                    <Lock size={20} />
                  </div>
                )}

                {/* Tier Icon */}
                <div className="text-8xl mb-8 text-center bg-black/5 p-8 border-[3px] border-black border-dashed">
                  {tier.icon || '💎'}
                </div>

                {/* Tier Info */}
                <h3 className="text-3xl font-black uppercase text-black text-center mb-2 font-syne">{tier.name || 'Tier'}</h3>
                <p className="text-center font-black text-black opacity-40 uppercase tracking-tighter mb-10 pb-10 border-b-[3px] border-black border-dashed">
                  {(tier.pointsRequired || 0) === 0 ? 'ENTRY LEVEL' : `${tier.pointsRequired || 0}+ TOTAL PTS`}
                </p>

                {/* Benefits List */}
                <div className="space-y-6 flex-grow">
                  {tier.benefits?.discountPercentage > 0 && (
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center border-[2px] border-black ${isUnlocked ? 'bg-[#00ff88]' : 'bg-black/10'}`}>
                        <Check size={16} className="text-black font-black" />
                      </div>
                      <p className="text-sm font-black uppercase text-black leading-none">{tier.benefits.discountPercentage}% DISCOUNT</p>
                    </div>
                  )}
                  
                  {tier.benefits?.earningMultiplier > 1 && (
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center border-[2px] border-black ${isUnlocked ? 'bg-[#00ff88]' : 'bg-black/10'}`}>
                        <Check size={16} className="text-black font-black" />
                      </div>
                      <p className="text-sm font-black uppercase text-black leading-none">{tier.benefits.earningMultiplier}X MULTIPLIER</p>
                    </div>
                  )}
                  
                  {tier.benefits?.freeShippingThreshold > 0 && (
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center border-[2px] border-black ${isUnlocked ? 'bg-[#00ff88]' : 'bg-black/10'}`}>
                        <Check size={16} className="text-black font-black" />
                      </div>
                      <p className="text-sm font-black uppercase text-black leading-none">FREE SHIPPING OVER ₹{tier.benefits.freeShippingThreshold}</p>
                    </div>
                  )}
                  
                  {tier.benefits?.exclusiveAccess && (
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 flex items-center justify-center border-[2px] border-black ${isUnlocked ? 'bg-[#00ff88]' : 'bg-black/10'}`}>
                        <Check size={16} className="text-black font-black" />
                      </div>
                      <p className="text-sm font-black uppercase text-black leading-none">VIP ACCESS</p>
                    </div>
                  )}
                </div>

                {/* Progress bar for locked tiers */}
                {!isUnlocked && profile && tier.pointsRequired > 0 && (
                  <div className="mt-10 pt-10 border-t-[3px] border-black">
                    <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-black">
                      <span>Progress</span>
                      <span>{tier.pointsRequired - (profile.totalPointsEarned ?? 0)} PTS LEFT</span>
                    </div>
                    <div className="h-4 border-[3px] border-black bg-white relative overflow-hidden">
                      <div 
                        className="h-full bg-black"
                        style={{ 
                          width: `${Math.min(100, ((profile.totalPointsEarned ?? 0) / tier.pointsRequired) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
