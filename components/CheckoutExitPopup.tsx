import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Sparkles, CheckCircle } from 'lucide-react';

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
            className="checkout-exit-container fixed inset-0 bg-black/80 backdrop-blur-md z-[999998]"
          />

          {/* Popup Modal Box — fully mobile-fitted */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="checkout-exit-container fixed z-[999999]"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(92vw, 420px)',
              maxHeight: '90dvh',
              overflowY: 'auto',
              isolation: 'isolate',
            }}
          >
            <div
              className="bg-white border-[4px] border-black relative overflow-hidden"
              style={{ boxShadow: '8px 8px 0px 0px #ff0055' }}
            >
              {/* Top Banner */}
              <div className="bg-[#ff0055] text-white text-center py-1.5 text-[9px] font-black uppercase tracking-[0.18em] border-b-[3px] border-black select-none pointer-events-none animate-pulse">
                ⚡ EXTREMELY URGENT DISCOUNT ⚡
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1.5 text-black hover:opacity-60 transition-opacity z-20 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Content */}
              <div className="p-5 pt-4 text-center">
                {!claimed ? (
                  <>
                    {/* Flame Icon */}
                    <div className="flex justify-center mb-2">
                      <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
                        <Flame size={22} />
                      </div>
                    </div>

                    {/* Headline */}
                    <h2 className="text-lg font-black text-black uppercase tracking-wide leading-tight mb-1">
                      HOLD ON!
                      <br />
                      <span className="text-[#ff0055]">ESPECIALLY FOR YOU ONLY</span>
                    </h2>

                    {/* Countdown */}
                    <div className="my-3 bg-zinc-900 border-[2px] border-black py-2 px-3 text-center">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">
                        Special Price Reserved For
                      </span>
                      <span className="text-2xl font-bold font-mono text-[#00ff88] tracking-widest">
                        {formatTime(secondsLeft)}
                      </span>
                    </div>

                    {/* Body Text */}
                    <p className="text-zinc-600 text-[11px] font-bold uppercase leading-relaxed mb-4">
                      Complete checkout now to get an extra{' '}
                      <span className="text-[#ff0055] font-black underline">₹15 DISCOUNT</span>.
                      <br />
                      <span className="text-[10px] text-red-500 font-black tracking-tight mt-1 block">
                        ⚠️ ONLY 2 ITEMS LEFT AT THIS PRICE. STOCK WILL BE RELEASED ONCE EXITED!
                      </span>
                    </p>

                    {/* CTA */}
                    <button
                      onClick={handleClaim}
                      className="w-full bg-[#00ff88] text-black font-black text-[11px] py-3 border-[2.5px] border-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={13} />
                      Claim ₹15 Off &amp; Purchase
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
                    <h3 className="text-lg font-black uppercase text-black">₹15 OFF APPLIED!</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold mt-1">
                      Completing your secure checkout...
                    </p>
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
