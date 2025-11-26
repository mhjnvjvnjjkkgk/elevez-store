import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchFilters as Filters, SearchResult } from '../services/smartSearchService';

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  facets: SearchResult['facets'];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  facets
}) => {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['categories', 'price', 'sort'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, priceRange: { min, max } });
  };

  const handleSortChange = (sortBy: Filters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handleInStockToggle = () => {
    onFiltersChange({ ...filters, inStock: !filters.inStock });
  };

  const handleClearAll = () => {
    onFiltersChange({
      query: filters.query,
      categories: [],
      priceRange: { min: 0, max: 1000 },
      sizes: [],
      colors: [],
      inStock: false,
      sortBy: 'relevance'
    });
  };

  const activeFiltersCount = 
    filters.categories.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.inStock ? 1 : 0) +
    (filters.sortBy !== 'relevance' ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Filters Panel */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-black border-r lg:border lg:rounded-xl border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black border-b border-white/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-400">{activeFiltersCount} active</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-[#00ff88] hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Sort By */}
              <div>
                <button
                  onClick={() => toggleSection('sort')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h4 className="font-bold">Sort By</h4>
                  {expandedSections.has('sort') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.has('sort') && (
                  <div className="space-y-2">
                    {[
                      { value: 'relevance', label: 'Relevance' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'newest', label: 'Newest First' },
                      { value: 'popular', label: 'Most Popular' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="sort"
                          checked={filters.sortBy === option.value}
                          onChange={() => handleSortChange(option.value as Filters['sortBy'])}
                          className="w-4 h-4 accent-[#00ff88]"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              {facets.categories.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="font-bold">Categories</h4>
                    {expandedSections.has('categories') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSections.has('categories') && (
                    <div className="space-y-2">
                      {facets.categories.map((category) => (
                        <label
                          key={category.name}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.categories.includes(category.name)}
                              onChange={() => handleCategoryToggle(category.name)}
                              className="w-4 h-4 accent-[#00ff88]"
                            />
                            <span className="text-sm">{category.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">({category.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h4 className="font-bold">Price Range</h4>
                  {expandedSections.has('price') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSections.has('price') && (
                  <div className="space-y-3">
                    {facets.priceRanges.map((range) => (
                      <button
                        key={range.range}
                        onClick={() => {
                          const [min, max] = range.range.includes('+')
                            ? [100, 10000]
                            : range.range.includes('Under')
                            ? [0, 25]
                            : range.range.split(' - ').map(p => parseInt(p.replace('$', '')));
                          handlePriceRangeChange(min, max);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <span className="text-sm">{range.range}</span>
                        <span className="text-xs text-gray-500">({range.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes */}
              {facets.sizes.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('sizes')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="font-bold">Sizes</h4>
                    {expandedSections.has('sizes') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSections.has('sizes') && (
                    <div className="flex flex-wrap gap-2">
                      {facets.sizes.map((size) => (
                        <button
                          key={size.name}
                          onClick={() => handleSizeToggle(size.name)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            filters.sizes.includes(size.name)
                              ? 'bg-[#00ff88] text-black border-[#00ff88]'
                              : 'bg-white/5 border-white/10 hover:border-[#00ff88]/50'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Colors */}
              {facets.colors.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('colors')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <h4 className="font-bold">Colors</h4>
                    {expandedSections.has('colors') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSections.has('colors') && (
                    <div className="flex flex-wrap gap-2">
                      {facets.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleColorToggle(color.name)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            filters.colors.includes(color.name)
                              ? 'bg-[#00ff88] text-black border-[#00ff88]'
                              : 'bg-white/5 border-white/10 hover:border-[#00ff88]/50'
                          }`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* In Stock Only */}
              <div>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={handleInStockToggle}
                    className="w-4 h-4 accent-[#00ff88]"
                  />
                  <span className="text-sm font-bold">In Stock Only</span>
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
