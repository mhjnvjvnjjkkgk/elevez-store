import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageReveal: React.FC<ImageRevealProps> = ({ src, alt, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={isInView ? { clipPath: 'inset(0 0 0% 0)' } : {}}
        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
        className="w-full h-full"
      >
        <motion.img
          src={src}
          alt={alt}
          initial={{ scale: 1.4 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1] }}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
      </motion.div>
      
      {/* Overlay curtain effect */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={isInView ? { scaleY: 0 } : {}}
        transition={{ duration: 1, ease: [0.77, 0, 0.175, 1], delay: 0.1 }}
        className="absolute inset-0 bg-[#00ff88] origin-top z-10"
      />
    </div>
  );
};
