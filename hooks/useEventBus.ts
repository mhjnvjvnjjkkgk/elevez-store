import { useEffect, useCallback, useRef } from 'react';
import { getEventBus, AdminEvent, AdminEventType } from '../services/eventBusService';

export function useEventBus() {
  const eventBus = getEventBus();
  const unsubscribersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    return () => {
      // Cleanup all subscriptions on unmount
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, []);

  const subscribe = useCallback((
    eventType: string,
    handler: (event: AdminEvent) => void,
    filter?: (event: AdminEvent) => boolean
  ) => {
    const unsubscribe = eventBus.subscribe(eventType, handler, filter);
    unsubscribersRef.current.push(unsubscribe);
    return unsubscribe;
  }, [eventBus]);

  const subscribeToMultiple = useCallback((
    eventTypes: string[],
    handler: (event: AdminEvent) => void,
    filter?: (event: AdminEvent) => boolean
  ) => {
    const unsubscribe = eventBus.subscribeToMultiple(eventTypes, handler, filter);
    unsubscribersRef.current.push(unsubscribe);
    return unsubscribe;
  }, [eventBus]);

  const publish = useCallback((
    eventType: string,
    payload: any,
    source?: string
  ) => {
    eventBus.publish(eventType, payload, source);
  }, [eventBus]);

  const getHistory = useCallback((eventType?: string, limit?: number) => {
    return eventBus.getHistory(eventType, limit);
  }, [eventBus]);

  return {
    subscribe,
    subscribeToMultiple,
    publish,
    getHistory,
    eventBus,
  };
}

export function useOnDiscountCreated(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.DISCOUNT_CREATED, handler);
  }, [subscribe, handler]);
}

export function useOnDiscountUpdated(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.DISCOUNT_UPDATED, handler);
  }, [subscribe, handler]);
}

export function useOnDiscountDeleted(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.DISCOUNT_DELETED, handler);
  }, [subscribe, handler]);
}

export function useOnPointsAdded(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.POINTS_ADDED, handler);
  }, [subscribe, handler]);
}

export function useOnPointsRemoved(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.POINTS_REMOVED, handler);
  }, [subscribe, handler]);
}

export function useOnUserUpdated(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.USER_UPDATED, handler);
  }, [subscribe, handler]);
}

export function useOnUserTierChanged(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.USER_TIER_CHANGED, handler);
  }, [subscribe, handler]);
}

export function useOnSyncCompleted(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.SYNC_COMPLETED, handler);
  }, [subscribe, handler]);
}

export function useOnBulkOperationCompleted(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe(AdminEventType.BULK_OPERATION_COMPLETED, handler);
  }, [subscribe, handler]);
}

export function useOnError(handler: (event: AdminEvent) => void) {
  const { subscribe } = useEventBus();
  
  useEffect(() => {
    return subscribe('error', handler);
  }, [subscribe, handler]);
}
