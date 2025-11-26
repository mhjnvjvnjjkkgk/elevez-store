import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { ComparisonItem } from '../services/productComparisonService';

interface ComparisonBarProps {
  comparisonItems: ComparisonItem[];
  onRemove: (productId: number) => void;
  onCompare: () => void;
  onClear: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  comparisonItems,
  onRemove,
  onCompare,
  onClear
}) => {
  if (comparisonItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="bg-gradient-to-r from-black to-zinc-900 border-2 border-[#00ff88] rounded-2xl shadow-2xl shadow-[#00ff88]/20 p-4">
          <div className="flex items-center gap-4">
            {/* Product Thumbnails */}
            <div className="flex items-center gap-2">
              {comparisonItems.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
                  />
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
              
              {/* Empty Slots */}
              {[...Array(4 - comparisonItems.length)].map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white/40 text-xs">+</span>
                </div>
              ))}
            </div>

            {/* Info & Actions */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/20">
              <div className="text-left">
                <p className="text-sm font-bold text-white">
                  {comparisonItems.length} Product{comparisonItems.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-400">
                  {comparisonItems.length < 2 ? 'Add more to compare' : 'Ready to compare'}
                </p>
              </div>

              <div className="flex gap-2">
                {comparisonItems.length >= 2 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCompare}
                    className="bg-[#00ff88] text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors"
                  >
                    <Eye size={18} />
                    Compare
                  </motion.button>
                )}
                
                <button
                  onClick={onClear}
                  className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
