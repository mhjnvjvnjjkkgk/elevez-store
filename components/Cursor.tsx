import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Cursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    setIsMobile(isMobileDevice);
    if (isMobileDevice) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('interactive') ||
        target.closest('.interactive')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div className="noise-overlay" />
      {!isMobile && (
        <motion.div
          className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
          animate={{
            x: position.x,
            y: position.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          }}
        />
      )}
    </>
  );
};
