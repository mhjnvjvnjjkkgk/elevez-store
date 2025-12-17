import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Gift, Sparkles, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { loyaltyRulesService } from '../../services/loyaltyRulesService';

export const HowItWorksSection: React.FC = () => {
  const [earningRate, setEarningRate] = useState<string>('1 point per $10');

  // Load dynamic earning rate
  useEffect(() => {
    const loadEarningRate = async () => {
      const rules = await loyaltyRulesService.getRules();
      const rate = rules.pointsEarning.pointsPerDollar;
      
      // Format rate for display
      if (rate >= 1) {
        setEarningRate(`${rate} points per ₹1`);
      } else {
        const dollarsPerPoint = Math.round(1 / rate);
        setEarningRate(`1 point per ₹${dollarsPerPoint}`);
      }
    };
    loadEarningRate();

    // Subscribe to real-time updates
    const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
      const rate = rules.pointsEarning.pointsPerDollar;
      if (rate >= 1) {
        setEarningRate(`${rate} points per ₹1`);
      } else {
        const dollarsPerPoint = Math.round(1 / rate);
        setEarningRate(`1 point per ₹${dollarsPerPoint}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const steps = [
    {
      icon: ShoppingBag,
      title: 'Shop & Earn',
      description: `Earn ${earningRate} spent. The more you shop, the more you earn!`,
      color: 'from-[#00ff88] to-cyan-500',
      glowColor: 'rgba(0, 255, 136, 0.3)'
    },
    {
      icon: Sparkles,
      title: 'Complete Actions',
      description: 'Get bonus points by sharing on social media, adding phone number, and more.',
      color: 'from-purple-500 to-pink-500',
      glowColor: 'rgba(168, 85, 247, 0.3)'
    },
    {
      icon: TrendingUp,
      title: 'Unlock Tiers',
      description: 'Progress through Bronze, Silver, Gold, and Platinum tiers for better rewards.',
      color: 'from-yellow-500 to-orange-500',
      glowColor: 'rgba(251, 191, 36, 0.3)'
    },
    {
      icon: Gift,
      title: 'Redeem Rewards',
      description: 'Use your points to get discount codes and save on your next purchase.',
      color: 'from-[#00ff88] to-emerald-500',
      glowColor: 'rgba(0, 255, 136, 0.3)'
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <Zap className="w-12 h-12 text-[#00ff88] mx-auto" />
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 font-syne tracking-tight"
              style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}>
            HOW IT <span className="text-[#00ff88]">WORKS</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#00ff88]" />
            <p className="text-[#00ff88]/70 uppercase tracking-widest text-sm">
              Four Simple Steps
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#00ff88]" />
          </div>
        </motion.div>

        {/* Enhanced Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group"
              >
                {/* Optimized Card Container */}
                <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl p-6 
                              border-2 border-white/10 hover:border-[#00ff88]/50 
                              transition-all duration-300 h-full overflow-hidden
                              shadow-xl hover:shadow-2xl"
                     style={{ 
                       boxShadow: `0 0 0 rgba(0, 255, 136, 0), inset 0 0 20px rgba(0, 0, 0, 0.5)`,
                       transition: 'all 0.3s'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.boxShadow = `0 0 30px ${step.glowColor}, inset 0 0 20px rgba(0, 0, 0, 0.5)`;
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.boxShadow = `0 0 0 rgba(0, 255, 136, 0), inset 0 0 20px rgba(0, 0, 0, 0.5)`;
                     }}
                >
                  {/* Static Background Grid */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  
                  {/* Step Number (Large Background) */}
                  <div className="absolute top-4 right-4 text-7xl font-black text-[#00ff88]/5 font-syne">
                    {index + 1}
                  </div>

                  {/* Icon Container */}
                  <div 
                    className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} 
                              flex items-center justify-center mb-4 shadow-lg 
                              group-hover:scale-110 transition-transform duration-300
                              border-2 border-black`}
                  >
                    <step.icon className="w-8 h-8 text-black relative z-10" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white mb-2 font-syne tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#00ff88]/20 
                                group-hover:border-[#00ff88]/50 transition-colors" />
                </div>
              </motion.div>

              {/* Static Arrow Between Steps (Desktop Only) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="hidden lg:flex items-center justify-center absolute"
                  style={{ 
                    left: `${(index + 1) * 25 - 2}%`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <ArrowRight className="w-6 h-6 text-[#00ff88]/50" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
