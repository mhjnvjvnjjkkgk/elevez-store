// Performance Optimization Service
import { useCallback, useRef, useEffect } from 'react';

/**
 * Debounce function for optimizing frequent function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for limiting function execution frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoization helper for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Request animation frame wrapper for smooth animations
 */
export const requestAnimationFrameThrottle = (callback: () => void) => {
  let rafId: number | null = null;

  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(callback);
  };
};

/**
 * Intersection Observer helper for lazy loading
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isVisible;
};

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  items: any[];
  overscan?: number;
}

export const useVirtualScroll = (config: VirtualScrollConfig) => {
  const { itemHeight, containerHeight, items, overscan = 3 } = config;
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, items, overscan]);

  return {
    ...visibleRange,
    setScrollTop,
    totalHeight: items.length * itemHeight
  };
};

/**
 * Performance monitoring utility
 */
export const measurePerformance = async (
  name: string,
  fn: () => Promise<any>
) => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

/**
 * Batch updates to reduce re-renders
 */
export const useBatchUpdates = <T,>(initialState: T) => {
  const [state, setState] = React.useState(initialState);
  const batchRef = useRef<Partial<T>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    batchRef.current = { ...batchRef.current, ...updates };

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 16); // ~60fps
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
};

/**
 * Cache management utility
 */
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key: string) {
    return this.get(key) !== null;
  }
}

/**
 * Query optimization helper
 */
export const optimizeQuery = (query: any) => {
  // Add indexes for common queries
  // Add pagination
  // Add caching
  return query;
};
