import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoyalty } from '../../hooks/useLoyalty';
import { Gift, Sparkles, Check, Loader, Copy, X, ShoppingBag, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const colors = ['#00ff88', '#ff00ff', '#00ffff', '#ffff00', '#ff8800', '#ff0088'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100;
  const duration = 2 + Math.random() * 2;

  return (
    <motion.div
      initial={{ y: -20, x: x + '%', opacity: 1, scale: 0 }}
      animate={{
        y: 400,
        x: `${x + (Math.random() - 0.5) * 50}%`,
        opacity: [1, 1, 0],
        scale: [0, 1, 1],
        rotate: Math.random() * 720 - 360
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
      className="absolute top-0 w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
};

export const RedeemRewardsSection: React.FC = () => {
  const navigate = useNavigate();
  const { profile, redemptionOptions, redeemPoints } = useLoyalty();
  const [loading, setLoading] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedAmount, setRedeemedAmount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<number[]>([]);

  const handleRedeem = async (pointsCost: number, discount: number) => {
    if (!profile || profile.points < pointsCost) return;

    setLoading(true);
    try {
      const code = await redeemPoints(pointsCost, discount);
      setRedeemedCode(code.code);
      setRedeemedAmount(discount);
      setShowModal(true);
      // Create confetti particles
      setConfettiParticles(Array.from({ length: 50 }, (_, i) => i));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (redeemedCode) {
      navigator.clipboard.writeText(redeemedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setRedeemedCode(null);
    setConfettiParticles([]);
  };

  const goToShop = () => {
    closeModal();
    navigate('/#shop');
  };

  return (
    <section className="py-24 px-6 bg-white border-b-[8px] border-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Exchange
          </div>
          <h2 className="text-6xl md:text-8xl font-black font-syne text-black uppercase leading-none tracking-tighter">
            REDEEM <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>POINTS</span>
          </h2>
        </div>

        {/* Beautiful Animated Success Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90"
                onClick={closeModal}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white border-[12px] border-black p-12 md:p-20 shadow-[32px_32px_0px_0px_#00ff88] max-w-2xl w-full text-center"
              >
                <button
                  onClick={closeModal}
                  className="absolute top-6 right-6 p-2 bg-black text-white hover:bg-[#00ff88] hover:text-black transition-colors border-[3px] border-black"
                >
                  <X size={32} />
                </button>

                <div className="w-32 h-32 bg-[#00ff88] border-[6px] border-black flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_0px_#000]">
                  <Check size={64} className="text-black font-black" />
                </div>

                <h3 className="text-5xl md:text-7xl font-black uppercase font-syne text-black mb-6 leading-none">OPERATION SUCCESS</h3>
                <p className="text-2xl font-bold text-black uppercase opacity-60 mb-12">
                  YOU'VE SECURED A <span className="bg-black text-[#00ff88] px-3 py-1">₹{redeemedAmount}</span> DISCOUNT ASSET.
                </p>

                <div className="bg-black text-white p-10 mb-12 border-[4px] border-black shadow-[12px_12px_0px_0px_#00ff88] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/10 rotate-45 translate-x-12 -translate-y-12" />
                  <p className="text-xs font-black uppercase opacity-40 mb-4 tracking-[0.4em]">Decrypted Access Code</p>
                  <p className="text-5xl md:text-7xl font-black tracking-widest mb-10 font-syne">{redeemedCode}</p>
                  
                  <button
                    onClick={copyCode}
                    className={`w-full py-6 font-black uppercase text-2xl border-[3px] border-white transition-all flex items-center justify-center gap-4 ${
                      copiedCode ? 'bg-[#00ff88] text-black border-[#00ff88]' : 'bg-transparent text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {copiedCode ? <><Check size={28} /> COPIED</> : <><Copy size={28} /> CLONE CODE</>}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    onClick={goToShop}
                    className="flex-1 bg-black text-[#00ff88] py-6 border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-4"
                  >
                    <ShoppingBag size={28} />
                    DEPLOY NOW
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-white text-black py-6 border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                  >
                    CONTINUE
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Redemption Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {redemptionOptions.map((option, index) => {
            const canAfford = profile && profile.points >= option.points;

            return (
              <div
                key={index}
                className={`bg-white border-[6px] border-black p-10 transition-all relative group flex flex-col h-full ${
                  canAfford 
                    ? 'shadow-[12px_12px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] hover:-translate-y-2' 
                    : 'shadow-[8px_8px_0px_0px_#000] opacity-50 grayscale'
                }`}
              >
                {/* Badge */}
                {index === 2 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#00ff88] px-4 py-2 border-[4px] border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000]">
                    OPTIMAL VALUE
                  </div>
                )}

                <div className="w-24 h-24 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center mb-10 shadow-[8px_8px_0px_0px_#00ff88] group-hover:scale-110 transition-transform mx-auto">
                  <Gift size={48} />
                </div>

                <div className="text-center mb-10 flex-grow">
                  <p className="text-6xl font-black text-black mb-2 font-syne">₹{option.discount}</p>
                  <p className="text-xs font-black uppercase text-black opacity-40 tracking-widest">Digital Asset</p>
                </div>

                <div className="bg-black/5 border-[3px] border-black border-dashed p-6 mb-10 text-center">
                  <p className="text-2xl font-black text-black">{option.points} PTS</p>
                </div>

                <button
                  onClick={() => handleRedeem(option.points, option.discount)}
                  disabled={!canAfford || loading}
                  className={`w-full py-6 font-black uppercase text-xl border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-4 ${
                    canAfford ? 'bg-[#00ff88] text-black' : 'bg-white text-black opacity-30 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <Loader size={24} className="animate-spin" />
                  ) : canAfford ? (
                    'REDEEM'
                  ) : (
                    `LACK ${option.points - (profile?.points || 0)} PTS`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Tip Box */}
        <div className="mt-20 bg-black text-white p-10 border-[6px] border-black shadow-[16px_16px_0px_0px_#00ff88] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/10 rotate-45 translate-x-16 -translate-y-16" />
          <p className="text-xl font-bold uppercase text-center relative z-10">
            <span className="text-[#00ff88]">INTEL:</span> ASSETS VALID FOR 30 DAYS. HIGHER EXCHANGE VOLUMES YIELD SUPERIOR VALUE RATIOS.
          </p>
        </div>
      </div>
    </section>
  );
};
