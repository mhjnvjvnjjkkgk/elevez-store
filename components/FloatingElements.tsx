import React from 'react';
import { motion } from 'framer-motion';

export const FloatingElements: React.FC = () => {
  const elements = [
    { type: 'circle', color: '#00ff88', size: 100, top: '10%', left: '5%' },
    { type: 'rect', color: '#ff00ff', size: 80, top: '60%', left: '85%' },
    { type: 'triangle', color: '#00ffff', size: 120, top: '30%', left: '90%' },
    { type: 'rect', color: '#ffffff', size: 60, top: '80%', left: '10%' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.1, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute"
          style={{
            top: el.top,
            left: el.left,
            width: el.size,
            height: el.size,
            border: `2px solid ${el.color}`,
            borderRadius: el.type === 'circle' ? '50%' : el.type === 'triangle' ? '0' : '4px',
            clipPath: el.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
          }}
        />
      ))}
    </div>
  );
};
