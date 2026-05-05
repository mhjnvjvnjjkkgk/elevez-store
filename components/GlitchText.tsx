import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", triggerOnHover = true }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!triggerOnHover) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [triggerOnHover]);

  const glitchVariants = {
    initial: { x: 0, y: 0, opacity: 1 },
    glitch1: { 
      x: [0, -2, 2, -1, 0], 
      y: [0, 1, -1, 1, 0], 
      color: ['#000', '#00ff88', '#ff00ff', '#00ffff', '#000'],
      transition: { duration: 0.2 }
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
      <span className="relative z-10">{text}</span>
      
      {isGlitching && (
        <>
          <motion.span 
            className="absolute top-0 left-0 -z-10 text-[#00ff88] opacity-70"
            animate={{ x: [-2, 2, -2], y: [1, -1, 1] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          >
            {text}
          </motion.span>
          <motion.span 
            className="absolute top-0 left-0 -z-10 text-[#ff00ff] opacity-70"
            animate={{ x: [2, -2, 2], y: [-1, 1, -1] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          >
            {text}
          </motion.span>
        </>
      )}
    </motion.div>
  );
};
