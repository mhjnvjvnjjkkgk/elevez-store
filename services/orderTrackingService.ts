import { db } from '../firebaseConfig';
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy, Unsubscribe } from 'firebase/firestore';

export interface OrderStatus {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingLink?: string;
  shippedAt?: string;
  deliveredAt?: string;
  lastUpdated: string;
}

export interface Order {
  id: string;
  orderId: string;
  email: string;
  fullName: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
  trackingLink?: string;
  shippedAt?: string;
  deliveredAt?: string;
  pointsEarned?: number;
}

class OrderTrackingService {
  /**
   * Update order status with tracking information
   */
  async updateOrderStatus(
    orderId: string, 
    statusUpdate: Partial<OrderStatus>
  ): Promise<void> {
    try {
      console.log('🔄 Updating order status:', { orderId, statusUpdate });
      
      const orderRef = doc(db, 'orders', orderId);
      
      const updateData: any = {
        ...statusUpdate,
        lastUpdated: new Date().toISOString()
      };
      
      // Add timestamp for status changes
      if (statusUpdate.status === 'shipped' && !statusUpdate.shippedAt) {
        updateData.shippedAt = new Date().toISOString();
      }
      
      if (statusUpdate.status === 'delivered' && !statusUpdate.deliveredAt) {
        updateData.deliveredAt = new Date().toISOString();
      }
      
      await updateDoc(orderRef, updateData);
      
      console.log('✅ Order status updated successfully');
      
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }
  
  /**
   * Ship an order with tracking link
   */
  async shipOrder(orderId: string, trackingLink: string): Promise<void> {
    // Validate tracking link
    if (!trackingLink || !this.isValidUrl(trackingLink)) {
      throw new Error('Please provide a valid tracking URL');
    }
    
    await this.updateOrderStatus(orderId, {
      status: 'shipped',
      trackingLink,
      shippedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }
  
  /**
   * Mark order as delivered
   */
  async markDelivered(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, {
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }
  
  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    const updateData: any = {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    if (reason) {
      updateData.cancellationReason = reason;
    }
    
    await this.updateOrderStatus(orderId, updateData);
  }
  
  /**
   * Get real-time orders for a user
   */
  subscribeToUserOrders(
    userEmail: string, 
    callback: (orders: Order[]) => void
  ): Unsubscribe {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('email', '==', userEmail),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      
      callback(orders);
    }, (error) => {
      console.error('Error in orders subscription:', error);
    });
  }
  
  /**
   * Get real-time orders for admin
   */
  subscribeToAllOrders(callback: (orders: Order[]) => void): Unsubscribe {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      
      callback(orders);
    }, (error) => {
      console.error('Error in admin orders subscription:', error);
    });
  }
  
  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get order status display info
   */
  getStatusInfo(status: string) {
    const statusMap: Record<string, { icon: string; label: string; color: string }> = {
      pending: { icon: '⏳', label: 'Pending', color: '#ffaa00' },
      processing: { icon: '🔄', label: 'Processing', color: '#00aaff' },
      shipped: { icon: '🚚', label: 'Shipped', color: '#00ff88' },
      delivered: { icon: '✅', label: 'Delivered', color: '#00ff88' },
      cancelled: { icon: '❌', label: 'Cancelled', color: '#ff4444' }
    };
    
    return statusMap[status] || statusMap.pending;
  }
  
  /**
   * Calculate order progress percentage
   */
  getOrderProgress(status: string): number {
    const progressMap: Record<string, number> = {
      pending: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0
    };
    
    return progressMap[status] || 0;
  }
}

// Export singleton instance
export const orderTrackingService = new OrderTrackingService();
export default orderTrackingService;
