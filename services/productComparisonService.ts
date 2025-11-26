import { Product } from '../types';

export interface ComparisonItem {
  product: Product;
  addedAt: number;
}

class ProductComparisonService {
  private readonly STORAGE_KEY = 'product_comparison';
  private readonly MAX_ITEMS = 4;

  /**
   * Get comparison items from storage
   */
  getComparisonItems(): ComparisonItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading comparison items:', error);
      return [];
    }
  }

  /**
   * Save comparison items to storage
   */
  private saveComparisonItems(items: ComparisonItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving comparison items:', error);
    }
  }

  /**
   * Add product to comparison
   */
  addToComparison(product: Product): { success: boolean; message: string } {
    const items = this.getComparisonItems();

    // Check if already in comparison
    if (items.some(item => item.product.id === product.id)) {
      return {
        success: false,
        message: 'Product already in comparison'
      };
    }

    // Check max limit
    if (items.length >= this.MAX_ITEMS) {
      return {
        success: false,
        message: `Maximum ${this.MAX_ITEMS} products can be compared`
      };
    }

    // Add product
    const newItem: ComparisonItem = {
      product,
      addedAt: Date.now()
    };

    items.push(newItem);
    this.saveComparisonItems(items);

    return {
      success: true,
      message: 'Added to comparison'
    };
  }

  /**
   * Remove product from comparison
   */
  removeFromComparison(productId: number): void {
    const items = this.getComparisonItems();
    const filtered = items.filter(item => item.product.id !== productId);
    this.saveComparisonItems(filtered);
  }

  /**
   * Clear all comparison items
   */
  clearComparison(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if product is in comparison
   */
  isInComparison(productId: number): boolean {
    const items = this.getComparisonItems();
    return items.some(item => item.product.id === productId);
  }

  /**
   * Get comparison count
   */
  getComparisonCount(): number {
    return this.getComparisonItems().length;
  }

  /**
   * Get comparison features matrix
   */
  getComparisonMatrix(items: ComparisonItem[]): {
    features: string[];
    matrix: Record<string, (string | number | boolean)[]>;
  } {
    if (items.length === 0) {
      return { features: [], matrix: {} };
    }

    const features = [
      'Name',
      'Price',
      'Category',
      'Type',
      'Colors',
      'Sizes',
      'Material',
      'Rating',
      'In Stock'
    ];

    const matrix: Record<string, (string | number | boolean)[]> = {};

    features.forEach(feature => {
      matrix[feature] = items.map(item => {
        const product = item.product;
        
        switch (feature) {
          case 'Name':
            return product.name;
          case 'Price':
            return `₹${product.price}`;
          case 'Category':
            return product.category || 'N/A';
          case 'Type':
            return product.type || 'N/A';
          case 'Colors':
            return product.colors?.join(', ') || 'N/A';
          case 'Sizes':
            return product.sizes?.join(', ') || 'N/A';
          case 'Material':
            return (product as any).material || 'N/A';
          case 'Rating':
            return (product as any).rating ? `${(product as any).rating}/5` : 'N/A';
          case 'In Stock':
            return (product as any).inStock !== false ? 'Yes' : 'No';
          default:
            return 'N/A';
        }
      });
    });

    return { features, matrix };
  }

  /**
   * Get price comparison
   */
  getPriceComparison(items: ComparisonItem[]): {
    lowest: number;
    highest: number;
    average: number;
  } {
    if (items.length === 0) {
      return { lowest: 0, highest: 0, average: 0 };
    }

    const prices = items.map(item => item.product.price);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return { lowest, highest, average };
  }

  /**
   * Get best value product
   */
  getBestValue(items: ComparisonItem[]): Product | null {
    if (items.length === 0) return null;

    // Simple algorithm: best rating to price ratio
    let bestProduct: Product | null = null;
    let bestScore = 0;

    items.forEach(item => {
      const product = item.product;
      const rating = (product as any).rating || 3;
      const score = rating / product.price;

      if (score > bestScore) {
        bestScore = score;
        bestProduct = product;
      }
    });

    return bestProduct;
  }

  /**
   * Generate comparison URL for sharing
   */
  generateComparisonUrl(items: ComparisonItem[]): string {
    const productIds = items.map(item => item.product.id).join(',');
    const baseUrl = window.location.origin;
    return `${baseUrl}/compare?products=${productIds}`;
  }

  /**
   * Parse comparison URL
   */
  parseComparisonUrl(url: string): number[] {
    try {
      const urlObj = new URL(url);
      const productsParam = urlObj.searchParams.get('products');
      if (!productsParam) return [];
      
      return productsParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    } catch (error) {
      console.error('Error parsing comparison URL:', error);
      return [];
    }
  }
}

export const productComparisonService = new ProductComparisonService();
export default productComparisonService;
