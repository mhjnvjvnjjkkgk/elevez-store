import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { CartItem } from '../types';

export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  active: boolean;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  image: string;
}

export interface Order {
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
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
}

// Tax rate (18% GST for India)
const TAX_RATE = 0.18;

// Shipping methods
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    cost: 50,
    estimatedDays: 6,
    active: true,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    cost: 150,
    estimatedDays: 2,
    active: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    cost: 300,
    estimatedDays: 1,
    active: true,
  },
];

// Calculate tax
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

// Calculate total
export function calculateTotal(subtotal: number, tax: number, shipping: number, discount: number = 0): number {
  return Math.round((subtotal + tax + shipping - discount) * 100) / 100;
}

// Validate address
export function validateAddress(address: Partial<Address>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.firstName || address.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  if (!address.lastName || address.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  if (!address.email || !address.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!address.phone || address.phone.trim().length < 10) {
    errors.push('Valid phone number is required');
  }
  if (!address.street || address.street.trim().length < 5) {
    errors.push('Street address must be at least 5 characters');
  }
  if (!address.city || address.city.trim().length < 2) {
    errors.push('City is required');
  }
  if (!address.state || address.state.trim().length < 2) {
    errors.push('State is required');
  }
  if (!address.zipCode || address.zipCode.trim().length < 5) {
    errors.push('Valid zip code is required');
  }
  if (!address.country || address.country.trim().length < 2) {
    errors.push('Country is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Add address
export async function addAddress(userId: string, address: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<{ success: boolean; data?: Address; error?: string }> {
  try {
    const validation = validateAddress(address);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const docRef = await addDoc(collection(db, 'addresses'), {
      ...address,
      userId,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      data: {
        id: docRef.id,
        userId,
        ...address,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error('Error adding address:', error);
    return { success: false, error: 'Failed to add address' };
  }
}

// Get user addresses
export async function getUserAddresses(userId: string): Promise<{ success: boolean; data?: Address[]; error?: string }> {
  try {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const addresses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    })) as Address[];

    return { success: true, data: addresses };
  } catch (error) {
    console.error('Error getting addresses:', error);
    return { success: false, error: 'Failed to get addresses' };
  }
}

// Update address
export async function updateAddress(addressId: string, updates: Partial<Address>): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateAddress(updates);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    await updateDoc(doc(db, 'addresses', addressId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating address:', error);
    return { success: false, error: 'Failed to update address' };
  }
}

// Delete address
export async function deleteAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'addresses', addressId), { deleted: true });
    return { success: true };
  } catch (error) {
    console.error('Error deleting address:', error);
    return { success: false, error: 'Failed to delete address' };
  }
}

// Create order
export async function createOrder(
  userId: string,
  items: CartItem[],
  shippingAddress: Address,
  billingAddress: Address,
  shippingMethod: ShippingMethod,
  discountAmount: number = 0
): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax, shippingMethod.cost, discountAmount);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order items
    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      image: item.image,
    }));

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + shippingMethod.estimatedDays);

    // Create order document
    const docRef = await addDoc(collection(db, 'orders'), {
      userId,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      shipping: shippingMethod.cost,
      discount: discountAmount,
      total,
      status: 'pending',
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentStatus: 'pending',
      notes: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      estimatedDelivery: Timestamp.fromDate(estimatedDelivery),
    });

    return {
      success: true,
      data: {
        id: docRef.id,
        userId,
        orderNumber,
        items: orderItems,
        subtotal,
        tax,
        shipping: shippingMethod.cost,
        discount: discountAmount,
        total,
        status: 'pending',
        shippingAddress,
        billingAddress,
        shippingMethod,
        paymentStatus: 'pending',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDelivery,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

// Get order
export async function getOrder(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (!docSnap.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || new Date(),
      } as Order,
    };
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: 'Failed to get order' };
  }
}

// Get user orders
export async function getUserOrders(userId: string): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        estimatedDelivery: data.estimatedDelivery?.toDate?.() || new Date(),
      } as Order;
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: 'Failed to get orders' };
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    await updateDoc(doc(db, 'orders', orderId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
