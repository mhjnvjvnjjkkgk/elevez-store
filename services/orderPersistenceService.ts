// Order Persistence Service - Ensures orders persist across sessions and server restarts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CartItem } from '../types';
import { userProfileSyncService } from './userProfileSyncService';

export interface PersistedOrder {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod?: any;
  notes?: string;
  createdAt: any; // Firestore Timestamp or string
  updatedAt: any; // Firestore Timestamp or string
  estimatedDelivery?: any; // Firestore Timestamp or string
}

export interface OrderItem {
  productId: number;
  productName: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  image: string;
}

class OrderPersistenceService {
  private ordersCollection = 'orders';

  /**
   * Save order to Firebase with full persistence
   */
  async saveOrder(
    userId: string,
    orderData: Omit<PersistedOrder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }

      const ordersRef = collection(db, this.ordersCollection);
      const orderRef = doc(ordersRef);

      const fullOrderData: any = {
        ...orderData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(orderRef, fullOrderData);

      console.log(`✅ Order saved to Firebase: ${orderData.orderNumber} (ID: ${orderRef.id})`);
      
      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('❌ Error saving order to Firebase:', error);
      return { success: false, error: 'Failed to save order' };
    }
  }

  /**
   * Get all orders for a user (persisted across sessions)
   */
  async getUserOrders(userId: string): Promise<PersistedOrder[]> {
    try {
      if (!userId) {
        console.warn('No user ID provided for getUserOrders');
        return [];
      }

      const ordersRef = collection(db, this.ordersCollection);
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const orders: PersistedOrder[] = [];

      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as PersistedOrder);
      });

      console.log(`📦 Loaded ${orders.length} persisted orders for user ${userId}`);
      
      return orders;
    } catch (error) {
      console.error('❌ Error loading user orders:', error);
      return [];
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<PersistedOrder | null> {
    try {
      const orderRef = doc(db, this.ordersCollection, orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        return {
          id: orderSnap.id,
          ...orderSnap.data()
        } as PersistedOrder;
      }

      return null;
    } catch (error) {
      console.error('❌ Error loading order:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: PersistedOrder['status'],
    paymentStatus?: PersistedOrder['paymentStatus']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const orderRef = doc(db, this.ordersCollection, orderId);
      
      const updates: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (paymentStatus) {
        updates.paymentStatus = paymentStatus;
      }

      await updateDoc(orderRef, updates);

      console.log(`✅ Order status updated: ${orderId} -> ${status}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return { success: false, error: 'Failed to update order status' };
    }
  }

  /**
   * Real-time listener for user orders (persists across sessions)
   */
  subscribeToUserOrders(
    userId: string,
    callback: (orders: PersistedOrder[]) => void
  ): () => void {
    try {
      if (!userId) {
        console.warn('No user ID provided for subscribeToUserOrders');
        return () => {};
      }

      const ordersRef = collection(db, this.ordersCollection);
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders: PersistedOrder[] = [];
          snapshot.forEach((doc) => {
            orders.push({
              id: doc.id,
              ...doc.data()
            } as PersistedOrder);
          });

          console.log(`🔄 Real-time update: ${orders.length} orders for user ${userId}`);
          callback(orders);
        },
        (error) => {
          console.error('❌ Error in orders listener:', error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up orders listener:', error);
      return () => {};
    }
  }

  /**
   * Verify order persistence (for debugging)
   */
  async verifyOrderPersistence(userId: string): Promise<{
    success: boolean;
    orderCount: number;
    orders: PersistedOrder[];
  }> {
    try {
      const orders = await this.getUserOrders(userId);
      
      console.log(`🔍 Order persistence verification for user ${userId}:`);
      console.log(`   - Total orders: ${orders.length}`);
      console.log(`   - Orders:`, orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total
      })));

      return {
        success: true,
        orderCount: orders.length,
        orders
      };
    } catch (error) {
      console.error('❌ Error verifying order persistence:', error);
      return {
        success: false,
        orderCount: 0,
        orders: []
      };
    }
  }

  /**
   * Create order from cart items (helper method)
   */
  async createOrderFromCart(
    userId: string,
    cartItems: CartItem[],
    shippingAddress: any,
    shippingCost: number = 50,
    discountAmount: number = 0
  ): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
      const total = subtotal + tax + shippingCost - discountAmount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Convert cart items to order items
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        name: item.name,
        quantity: item.quantity,
        size: item.size || 'N/A',
        color: item.color || 'N/A',
        price: item.price,
        image: item.image
      }));

      // Create order
      const result = await this.saveOrder(userId, {
        userId,
        orderNumber,
        items: orderItems,
        subtotal,
        tax,
        shipping: shippingCost,
        discount: discountAmount,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress,
        notes: ''
      });

      if (result.success) {
        // Sync user profile with order data
        try {
          await userProfileSyncService.syncUserFromOrder(userId, shippingAddress, total);
        } catch (error) {
          console.warn('Failed to sync user profile:', error);
        }

        return {
          success: true,
          orderId: result.orderId,
          orderNumber
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating order from cart:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }
}

export const orderPersistenceService = new OrderPersistenceService();
