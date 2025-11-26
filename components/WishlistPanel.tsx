import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart, Share2, Download, Trash2, SlidersHorizontal, Star } from 'lucide-react';
import { Product } from '../types';
import { wishlistService, WishlistItem } from '../services/wishlistService';

interface WishlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const WishlistPanel: React.FC<WishlistPanelProps> = ({
  isOpen,
  onClose,
  onProductClick,
  onAddToCart
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'price-low' | 'price-high' | 'priority' | 'name'>('date');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadWishlist();
    }
  }, [isOpen, sortBy, filterPriority]);

  const loadWishlist = () => {
    let items = wishlistService.sortWishlist(sortBy);
    
    if (filterPriority !== 'all') {
      items = items.filter(item => item.priority === filterPriority);
    }

    setWishlist(items);
    setStats(wishlistService.getWishlistStats());
  };

  const handleRemove = (productId: string) => {
    wishlistService.removeFromWishlist(productId);
    loadWishlist();
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart?.(product);
    wishlistService.removeFromWishlist(product.id);
    loadWishlist();
  };

  const handleMoveAllToCart = () => {
    if (confirm('Move all items to cart?')) {
      wishlistService.moveAllToCart((product) => onAddToCart?.(product));
      loadWishlist();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear entire wishlist?')) {
      wishlistService.clearWishlist();
      loadWishlist();
    }
  };

  const handleShare = () => {
    const link = wishlistService.generateShareableLink();
    navigator.clipboard.writeText(link);
    alert('Wishlist link copied to clipboard!');
  };

  const handleExport = () => {
    const data = wishlistService.exportWishlist();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.json';
    a.click();
  };

  const getPriorityColor = (priority?: WishlistItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'low':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    }
  };

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-black border-l border-white/10 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00ff88]/20 to-transparent p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Heart size={28} className="text-[#00ff88]" fill="currentColor" />
                  <div>
                    <h2 className="text-2xl font-bold">My Wishlist</h2>
                    <p className="text-gray-400">{wishlist.length} items</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Stats */}
              {stats && stats.totalItems > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Value</p>
                    <p className="text-lg font-bold text-[#00ff88]">
                      ${stats.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Avg Price</p>
                    <p className="text-lg font-bold">
                      ${stats.averagePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">High Priority</p>
                    <p className="text-lg font-bold text-red-400">
                      {stats.byPriority.high}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            {wishlist.length > 0 && (
              <div className="p-4 border-b border-white/10 flex gap-2 flex-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-[#00ff88]"
                >
                  <option value="date">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="priority">Priority</option>
                  <option value="name">Name</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm outline-none focus:border-[#00ff88]"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <button
                  onClick={handleShare}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  title="Share Wishlist"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={handleExport}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  title="Export Wishlist"
                >
                  <Download size={18} />
                </button>

                <button
                  onClick={handleClearAll}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors ml-auto"
                  title="Clear All"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            )}

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart size={64} className="text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Your Wishlist is Empty</h3>
                  <p className="text-gray-500">Add products you love to save them for later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#00ff88]/50 transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div
                          onClick={() => onProductClick?.(item.product)}
                          className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-black/20 cursor-pointer"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3
                              onClick={() => onProductClick?.(item.product)}
                              className="font-bold line-clamp-2 cursor-pointer hover:text-[#00ff88] transition-colors"
                            >
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => handleRemove(item.product.id)}
                              className="p-1 hover:bg-red-500/20 rounded-full transition-colors flex-shrink-0"
                            >
                              <X size={18} className="text-red-400" />
                            </button>
                          </div>

                          <p className="text-2xl font-bold text-[#00ff88] mb-2">
                            ${item.product.price.toFixed(2)}
                          </p>

                          {/* Priority Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(item.priority)}`}>
                              {item.priority?.toUpperCase()}
                            </span>
                            {item.notifyOnSale && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
                                🔔 Sale Alert
                              </span>
                            )}
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                              {item.notes}
                            </p>
                          )}

                          {/* Actions */}
                          <button
                            onClick={() => handleAddToCart(item.product)}
                            className="w-full bg-[#00ff88] text-black py-2 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="border-t border-white/10 p-4 bg-black/50">
                <button
                  onClick={handleMoveAllToCart}
                  className="w-full bg-[#00ff88] text-black py-3 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Move All to Cart ({wishlist.length} items)
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
