// Auto Sync Service - Automatic data synchronization across all collections
import { syncManager, SyncEvent } from './realtimeSyncService';
import { QueryConstraint, orderBy, limit } from 'firebase/firestore';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AutoSyncConfig {
  enableAutoSync: boolean;
  collections: string[];
  updateInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface SyncMetrics {
  totalEvents: number;
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  errorCount: number;
  lastEventTime: Date | null;
}

// ============================================
// AUTO SYNC MANAGER
// ============================================

class AutoSyncManager {
  private config: AutoSyncConfig = {
    enableAutoSync: true,
    collections: ['users', 'orders', 'products', 'discounts', 'analytics', 'loyaltyPoints'],
    updateInterval: 5000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private metrics: SyncMetrics = {
    totalEvents: 0,
    addedCount: 0,
    modifiedCount: 0,
    removedCount: 0,
    errorCount: 0,
    lastEventTime: null
  };

  private listenerIds: string[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private eventCallbacks: Set<(event: SyncEvent) => void> = new Set();

  /**
   * Initialize auto sync
   */
  initialize(config: Partial<AutoSyncConfig> = {}): void {
    this.config = { ...this.config, ...config };

    if (this.config.enableAutoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Start auto sync
   */
  private startAutoSync(): void {
    this.config.collections.forEach((collectionName) => {
      this.syncCollection(collectionName);
    });
  }

  /**
   * Sync a single collection
   */
  private syncCollection(collectionName: string, retryCount: number = 0): void {
    try {
      const constraints: QueryConstraint[] = [
        orderBy('updatedAt', 'desc'),
        limit(100)
      ];

      const listenerId = syncManager.subscribeToCollection(
        collectionName,
        constraints,
        (event) => {
          this.handleSyncEvent(event);
        }
      );

      this.listenerIds.push(listenerId);
      this.retryAttempts.delete(collectionName);
    } catch (error) {
      console.error(`Error syncing ${collectionName}:`, error);

      if (retryCount < this.config.maxRetries) {
        setTimeout(() => {
          this.syncCollection(collectionName, retryCount + 1);
        }, this.config.retryDelay * (retryCount + 1));

        this.retryAttempts.set(collectionName, retryCount + 1);
      } else {
        this.metrics.errorCount++;
      }
    }
  }

  /**
   * Handle sync event
   */
  private handleSyncEvent(event: SyncEvent): void {
    // Update metrics
    this.metrics.totalEvents++;
    this.metrics.lastEventTime = new Date();

    switch (event.type) {
      case 'added':
        this.metrics.addedCount++;
        break;
      case 'modified':
        this.metrics.modifiedCount++;
        break;
      case 'removed':
        this.metrics.removedCount++;
        break;
    }

    // Broadcast to callbacks
    this.eventCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Register event callback
   */
  onSyncEvent(callback: (event: SyncEvent) => void): () => void {
    this.eventCallbacks.add(callback);

    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  /**
   * Get metrics
   */
  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalEvents: 0,
      addedCount: 0,
      modifiedCount: 0,
      removedCount: 0,
      errorCount: 0,
      lastEventTime: null
    };
  }

  /**
   * Stop auto sync
   */
  stopAutoSync(): void {
    this.listenerIds.forEach((id) => {
      syncManager.unsubscribe(id);
    });
    this.listenerIds = [];
    this.eventCallbacks.clear();
  }

  /**
   * Get config
   */
  getConfig(): AutoSyncConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<AutoSyncConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.enableAutoSync !== undefined) {
      if (config.enableAutoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }

  /**
   * Get retry attempts
   */
  getRetryAttempts(): Map<string, number> {
    return new Map(this.retryAttempts);
  }

  /**
   * Get active listeners
   */
  getActiveListeners(): string[] {
    return [...this.listenerIds];
  }
}

// Export singleton instance
export const autoSyncManager = new AutoSyncManager();

// ============================================
// COLLECTION-SPECIFIC AUTO SYNC
// ============================================

/**
 * Auto sync users
 */
export const autoSyncUsers = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'users',
    [orderBy('updatedAt', 'desc'), limit(100)],
    callback || (() => {})
  );
};

/**
 * Auto sync orders
 */
export const autoSyncOrders = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'orders',
    [orderBy('createdAt', 'desc'), limit(100)],
    callback || (() => {})
  );
};

/**
 * Auto sync products
 */
export const autoSyncProducts = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'products',
    [orderBy('updatedAt', 'desc'), limit(100)],
    callback || (() => {})
  );
};

/**
 * Auto sync discounts
 */
export const autoSyncDiscounts = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'discounts',
    [orderBy('createdAt', 'desc'), limit(100)],
    callback || (() => {})
  );
};

/**
 * Auto sync analytics
 */
export const autoSyncAnalytics = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'analytics',
    [orderBy('timestamp', 'desc'), limit(100)],
    callback || (() => {})
  );
};

/**
 * Auto sync loyalty points
 */
export const autoSyncLoyaltyPoints = (callback?: (event: SyncEvent) => void): string => {
  return syncManager.subscribeToCollection(
    'loyaltyPoints',
    [orderBy('updatedAt', 'desc'), limit(100)],
    callback || (() => {})
  );
};

// SyncMetrics interface is exported at the top of the file
