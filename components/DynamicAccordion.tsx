import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string;
}

interface DynamicAccordionProps {
  items: AccordionItem[];
  compact?: boolean;
}

export const DynamicAccordion: React.FC<DynamicAccordionProps> = ({ items, compact = false }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {items.map((item, idx) => (
        <div key={idx} className={`bg-white overflow-hidden transition-all ${compact ? 'border-[2px] border-black shadow-[3px_3px_0px_0px_#000]' : 'border-[4px] border-black shadow-[6px_6px_0px_0px_#000]'}`}>
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className={`w-full flex items-center justify-between text-left hover:bg-[#00ff88] transition-colors ${compact ? 'p-3' : 'p-6'}`}
          >
            <span className={`uppercase tracking-tight text-black ${compact ? 'text-xs font-black' : 'text-xl font-black'}`}>{item.title}</span>
            <div className={`bg-black text-white flex items-center justify-center border-[2px] border-black shrink-0 ${compact ? 'w-6 h-6' : 'w-10 h-10'}`}>
              {openIndex === idx ? <Minus size={compact ? 12 : 20} /> : <Plus size={compact ? 12 : 20} />}
            </div>
          </button>
          
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className={`pt-0 border-black text-black leading-relaxed ${compact ? 'p-3 border-t-[2px] text-[11px] font-bold' : 'p-6 border-t-[4px] font-medium'}`}>
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
