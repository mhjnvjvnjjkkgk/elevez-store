import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InteractiveText } from './InteractiveText';

gsap.registerPlugin(ScrollTrigger);

export const ShowcaseSection: React.FC = () => {
  const component = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      let panels = gsap.utils.toArray(".panel");
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: slider.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          end: () => "+=" + slider.current?.offsetWidth
        }
      });
    }, component);
    return () => ctx.revert();
  }, []);

  const items = [
    {
      title: "DIGITAL GENESIS",
      subtitle: "BORN IN THE VOID",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
      color: "#00ff88"
    },
    {
      title: "NEO TOKYO",
      subtitle: "URBAN PROTOCOL",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200",
      color: "#ff00ff"
    },
    {
      title: "METAVERSE READY",
      subtitle: "VIRTUAL FABRIC",
      image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200",
      color: "#00ffff"
    }
  ];

  return (
    <div ref={component}>
      <div ref={slider} className="flex overflow-hidden bg-black h-screen">
        {items.map((item, i) => (
          <div key={i} className="panel min-w-full h-full flex items-center justify-center relative p-20 border-r-[8px] border-black">
            <div className="absolute inset-0 opacity-40">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale" />
            </div>
            
            <div className="relative z-10 text-center">
              <InteractiveText 
                text={item.title} 
                className="text-[10vw] font-black font-syne text-white leading-none tracking-tighter mb-4"
                style={{ WebkitTextStroke: `2px ${item.color}` }}
              />
              <p className="text-3xl font-black text-white uppercase tracking-[0.5em] opacity-80">
                {item.subtitle}
              </p>
              
              <div className="mt-12 inline-block px-10 py-4 bg-white text-black font-black uppercase text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_#00ff88]">
                Explore Timeline
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
