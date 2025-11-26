// Offline Sync Service - Queue and sync operations when offline
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface OfflineStatus {
  isOnline: boolean;
  queuedOperations: number;
  failedOperations: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
}

// ============================================
// OFFLINE SYNC MANAGER
// ============================================

class OfflineSyncManager {
  private queue: Map<string, QueuedOperation> = new Map();
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private statusCallbacks: Set<(status: OfflineStatus) => void> = new Set();
  private lastSyncTime: Date | null = null;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Load queue from storage
    this.loadQueue();
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.broadcastStatus();

    // Attempt to sync
    if (this.queue.size > 0) {
      this.syncQueue();
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    this.broadcastStatus();
  }

  /**
   * Queue operation
   */
  queueOperation(
    type: 'create' | 'update' | 'delete',
    collection: string,
    data: any
  ): string {
    const id = `${Date.now()}_${Math.random()}`;
    const operation: QueuedOperation = {
      id,
      type,
      collection,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
      status: 'pending'
    };

    this.queue.set(id, operation);
    this.persistQueue();
    this.broadcastStatus();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    }

    return id;
  }

  /**
   * Sync queue
   */
  async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.broadcastStatus();

    const operations = Array.from(this.queue.values()).filter(
      (op) => op.status === 'pending'
    );

    for (const operation of operations) {
      try {
        operation.status = 'syncing';
        await this.executeOperation(operation);
        operation.status = 'completed';
        this.queue.delete(operation.id);
      } catch (error) {
        console.error('Error syncing operation:', error);
        operation.retries++;

        if (operation.retries >= operation.maxRetries) {
          operation.status = 'failed';
        } else {
          operation.status = 'pending';
        }
      }
    }

    this.syncInProgress = false;
    this.lastSyncTime = new Date();
    this.persistQueue();
    this.broadcastStatus();
  }

  /**
   * Execute operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    const collectionRef = collection(db, operation.collection);

    switch (operation.type) {
      case 'create':
        await addDoc(collectionRef, operation.data);
        break;

      case 'update':
        if (operation.data.id) {
          const docRef = doc(db, operation.collection, operation.data.id);
          await updateDoc(docRef, operation.data);
        }
        break;

      case 'delete':
        if (operation.data.id) {
          const docRef = doc(db, operation.collection, operation.data.id);
          await deleteDoc(docRef);
        }
        break;
    }
  }

  /**
   * Get status
   */
  getStatus(): OfflineStatus {
    const failedOps = Array.from(this.queue.values()).filter(
      (op) => op.status === 'failed'
    ).length;

    return {
      isOnline: this.isOnline,
      queuedOperations: this.queue.size,
      failedOperations: failedOps,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Register status callback
   */
  onStatusChange(callback: (status: OfflineStatus) => void): () => void {
    this.statusCallbacks.add(callback);

    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Broadcast status
   */
  private broadcastStatus(): void {
    const status = this.getStatus();
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  /**
   * Persist queue
   */
  private persistQueue(): void {
    try {
      const queueData = Array.from(this.queue.values());
      localStorage.setItem('offline_queue', JSON.stringify(queueData));
    } catch (error) {
      console.error('Error persisting queue:', error);
    }
  }

  /**
   * Load queue
   */
  private loadQueue(): void {
    try {
      const data = localStorage.getItem('offline_queue');
      if (data) {
        const operations = JSON.parse(data) as QueuedOperation[];
        operations.forEach((op) => {
          this.queue.set(op.id, op);
        });
      }
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue.clear();
    localStorage.removeItem('offline_queue');
    this.broadcastStatus();
  }

  /**
   * Get queue
   */
  getQueue(): QueuedOperation[] {
    return Array.from(this.queue.values());
  }

  /**
   * Retry failed operations
   */
  async retryFailed(): Promise<void> {
    const failedOps = Array.from(this.queue.values()).filter(
      (op) => op.status === 'failed'
    );

    failedOps.forEach((op) => {
      op.status = 'pending';
      op.retries = 0;
    });

    this.persistQueue();
    await this.syncQueue();
  }
}

// Export singleton
export const offlineSyncManager = new OfflineSyncManager();
