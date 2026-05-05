import React from 'react';
import { motion } from 'framer-motion';
import { GlitchText } from './GlitchText';
import { VelocityHeader } from './VelocityHeader';

export const CoreProtocol: React.FC = () => {
  const protocols = [
    { id: '001', title: 'DIGITAL_INTEGRITY', desc: 'Every stitch is encoded with precision and brand loyalty.' },
    { id: '002', title: 'URBAN_UTILITY', desc: 'Engineered for the streets, designed for the metaverse.' },
    { id: '003', title: 'KINETIC_FLOW', desc: 'Garments that move with the velocity of modern life.' }
  ];

  return (
    <section className="py-40 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-10 h-full">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20 h-20 w-full" />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-32">
          <VelocityHeader text="Core Protocol" className="text-white !text-8xl md:!text-[12rem]" />
          <p className="text-[#00ff88] font-black uppercase tracking-[0.5em] text-xl mt-4">The DNA of the Syndicate</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {protocols.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="text-sm font-black text-[#00ff88] mb-6 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-[#00ff88]" /> [ PROTOCOL_{p.id} ]
              </div>
              <h3 className="text-4xl font-black font-syne mb-8 uppercase group-hover:italic transition-all">
                {p.title}
              </h3>
              <p className="text-white/60 font-medium text-lg leading-relaxed border-l-[4px] border-[#00ff88] pl-8">
                {p.desc}
              </p>
              
              <div className="mt-12 overflow-hidden h-[60px] relative border-[2px] border-white/20 group-hover:border-[#00ff88] transition-colors">
                <motion.div
                  animate={{ y: [0, -60, 0] }}
                  transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                  className="p-4 font-black uppercase text-xs tracking-widest flex items-center justify-between"
                >
                  <span>STATUS: OPTIMIZED</span>
                  <GlitchText text="ENCRYPTED" triggerOnHover={false} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
