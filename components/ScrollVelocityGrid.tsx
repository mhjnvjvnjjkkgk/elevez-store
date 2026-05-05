import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';

interface ScrollVelocityGridProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollVelocityGrid: React.FC<ScrollVelocityGridProps> = ({ children, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Transform velocity into skew and scale
  const skewX = useTransform(smoothVelocity, [-1000, 0, 1000], [-5, 0, 5]);
  const scale = useTransform(smoothVelocity, [-2000, 0, 2000], [0.95, 1, 0.95]);

  return (
    <motion.div
      ref={containerRef}
      style={{
        skewX,
        scale,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
