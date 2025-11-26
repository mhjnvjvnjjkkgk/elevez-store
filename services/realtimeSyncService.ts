// Real-time Sync Service - Automatic Firebase synchronization
import {
  collection,
  query,
  onSnapshot,
  Unsubscribe,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SyncListener {
  id: string;
  unsubscribe: Unsubscribe;
  collectionName: string;
  active: boolean;
  lastUpdate: Date;
}

export interface SyncEvent {
  type: 'added' | 'modified' | 'removed';
  data: DocumentData;
  timestamp: Date;
  collectionName: string;
}

export interface SyncStatus {
  isConnected: boolean;
  activeListeners: number;
  lastSync: Date;
  syncErrors: number;
  totalSynced: number;
}

// ============================================
// SYNC MANAGER
// ============================================

class RealtimeSyncManager {
  private listeners: Map<string, SyncListener> = new Map();
  private syncCallbacks: Map<string, Set<(event: SyncEvent) => void>> = new Map();
  private syncStatus: SyncStatus = {
    isConnected: true,
    activeListeners: 0,
    lastSync: new Date(),
    syncErrors: 0,
    totalSynced: 0
  };

  /**
   * Subscribe to collection changes
   */
  subscribeToCollection(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    onData: (event: SyncEvent) => void
  ): string {
    const listenerId = `${collectionName}-${Date.now()}`;

    try {
      const q = query(collection(db, collectionName), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
          snapshot.docChanges().forEach((change) => {
            const event: SyncEvent = {
              type: change.type as 'added' | 'modified' | 'removed',
              data: change.doc.data(),
              timestamp: new Date(),
              collectionName
            };

            onData(event);
            this.broadcastEvent(collectionName, event);
            this.syncStatus.totalSynced++;
            this.syncStatus.lastSync = new Date();
          });
        },
        (error) => {
          console.error(`Error syncing ${collectionName}:`, error);
          this.syncStatus.syncErrors++;
        }
      );

      const listener: SyncListener = {
        id: listenerId,
        unsubscribe,
        collectionName,
        active: true,
        lastUpdate: new Date()
      };

      this.listeners.set(listenerId, listener);
      this.syncStatus.activeListeners = this.listeners.size;

      return listenerId;
    } catch (error) {
      console.error(`Failed to subscribe to ${collectionName}:`, error);
      this.syncStatus.syncErrors++;
      throw error;
    }
  }

  /**
   * Subscribe to specific document
   */
  subscribeToDocument(
    collectionName: string,
    documentId: string,
    onData: (event: SyncEvent) => void
  ): string {
    const listenerId = `${collectionName}-${documentId}-${Date.now()}`;

    try {
      const docRef = collection(db, collectionName);
      const q = query(docRef, where('__name__', '==', documentId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const event: SyncEvent = {
              type: change.type as 'added' | 'modified' | 'removed',
              data: { id: documentId, ...change.doc.data() },
              timestamp: new Date(),
              collectionName
            };

            onData(event);
            this.broadcastEvent(collectionName, event);
            this.syncStatus.totalSynced++;
            this.syncStatus.lastSync = new Date();
          });
        },
        (error) => {
          console.error(`Error syncing document ${documentId}:`, error);
          this.syncStatus.syncErrors++;
        }
      );

      const listener: SyncListener = {
        id: listenerId,
        unsubscribe,
        collectionName,
        active: true,
        lastUpdate: new Date()
      };

      this.listeners.set(listenerId, listener);
      this.syncStatus.activeListeners = this.listeners.size;

      return listenerId;
    } catch (error) {
      console.error(`Failed to subscribe to document:`, error);
      this.syncStatus.syncErrors++;
      throw error;
    }
  }

  /**
   * Register callback for collection events
   */
  onCollectionChange(
    collectionName: string,
    callback: (event: SyncEvent) => void
  ): () => void {
    if (!this.syncCallbacks.has(collectionName)) {
      this.syncCallbacks.set(collectionName, new Set());
    }

    this.syncCallbacks.get(collectionName)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.syncCallbacks.get(collectionName)?.delete(callback);
    };
  }

  /**
   * Broadcast event to all listeners
   */
  private broadcastEvent(collectionName: string, event: SyncEvent): void {
    const callbacks = this.syncCallbacks.get(collectionName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in sync callback:', error);
        }
      });
    }
  }

  /**
   * Unsubscribe from listener
   */
  unsubscribe(listenerId: string): void {
    const listener = this.listeners.get(listenerId);
    if (listener) {
      listener.unsubscribe();
      listener.active = false;
      this.listeners.delete(listenerId);
      this.syncStatus.activeListeners = this.listeners.size;
    }
  }

  /**
   * Unsubscribe all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach((listener) => {
      listener.unsubscribe();
      listener.active = false;
    });
    this.listeners.clear();
    this.syncCallbacks.clear();
    this.syncStatus.activeListeners = 0;
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Reset sync status
   */
  resetStatus(): void {
    this.syncStatus = {
      isConnected: true,
      activeListeners: this.listeners.size,
      lastSync: new Date(),
      syncErrors: 0,
      totalSynced: 0
    };
  }

  /**
   * Get active listeners count
   */
  getActiveListenersCount(): number {
    return this.listeners.size;
  }

  /**
   * Get listener info
   */
  getListenerInfo(listenerId: string): SyncListener | undefined {
    return this.listeners.get(listenerId);
  }

  /**
   * Get all listeners
   */
  getAllListeners(): SyncListener[] {
    return Array.from(this.listeners.values());
  }
}

// Export singleton instance
export const syncManager = new RealtimeSyncManager();

// ============================================
// COLLECTION SYNC HELPERS
// ============================================

/**
 * Sync users collection
 */
export const syncUsers = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('users', constraints, onData);
};

/**
 * Sync orders collection
 */
export const syncOrders = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('orders', constraints, onData);
};

/**
 * Sync products collection
 */
export const syncProducts = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('products', constraints, onData);
};

/**
 * Sync discounts collection
 */
export const syncDiscounts = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('discounts', constraints, onData);
};

/**
 * Sync analytics collection
 */
export const syncAnalytics = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('analytics', constraints, onData);
};

/**
 * Sync loyalty points collection
 */
export const syncLoyaltyPoints = (
  onData: (event: SyncEvent) => void,
  constraints: QueryConstraint[] = []
): string => {
  return syncManager.subscribeToCollection('loyaltyPoints', constraints, onData);
};

// ============================================
// BATCH SYNC
// ============================================

export interface BatchSyncConfig {
  collections: string[];
  constraints?: Map<string, QueryConstraint[]>;
  onSync?: (event: SyncEvent) => void;
}

/**
 * Sync multiple collections
 */
export const batchSync = (config: BatchSyncConfig): string[] => {
  const listenerIds: string[] = [];

  config.collections.forEach((collectionName) => {
    const constraints = config.constraints?.get(collectionName) || [];
    const listenerId = syncManager.subscribeToCollection(
      collectionName,
      constraints,
      (event) => {
        config.onSync?.(event);
      }
    );
    listenerIds.push(listenerId);
  });

  return listenerIds;
};

/**
 * Stop batch sync
 */
export const stopBatchSync = (listenerIds: string[]): void => {
  listenerIds.forEach((id) => syncManager.unsubscribe(id));
};

// ============================================
// EXPORTS
// ============================================

export { SyncListener, SyncEvent, SyncStatus };
