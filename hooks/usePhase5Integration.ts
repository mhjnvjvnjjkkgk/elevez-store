// Phase 5 Integration Hook - Combines all Phase 5 features
import { useEffect, useState, useRef } from 'react';
import { cacheManager, CacheStats } from '../services/advancedCacheService';
import { offlineSyncManager, OfflineStatus } from '../services/offlineSyncService';
import { performanceOptimizer, PerformanceReport } from '../services/performanceOptimizationService';
import { autoSyncManager } from '../services/autoSyncService';

export interface Phase5Status {
  cacheStats: CacheStats;
  offlineStatus: OfflineStatus;
  performanceReport: PerformanceReport;
  isOptimized: boolean;
}

export const usePhase5Integration = () => {
  const [status, setStatus] = useState<Phase5Status>({
    cacheStats: cacheManager.getStats(),
    offlineStatus: offlineSyncManager.getStatus(),
    performanceReport: performanceOptimizer.getReport(),
    isOptimized: true
  });

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize all Phase 5 services
    cacheManager.initialize({
      maxSize: 50 * 1024 * 1024,
      defaultTTL: 5 * 60 * 1000,
      enableCompression: true,
      enablePersistence: true
    });

    autoSyncManager.initialize({
      enableAutoSync: true,
      updateInterval: 5000
    });

    // Update status periodically
    updateIntervalRef.current = setInterval(() => {
      setStatus({
        cacheStats: cacheManager.getStats(),
        offlineStatus: offlineSyncManager.getStatus(),
        performanceReport: performanceOptimizer.getReport(),
        isOptimized: true
      });
    }, 1000);

    // Listen for offline status changes
    const unsubscribeOffline = offlineSyncManager.onStatusChange(() => {
      setStatus((prev) => ({
        ...prev,
        offlineStatus: offlineSyncManager.getStatus()
      }));
    });

    // Listen for slow operations
    const unsubscribePerf = performanceOptimizer.onSlowOperation((metric) => {
      console.warn('Slow operation detected:', metric);
    });

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      unsubscribeOffline();
      unsubscribePerf();
      cacheManager.destroy();
    };
  }, []);

  return {
    status,
    cacheManager,
    offlineSyncManager,
    performanceOptimizer,
    // Helper functions
    clearCache: () => cacheManager.clear(),
    syncOfflineQueue: () => offlineSyncManager.syncQueue(),
    retryFailedOperations: () => offlineSyncManager.retryFailed(),
    getPerformanceReport: () => performanceOptimizer.getReport(),
    getSlowOperations: () => performanceOptimizer.getSlowOperations()
  };
};

export const useCacheManager = () => {
  const [stats, setStats] = useState(cacheManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { stats, cacheManager };
};

export const useOfflineSync = () => {
  const [status, setStatus] = useState(offlineSyncManager.getStatus());

  useEffect(() => {
    const unsubscribe = offlineSyncManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return { status, offlineSyncManager };
};

export const usePerformanceMonitoring = () => {
  const [report, setReport] = useState(performanceOptimizer.getReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(performanceOptimizer.getReport());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { report, performanceOptimizer };
};
