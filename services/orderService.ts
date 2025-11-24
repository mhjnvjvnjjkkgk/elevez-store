import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Order data interface
export interface OrderData {
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  items: any[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  orderDate?: Timestamp;
  status?: string;
}

// Save order to Firestore
export const saveOrder = async (orderData: OrderData) => {
  try {
    const now = Timestamp.now();
    
    // Add timestamp and default status
    const orderWithMetadata = {
      ...orderData,
      orderDate: now,
      createdAt: now, // For admin panel compatibility
      status: 'pending',
      orderId: `ORD-${Date.now()}` // Unique order ID
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'orders'), orderWithMetadata);
    console.log('✅ Order saved with ID: ', docRef.id);
    console.log('📦 Order details:', {
      orderId: orderWithMetadata.orderId,
      userId: orderData.userId,
      items: orderData.items.length,
      total: orderData.totalAmount
    });
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('❌ Error saving order: ', error);
    return { success: false, error: error.message };
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (userId: string) => {
  try {
    // This would be implemented to retrieve user's orders
    // For now, we're just saving them
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting orders: ', error);
    return { success: false, error: error.message };
  }
};

// Get order by ID
export const getOrder = async (orderId: string) => {
  try {
    // This would be implemented if you need to retrieve orders
    // For now, we're just saving them
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting order: ', error);
    return { success: false, error: error.message };
  }
};

// Get order by ID with user verification
export const getOrderById = async (orderId: string, userId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = orderSnap.data();

    // Verify the order belongs to the user
    if (orderData.userId !== userId) {
      return { success: false, error: 'Unauthorized access to this order' };
    }

    return { 
      success: true, 
      data: {
        id: orderId,
        ...orderData
      }
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: error.message };
  }
};