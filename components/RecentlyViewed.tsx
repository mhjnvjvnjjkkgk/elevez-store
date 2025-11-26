import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, TrendingUp, Eye } from 'lucide-react';
import { Product } from '../types';
import { recentlyViewedService, ViewedProduct } from '../services/recentlyViewedService';

interface RecentlyViewedProps {
  excludeProductId?: string;
  limit?: number;
  onProductClick?: (product: Product) => void;
  showStats?: boolean;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  excludeProductId,
  limit = 10,
  onProductClick,
  showStats = false
}) => {
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadRecentlyViewed();
  }, [excludeProductId, limit]);

  const loadRecentlyViewed = () => {
    const viewed = excludeProductId
      ? recentlyViewedService.getRecentlyViewedExcluding(excludeProductId, limit)
      : recentlyViewedService.getRecentlyViewed(limit);
    
    setViewedProducts(viewed);

    if (showStats) {
      setStats(recentlyViewedService.getViewStats());
    }
  };

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    recentlyViewedService.removeProduct(productId);
    loadRecentlyViewed();
  };

  const handleClearAll = () => {
    if (confirm('Clear all recently viewed products?')) {
      recentlyViewedService.clearRecentlyViewed();
      loadRecentlyViewed();
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (viewedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock size={28} className="text-[#00ff88]" />
          <div>
            <h2 className="text-2xl font-bold">Recently Viewed</h2>
            <p className="text-gray-400 text-sm">
              {viewedProducts.length} {viewedProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
        
        {viewedProducts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Views</p>
            <p className="text-2xl font-bold text-[#00ff88]">{stats.totalViews}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Unique Products</p>
            <p className="text-2xl font-bold">{stats.uniqueProducts}</p>
          </div>
          {stats.mostViewed && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <TrendingUp size={16} />
                Most Viewed
              </p>
              <p className="font-bold truncate">{stats.mostViewed.product.name}</p>
              <p className="text-xs text-gray-500">{stats.mostViewed.viewCount} views</p>
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {viewedProducts.map((viewed, index) => (
          <motion.div
            key={viewed.product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onProductClick?.(viewed.product)}
            className="group relative cursor-pointer"
          >
            {/* Remove Button */}
            <button
              onClick={(e) => handleRemove(viewed.product.id, e)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-black/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={14} />
            </button>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#00ff88]/50 transition-all">
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-black/20 overflow-hidden">
                <img
                  src={viewed.product.image}
                  alt={viewed.product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* View Count Badge */}
                {viewed.viewCount > 1 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full flex items-center gap-1">
                    <Eye size={12} className="text-[#00ff88]" />
                    <span className="text-xs font-bold">{viewed.viewCount}</span>
                  </div>
                )}

                {/* Time Badge */}
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg">
                  <p className="text-xs text-gray-300 text-center">
                    {formatTimeAgo(viewed.viewedAt)}
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-[#00ff88] transition-colors">
                  {viewed.product.name}
                </h3>
                
                <p className="text-lg font-bold text-[#00ff88]">
                  ${viewed.product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
