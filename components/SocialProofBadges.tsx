import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Star, TrendingUp } from 'lucide-react';

interface Badge {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

export const SocialProofBadges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // Simulate fetching real data
    const timer = setTimeout(() => {
      setBadges([
        {
          icon: <Users size={24} />,
          label: 'Active Customers',
          value: '10K+',
          color: '#00ff88'
        },
        {
          icon: <ShoppingBag size={24} />,
          label: 'Orders Completed',
          value: '50K+',
          color: '#ffffff'
        },
        {
          icon: <Star size={24} />,
          label: 'Average Rating',
          value: '4.9★',
          color: '#00ff88'
        },
        {
          icon: <TrendingUp size={24} />,
          label: 'Growth This Month',
          value: '+45%',
          color: '#ffffff'
        }
      ]);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 px-4 bg-white border-y-[6px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-[4px] border-black p-8 flex flex-col items-center justify-center text-center shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all"
            >
              <div 
                className="w-16 h-16 border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]"
                style={{ backgroundColor: badge.color }}
              >
                <div className="text-black">
                  {badge.icon}
                </div>
              </div>
              <p className="text-4xl font-black font-syne text-black mb-2 uppercase italic">
                {badge.value}
              </p>
              <p className="text-xs text-black font-black uppercase tracking-[0.2em]">
                {badge.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
