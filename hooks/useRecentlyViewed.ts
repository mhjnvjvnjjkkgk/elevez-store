import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { recentlyViewedService, ViewedProduct } from '../services/recentlyViewedService';

export const useRecentlyViewed = (limit?: number) => {
  const [recentlyViewed, setRecentlyViewed] = useState<ViewedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecentlyViewed = useCallback(() => {
    try {
      const viewed = recentlyViewedService.getRecentlyViewed(limit);
      setRecentlyViewed(viewed);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const trackView = useCallback((product: Product) => {
    recentlyViewedService.trackView(product);
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const removeProduct = useCallback((productId: string) => {
    recentlyViewedService.removeProduct(productId);
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const clearAll = useCallback(() => {
    recentlyViewedService.clearRecentlyViewed();
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  const getRecommended = useCallback((allProducts: Product[], recommendLimit?: number) => {
    return recentlyViewedService.getRecommendedBasedOnViewed(allProducts, recommendLimit);
  }, []);

  return {
    recentlyViewed,
    isLoading,
    trackView,
    removeProduct,
    clearAll,
    getRecommended,
    refresh: loadRecentlyViewed
  };
};
