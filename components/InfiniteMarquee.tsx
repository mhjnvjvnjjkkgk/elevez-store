import React from 'react';
import { motion } from 'framer-motion';

interface InfiniteMarqueeProps {
  text: string;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ 
  text, 
  speed = 20, 
  direction = 'left',
  className = "" 
}) => {
  const marqueeVariants = {
    animate: {
      x: direction === 'left' ? [0, -1000] : [-1000, 0],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        },
      },
    },
  };

  return (
    <div className={`overflow-hidden whitespace-nowrap bg-black border-y-[6px] border-black py-4 flex ${className}`}>
      <motion.div
        className="inline-block"
        variants={marqueeVariants}
        animate="animate"
      >
        <span className="text-4xl md:text-6xl font-black font-syne text-[#00ff88] uppercase tracking-tighter mx-4">
          {Array(10).fill(text + " /// ").join("") }
        </span>
      </motion.div>
      <motion.div
        className="inline-block"
        variants={marqueeVariants}
        animate="animate"
      >
        <span className="text-4xl md:text-6xl font-black font-syne text-[#00ff88] uppercase tracking-tighter mx-4">
          {Array(10).fill(text + " /// ").join("") }
        </span>
      </motion.div>
    </div>
  );
};
