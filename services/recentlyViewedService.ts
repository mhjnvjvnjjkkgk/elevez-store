import { Product } from '../types';

export interface ViewedProduct {
  product: Product;
  viewedAt: number;
  viewCount: number;
}

class RecentlyViewedService {
  private readonly STORAGE_KEY = 'recently_viewed';
  private readonly MAX_ITEMS = 20;

  /**
   * Track a product view
   */
  trackView(product: Product): void {
    try {
      const viewed = this.getRecentlyViewed();
      
      // Check if product already exists
      const existingIndex = viewed.findIndex(v => v.product.id === product.id);
      
      if (existingIndex !== -1) {
        // Update existing entry
        viewed[existingIndex] = {
          product,
          viewedAt: Date.now(),
          viewCount: viewed[existingIndex].viewCount + 1
        };
        
        // Move to front
        const item = viewed.splice(existingIndex, 1)[0];
        viewed.unshift(item);
      } else {
        // Add new entry at front
        viewed.unshift({
          product,
          viewedAt: Date.now(),
          viewCount: 1
        });
      }

      // Keep only MAX_ITEMS
      const trimmed = viewed.slice(0, this.MAX_ITEMS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }

  /**
   * Get recently viewed products
   */
  getRecentlyViewed(limit?: number): ViewedProduct[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return [];

      const viewed: ViewedProduct[] = JSON.parse(saved);
      return limit ? viewed.slice(0, limit) : viewed;
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      return [];
    }
  }

  /**
   * Get recently viewed products excluding current product
   */
  getRecentlyViewedExcluding(excludeId: string, limit: number = 10): ViewedProduct[] {
    const viewed = this.getRecentlyViewed();
    return viewed
      .filter(v => v.product.id !== excludeId)
      .slice(0, limit);
  }

  /**
   * Clear recently viewed
   */
  clearRecentlyViewed(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }

  /**
   * Remove specific product from recently viewed
   */
  removeProduct(productId: string): void {
    try {
      const viewed = this.getRecentlyViewed();
      const filtered = viewed.filter(v => v.product.id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing product:', error);
    }
  }

  /**
   * Get view statistics
   */
  getViewStats(): {
    totalViews: number;
    uniqueProducts: number;
    mostViewed: ViewedProduct | null;
    recentlyAdded: ViewedProduct[];
  } {
    const viewed = this.getRecentlyViewed();
    
    const totalViews = viewed.reduce((sum, v) => sum + v.viewCount, 0);
    const uniqueProducts = viewed.length;
    
    const mostViewed = viewed.length > 0
      ? viewed.reduce((max, v) => v.viewCount > max.viewCount ? v : max)
      : null;
    
    const recentlyAdded = viewed
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 5);

    return {
      totalViews,
      uniqueProducts,
      mostViewed,
      recentlyAdded
    };
  }

  /**
   * Get products viewed in last N days
   */
  getViewedInLastDays(days: number): ViewedProduct[] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const viewed = this.getRecentlyViewed();
    
    return viewed.filter(v => v.viewedAt >= cutoff);
  }

  /**
   * Get products by category from recently viewed
   */
  getViewedByCategory(category: string): ViewedProduct[] {
    const viewed = this.getRecentlyViewed();
    return viewed.filter(v => v.product.category === category);
  }

  /**
   * Get recommended products based on recently viewed
   */
  getRecommendedBasedOnViewed(allProducts: Product[], limit: number = 10): Product[] {
    const viewed = this.getRecentlyViewed();
    if (viewed.length === 0) return [];

    // Get categories from viewed products
    const viewedCategories = new Set(
      viewed.map(v => v.product.category).filter(Boolean)
    );

    // Get products from same categories, excluding already viewed
    const viewedIds = new Set(viewed.map(v => v.product.id));
    
    const recommended = allProducts.filter(product => 
      !viewedIds.has(product.id) &&
      product.category &&
      viewedCategories.has(product.category)
    );

    // Sort by popularity or rating if available
    return recommended
      .sort((a, b) => {
        const aRating = (a as any).rating || 0;
        const bRating = (b as any).rating || 0;
        return bRating - aRating;
      })
      .slice(0, limit);
  }

  /**
   * Export recently viewed data
   */
  exportData(): string {
    const viewed = this.getRecentlyViewed();
    return JSON.stringify(viewed, null, 2);
  }

  /**
   * Import recently viewed data
   */
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        localStorage.setItem(this.STORAGE_KEY, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const recentlyViewedService = new RecentlyViewedService();
export default recentlyViewedService;
