import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { FilterState, FilterOptions } from '../services/productFilterService';

interface AdvancedProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  filterOptions: FilterOptions;
  activeFilterCount: number;
  onToggleColor: (color: string) => void;
  onToggleSize: (size: string) => void;
  onToggleCategory: (category: string) => void;
  onToggleType: (type: string) => void;
  onUpdatePriceRange: (min: number, max: number) => void;
  onToggleInStock: () => void;
  onToggleOnSale: () => void;
  onReset: () => void;
  getColorHex: (color: string) => string;
}

export const AdvancedProductFilters: React.FC<AdvancedProductFiltersProps> = ({
  isOpen,
  onClose,
  filterState,
  filterOptions,
  activeFilterCount,
  onToggleColor,
  onToggleSize,
  onToggleCategory,
  onToggleType,
  onUpdatePriceRange,
  onToggleInStock,
  onToggleOnSale,
  onReset,
  getColorHex
}) => {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={24} className="text-[#00ff88]" />
                  <h2 className="text-2xl font-bold">Filters</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                  <button
                    onClick={onReset}
                    className="text-sm text-[#00ff88] hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Filter Content */}
            <div className="p-6 space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-bold mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Min</label>
                      <input
                        type="number"
                        value={filterState.priceRange.min}
                        onChange={(e) => onUpdatePriceRange(
                          Number(e.target.value),
                          filterState.priceRange.max
                        )}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#00ff88] outline-none"
                      />
                    </div>
                    <span className="text-gray-400 mt-6">-</span>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Max</label>
                      <input
                        type="number"
                        value={filterState.priceRange.max}
                        onChange={(e) => onUpdatePriceRange(
                          filterState.priceRange.min,
                          Number(e.target.value)
                        )}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#00ff88] outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Price Range Slider */}
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max}
                      value={filterState.priceRange.max}
                      onChange={(e) => onUpdatePriceRange(
                        filterState.priceRange.min,
                        Number(e.target.value)
                      )}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              {filterOptions.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {filterOptions.colors.map(color => {
                      const isSelected = filterState.selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => onToggleColor(color)}
                          className="group relative"
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 transition-all ${
                              isSelected 
                                ? 'border-[#00ff88] scale-110' 
                                : 'border-white/20 hover:border-white/40'
                            }`}
                            style={{ backgroundColor: getColorHex(color) }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={20} className="text-white drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {filterOptions.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.sizes.map(size => {
                      const isSelected = filterState.selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => onToggleSize(size)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            isSelected
                              ? 'bg-[#00ff88] text-black'
                              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {filterOptions.categories.map(category => {
                      const isSelected = filterState.selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          onClick={() => onToggleCategory(category)}
                          className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]'
                              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <span>{category}</span>
                          {isSelected && <Check size={20} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Types */}
              {filterOptions.types.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Product Types</h3>
                  <div className="space-y-2">
                    {filterOptions.types.map(type => {
                      const isSelected = filterState.selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => onToggleType(type)}
                          className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]'
                              : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <span>{type}</span>
                          {isSelected && <Check size={20} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div>
                <h3 className="text-lg font-bold mb-4">Availability</h3>
                <div className="space-y-2">
                  <button
                    onClick={onToggleInStock}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-all flex items-center justify-between ${
                      filterState.inStockOnly
                        ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>In Stock Only</span>
                    {filterState.inStockOnly && <Check size={20} />}
                  </button>
                  
                  <button
                    onClick={onToggleOnSale}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-left transition-all flex items-center justify-between ${
                      filterState.onSaleOnly
                        ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>On Sale</span>
                    {filterState.onSaleOnly && <Check size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-black/95 backdrop-blur-md border-t border-white/10 p-6">
              <button
                onClick={onClose}
                className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
