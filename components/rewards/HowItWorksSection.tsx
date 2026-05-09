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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Process
          </div>
          <h2 className="text-6xl md:text-8xl font-black font-syne text-black uppercase leading-none tracking-tighter">
            HOW IT <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>WORKS</span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all group relative"
            >
              {/* Step Number */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_0px_#000]">
                {index + 1}
              </div>

              {/* Icon Container */}
              <div className="w-20 h-20 bg-black text-white border-[3px] border-black flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_#00ff88] group-hover:scale-110 transition-transform">
                <step.icon size={40} className="text-[#00ff88]" />
              </div>
              
              {/* Content */}
              <h3 className="text-3xl font-black text-black mb-4 uppercase font-syne tracking-tight">
                {step.title}
              </h3>
              <p className="text-black font-bold text-lg uppercase opacity-60 leading-tight">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
