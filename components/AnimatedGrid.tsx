import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const AnimatedGrid: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
      
      <motion.div
        className="absolute inset-0 bg-[#00ff88]"
        style={{
          maskImage: `radial-gradient(circle 300px at var(--x) var(--y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(circle 300px at var(--x) var(--y), black, transparent)`,
          // @ts-ignore
          '--x': springX,
          // @ts-ignore
          '--y': springY,
          opacity: 0.1
        }}
      />
    </div>
  );
};
