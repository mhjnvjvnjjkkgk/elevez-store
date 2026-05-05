import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: string;
}

interface DynamicAccordionProps {
  items: AccordionItem[];
}

export const DynamicAccordion: React.FC<DynamicAccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="border-[4px] border-black bg-white shadow-[6px_6px_0px_0px_#000] overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[#00ff88] transition-colors"
          >
            <span className="text-xl font-black uppercase tracking-tight text-black">{item.title}</span>
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-[2px] border-black">
              {openIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
            </div>
          </button>
          
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="p-6 pt-0 border-t-[4px] border-black text-black font-medium leading-relaxed">
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
