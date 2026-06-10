import React, { useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useVelocity, 
  useAnimationFrame, 
  useMotionValue 
} from 'framer-motion';

interface InfiniteMarqueeProps {
  text: string;
  speed?: number; // Kept for API compatibility, but we now use baseVelocity internally
  direction?: 'left' | 'right';
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({ 
  text, 
  speed = 20, 
  direction = 'left',
  className = "" 
}) => {
  // Translate traditional speed parameter into a base velocity step size (higher speed param = slower loop, so inverse)
  const baseVelocity = speed > 0 ? (60 / speed) : 2.5;

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smooth the scroll velocity
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300
  });
  
  // Transform scroll speed to velocity factor
  const velocityFactor = useTransform(smoothVelocity, [0, 2000], [0, 8], {
    clamp: false
  });

  const directionFactor = useRef<number>(direction === 'left' ? -1 : 1);
  
  // Simple wrapping function to loop the marquee seamlessly between -50% and 0%
  const wrapRange = (v: number) => {
    const min = -50;
    const max = 0;
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
  };
  
  const x = useTransform(baseX, (v) => `${wrapRange(v)}%`);

  useAnimationFrame((time, delta) => {
    // Base step distance per frame (adjusted for frame delta to keep it independent of screen refresh rate)
    let moveBy = directionFactor.current * baseVelocity * (delta / 16);
    
    // Add velocity acceleration based on active scroll speed
    const scrollFactor = velocityFactor.get();
    if (scrollFactor !== 0) {
      moveBy += directionFactor.current * scrollFactor * (delta / 16);
    }
    
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={`overflow-hidden whitespace-nowrap bg-black border-y-[6px] border-black py-4 flex flex-nowrap select-none ${className}`}>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {/* Render two identical content spans for seamless wrapping */}
        <span className="text-4xl md:text-6xl font-black font-syne text-[#00ff88] uppercase tracking-tighter mx-4 whitespace-nowrap">
          {Array(8).fill(text + " /// ").join("") }
        </span>
        <span className="text-4xl md:text-6xl font-black font-syne text-[#00ff88] uppercase tracking-tighter mx-4 whitespace-nowrap">
          {Array(8).fill(text + " /// ").join("") }
        </span>
      </motion.div>
    </div>
  );
};
