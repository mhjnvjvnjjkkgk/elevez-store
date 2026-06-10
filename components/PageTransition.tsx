import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)', y: 15, scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)', y: -15, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
      onAnimationComplete={() => setIsAnimating(false)}
      onAnimationStart={() => setIsAnimating(true)}
      style={!isAnimating ? { transform: 'none', filter: 'none' } : undefined}
    >
      {children}
    </motion.div>
  );
};
