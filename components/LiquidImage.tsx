import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LiquidImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const LiquidImage: React.FC<LiquidImageProps> = ({ src, alt, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          filter: isHovered ? 'url(#liquid-filter)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
    </div>
  );
};
