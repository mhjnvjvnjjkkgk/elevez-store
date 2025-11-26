import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { 
  productComparisonService, 
  ComparisonItem 
} from '../services/productComparisonService';

export const useProductComparison = () => {
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Load comparison items on mount
  useEffect(() => {
    loadComparisonItems();
  }, []);

  const loadComparisonItems = useCallback(() => {
    const items = productComparisonService.getComparisonItems();
    setComparisonItems(items);
  }, []);

  const addToComparison = useCallback((product: Product) => {
    const result = productComparisonService.addToComparison(product);
    
    if (result.success) {
      loadComparisonItems();
      // Auto-open comparison if this is the second item
      if (comparisonItems.length === 1) {
        setIsComparisonOpen(true);
      }
    }
    
    return result;
  }, [comparisonItems.length, loadComparisonItems]);

  const removeFromComparison = useCallback((productId: number) => {
    productComparisonService.removeFromComparison(productId);
    loadComparisonItems();
  }, [loadComparisonItems]);

  const clearComparison = useCallback(() => {
    productComparisonService.clearComparison();
    loadComparisonItems();
    setIsComparisonOpen(false);
  }, [loadComparisonItems]);

  const isInComparison = useCallback((productId: number) => {
    return productComparisonService.isInComparison(productId);
  }, []);

  const openComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  const toggleComparison = useCallback(() => {
    setIsComparisonOpen(prev => !prev);
  }, []);

  // Get comparison matrix
  const comparisonMatrix = productComparisonService.getComparisonMatrix(comparisonItems);

  // Get price comparison
  const priceComparison = productComparisonService.getPriceComparison(comparisonItems);

  // Get best value product
  const bestValue = productComparisonService.getBestValue(comparisonItems);

  // Generate shareable URL
  const shareUrl = productComparisonService.generateComparisonUrl(comparisonItems);

  // Get comparison count
  const comparisonCount = comparisonItems.length;

  // Check if comparison is full
  const isFull = comparisonCount >= 4;

  return {
    // State
    comparisonItems,
    comparisonCount,
    isComparisonOpen,
    isFull,
    
    // Computed
    comparisonMatrix,
    priceComparison,
    bestValue,
    shareUrl,
    
    // Actions
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    openComparison,
    closeComparison,
    toggleComparison
  };
};
