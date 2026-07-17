import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

interface CheckoutExitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: () => void;
}

export const CheckoutExitPopup: React.FC<CheckoutExitPopupProps> = ({ isOpen, onClose, onApplyDiscount }) => {
  const [domReady, setDomReady] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  // 3 minutes countdown timer
  const [secondsLeft, setSecondsLeft] = useState(180);

  useEffect(() => {
    setDomReady(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaim = () => {
    setClaimed(true);
    onApplyDiscount();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!domReady) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Custom style to override cursor */}
          <style>{`
            .checkout-exit-container, .checkout-exit-container * {
              cursor: auto !important;
            }
            .checkout-exit-container button, .checkout-exit-container a {
              cursor: pointer !important;
            }
          `}</style>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="checkout-exit-container fixed inset-0 bg-black/80 backdrop-blur-md z-[999999]"
          />

          {/* Popup Modal Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="checkout-exit-container fixed w-full max-w-md px-4 z-[999999]"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              isolation: 'isolate'
            }}
          >
            <div className="bg-white border-[5px] border-black rounded-none p-6 sm:p-8 relative overflow-hidden shadow-[12px_12px_0px_0px_#ff0055]">
              {/* Top Banner Tag */}
              <div className="absolute top-0 left-0 right-0 bg-[#ff0055] text-white text-center py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-[3px] border-black select-none pointer-events-none animate-pulse">
                ⚡ EXTREMELY URGENT DISCOUNT ⚡
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-8 right-4 p-1 text-black hover:opacity-60 transition-opacity z-20 cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="mt-4 text-center">
                {!claimed ? (
                  <>
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
                        <Flame size={24} />
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-black uppercase font-syne tracking-wide leading-tight">
                      HOLD ON!<br />
                      <span className="text-[#ff0055]">ESPECIALLY FOR YOU ONLY</span>
                    </h2>
                    
                    {/* Urgent Pricing reserved countdown */}
                    <div className="my-4 bg-zinc-900 border-[2px] border-black py-2.5 px-4 text-center">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Special Price Reserved For</span>
                      <span className="text-xl font-bold font-mono text-[#00ff88] tracking-widest">{formatTime(secondsLeft)}</span>
                    </div>

                    <p className="text-zinc-600 text-xs font-bold uppercase leading-relaxed mb-6">
                      Complete checkout now to get an extra <span className="text-[#ff0055] font-black underline">₹15 DISCOUNT</span>. 
                      <br />
                      <span className="text-[10px] text-red-500 font-black tracking-tighter mt-1 block">⚠️ ONLY 2 ITEMS LEFT AT THIS PRICE. STOCK WILL BE RELEASED ONCE EXITED!</span>
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={handleClaim}
                      className="w-full bg-[#00ff88] text-black font-black text-xs py-3 border-[2.5px] border-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      Claim ₹15 Off & Purchase
                    </button>

                    <button
                      onClick={onClose}
                      className="mt-3 text-[10px] font-black text-zinc-400 hover:text-black uppercase tracking-wider underline cursor-pointer"
                    >
                      No thanks, I want to pay full price
                    </button>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-black uppercase text-black font-syne">₹15 OFF APPLIED!</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold mt-1">Completing your secure checkout...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
