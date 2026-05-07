import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveTextProps {
  text: string;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({ text, className = "", delay = 0, style }) => {
  return (
    <div className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`} style={style}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-flex whitespace-nowrap overflow-visible">
          {word.split("").map((char, j) => (
            <motion.span
              key={j}
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: false }}
              transition={{ 
                duration: 0.5, 
                delay: delay + (i * 0.1) + (j * 0.03),
                ease: [0.33, 1, 0.68, 1]
              }}
              className="inline-block origin-bottom cursor-default font-black"
              whileHover={{
                y: -10,
                scale: 1.15,
                color: "#00ff88",
                rotate: Math.random() * 20 - 10,
                transition: { type: "spring", stiffness: 500, damping: 10 }
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};
