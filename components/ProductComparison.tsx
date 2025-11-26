import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, ShoppingCart, Check, Award } from 'lucide-react';
import { ComparisonItem } from '../services/productComparisonService';
import { Link } from 'react-router-dom';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonItems: ComparisonItem[];
  comparisonMatrix: {
    features: string[];
    matrix: Record<string, (string | number | boolean)[]>;
  };
  priceComparison: {
    lowest: number;
    highest: number;
    average: number;
  };
  bestValue: any | null;
  shareUrl: string;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onAddToCart?: (productId: number) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  isOpen,
  onClose,
  comparisonItems,
  comparisonMatrix,
  priceComparison,
  bestValue,
  shareUrl,
  onRemove,
  onClear,
  onAddToCart
}) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Product Comparison',
          text: 'Check out this product comparison',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Comparison link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (comparisonItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />

          {/* Comparison Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-black border-t border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold">Product Comparison</h2>
                    <p className="text-gray-400 mt-1">
                      Comparing {comparisonItems.length} product{comparisonItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                    
                    <button
                      onClick={onClear}
                      className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                    
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                {comparisonItems.length > 1 && (
                  <div className="flex gap-4 text-sm">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-gray-400">Lowest: </span>
                      <span className="text-green-400 font-bold">₹{priceComparison.lowest}</span>
                    </div>
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <span className="text-gray-400">Highest: </span>
                      <span className="text-red-400 font-bold">₹{priceComparison.highest}</span>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <span className="text-gray-400">Average: </span>
                      <span className="text-blue-400 font-bold">₹{priceComparison.average.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="max-w-7xl mx-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-black z-10 p-4 text-left border-b border-white/10">
                        <span className="text-gray-400 text-sm uppercase tracking-wider">Feature</span>
                      </th>
                      {comparisonItems.map((item, index) => (
                        <th key={item.product.id} className="p-4 border-b border-white/10 min-w-[250px]">
                          <div className="relative">
                            {/* Best Value Badge */}
                            {bestValue && bestValue.id === item.product.id && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#00ff88] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Award size={14} />
                                Best Value
                              </div>
                            )}
                            
                            {/* Product Image */}
                            <Link to={`/product/${item.product.id}`}>
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-48 object-cover rounded-lg mb-4 hover:scale-105 transition-transform"
                              />
                            </Link>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => onRemove(item.product.id)}
                              className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-red-500 rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {comparisonMatrix.features.map((feature, featureIndex) => (
                      <tr key={feature} className={featureIndex % 2 === 0 ? 'bg-white/5' : ''}>
                        <td className="sticky left-0 bg-black z-10 p-4 font-bold border-b border-white/10">
                          {feature}
                        </td>
                        {comparisonMatrix.matrix[feature].map((value, valueIndex) => {
                          const isBestPrice = feature === 'Price' && 
                            value === `₹${priceComparison.lowest}`;
                          
                          return (
                            <td 
                              key={valueIndex} 
                              className={`p-4 border-b border-white/10 text-center ${
                                isBestPrice ? 'bg-green-500/10 text-green-400 font-bold' : ''
                              }`}
                            >
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <Check size={20} className="mx-auto text-green-400" />
                                ) : (
                                  <X size={20} className="mx-auto text-red-400" />
                                )
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Action Row */}
                    <tr>
                      <td className="sticky left-0 bg-black z-10 p-4 font-bold">
                        Actions
                      </td>
                      {comparisonItems.map(item => (
                        <td key={item.product.id} className="p-4">
                          <div className="flex flex-col gap-2">
                            <Link
                              to={`/product/${item.product.id}`}
                              className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-bold text-center transition-colors"
                            >
                              View Details
                            </Link>
                            {onAddToCart && (
                              <button
                                onClick={() => onAddToCart(item.product.id)}
                                className="w-full bg-[#00ff88] hover:bg-white text-black py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                              >
                                <ShoppingCart size={18} />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
