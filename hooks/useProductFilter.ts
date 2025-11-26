import { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { 
  productFilterService, 
  FilterState, 
  FilterOptions 
} from '../services/productFilterService';

export const useProductFilter = (products: Product[]) => {
  const [filterState, setFilterState] = useState<FilterState>(() => 
    productFilterService.getInitialState()
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract available filter options from products
  const filterOptions = useMemo<FilterOptions>(() => 
    productFilterService.extractFilterOptions(products),
    [products]
  );

  // Apply filters to products
  const filteredProducts = useMemo(() => 
    productFilterService.filterProducts(products, filterState),
    [products, filterState]
  );

  // Get active filter count
  const activeFilterCount = useMemo(() => 
    productFilterService.getActiveFilterCount(
      filterState, 
      productFilterService.getInitialState()
    ),
    [filterState]
  );

  // Save filters when they change
  useEffect(() => {
    productFilterService.saveFilters(filterState);
  }, [filterState]);

  // Filter actions
  const toggleColor = (color: string) => {
    setFilterState(prev => productFilterService.toggleColor(prev, color));
  };

  const toggleSize = (size: string) => {
    setFilterState(prev => productFilterService.toggleSize(prev, size));
  };

  const toggleCategory = (category: string) => {
    setFilterState(prev => productFilterService.toggleCategory(prev, category));
  };

  const toggleType = (type: string) => {
    setFilterState(prev => productFilterService.toggleType(prev, type));
  };

  const updatePriceRange = (min: number, max: number) => {
    setFilterState(prev => productFilterService.updatePriceRange(prev, min, max));
  };

  const updateSort = (sortBy: FilterState['sortBy']) => {
    setFilterState(prev => productFilterService.updateSort(prev, sortBy));
  };

  const toggleInStock = () => {
    setFilterState(prev => productFilterService.toggleInStock(prev));
  };

  const toggleOnSale = () => {
    setFilterState(prev => productFilterService.toggleOnSale(prev));
  };

  const resetFilters = () => {
    setFilterState(productFilterService.resetFilters(
      productFilterService.getInitialState()
    ));
  };

  const openFilters = () => setIsFilterOpen(true);
  const closeFilters = () => setIsFilterOpen(false);
  const toggleFilters = () => setIsFilterOpen(prev => !prev);

  return {
    // State
    filterState,
    filterOptions,
    filteredProducts,
    activeFilterCount,
    isFilterOpen,
    
    // Actions
    toggleColor,
    toggleSize,
    toggleCategory,
    toggleType,
    updatePriceRange,
    updateSort,
    toggleInStock,
    toggleOnSale,
    resetFilters,
    openFilters,
    closeFilters,
    toggleFilters,
    
    // Utilities
    getColorHex: productFilterService.getColorHex.bind(productFilterService)
  };
};
