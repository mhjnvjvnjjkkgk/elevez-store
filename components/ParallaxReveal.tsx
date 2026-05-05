import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxRevealProps {
  image: string;
  title: string;
  description: string;
}

export const ParallaxReveal: React.FC<ParallaxRevealProps> = ({ image, title, description }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.2, 1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[150vh] overflow-hidden bg-black border-y-[10px] border-black">
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 w-full h-full"
      >
        <img src={image} alt={title} className="w-full h-full object-cover grayscale opacity-60" />
      </motion.div>

      <div className="sticky top-0 h-screen flex flex-col items-center justify-center z-10 px-6">
        <motion.div style={{ opacity }} className="text-center">
          <h2 className="text-[12vw] font-black font-syne text-[#00ff88] leading-none uppercase tracking-tighter mb-8" 
              style={{ WebkitTextStroke: '3px black' }}>
            {title}
          </h2>
          <p className="text-2xl md:text-4xl font-black text-white uppercase max-w-4xl mx-auto leading-tight italic">
            {description}
          </p>
          
          <div className="mt-16 w-32 h-[10px] bg-[#00ff88] mx-auto border-[2px] border-black shadow-[4px_4px_0px_0px_#fff]" />
        </motion.div>
      </div>
    </section>
  );
};
