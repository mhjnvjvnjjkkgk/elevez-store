// SECTION 5: Checkout Integration - Discount Code Application
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoyalty } from '../hooks/useLoyalty';
import { Tag, Check, X, Loader } from 'lucide-react';

interface CheckoutDiscountSectionProps {
  onDiscountApplied: (discountAmount: number, codeId: string) => void;
  onDiscountRemoved: () => void;
  appliedDiscount: { amount: number; codeId: string } | null;
}

export const CheckoutDiscountSection: React.FC<CheckoutDiscountSectionProps> = ({
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount
}) => {
  const { validateAndApplyCode, markCodeAsUsed, availableCodes } = useLoyalty();
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSavedCodes, setShowSavedCodes] = useState(false);

  const handleApplyCode = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const discountCode = await validateAndApplyCode(code.trim().toUpperCase());
      onDiscountApplied(discountCode.discountAmount, discountCode.id!);
      setCodeInput('');
      setShowSavedCodes(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    onDiscountRemoved();
    setError(null);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-[#00ff88]" />
        <h3 className="text-lg font-bold text-white">Discount Code</h3>
      </div>

      {appliedDiscount ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Discount Applied!</p>
                <p className="text-green-300 text-sm">You saved ₹{appliedDiscount.amount}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCode(codeInput)}
              placeholder="Enter discount code"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl 
                       text-white placeholder-white/50 focus:outline-none focus:border-[#00ff88] 
                       transition-colors uppercase"
            />
            <button
              onClick={() => handleApplyCode(codeInput)}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl 
                       text-white font-semibold hover:shadow-lg transition-all duration-300 
                       disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Saved Codes */}
          {availableCodes.length > 0 && (
            <div>
              <button
                onClick={() => setShowSavedCodes(!showSavedCodes)}
                className="text-[#00ff88] text-sm hover:underline mb-2"
              >
                {showSavedCodes ? 'Hide' : 'Show'} your saved codes ({availableCodes.length})
              </button>

              <AnimatePresence>
                {showSavedCodes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {availableCodes.map((code) => (
                      <motion.button
                        key={code.id}
                        onClick={() => handleApplyCode(code.code)}
                        whileHover={{ scale: 1.02 }}
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 
                                 rounded-lg p-3 text-left transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{code.code}</p>
                            <p className="text-white/70 text-xs">₹{code.discountAmount} off</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[#00ff88]" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Import ArrowRight
import { ArrowRight } from 'lucide-react';
