// Real-time Sync Hook - Automatic Firebase synchronization
import { useEffect, useCallback, useRef, useState } from 'react';
import {
  syncManager,
  SyncEvent,
  SyncStatus,
  batchSync,
  stopBatchSync,
  BatchSyncConfig
} from '../services/realtimeSyncService';
import { QueryConstraint } from 'firebase/firestore';

// ============================================
// SINGLE COLLECTION SYNC HOOK
// ============================================

export const useCollectionSync = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  onData?: (event: SyncEvent) => void
) => {
  const listenerIdRef = useRef<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Subscribe to collection
    listenerIdRef.current = syncManager.subscribeToCollection(
      collectionName,
      constraints,
      (event) => {
        onData?.(event);
        setSyncStatus(syncManager.getStatus());
      }
    );

    // Cleanup
    return () => {
      if (listenerIdRef.current) {
        syncManager.unsubscribe(listenerIdRef.current);
      }
    };
  }, [collectionName, constraints, onData]);

  return {
    syncStatus,
    listenerId: listenerIdRef.current,
    unsubscribe: () => {
      if (listenerIdRef.current) {
        syncManager.unsubscribe(listenerIdRef.current);
        listenerIdRef.current = null;
      }
    }
  };
};

// ============================================
// DOCUMENT SYNC HOOK
// ============================================

export const useDocumentSync = (
  collectionName: string,
  documentId: string,
  onData?: (event: SyncEvent) => void
) => {
  const listenerIdRef = useRef<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Subscribe to document
    listenerIdRef.current = syncManager.subscribeToDocument(
      collectionName,
      documentId,
      (event) => {
        onData?.(event);
        setSyncStatus(syncManager.getStatus());
      }
    );

    // Cleanup
    return () => {
      if (listenerIdRef.current) {
        syncManager.unsubscribe(listenerIdRef.current);
      }
    };
  }, [collectionName, documentId, onData]);

  return {
    syncStatus,
    listenerId: listenerIdRef.current,
    unsubscribe: () => {
      if (listenerIdRef.current) {
        syncManager.unsubscribe(listenerIdRef.current);
        listenerIdRef.current = null;
      }
    }
  };
};

// ============================================
// BATCH SYNC HOOK
// ============================================

export const useBatchSync = (config: BatchSyncConfig) => {
  const listenerIdsRef = useRef<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Start batch sync
    listenerIdsRef.current = batchSync(config);

    // Update status periodically
    const statusInterval = setInterval(() => {
      setSyncStatus(syncManager.getStatus());
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(statusInterval);
      stopBatchSync(listenerIdsRef.current);
      listenerIdsRef.current = [];
    };
  }, [config]);

  return {
    syncStatus,
    listenerIds: listenerIdsRef.current,
    stopSync: () => {
      stopBatchSync(listenerIdsRef.current);
      listenerIdsRef.current = [];
    }
  };
};

// ============================================
// COLLECTION CHANGE LISTENER HOOK
// ============================================

export const useOnCollectionChange = (
  collectionName: string,
  callback: (event: SyncEvent) => void
) => {
  useEffect(() => {
    const unsubscribe = syncManager.onCollectionChange(collectionName, callback);
    return unsubscribe;
  }, [collectionName, callback]);
};

// ============================================
// SYNC STATUS HOOK
// ============================================

export const useSyncStatus = (updateInterval: number = 1000) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getStatus());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return syncStatus;
};

// ============================================
// MULTI-COLLECTION SYNC HOOK
// ============================================

export interface MultiCollectionSyncConfig {
  collections: {
    name: string;
    constraints?: QueryConstraint[];
    onData?: (event: SyncEvent) => void;
  }[];
}

export const useMultiCollectionSync = (config: MultiCollectionSyncConfig) => {
  const listenerIdsRef = useRef<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Subscribe to each collection
    config.collections.forEach((collectionConfig) => {
      const listenerId = syncManager.subscribeToCollection(
        collectionConfig.name,
        collectionConfig.constraints || [],
        (event) => {
          collectionConfig.onData?.(event);
          setSyncStatus(syncManager.getStatus());
        }
      );
      listenerIdsRef.current.push(listenerId);
    });

    // Cleanup
    return () => {
      listenerIdsRef.current.forEach((id) => syncManager.unsubscribe(id));
      listenerIdsRef.current = [];
    };
  }, [config]);

  return {
    syncStatus,
    listenerIds: listenerIdsRef.current,
    unsubscribeAll: () => {
      listenerIdsRef.current.forEach((id) => syncManager.unsubscribe(id));
      listenerIdsRef.current = [];
    }
  };
};

// ============================================
// AUTO-SYNC HOOK (All Collections)
// ============================================

export const useAutoSync = (
  collections: string[] = ['users', 'orders', 'products', 'discounts', 'analytics'],
  onSync?: (event: SyncEvent) => void
) => {
  const listenerIdsRef = useRef<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    // Subscribe to all collections
    collections.forEach((collectionName) => {
      const listenerId = syncManager.subscribeToCollection(
        collectionName,
        [],
        (event) => {
          onSync?.(event);
          setSyncStatus(syncManager.getStatus());
        }
      );
      listenerIdsRef.current.push(listenerId);
    });

    // Update status periodically
    const statusInterval = setInterval(() => {
      setSyncStatus(syncManager.getStatus());
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(statusInterval);
      listenerIdsRef.current.forEach((id) => syncManager.unsubscribe(id));
      listenerIdsRef.current = [];
    };
  }, [collections, onSync]);

  return {
    syncStatus,
    listenerIds: listenerIdsRef.current,
    stopAutoSync: () => {
      listenerIdsRef.current.forEach((id) => syncManager.unsubscribe(id));
      listenerIdsRef.current = [];
    }
  };
};

// ============================================
// SYNC MANAGER HOOK
// ============================================

export const useSyncManager = () => {
  return {
    syncManager,
    getStatus: () => syncManager.getStatus(),
    getActiveListenersCount: () => syncManager.getActiveListenersCount(),
    getAllListeners: () => syncManager.getAllListeners(),
    unsubscribeAll: () => syncManager.unsubscribeAll(),
    resetStatus: () => syncManager.resetStatus()
  };
};
