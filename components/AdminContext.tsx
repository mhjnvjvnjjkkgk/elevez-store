import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getAdminContextService, AdminContextType, AdminState, DEFAULT_ADMIN_STATE, PointsTransaction } from '../services/adminContextService';
import { getEventBus } from '../services/eventBusService';
import { DiscountCode, UserProfile } from '../types';

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminContextProviderProps {
  children: React.ReactNode;
  adminId: string;
}

export const AdminContextProvider: React.FC<AdminContextProviderProps> = ({ children, adminId }) => {
  const [state, setState] = useState<AdminState>(DEFAULT_ADMIN_STATE);
  const contextService = getAdminContextService();
  const eventBus = getEventBus();

  // Initialize state from service
  useEffect(() => {
    setState(contextService.getState());

    // Subscribe to state changes
    const unsubscribers = [
      eventBus.subscribe('*', () => {
        setState(contextService.getState());
      }),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [contextService, eventBus]);

  const createDiscount = useCallback(async (code: DiscountCode) => {
    try {
      await contextService.createDiscount(code);
      eventBus.publishDiscountCreated(code, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to create discount', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const updateDiscount = useCallback(async (id: string, updates: Partial<DiscountCode>) => {
    try {
      await contextService.updateDiscount(id, updates);
      eventBus.publishDiscountUpdated({ id, ...updates }, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to update discount', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const deleteDiscount = useCallback(async (id: string) => {
    try {
      await contextService.deleteDiscount(id);
      eventBus.publishDiscountDeleted({ id }, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to delete discount', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const addPoints = useCallback(async (userId: string, amount: number, reason: string, adminIdParam?: string) => {
    try {
      await contextService.addPoints(userId, amount, reason, adminIdParam || adminId);
      eventBus.publishPointsAdded({ userId, amount, reason }, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to add points', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const removePoints = useCallback(async (userId: string, amount: number, reason: string, adminIdParam?: string) => {
    try {
      await contextService.removePoints(userId, amount, reason, adminIdParam || adminId);
      eventBus.publishPointsRemoved({ userId, amount, reason }, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to remove points', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const getPointsHistory = useCallback((userId: string): PointsTransaction[] => {
    return contextService.getPointsHistory(userId);
  }, [contextService]);

  const updateUser = useCallback(async (id: string, updates: Partial<UserProfile>) => {
    try {
      await contextService.updateUser(id, updates);
      eventBus.publishUserUpdated({ id, ...updates }, adminId);
    } catch (error) {
      eventBus.publish('error', { message: 'Failed to update user', error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const sync = useCallback(async () => {
    try {
      eventBus.publishSyncStarted({}, adminId);
      await contextService.sync();
      eventBus.publishSyncCompleted({ timestamp: new Date() }, adminId);
    } catch (error) {
      eventBus.publishSyncError({ error }, adminId);
      throw error;
    }
  }, [contextService, eventBus, adminId]);

  const on = useCallback((event: string, handler: Function) => {
    eventBus.subscribe(event, (evt) => handler(evt));
  }, [eventBus]);

  const off = useCallback((event: string, handler: Function) => {
    // Note: This is a simplified version. For full implementation,
    // you'd need to track subscription IDs
  }, []);

  const emit = useCallback((event: string, data: any) => {
    eventBus.publish(event, data, adminId);
  }, [eventBus, adminId]);

  const contextValue: AdminContextType = {
    state,
    discounts: state.discounts,
    points: state.points,
    users: state.users,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    addPoints,
    removePoints,
    getPointsHistory,
    updateUser,
    sync,
    on,
    off,
    emit,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
