import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';

interface ScrollVelocityContainerProps {
  children: React.ReactNode;
  className?: string;
  enableSkew?: boolean;
  enableScale?: boolean;
  enableBlur?: boolean;
  skewMax?: number; // Maximum skew angle in degrees
  scaleMaxChange?: number; // Maximum scale stretch/compress delta (e.g. 0.03)
  blurMax?: number; // Maximum blur in pixels
}

export const ScrollVelocityContainer: React.FC<ScrollVelocityContainerProps> = ({
  children,
  className = "",
  enableSkew = true,
  enableScale = true,
  enableBlur = true,
  skewMax = 6,
  scaleMaxChange = 0.03,
  blurMax = 2.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position and velocity globally
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Apply spring physics to smooth the velocity spikes
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 60,
    stiffness: 300,
    mass: 0.5
  });

  // Map velocity (-3000px/s to 3000px/s) to animated values
  const skewY = useTransform(
    smoothVelocity, 
    [-3000, 0, 3000], 
    [-skewMax, 0, skewMax]
  );
  
  const scaleY = useTransform(
    smoothVelocity,
    [-3000, 0, 3000],
    [1 + scaleMaxChange, 1, 1 + scaleMaxChange] // stretches vertically when scrolling fast in either direction
  );

  const blurAmount = useTransform(
    smoothVelocity,
    [-3000, -500, 0, 500, 3000],
    [blurMax, 0.5, 0, 0.5, blurMax]
  );

  // Convert number to blur CSS string
  const filter = useTransform(blurAmount, (b) => enableBlur && b > 0.1 ? `blur(${b}px)` : 'none');

  return (
    <motion.div
      ref={containerRef}
      style={{
        skewY: enableSkew ? skewY : 0,
        scaleY: enableScale ? scaleY : 1,
        filter: enableBlur ? filter : 'none',
        transformOrigin: 'center center',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
