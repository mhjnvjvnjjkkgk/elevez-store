import { useState, useCallback, useEffect } from 'react';
import { Product } from '../types';
import { smartSearchService, SearchFilters, SearchResult } from '../services/smartSearchService';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  priceRange: { min: 0, max: 10000 },
  sizes: [],
  colors: [],
  inStock: false,
  sortBy: 'relevance'
};

export const useSmartSearch = (products: Product[]) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(() => {
    if (!query && filters.categories.length === 0 && !filters.inStock) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchResults = smartSearchService.search(products, {
        ...filters,
        query
      });
      
      setResults(searchResults);
      
      // Save to history if there's a query
      if (query) {
        smartSearchService.saveSearchHistory(query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [products, query, filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounce);
  }, [performSearch]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery('');
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  return {
    query,
    filters,
    results,
    isSearching,
    handleSearch,
    updateFilters,
    resetFilters,
    clearSearch,
    performSearch
  };
};
