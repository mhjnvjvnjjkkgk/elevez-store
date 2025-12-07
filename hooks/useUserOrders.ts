// Hook for managing user orders with real-time Firebase sync
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { firebaseSyncService, UserOrder } from '../services/firebaseSyncService';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export function useUserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log('👤 No user logged in, clearing orders');
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('👤 User logged in:', user.uid, '- Loading orders...');
    setLoading(true);

    // First, load orders from Firebase immediately
    const loadInitialOrders = async () => {
      try {
        console.log('📦 Fetching orders from Firebase for user:', user.uid);
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const userOrders: UserOrder[] = [];
        
        console.log('📊 Firebase query returned', snapshot.size, 'documents');
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 Order document:', doc.id, data);
          
          userOrders.push({
            id: doc.id,
            ...data
          } as UserOrder);
        });

        setOrders(userOrders);
        setLoading(false);
        setError(null);
        
        console.log(`✅ Loaded ${userOrders.length} orders for user ${user.uid}`);
        if (userOrders.length > 0) {
          console.log('📋 Orders:', userOrders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            total: o.total,
            status: o.status
          })));
        } else {
          console.log('⚠️ No orders found for this user');
        }
      } catch (err: any) {
        console.error('❌ Error loading initial orders:', err);
        console.error('Error details:', err.message, err.code);
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    loadInitialOrders();

    // Then set up real-time listener for updates
    console.log('🔄 Setting up real-time listener for orders...');
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userOrders: UserOrder[] = [];
        
        console.log('🔄 Real-time update received:', snapshot.size, 'documents');
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          userOrders.push({
            id: doc.id,
            ...data
          } as UserOrder);
        });

        setOrders(userOrders);
        setError(null);
        
        console.log(`✅ Real-time update: ${userOrders.length} orders for user ${user.uid}`);
        if (userOrders.length > 0) {
          console.log('📋 Updated orders:', userOrders.map(o => o.orderNumber));
        }
      },
      (err: any) => {
        console.error('❌ Error in real-time orders listener:', err);
        console.error('Error details:', err.message, err.code);
        setError('Failed to sync orders');
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🔌 Cleaning up orders listener');
      unsubscribe();
    };
  }, [user]);

  // Get order by ID
  const getOrderById = (orderId: string): UserOrder | undefined => {
    return orders.find(order => order.id === orderId);
  };

  // Get orders by status
  const getOrdersByStatus = (status: string): UserOrder[] => {
    return orders.filter(order => order.status === status);
  };

  // Get recent orders
  const getRecentOrders = (limit: number = 5): UserOrder[] => {
    return orders.slice(0, limit);
  };

  return {
    orders,
    loading,
    error,
    getOrderById,
    getOrdersByStatus,
    getRecentOrders,
    hasOrders: orders.length > 0,
    orderCount: orders.length
  };
}
