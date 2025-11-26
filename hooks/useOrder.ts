import { useState, useCallback, useEffect } from 'react';
import { Order, getOrder, getUserOrders, updateOrderStatus } from '../services/checkoutService';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export function useOrder(userId: string | undefined) {
  const [state, setState] = useState<OrderState>(initialState);

  // Load user orders on mount
  useEffect(() => {
    if (userId) {
      loadUserOrders();
    }
  }, [userId]);

  // Load user orders
  const loadUserOrders = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await getUserOrders(userId);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          orders: result.data || [],
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to load orders',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load orders',
        loading: false,
      }));
    }
  }, [userId]);

  // Get single order
  const getOrderDetails = useCallback(async (orderId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await getOrder(orderId);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          currentOrder: result.data!,
          loading: false,
        }));
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to get order',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to get order',
        loading: false,
      }));
    }
  }, []);

  // Update order status
  const updateStatus = useCallback(
    async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await updateOrderStatus(orderId, status, paymentStatus);
        if (result.success) {
          // Update local state
          setState(prev => ({
            ...prev,
            orders: prev.orders.map(order =>
              order.id === orderId
                ? {
                    ...order,
                    status,
                    paymentStatus: paymentStatus || order.paymentStatus,
                    updatedAt: new Date(),
                  }
                : order
            ),
            currentOrder:
              prev.currentOrder?.id === orderId
                ? {
                    ...prev.currentOrder,
                    status,
                    paymentStatus: paymentStatus || prev.currentOrder.paymentStatus,
                    updatedAt: new Date(),
                  }
                : prev.currentOrder,
            loading: false,
          }));
          return true;
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Failed to update order status',
            loading: false,
          }));
          return false;
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to update order status',
          loading: false,
        }));
        return false;
      }
    },
    []
  );

  // Get order by order number
  const getOrderByNumber = useCallback((orderNumber: string) => {
    return state.orders.find(order => order.orderNumber === orderNumber);
  }, [state.orders]);

  // Get recent orders
  const getRecentOrders = useCallback((limit: number = 5) => {
    return state.orders.slice(0, limit);
  }, [state.orders]);

  // Get order total
  const getOrderTotal = useCallback((orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    return order?.total || 0;
  }, [state.orders]);

  // Get order status
  const getOrderStatus = useCallback((orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    return order?.status || null;
  }, [state.orders]);

  // Get order items count
  const getOrderItemsCount = useCallback((orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    return order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [state.orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status: Order['status']) => {
    return state.orders.filter(order => order.status === status);
  }, [state.orders]);

  // Get pending orders
  const getPendingOrders = useCallback(() => {
    return state.orders.filter(order => order.status === 'pending' || order.status === 'processing');
  }, [state.orders]);

  // Get completed orders
  const getCompletedOrders = useCallback(() => {
    return state.orders.filter(order => order.status === 'delivered');
  }, [state.orders]);

  // Get cancelled orders
  const getCancelledOrders = useCallback(() => {
    return state.orders.filter(order => order.status === 'cancelled');
  }, [state.orders]);

  // Calculate total spent
  const calculateTotalSpent = useCallback(() => {
    return state.orders.reduce((sum, order) => sum + order.total, 0);
  }, [state.orders]);

  // Calculate average order value
  const calculateAverageOrderValue = useCallback(() => {
    if (state.orders.length === 0) return 0;
    return calculateTotalSpent() / state.orders.length;
  }, [state.orders]);

  // Get order timeline
  const getOrderTimeline = useCallback((orderId: string) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return [];

    const timeline = [
      {
        status: 'pending',
        label: 'Order Placed',
        date: order.createdAt,
        completed: true,
      },
      {
        status: 'confirmed',
        label: 'Order Confirmed',
        date: order.updatedAt,
        completed: order.status !== 'pending',
      },
      {
        status: 'processing',
        label: 'Processing',
        date: order.updatedAt,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: order.updatedAt,
        completed: ['shipped', 'delivered'].includes(order.status),
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: order.estimatedDelivery,
        completed: order.status === 'delivered',
      },
    ];

    return timeline;
  }, [state.orders]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Reset orders
  const resetOrders = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // State
    state,

    // Order management
    loadUserOrders,
    getOrderDetails,
    updateStatus,

    // Order queries
    getOrderByNumber,
    getRecentOrders,
    getOrderTotal,
    getOrderStatus,
    getOrderItemsCount,
    getOrdersByStatus,
    getPendingOrders,
    getCompletedOrders,
    getCancelledOrders,

    // Analytics
    calculateTotalSpent,
    calculateAverageOrderValue,
    getOrderTimeline,

    // Utilities
    clearError,
    resetOrders,
  };
}
