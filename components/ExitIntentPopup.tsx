import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from top of page
      if (e.clientY <= 0 && !isVisible && !submitted) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
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

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            style={{ pointerEvents: 'auto' }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            className="fixed z-[9999] w-full max-w-md px-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ 
              pointerEvents: 'auto'
            }}
          >
            <div className="bg-gradient-to-br from-black to-zinc-900 border-2 border-[#00ff88]/50 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-[#00ff88]/20">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>

              {/* Content */}
              {!submitted ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl"
                    >
                      <Gift />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Wait! Don't Leave Yet
                  </h2>
                  <p className="text-gray-400 text-center mb-6">
                    Get <span className="text-[#00ff88] font-bold">15% OFF</span> your first order
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                      required
                    />

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg uppercase tracking-widest hover:bg-white transition-colors"
                    >
                      Claim 15% Discount
                    </motion.button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl mb-4"
                  >
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#00ff88] mb-4">
                    Success! Here's Your Code
                  </h3>
                  
                  {/* Discount Code Display */}
                  <div className="bg-gradient-to-r from-[#00ff88]/20 to-cyan-500/20 border-2 border-[#00ff88]/50 rounded-xl p-6 mb-6">
                    <p className="text-gray-400 text-sm mb-3">Your exclusive 15% discount code:</p>
                    <div className="flex items-center justify-center gap-3">
                      <code className="text-3xl font-black text-[#00ff88] tracking-widest">
                        {discountCode}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyCode}
                        className="p-2 bg-[#00ff88]/20 hover:bg-[#00ff88]/40 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check size={20} className="text-[#00ff88]" />
                        ) : (
                          <Copy size={20} className="text-[#00ff88]" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    Use this code at checkout to save 15%
                  </p>
                  <p className="text-gray-500 text-xs">
                    Code expires in 30 days
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
