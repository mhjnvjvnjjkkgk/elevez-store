// SECTION 4: Enhanced Rewards Page with Cyberpunk Aesthetic
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useLoyalty } from '../hooks/useLoyalty';
import { loyaltyRulesService } from '../services/loyaltyRulesService';
import { 
  Gift, Star, TrendingUp, Award, Share2, Phone, 
  Instagram, MessageCircle, Facebook, Sparkles, 
  ShoppingBag, Crown, Zap, Check, Copy, Clock, Hexagon
} from 'lucide-react';
import { HowItWorksSection } from './rewards/HowItWorksSection';
import { TiersBenefitsSection } from './rewards/TiersBenefitsSection';
import { RedeemRewardsSection } from './rewards/RedeemRewardsSection';
import { ClaimPointsSection } from './rewards/ClaimPointsSection';
import { PointsHistorySection } from './rewards/PointsHistorySection';

// Interactive Text Component for Animated Heading
const InteractiveText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`}>
    {text.split(" ").map((word, i) => (
      <span key={i} className="inline-flex whitespace-nowrap">
        {word.split("").map((char, j) => (
          <motion.span
            key={j}
            className="inline-block origin-bottom cursor-default"
            whileHover={{ 
              scale: 1.2, 
              y: -15,
              color: "#00ff88",
              rotate: Math.random() * 10 - 5,
              textShadow: "0 0 30px rgba(0,255,136,0.6)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    ))}
  </div>
);

export const RewardsPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const {
    profile,
    tierInfo,
    nextTier,
    pointsToNextTier,
    tierProgress,
    loading
  } = useLoyalty();

  // Safety timeout: never let the spinner show more than 4 seconds
  const [forceReady, setForceReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Dynamic rules state
  const [dynamicRules, setDynamicRules] = useState<any>(null);
  const [earningRate, setEarningRate] = useState<number>(0.1);
  const [tierThresholds, setTierThresholds] = useState<any[]>([]);

  // Load dynamic rules on mount
  useEffect(() => {
    const loadRules = async () => {
      try {
        const rules = await loyaltyRulesService.getRules();
        setDynamicRules(rules);
        setEarningRate(rules.pointsEarning.pointsPerDollar);
        setTierThresholds(rules.tiers);
        console.log('✅ Loaded dynamic loyalty rules:', rules);
      } catch (error) {
        console.error('❌ Error loading loyalty rules:', error);
      }
    };

    loadRules();

    // Subscribe to real-time rule changes
    const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
      console.log('🔄 Loyalty rules updated in real-time');
      setDynamicRules(rules);
      setEarningRate(rules.pointsEarning.pointsPerDollar);
      setTierThresholds(rules.tiers);
    });

    return () => unsubscribe();
  }, []);

  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  if (loading && !forceReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-[8px] border-black border-t-[#00ff88] animate-spin mx-auto mb-8 shadow-[8px_8px_0px_0px_#000]"></div>
          <p className="text-2xl font-black text-black uppercase tracking-widest animate-pulse">Syncing Rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-48 pb-20">
      {/* Hero Header */}
      <section className="relative px-6 mb-32">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-8 py-3 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-12">
            Loyalty Program
          </div>
          <h1 className="text-7xl md:text-[12rem] font-black font-syne mb-12 text-black uppercase leading-[0.85] tracking-tighter">
            ELITE <span className="text-[#00ff88]" style={{ WebkitTextStroke: '4px black' }}>SYNDICATE</span>
          </h1>
          
          {profile && (
            <div className="bg-white border-[8px] border-black p-12 shadow-[24px_24px_0px_0px_#00ff88] max-w-4xl mx-auto mt-20 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00ff88] -translate-y-20 translate-x-20 rotate-45 group-hover:scale-110 transition-transform" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-16 relative z-10">
                {/* Points */}
                <div className="flex-1">
                  <p className="text-sm font-black uppercase text-black opacity-50 mb-2">Available Balance</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-8xl md:text-9xl font-black text-black font-syne leading-none">{profile.points}</span>
                    <span className="text-2xl font-black text-black uppercase">PTS</span>
                  </div>
                </div>
                
                {/* Tier */}
                <div className="w-px h-32 bg-black hidden md:block" />
                
                <div className="flex-1">
                  <p className="text-sm font-black uppercase text-black opacity-50 mb-4">Current Status</p>
                  <div className="flex items-center gap-6">
                    <span className="text-6xl bg-black p-4 text-white border-[3px] border-black shadow-[6px_6px_0px_0px_#00ff88]">{tierInfo?.icon}</span>
                    <div>
                      <h2 className="text-4xl font-black uppercase text-black font-syne">{tierInfo?.name}</h2>
                      {nextTier && (
                        <p className="text-sm font-bold text-black uppercase mt-2">
                          <span className="text-[#00ff88] bg-black px-2 py-0.5">{pointsToNextTier}</span> PTS TO {nextTier.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {nextTier && (
                <div className="mt-12 h-10 border-[4px] border-black bg-white relative overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${tierProgress}%` }}
                    className="absolute inset-0 bg-[#00ff88] border-r-[4px] border-black"
                  />
                  <div className="absolute inset-0 flex items-center justify-center mix-blend-difference">
                    <span className="text-sm font-black uppercase text-white tracking-widest">{tierProgress.toFixed(0)}% TO NEXT TIER</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content sections */}
      <div className="space-y-32">
        <HowItWorksSection />
        <TiersBenefitsSection thresholds={tierThresholds} />
        <ClaimPointsSection earningRate={earningRate} />
        <RedeemRewardsSection />
        <PointsHistorySection />
      </div>
    </div>
  );
};
