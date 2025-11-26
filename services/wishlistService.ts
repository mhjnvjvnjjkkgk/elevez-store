import { Product } from '../types';

export interface WishlistItem {
  product: Product;
  addedAt: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  notifyOnSale?: boolean;
}

export interface WishlistCollection {
  id: string;
  name: string;
  items: WishlistItem[];
  createdAt: number;
  isPublic: boolean;
}

class WishlistService {
  private readonly STORAGE_KEY = 'wishlist';
  private readonly COLLECTIONS_KEY = 'wishlist_collections';

  /**
   * Add product to wishlist
   */
  addToWishlist(product: Product, options?: {
    notes?: string;
    priority?: WishlistItem['priority'];
    notifyOnSale?: boolean;
  }): boolean {
    try {
      const wishlist = this.getWishlist();
      
      // Check if already in wishlist
      if (wishlist.some(item => item.product.id === product.id)) {
        return false;
      }

      const item: WishlistItem = {
        product,
        addedAt: Date.now(),
        notes: options?.notes,
        priority: options?.priority || 'medium',
        notifyOnSale: options?.notifyOnSale || false
      };

      wishlist.unshift(item);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wishlist));
      
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }

  /**
   * Remove product from wishlist
   */
  removeFromWishlist(productId: string): boolean {
    try {
      const wishlist = this.getWishlist();
      const filtered = wishlist.filter(item => item.product.id !== productId);
      
      if (filtered.length === wishlist.length) {
        return false; // Product not found
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  /**
   * Check if product is in wishlist
   */
  isInWishlist(productId: string): boolean {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.product.id === productId);
  }

  /**
   * Get wishlist
   */
  getWishlist(): WishlistItem[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  }

  /**
   * Get wishlist count
   */
  getWishlistCount(): number {
    return this.getWishlist().length;
  }

  /**
   * Update wishlist item
   */
  updateWishlistItem(productId: string, updates: Partial<Omit<WishlistItem, 'product' | 'addedAt'>>): boolean {
    try {
      const wishlist = this.getWishlist();
      const index = wishlist.findIndex(item => item.product.id === productId);
      
      if (index === -1) return false;

      wishlist[index] = {
        ...wishlist[index],
        ...updates
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wishlist));
      return true;
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      return false;
    }
  }

  /**
   * Clear wishlist
   */
  clearWishlist(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  }

  /**
   * Get wishlist by priority
   */
  getWishlistByPriority(priority: WishlistItem['priority']): WishlistItem[] {
    return this.getWishlist().filter(item => item.priority === priority);
  }

  /**
   * Get items with sale notifications enabled
   */
  getItemsWithSaleNotifications(): WishlistItem[] {
    return this.getWishlist().filter(item => item.notifyOnSale);
  }

  /**
   * Sort wishlist
   */
  sortWishlist(sortBy: 'date' | 'price-low' | 'price-high' | 'priority' | 'name'): WishlistItem[] {
    const wishlist = this.getWishlist();

    switch (sortBy) {
      case 'date':
        return wishlist.sort((a, b) => b.addedAt - a.addedAt);
      
      case 'price-low':
        return wishlist.sort((a, b) => a.product.price - b.product.price);
      
      case 'price-high':
        return wishlist.sort((a, b) => b.product.price - a.product.price);
      
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return wishlist.sort((a, b) => 
          priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
        );
      
      case 'name':
        return wishlist.sort((a, b) => 
          a.product.name.localeCompare(b.product.name)
        );
      
      default:
        return wishlist;
    }
  }

  /**
   * Get wishlist statistics
   */
  getWishlistStats(): {
    totalItems: number;
    totalValue: number;
    averagePrice: number;
    oldestItem: WishlistItem | null;
    newestItem: WishlistItem | null;
    byPriority: Record<string, number>;
  } {
    const wishlist = this.getWishlist();
    
    const totalItems = wishlist.length;
    const totalValue = wishlist.reduce((sum, item) => sum + item.product.price, 0);
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
    
    const sorted = [...wishlist].sort((a, b) => a.addedAt - b.addedAt);
    const oldestItem = sorted[0] || null;
    const newestItem = sorted[sorted.length - 1] || null;

    const byPriority = {
      high: wishlist.filter(i => i.priority === 'high').length,
      medium: wishlist.filter(i => i.priority === 'medium').length,
      low: wishlist.filter(i => i.priority === 'low').length
    };

    return {
      totalItems,
      totalValue,
      averagePrice,
      oldestItem,
      newestItem,
      byPriority
    };
  }

  /**
   * Create wishlist collection
   */
  createCollection(name: string, isPublic: boolean = false): WishlistCollection {
    const collection: WishlistCollection = {
      id: `collection_${Date.now()}`,
      name,
      items: [],
      createdAt: Date.now(),
      isPublic
    };

    const collections = this.getCollections();
    collections.push(collection);
    localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));

    return collection;
  }

  /**
   * Get all collections
   */
  getCollections(): WishlistCollection[] {
    try {
      const saved = localStorage.getItem(this.COLLECTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading collections:', error);
      return [];
    }
  }

  /**
   * Add item to collection
   */
  addToCollection(collectionId: string, item: WishlistItem): boolean {
    try {
      const collections = this.getCollections();
      const collection = collections.find(c => c.id === collectionId);
      
      if (!collection) return false;

      // Check if already in collection
      if (collection.items.some(i => i.product.id === item.product.id)) {
        return false;
      }

      collection.items.push(item);
      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
      
      return true;
    } catch (error) {
      console.error('Error adding to collection:', error);
      return false;
    }
  }

  /**
   * Share wishlist
   */
  generateShareableLink(collectionId?: string): string {
    const data = collectionId
      ? this.getCollections().find(c => c.id === collectionId)
      : { items: this.getWishlist() };

    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}/wishlist/shared/${encoded}`;
  }

  /**
   * Export wishlist
   */
  exportWishlist(): string {
    const wishlist = this.getWishlist();
    return JSON.stringify(wishlist, null, 2);
  }

  /**
   * Import wishlist
   */
  importWishlist(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        localStorage.setItem(this.STORAGE_KEY, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing wishlist:', error);
      return false;
    }
  }

  /**
   * Move all to cart
   */
  moveAllToCart(onAddToCart: (product: Product) => void): void {
    const wishlist = this.getWishlist();
    wishlist.forEach(item => {
      onAddToCart(item.product);
    });
    this.clearWishlist();
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
