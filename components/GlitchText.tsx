import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
  forceGlitch?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  className = "", 
  triggerOnHover = true,
  forceGlitch = false
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (forceGlitch) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [forceGlitch]);

  useEffect(() => {
    if (!triggerOnHover && !forceGlitch) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 300);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [triggerOnHover, forceGlitch]);

  const glitchVariants = {
    initial: { x: 0, y: 0, opacity: 1, skew: 0 },
    glitch1: { 
      x: [0, -3, 3, -2, 0], 
      y: [0, 1, -1, 2, 0],
      skew: [0, 10, -10, 5, 0],
      transition: { duration: 0.15, ease: "easeInOut" }
    },
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => triggerOnHover && setIsGlitching(true)}
      onMouseLeave={() => triggerOnHover && setIsGlitching(false)}
      animate={isGlitching ? "glitch1" : "initial"}
      variants={glitchVariants}
    >
      <span className="relative z-10 block">{text}</span>
      
      {isGlitching && (
        <>
          <motion.span 
            className="absolute top-0 left-0 -z-10 text-[#00ff88] opacity-80 mix-blend-screen whitespace-nowrap"
            animate={{ 
              x: [-4, 4, -2], 
              y: [2, -2, 1],
              clipPath: [
                'inset(20% 0 50% 0)',
                'inset(10% 0 80% 0)',
                'inset(40% 0 10% 0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          >
            {text}
          </motion.span>
          <motion.span 
            className="absolute top-0 left-0 -z-10 text-[#ff00ff] opacity-80 mix-blend-screen whitespace-nowrap"
            animate={{ 
              x: [4, -4, 2], 
              y: [-2, 2, -1],
              clipPath: [
                'inset(50% 0 20% 0)',
                'inset(80% 0 10% 0)',
                'inset(10% 0 40% 0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          >
            {text}
          </motion.span>
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
        </>
      )}
    </motion.div>
  );
};
