import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Terminal } from 'lucide-react';
import { GlitchText } from './GlitchText';

export const NewsletterSyndicate: React.FC = () => {
  return (
    <section className="relative py-40 bg-white border-y-[10px] border-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="text-[30rem] font-black font-syne leading-none uppercase absolute -top-20 -left-20 rotate-[-15deg]">
          SYNDICATE SYNDICATE SYNDICATE
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-24 h-24 bg-black text-[#00ff88] flex items-center justify-center border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-8"
            >
              <Terminal size={48} />
            </motion.div>
            
            <h2 className="text-6xl md:text-9xl font-black font-syne text-black leading-none uppercase tracking-tighter mb-8">
              JOIN THE <br />
              <span className="text-white" style={{ WebkitTextStroke: '3px black' }}>SYNDICATE</span>
            </h2>
            
            <p className="text-xl md:text-2xl font-black text-black uppercase tracking-[0.2em] max-w-2xl mb-12 italic">
              ACCESS EXCLUSIVE DROPS, DIGITAL PROTOCOLS, AND URBAN UTILITY SIGNALS.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-0 border-[6px] border-black shadow-[16px_16px_0px_0px_#00ff88] group transition-all hover:shadow-[16px_16px_0px_0px_#000]">
              <div className="flex-1 flex items-center bg-white p-6 gap-4">
                <Mail className="text-black" size={24} />
                <input 
                  type="email" 
                  placeholder="ENTER_EMAIL_ADDRESS" 
                  className="w-full bg-transparent outline-none font-black uppercase text-xl placeholder:text-gray-300"
                />
              </div>
              <button className="bg-black text-[#00ff88] px-10 py-6 font-black uppercase text-xl flex items-center justify-center gap-4 hover:bg-[#00ff88] hover:text-black transition-all">
                CONNECT <ArrowRight size={24} />
              </button>
            </div>
            
            <div className="mt-8 flex justify-between items-center text-xs font-black uppercase tracking-widest text-black opacity-40">
              <span>PROTOCOL: V2.0.4</span>
              <span>ESTABLISHED IN THE VOID</span>
              <GlitchText text="ENCRYPTED" triggerOnHover={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Side Marquees */}
      <div className="absolute right-0 top-0 h-full w-20 flex flex-col justify-around pointer-events-none opacity-20 hidden lg:flex">
        <div className="rotate-90 whitespace-nowrap font-black text-6xl text-black uppercase tracking-tighter">ACCESS GRANTED ///</div>
        <div className="rotate-90 whitespace-nowrap font-black text-6xl text-black uppercase tracking-tighter">ACCESS GRANTED ///</div>
      </div>
    </section>
  );
};
