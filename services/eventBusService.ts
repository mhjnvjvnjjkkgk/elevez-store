export interface AdminEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  id: string;
}

export enum AdminEventType {
  // Discount events
  DISCOUNT_CREATED = 'discount:created',
  DISCOUNT_UPDATED = 'discount:updated',
  DISCOUNT_DELETED = 'discount:deleted',
  DISCOUNT_USED = 'discount:used',
  
  // Points events
  POINTS_ADDED = 'points:added',
  POINTS_REMOVED = 'points:removed',
  POINTS_REDEEMED = 'points:redeemed',
  
  // User events
  USER_UPDATED = 'user:updated',
  USER_TIER_CHANGED = 'user:tier_changed',
  USER_CREATED = 'user:created',
  
  // System events
  SYNC_STARTED = 'sync:started',
  SYNC_COMPLETED = 'sync:completed',
  SYNC_ERROR = 'sync:error',
  
  // Filter events
  FILTER_APPLIED = 'filter:applied',
  FILTER_CLEARED = 'filter:cleared',
  
  // Notification events
  NOTIFICATION_CREATED = 'notification:created',
  NOTIFICATION_DISMISSED = 'notification:dismissed',
  
  // Bulk operation events
  BULK_OPERATION_STARTED = 'bulk:started',
  BULK_OPERATION_COMPLETED = 'bulk:completed',
  BULK_OPERATION_ERROR = 'bulk:error',
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: (event: AdminEvent) => void;
  filter?: (event: AdminEvent) => boolean;
}

export class EventBusService {
  private subscriptions: Map<string, Set<EventSubscription>> = new Map();
  private eventHistory: AdminEvent[] = [];
  private maxHistorySize = 100;
  private eventCounter = 0;

  subscribe(
    eventType: string,
    handler: (event: AdminEvent) => void,
    filter?: (event: AdminEvent) => boolean
  ): () => void {
    const subscriptionId = `sub_${++this.eventCounter}`;
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      filter,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(subscription);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, subscriptionId);
  }

  subscribeToMultiple(
    eventTypes: string[],
    handler: (event: AdminEvent) => void,
    filter?: (event: AdminEvent) => boolean
  ): () => void {
    const unsubscribers = eventTypes.map(eventType =>
      this.subscribe(eventType, handler, filter)
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }

  unsubscribe(eventType: string, subscriptionId: string): void {
    if (this.subscriptions.has(eventType)) {
      const subs = this.subscriptions.get(eventType)!;
      const toRemove = Array.from(subs).find(sub => sub.id === subscriptionId);
      if (toRemove) {
        subs.delete(toRemove);
      }
    }
  }

  publish(
    eventType: string,
    payload: any,
    source: string = 'system'
  ): void {
    const event: AdminEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
      id: `evt_${++this.eventCounter}`,
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    if (this.subscriptions.has(eventType)) {
      const subscribers = this.subscriptions.get(eventType)!;
      subscribers.forEach(subscription => {
        try {
          if (!subscription.filter || subscription.filter(event)) {
            subscription.handler(event);
          }
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Also publish to wildcard subscribers
    if (this.subscriptions.has('*')) {
      const wildcardSubscribers = this.subscriptions.get('*')!;
      wildcardSubscribers.forEach(subscription => {
        try {
          if (!subscription.filter || subscription.filter(event)) {
            subscription.handler(event);
          }
        } catch (error) {
          console.error(`Error in wildcard event handler:`, error);
        }
      });
    }
  }

  getHistory(eventType?: string, limit: number = 50): AdminEvent[] {
    let history = [...this.eventHistory];
    
    if (eventType) {
      history = history.filter(e => e.type === eventType);
    }
    
    return history.slice(-limit);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.subscriptions.get(eventType)?.size || 0;
    }
    
    let total = 0;
    this.subscriptions.forEach(subs => {
      total += subs.size;
    });
    return total;
  }

  getEventTypes(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  clear(): void {
    this.subscriptions.clear();
    this.eventHistory = [];
    this.eventCounter = 0;
  }

  // Utility methods for common operations
  onDiscountCreated(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.DISCOUNT_CREATED, handler);
  }

  onDiscountUpdated(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.DISCOUNT_UPDATED, handler);
  }

  onDiscountDeleted(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.DISCOUNT_DELETED, handler);
  }

  onPointsAdded(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.POINTS_ADDED, handler);
  }

  onPointsRemoved(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.POINTS_REMOVED, handler);
  }

  onUserUpdated(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.USER_UPDATED, handler);
  }

  onUserTierChanged(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.USER_TIER_CHANGED, handler);
  }

  onSyncCompleted(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe(AdminEventType.SYNC_COMPLETED, handler);
  }

  onError(handler: (event: AdminEvent) => void): () => void {
    return this.subscribe('error', handler);
  }

  publishDiscountCreated(payload: any, source?: string): void {
    this.publish(AdminEventType.DISCOUNT_CREATED, payload, source);
  }

  publishDiscountUpdated(payload: any, source?: string): void {
    this.publish(AdminEventType.DISCOUNT_UPDATED, payload, source);
  }

  publishDiscountDeleted(payload: any, source?: string): void {
    this.publish(AdminEventType.DISCOUNT_DELETED, payload, source);
  }

  publishPointsAdded(payload: any, source?: string): void {
    this.publish(AdminEventType.POINTS_ADDED, payload, source);
  }

  publishPointsRemoved(payload: any, source?: string): void {
    this.publish(AdminEventType.POINTS_REMOVED, payload, source);
  }

  publishUserUpdated(payload: any, source?: string): void {
    this.publish(AdminEventType.USER_UPDATED, payload, source);
  }

  publishUserTierChanged(payload: any, source?: string): void {
    this.publish(AdminEventType.USER_TIER_CHANGED, payload, source);
  }

  publishSyncStarted(payload: any, source?: string): void {
    this.publish(AdminEventType.SYNC_STARTED, payload, source);
  }

  publishSyncCompleted(payload: any, source?: string): void {
    this.publish(AdminEventType.SYNC_COMPLETED, payload, source);
  }

  publishSyncError(payload: any, source?: string): void {
    this.publish(AdminEventType.SYNC_ERROR, payload, source);
  }

  publishBulkOperationStarted(payload: any, source?: string): void {
    this.publish(AdminEventType.BULK_OPERATION_STARTED, payload, source);
  }

  publishBulkOperationCompleted(payload: any, source?: string): void {
    this.publish(AdminEventType.BULK_OPERATION_COMPLETED, payload, source);
  }

  publishBulkOperationError(payload: any, source?: string): void {
    this.publish(AdminEventType.BULK_OPERATION_ERROR, payload, source);
  }
}

// Singleton instance
let instance: EventBusService | null = null;

export function getEventBus(): EventBusService {
  if (!instance) {
    instance = new EventBusService();
  }
  return instance;
}

export function resetEventBus(): void {
  if (instance) {
    instance.clear();
    instance = null;
  }
}
