import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check } from 'lucide-react';
import { generateDiscountCode } from '../services/discountService';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setDomReady(true);
  }, []);

  useEffect(() => {
    // Disable entirely on mobile devices
    const isMobileDevice = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isMobileDevice) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from top of page
      if (e.clientY <= 0 && !isVisible && !submitted) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        // Generate a unique discount code for this user
        const code = generateDiscountCode(15, 'exit-intent', 1);

        // Save email to Firebase users collection
        await addDoc(collection(db, 'users'), {
          email: email,
          source: 'exit-intent',
          discountCode: code,
          totalPoints: 0,
          tier: 'bronze',
          createdAt: serverTimestamp(),
          subscribed: true
        });

        setDiscountCode(code);
        setSubmitted(true);

        // Auto-close after 4 seconds
        setTimeout(() => {
          handleClose();
        }, 4000);
      } catch (error) {
        console.error('Error saving email:', error);
        // Still show success to user even if save fails
        const code = generateDiscountCode(15, 'exit-intent', 1);
        setDiscountCode(code);
        setSubmitted(true);
      }
    }
  };

  const handleCopyCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setEmail('');
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
            .exit-popup-container input {
              cursor: text !important;
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

                  <h2 className="text-2xl font-bold text-white text-center mb-2 font-syne">
                    Wait! <span className="text-[#00ff88]">Don't Leave Yet</span>
                  </h2>
                  <p className="text-gray-400 text-center mb-8">
                    Unlock <span className="text-white font-bold">15% OFF</span> your first order immediately.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3.5 bg-black/50 border-[3px] border-black rounded-none text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#00ff88] transition-all"
                      required
                    />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-[#00ff88] text-black font-black py-3.5 border-[3px] border-black rounded-none uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[4px_4px_0_0_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      Unlock My Discount
                    </motion.button>
                  </form>

                  <button
                    onClick={handleClose}
                    className="w-full text-center mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
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

                  <h3 className="text-2xl font-bold text-white mb-2 font-syne">
                    You're In!
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">Here is your exclusive discount code:</p>

                  {/* Discount Code Display */}
                  <div
                    onClick={handleCopyCode}
                    className="bg-zinc-900 border-[3px] border-black border-dashed rounded-none p-4 mb-6 cursor-pointer group hover:border-[#00ff88] transition-colors relative shadow-[4px_4px_0px_0px_#000]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-2xl font-black text-[#00ff88] tracking-widest font-mono">
                        {discountCode}
                      </code>
                      <div className="p-2 bg-[#00ff88]/10 rounded-lg group-hover:bg-[#00ff88] transition-colors">
                        {copied ? <Check size={18} className="text-[#00ff88] group-hover:text-black" /> : <Copy size={18} className="text-[#00ff88] group-hover:text-black" />}
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-[#00ff88] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg"
                        >
                          COPIED!
                        </motion.span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs">
                    Code expires in 24 hours. Valid on all collections.
                  </p>
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
