import { useContext, useEffect, useState, useCallback } from 'react';
import { AdminContext } from '../components/AdminContext';
import { AdminContextType, AdminState } from '../services/adminContextService';

export function useAdminContext(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminContextProvider');
  }
  return context;
}

export function useAdminState(): AdminState {
  const { state } = useAdminContext();
  return state;
}

export function useDiscounts() {
  const { discounts, createDiscount, updateDiscount, deleteDiscount } = useAdminContext();
  return { discounts, createDiscount, updateDiscount, deleteDiscount };
}

export function usePoints() {
  const { points, addPoints, removePoints, getPointsHistory } = useAdminContext();
  return { points, addPoints, removePoints, getPointsHistory };
}

export function useUsers() {
  const { users, updateUser } = useAdminContext();
  return { users, updateUser };
}

export function useAdminSync() {
  const { state, sync } = useAdminContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      await sync();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [sync]);

  return {
    isSyncing: isSyncing || state.isSyncing,
    lastSync: state.lastSync,
    error: syncError || state.error,
    sync: handleSync,
  };
}

export function useAdminEvents() {
  const { on, off, emit } = useAdminContext();
  
  const subscribe = useCallback((event: string, handler: Function) => {
    on(event, handler);
    return () => off(event, handler);
  }, [on, off]);

  return { subscribe, emit };
}

export function useAdminLoading() {
  const { state } = useAdminContext();
  return state.loading;
}

export function useAdminError() {
  const { state } = useAdminContext();
  return state.error;
}
