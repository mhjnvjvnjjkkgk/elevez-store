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
          color: 'from-blue-500 to-cyan-500'
        },
        {
          icon: <ShoppingBag size={24} />,
          label: 'Orders Completed',
          value: '50K+',
          color: 'from-[#00ff88] to-green-500'
        },
        {
          icon: <Star size={24} />,
          label: 'Average Rating',
          value: '4.9★',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          icon: <TrendingUp size={24} />,
          label: 'Growth This Month',
          value: '+45%',
          color: 'from-purple-500 to-pink-500'
        }
      ]);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-12 px-4 bg-black/50 border-y border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${badge.color} p-0.5 rounded-xl`}
            >
              <div className="bg-black rounded-xl p-4 h-full flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="text-white mb-2 opacity-80"
                >
                  {badge.icon}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-2xl font-black font-syne text-white mb-1"
                >
                  {badge.value}
                </motion.p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  {badge.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
