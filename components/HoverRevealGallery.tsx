import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const HoverRevealGallery: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const items = [
    { title: "THE ARCHIVE", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1200" },
    { title: "CORE ESSENTIALS", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200" },
    { title: "FUTURE DROPS", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" },
    { title: "SYNDICATE EXCLUSIVE", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200" }
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative py-40 bg-white" onMouseMove={handleMouseMove}>
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-sm font-black uppercase tracking-[0.4em] mb-20 text-black border-l-[6px] border-black pl-6">Lookbook // 2024</h2>
        
        <div className="flex flex-col gap-12">
          {items.map((item, i) => (
            <div
              key={i}
              className="group cursor-none py-8 border-b-[4px] border-black flex justify-between items-center"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-5xl md:text-8xl font-black font-syne text-black uppercase group-hover:text-[#00ff88] transition-colors leading-none tracking-tighter">
                {item.title}
              </h3>
              <div className="text-xl font-black text-black opacity-20 group-hover:opacity-100 transition-opacity">
                ( {i + 1} / {items.length} )
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hoveredIndex !== null && (
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
