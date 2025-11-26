// Auto Sync Hook - Automatic data synchronization
import { useEffect, useRef, useState } from 'react';
import { autoSyncManager, SyncMetrics } from '../services/autoSyncService';
import { SyncEvent } from '../services/realtimeSyncService';

// ============================================
// AUTO SYNC HOOK
// ============================================

export const useAutoSync = (
  onSyncEvent?: (event: SyncEvent) => void,
  updateInterval: number = 1000
) => {
  const [metrics, setMetrics] = useState<SyncMetrics>(autoSyncManager.getMetrics());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize auto sync
    autoSyncManager.initialize({
      enableAutoSync: true,
      updateInterval
    });

    // Register event callback
    if (onSyncEvent) {
      unsubscribeRef.current = autoSyncManager.onSyncEvent(onSyncEvent);
    }

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(autoSyncManager.getMetrics());
    }, updateInterval);

    // Cleanup
    return () => {
      clearInterval(metricsInterval);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [onSyncEvent, updateInterval]);

  return {
    metrics,
    config: autoSyncManager.getConfig(),
    updateConfig: (config: any) => autoSyncManager.updateConfig(config),
    stopAutoSync: () => autoSyncManager.stopAutoSync(),
    resetMetrics: () => autoSyncManager.resetMetrics(),
    getRetryAttempts: () => autoSyncManager.getRetryAttempts(),
    getActiveListeners: () => autoSyncManager.getActiveListeners()
  };
};

// ============================================
// SYNC METRICS HOOK
// ============================================

export const useSyncMetrics = (updateInterval: number = 1000) => {
  const [metrics, setMetrics] = useState<SyncMetrics>(autoSyncManager.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(autoSyncManager.getMetrics());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return metrics;
};

// ============================================
// SYNC EVENT LISTENER HOOK
// ============================================

export const useSyncEventListener = (
  callback: (event: SyncEvent) => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = autoSyncManager.onSyncEvent(callback);
    return unsubscribe;
  }, [callback, enabled]);
};

// ============================================
// COLLECTION SYNC HOOK
// ============================================

export interface CollectionSyncConfig {
  collections: string[];
  onSync?: (event: SyncEvent) => void;
  updateInterval?: number;
}

export const useCollectionAutoSync = (config: CollectionSyncConfig) => {
  const [metrics, setMetrics] = useState<SyncMetrics>(autoSyncManager.getMetrics());

  useEffect(() => {
    // Initialize with specific collections
    autoSyncManager.initialize({
      enableAutoSync: true,
      collections: config.collections,
      updateInterval: config.updateInterval || 5000
    });

    // Register callback
    let unsubscribe: (() => void) | null = null;
    if (config.onSync) {
      unsubscribe = autoSyncManager.onSyncEvent(config.onSync);
    }

    // Update metrics
    const interval = setInterval(() => {
      setMetrics(autoSyncManager.getMetrics());
    }, config.updateInterval || 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [config]);

  return {
    metrics,
    stopSync: () => autoSyncManager.stopAutoSync(),
    resetMetrics: () => autoSyncManager.resetMetrics()
  };
};

// ============================================
// SYNC STATUS HOOK
// ============================================

export const useSyncStatus = (updateInterval: number = 1000) => {
  const [status, setStatus] = useState({
    isActive: true,
    totalEvents: 0,
    errorCount: 0,
    lastEventTime: null as Date | null,
    activeListeners: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = autoSyncManager.getMetrics();
      const listeners = autoSyncManager.getActiveListeners();

      setStatus({
        isActive: listeners.length > 0,
        totalEvents: metrics.totalEvents,
        errorCount: metrics.errorCount,
        lastEventTime: metrics.lastEventTime,
        activeListeners: listeners.length
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return status;
};

// ============================================
// SYNC MANAGER HOOK
// ============================================

export const useSyncManager = () => {
  return {
    autoSyncManager,
    initialize: (config: any) => autoSyncManager.initialize(config),
    getMetrics: () => autoSyncManager.getMetrics(),
    resetMetrics: () => autoSyncManager.resetMetrics(),
    stopAutoSync: () => autoSyncManager.stopAutoSync(),
    getConfig: () => autoSyncManager.getConfig(),
    updateConfig: (config: any) => autoSyncManager.updateConfig(config),
    getRetryAttempts: () => autoSyncManager.getRetryAttempts(),
    getActiveListeners: () => autoSyncManager.getActiveListeners(),
    onSyncEvent: (callback: (event: SyncEvent) => void) =>
      autoSyncManager.onSyncEvent(callback)
  };
};
