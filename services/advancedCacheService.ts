// Advanced Cache Service - Multi-layer caching with TTL and invalidation
import { SyncEvent } from './realtimeSyncService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enablePersistence: boolean;
}

// ============================================
// ADVANCED CACHE MANAGER
// ============================================

class AdvancedCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enableCompression: true,
    enablePersistence: true
  };

  private cleanupInterval: NodeJS.Timeout | null = null;
  private invalidationCallbacks: Map<string, Set<() => void>> = new Map();

  /**
   * Initialize cache
   */
  initialize(config: Partial<CacheConfig> = {}): void {
    this.config = { ...this.config, ...config };

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute

    // Load from persistence if enabled
    if (this.config.enablePersistence) {
      this.loadFromPersistence();
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.persistEntry(key, entry);
    }

    // Check size limit
    if (this.getMemoryUsage() > this.config.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access info
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data as T;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
        count++;
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.triggerInvalidationCallbacks(key);
    });

    return count;
  }

  /**
   * Register invalidation callback
   */
  onInvalidate(pattern: string, callback: () => void): () => void {
    if (!this.invalidationCallbacks.has(pattern)) {
      this.invalidationCallbacks.set(pattern, new Set());
    }

    this.invalidationCallbacks.get(pattern)!.add(callback);

    return () => {
      this.invalidationCallbacks.get(pattern)?.delete(callback);
    };
  }

  /**
   * Trigger invalidation callbacks
   */
  private triggerInvalidationCallbacks(key: string): void {
    this.invalidationCallbacks.forEach((callbacks, pattern) => {
      if (new RegExp(pattern).test(key)) {
        callbacks.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error('Error in invalidation callback:', error);
          }
        });
      }
    });
  }

  /**
   * Get cache stats
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      totalEntries: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.stats.misses / total) * 100 : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    let size = 0;
    this.cache.forEach((entry) => {
      size += JSON.stringify(entry.data).length;
    });
    return size;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * Evict LRU entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Persist entry
   */
  private persistEntry(key: string, entry: CacheEntry<any>): void {
    try {
      const data = JSON.stringify(entry);
      localStorage.setItem(`cache_${key}`, data);
    } catch (error) {
      console.error('Error persisting cache entry:', error);
    }
  }

  /**
   * Load from persistence
   */
  private loadFromPersistence(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          const cacheKey = key.substring(6);
          const data = localStorage.getItem(key);
          if (data) {
            const entry = JSON.parse(data);
            this.cache.set(cacheKey, entry);
          }
        }
      });
    } catch (error) {
      console.error('Error loading cache from persistence:', error);
    }
  }

  /**
   * Destroy cache
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.invalidationCallbacks.clear();
  }
}

// Export singleton
export const cacheManager = new AdvancedCacheManager();

// ============================================
// CACHE HELPERS
// ============================================

export const cacheAnalytics = (data: any, ttl?: number) => {
  cacheManager.set('analytics', data, ttl);
};

export const getCachedAnalytics = () => {
  return cacheManager.get('analytics');
};

export const cacheUsers = (data: any, ttl?: number) => {
  cacheManager.set('users', data, ttl);
};

export const getCachedUsers = () => {
  return cacheManager.get('users');
};

export const cacheOrders = (data: any, ttl?: number) => {
  cacheManager.set('orders', data, ttl);
};

export const getCachedOrders = () => {
  return cacheManager.get('orders');
};

export const invalidateAnalytics = () => {
  cacheManager.invalidatePattern(/^analytics/);
};

export const invalidateUsers = () => {
  cacheManager.invalidatePattern(/^users/);
};

export const invalidateOrders = () => {
  cacheManager.invalidatePattern(/^orders/);
};
