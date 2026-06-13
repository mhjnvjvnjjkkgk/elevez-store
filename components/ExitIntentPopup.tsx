import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check } from 'lucide-react';

interface ExitIntentPopupProps {
  onClose?: () => void;
  onApplyDiscount?: (discountAmount: number) => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onClose, onApplyDiscount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  // Back button exit-intent intercept for mobile and desktop
  useEffect(() => {
    const hasSeen = localStorage.getItem('elevez_exit_popup_seen') === 'true';
    if (hasSeen) return;

    // Push a dummy history state to catch back swipe/clicks
    window.history.pushState({ exitPopup: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      // Check if user is navigating back
      if (!localStorage.getItem('elevez_exit_popup_seen')) {
        localStorage.setItem('elevez_exit_popup_seen', 'true');
        setIsVisible(true);
        // Re-push state so page doesn't navigate away immediately
        window.history.pushState({ exitPopup: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Mouse leave exit-intent for desktop
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const hasSeen = localStorage.getItem('elevez_exit_popup_seen') === 'true';
      // clientY <= 0 triggers when cursor moves above the page view (tab area)
      if (e.clientY <= 0 && !isVisible && !submitted && !hasSeen) {
        localStorage.setItem('elevez_exit_popup_seen', 'true');
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, submitted]);

  const handleClaimDiscount = () => {
    localStorage.setItem('elevez_exit_popup_seen', 'true');
    localStorage.setItem('elevez_exit_discount_claimed', 'true');
    if (onApplyDiscount) {
      onApplyDiscount(20);
    }
    setSubmitted(true);
    // Auto-close after 2 seconds
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setIsVisible(false);
    setSubmitted(false);
    onClose?.();
  };

  if (!domReady) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Override global cursor:none for this popup */}
          <style>{`
            .exit-popup-container, .exit-popup-container * {
              cursor: auto !important;
            }
            .exit-popup-container button {
              cursor: pointer !important;
            }
          `}</style>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="exit-popup-container fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{
              zIndex: 2147483646
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="exit-popup-container fixed w-full max-w-md px-4"
            style={{
              zIndex: 2147483647,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              isolation: 'isolate'
            }}
          >
            <div className="bg-zinc-950 border-[6px] border-black rounded-none p-8 relative overflow-hidden shadow-[16px_16px_0px_0px_#ff007f]">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors group z-20 cursor-pointer"
                aria-label="Close popup"
              >
                <X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* Content */}
              {!submitted ? (
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mb-2">
                      <Gift className="w-8 h-8 text-[#00ff88]" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white text-center mb-2 font-syne uppercase tracking-wider">
                    ⚡ WAIT! <span className="text-[#00ff88]">SPECIAL OFFER</span>
                  </h2>
                  <p className="text-gray-400 text-center text-xs mb-8 uppercase font-bold tracking-wide">
                    Claim <span className="text-[#00ff88] font-black">₹20 OFF</span> your order right now.
                    <br />
                    <span className="text-red-500 font-extrabold text-[10px] animate-pulse">⚠️ THIS OFFER WILL VANISH ONCE YOU GO BACK!</span>
                  </p>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClaimDiscount}
                      className="w-full bg-[#00ff88] text-black font-black py-4 border-[3px] border-black rounded-none uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[4px_4px_0_0_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      APPLY ₹20 DISCOUNT
                    </motion.button>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full text-center mt-6 text-[10px] text-gray-500 hover:text-gray-300 font-black uppercase tracking-wider transition-colors"
                  >
                    No thanks, I prefer paying full price
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-[#00ff88] flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                    <Check className="w-8 h-8 text-black" strokeWidth={3} />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 font-syne uppercase">
                    DISCOUNT APPLIED!
                  </h3>
                  <p className="text-[#00ff88] font-black text-sm mb-4">₹20 has been deducted from your order total.</p>
                  <p className="text-gray-500 text-xs">Complete your purchase now to secure this offer.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
