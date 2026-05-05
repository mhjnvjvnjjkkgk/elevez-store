import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveText } from './InteractiveText';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  align = 'center',
  className = "" 
}) => {
  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const flexClass = align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center';

  return (
    <div className={`mb-20 flex flex-col ${flexClass} ${alignmentClass} ${className}`}>
      {/* Small badge above title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        className="inline-block bg-black text-[#00ff88] text-xs font-black uppercase tracking-[0.5em] px-4 py-1 border-[2px] border-black mb-6"
      >
        Protocol: {title.replace(/\s+/g, '_').toUpperCase()}
      </motion.div>

      {/* Massive Interactive Title */}
      <InteractiveText 
        text={title} 
        className={`w-full font-syne font-black uppercase text-black leading-[0.85] text-7xl md:text-[10rem] lg:text-[12rem] ${align === 'center' ? 'justify-center' : ''}`} 
      />
      
      {/* Decorative Line */}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: '100px' }}
        viewport={{ once: false }}
        className="h-[6px] bg-black mt-4 mb-8"
      />

      {/* Subtitle with reveal animation */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-black font-black uppercase text-xl md:text-2xl tracking-tighter leading-none"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
