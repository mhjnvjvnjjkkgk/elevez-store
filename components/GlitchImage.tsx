import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchImageProps {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  triggerOnHover?: boolean;
  forceGlitch?: boolean;
}

export const GlitchImage: React.FC<GlitchImageProps> = ({ 
  src,
  alt = "logo",
  className = "", 
  imgClassName = "",
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
        setTimeout(() => setIsGlitching(false), 350);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [triggerOnHover, forceGlitch]);

  const glitchVariants = {
    initial: { x: 0, y: 0, opacity: 1, skew: 0 },
    glitch1: { 
      x: [0, -2, 2, -1, 0], 
      y: [0, 1, -1, 1, 0],
      skew: [0, 5, -5, 2, 0],
      transition: { duration: 0.2, ease: "easeInOut" }
    },
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => triggerOnHover && setIsGlitching(true)}
      onMouseLeave={() => triggerOnHover && setIsGlitching(false)}
      animate={isGlitching ? "glitch1" : "initial"}
      variants={glitchVariants}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Primary Image */}
      <img src={src} alt={alt} className={`relative z-10 ${imgClassName}`} />
      
      {isGlitching && (
        <>
          {/* Cyan/Green Glitch Layer */}
          <motion.img 
            src={src}
            alt={alt}
            className={`absolute top-0 left-0 z-0 opacity-70 mix-blend-screen ${imgClassName}`}
            style={{
              filter: 'drop-shadow(-2px 0 0 #00ff88) saturate(150%)',
            }}
            animate={{ 
              x: [-3, 3, -1], 
              y: [1, -2, 1],
              clipPath: [
                'inset(15% 0 55% 0)',
                'inset(5% 0 85% 0)',
                'inset(45% 0 5% 0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.12 }}
          />
          {/* Magenta Glitch Layer */}
          <motion.img 
            src={src}
            alt={alt}
            className={`absolute top-0 left-0 z-0 opacity-70 mix-blend-screen ${imgClassName}`}
            style={{
              filter: 'drop-shadow(2px 0 0 #ff00ff) saturate(150%)',
            }}
            animate={{ 
              x: [3, -3, 1], 
              y: [-1, 2, -1],
              clipPath: [
                'inset(55% 0 15% 0)',
                'inset(85% 0 5% 0)',
                'inset(5% 0 45% 0)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.12 }}
          />
          {/* Scanline Overlay effect */}
          <div className="absolute inset-0 z-20 bg-white/5 mix-blend-overlay pointer-events-none" />
        </>
      )}
    </motion.div>
  );
};
