import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchText } from './GlitchText';

export const PageLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] } }}
          className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="absolute top-10 left-10 text-[#00ff88] font-black text-xs uppercase tracking-[0.5em]">
            Protocol: Loading...
          </div>
          
          <div className="relative text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-8xl md:text-[15rem] font-black font-syne leading-none tracking-tighter"
            >
              {progress}<span className="text-[#00ff88]">%</span>
            </motion.div>
            
            <div className="mt-8">
              <GlitchText 
                text="ESTABLISHING CONNECTION" 
                className="text-[#00ff88] font-black text-xl uppercase tracking-widest"
                triggerOnHover={false} 
              />
            </div>
          </div>

          <div className="absolute bottom-20 left-0 w-full px-20">
            <div className="h-[10px] w-full border-[2px] border-white/20 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute inset-0 bg-[#00ff88] shadow-[0_0_20px_#00ff88]"
              />
            </div>
            <div className="mt-4 flex justify-between text-white/40 font-black text-[10px] uppercase tracking-widest">
              <span>System: Ready</span>
              <span>Buffer: Active</span>
              <span>Nodes: 12</span>
            </div>
          </div>

          {/* Decorative scanline */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] animate-scanline" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
