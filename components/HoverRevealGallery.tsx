import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const HoverRevealGallery: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null);
  const [isMobile] = useState(() => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

  const items = [
    { title: "THE ARCHIVE", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200" },
    { title: "CORE ESSENTIALS", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200" },
    { title: "FUTURE DROPS", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" },
    { title: "SYNDICATE EXCLUSIVE", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200" }
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleItemTap = (i: number) => {
    if (isMobile) {
      setExpandedMobile(expandedMobile === i ? null : i);
    }
  };

  return (
    <div className="relative py-24 sm:py-40 bg-white" onMouseMove={handleMouseMove}>
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-sm font-black uppercase tracking-[0.4em] mb-16 sm:mb-20 text-black border-l-[6px] border-black pl-6">Lookbook // 2024</h2>
        
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <div key={i}>
              <div
                className="group cursor-none py-6 sm:py-8 border-b-[4px] border-black flex justify-between items-center"
                onMouseEnter={() => !isMobile && setHoveredIndex(i)}
                onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                onClick={() => handleItemTap(i)}
              >
                <h3 className="text-3xl sm:text-5xl md:text-8xl font-black font-syne text-black uppercase group-hover:text-[#00ff88] transition-colors leading-none tracking-tighter">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-black text-black opacity-20 group-hover:opacity-100 transition-opacity">
                    ( {i + 1} / {items.length} )
                  </div>
                  {/* Mobile expand chevron */}
                  {isMobile && (
                    <motion.div
                      animate={{ rotate: expandedMobile === i ? 180 : 0 }}
                      className="text-black text-xl font-black leading-none md:hidden"
                    >
                      ↓
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Mobile accordion image */}
              <AnimatePresence>
                {isMobile && expandedMobile === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="overflow-hidden"
                  >
                    <div className="border-[4px] border-black border-t-0 overflow-hidden shadow-[8px_8px_0px_0px_#00ff88]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-[240px] object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop hover-reveal image (unchanged behaviour) */}
      <AnimatePresence>
        {!isMobile && hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              x: mousePos.x - 200, 
              y: mousePos.y - 150
            }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed pointer-events-none z-50 w-[400px] h-[300px] border-[10px] border-black shadow-[20px_20px_0px_0px_#00ff88] overflow-hidden"
            style={{ left: 0, top: 0 }}
          >
            <img 
              src={items[hoveredIndex].image} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              alt="Gallery" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
