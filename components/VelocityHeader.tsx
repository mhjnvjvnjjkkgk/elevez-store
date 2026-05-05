import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';

interface VelocityHeaderProps {
  text: string;
  className?: string;
}

export const VelocityHeader: React.FC<VelocityHeaderProps> = ({ text, className = "" }) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Create a spring-smoothed velocity value
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Transform velocity into skew, scale, and chromatic aberration effects
  // We want the text to "stretch" and "shear" when scrolling fast
  const skew = useTransform(smoothVelocity, [-1000, 0, 1000], [-10, 0, 10]);
  const scaleX = useTransform(smoothVelocity, [-2000, 0, 2000], [1.2, 1, 1.2]);
  const xOffset = useTransform(smoothVelocity, [-1000, 0, 1000], [-20, 0, 20]);

  return (
    <div className={`relative overflow-hidden py-4 ${className}`}>
      {/* Background layer for chromatic aberration effect */}
      <motion.div
        className="absolute inset-0 text-[#00ff88] opacity-50 select-none"
        style={{
          skewX: skew,
          x: useTransform(xOffset, (v) => v * -0.5),
          scaleX,
          WebkitTextStroke: '2px #00ff88'
        }}
      >
        <span className="font-syne font-black uppercase whitespace-nowrap">{text}</span>
      </motion.div>

      {/* Main text layer */}
      <motion.div
        style={{
          skewX: skew,
          scaleX,
          x: xOffset
        }}
      >
        <h2 className={`font-syne font-black uppercase text-black relative z-10 tracking-tighter leading-[0.85] text-7xl md:text-[10rem] lg:text-[12rem] ${className}`}>
          {text}
        </h2>
      </motion.div>
    </div>
  );
};
