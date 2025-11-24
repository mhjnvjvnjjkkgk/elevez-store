// SECTION 4: Enhanced Rewards Page with Cyberpunk Aesthetic
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useLoyalty } from '../hooks/useLoyalty';
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

  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 
                    flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      {/* Optimized Static Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Static Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Static Scan Lines */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0, 255, 136, 0.1) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0, 255, 136, 0.1) 3px
            )`
          }}
        />
        
        {/* Static Glowing Orbs - No Animation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Enhanced Hero Header */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative z-10 pt-32 pb-20 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Simplified Icon Container */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="inline-block mb-8 relative"
          >
            {/* Static Hexagon Border */}
            <div className="absolute inset-0">
              <Hexagon className="w-32 h-32 text-[#00ff88]/30" strokeWidth={2} />
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00ff88] to-cyan-500 
                            flex items-center justify-center shadow-2xl shadow-[#00ff88]/50
                            rounded-xl relative overflow-hidden border-2 border-black">
                <Crown className="w-10 h-10 text-black relative z-10" />
              </div>
            </div>
          </motion.div>

          {/* Interactive Animated Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white mb-4 font-syne tracking-tighter"
          >
            <InteractiveText text="REWARDS" className="text-white" />
            <br />
            <InteractiveText text="PROGRAM" className="text-[#00ff88]" />
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#00ff88]" />
            <p className="text-[#00ff88] uppercase tracking-[0.3em] text-sm font-bold">
              Earn • Unlock • Dominate
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#00ff88]" />
          </motion.div>

          {/* Enhanced Status Card */}
          {profile && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block bg-black/80 backdrop-blur-2xl rounded-3xl p-8 
                       border-2 border-[#00ff88]/30 shadow-2xl shadow-[#00ff88]/20
                       relative overflow-hidden"
            >
              {/* Static Background Pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle, #00ff88 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Points Display */}
                <div className="text-center md:text-left">
                  <p className="text-[#00ff88]/70 text-xs uppercase tracking-widest mb-2 font-bold">
                    Available Points
                  </p>
                  <p 
                    className="text-7xl font-black text-white font-syne"
                    style={{
                      textShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
                    }}
                  >
                    {profile.points}
                  </p>
                  <div className="h-1 w-full bg-gradient-to-r from-[#00ff88] to-cyan-500 mt-2 rounded-full" />
                </div>
                
                {/* Divider */}
                <div className="hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-[#00ff88]/50 to-transparent" />
                
                {/* Tier Display */}
                <div className="text-center md:text-left">
                  <p className="text-[#00ff88]/70 text-xs uppercase tracking-widest mb-2 font-bold">
                    Current Tier
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">
                      {tierInfo?.icon}
                    </span>
                    <span className="text-4xl font-black text-white font-syne">
                      {tierInfo?.name}
                    </span>
                  </div>
                  {nextTier && (
                    <p className="text-white/50 text-sm mt-2">
                      <span className="text-[#00ff88]">{pointsToNextTier}</span> pts to {nextTier.name}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#00ff88]/50" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#00ff88]/50" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content Sections */}
      <div className="relative z-10">
        <HowItWorksSection />
        <TiersBenefitsSection />
        <ClaimPointsSection />
        <RedeemRewardsSection />
        <PointsHistorySection />
      </div>
    </div>
  );
};
