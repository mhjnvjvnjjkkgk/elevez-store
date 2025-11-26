// Performance Optimization Service - Monitor and optimize performance
import { SyncEvent } from './realtimeSyncService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  category: 'render' | 'network' | 'cache' | 'sync' | 'storage';
  success: boolean;
}

export interface PerformanceReport {
  avgRenderTime: number;
  avgNetworkTime: number;
  avgCacheTime: number;
  avgSyncTime: number;
  totalMetrics: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  errorRate: number;
}

export interface PerformanceThresholds {
  renderTime: number;
  networkTime: number;
  cacheTime: number;
  syncTime: number;
}

// ============================================
// PERFORMANCE MONITOR
// ============================================

class PerformanceOptimizer {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    renderTime: 100, // ms
    networkTime: 500, // ms
    cacheTime: 50, // ms
    syncTime: 1000 // ms
  };

  private alertCallbacks: Set<(metric: PerformanceMetric) => void> = new Set();
  private maxMetrics = 1000;

  /**
   * Record metric
   */
  recordMetric(
    name: string,
    duration: number,
    category: PerformanceMetric['category'],
    success: boolean = true
  ): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      category,
      success
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check thresholds
    this.checkThresholds(metric);
  }

  /**
   * Check thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    let threshold = 0;

    switch (metric.category) {
      case 'render':
        threshold = this.thresholds.renderTime;
        break;
      case 'network':
        threshold = this.thresholds.networkTime;
        break;
      case 'cache':
        threshold = this.thresholds.cacheTime;
        break;
      case 'sync':
        threshold = this.thresholds.syncTime;
        break;
    }

    if (metric.duration > threshold) {
      this.triggerAlert(metric);
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(metric: PerformanceMetric): void {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  /**
   * Register alert callback
   */
  onSlowOperation(callback: (metric: PerformanceMetric) => void): () => void {
    this.alertCallbacks.add(callback);

    return () => {
      this.alertCallbacks.delete(callback);
    };
  }

  /**
   * Get report
   */
  getReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        avgRenderTime: 0,
        avgNetworkTime: 0,
        avgCacheTime: 0,
        avgSyncTime: 0,
        totalMetrics: 0,
        slowestOperation: null,
        fastestOperation: null,
        errorRate: 0
      };
    }

    const renderMetrics = this.metrics.filter((m) => m.category === 'render');
    const networkMetrics = this.metrics.filter((m) => m.category === 'network');
    const cacheMetrics = this.metrics.filter((m) => m.category === 'cache');
    const syncMetrics = this.metrics.filter((m) => m.category === 'sync');

    const avgRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
        : 0;

    const avgNetworkTime =
      networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.duration, 0) / networkMetrics.length
        : 0;

    const avgCacheTime =
      cacheMetrics.length > 0
        ? cacheMetrics.reduce((sum, m) => sum + m.duration, 0) / cacheMetrics.length
        : 0;

    const avgSyncTime =
      syncMetrics.length > 0
        ? syncMetrics.reduce((sum, m) => sum + m.duration, 0) / syncMetrics.length
        : 0;

    const slowestOperation = this.metrics.reduce((max, m) =>
      m.duration > max.duration ? m : max
    );

    const fastestOperation = this.metrics.reduce((min, m) =>
      m.duration < min.duration ? m : min
    );

    const errorCount = this.metrics.filter((m) => !m.success).length;
    const errorRate = (errorCount / this.metrics.length) * 100;

    return {
      avgRenderTime,
      avgNetworkTime,
      avgCacheTime,
      avgSyncTime,
      totalMetrics: this.metrics.length,
      slowestOperation,
      fastestOperation,
      errorRate
    };
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter((m) => m.category === category);
  }

  /**
   * Set thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold?: number): PerformanceMetric[] {
    return this.metrics.filter((m) => {
      const categoryThreshold = this.thresholds[m.category as keyof PerformanceThresholds];
      return m.duration > (threshold || categoryThreshold);
    });
  }

  /**
   * Get failed operations
   */
  getFailedOperations(): PerformanceMetric[] {
    return this.metrics.filter((m) => !m.success);
  }
}

// Export singleton
export const performanceOptimizer = new PerformanceOptimizer();

// ============================================
// PERFORMANCE DECORATORS
// ============================================

export function measurePerformance(category: PerformanceMetric['category']) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        performanceOptimizer.recordMetric(propertyKey, duration, category, true);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        performanceOptimizer.recordMetric(propertyKey, duration, category, false);
        throw error;
      }
    };

    return descriptor;
  };
}
