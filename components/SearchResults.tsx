import React from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { SearchResult } from '../services/smartSearchService';

interface SearchResultsProps {
  results: SearchResult;
  query: string;
  onProductClick: (product: Product) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  onProductClick,
  onToggleFilters,
  showFilters
}) => {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search size={64} className="text-gray-600 mb-4" />
        <h3 className="text-2xl font-bold text-gray-400 mb-2">Start Searching</h3>
        <p className="text-gray-500">Enter a search term to find products</p>
      </div>
    );
  }

  if (results.totalResults === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Search size={64} className="text-gray-600 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
        <p className="text-gray-400 mb-6">
          No products found for "{query}"
        </p>
        {results.suggestions.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Did you mean:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {results.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00ff88]/50 rounded-lg text-sm transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Search Results for "{query}"
          </h2>
          <p className="text-gray-400 mt-1">
            {results.totalResults} {results.totalResults === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            showFilters
              ? 'bg-[#00ff88] text-black border-[#00ff88]'
              : 'bg-white/5 border-white/10 hover:border-[#00ff88]/50'
          }`}
        >
          <SlidersHorizontal size={20} />
          Filters
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onProductClick(product)}
            className="group cursor-pointer"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#00ff88]/50 transition-all">
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-black/20 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart
                    }}
                    className="px-4 py-2 bg-[#00ff88] text-black rounded-lg font-bold hover:bg-white transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Quick view
                    }}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Quick View
                  </button>
                </div>

                {/* Badges */}
                {(product as any).isNew && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[#00ff88] text-black text-xs font-bold rounded-full">
                    NEW
                  </div>
                )}
                {(product as any).discount && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    -{(product as any).discount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-[#00ff88] transition-colors">
                  {product.name}
                </h3>
                
                {product.category && (
                  <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#00ff88]">
                      ${product.price.toFixed(2)}
                    </p>
                    {(product as any).originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ${(product as any).originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {(product as any).rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-bold">{(product as any).rating}</span>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                {(product as any).inStock === false && (
                  <div className="mt-3 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                    <p className="text-sm text-red-400 font-bold">Out of Stock</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {results.totalResults > results.products.length && (
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-lg hover:border-[#00ff88]/50 hover:bg-white/10 transition-all">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};
