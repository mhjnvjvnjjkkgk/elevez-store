// Test file for order service
import { saveOrder } from './orderService';

// Test data
const testOrder = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  pincode: '10001',
  paymentMethod: 'upi',
  items: [
    {
      id: 1,
      name: 'Test Product',
      price: 29.99,
      quantity: 2,
      size: 'M',
      color: 'Black'
    }
  ],
  subtotal: 59.98,
  shippingCost: 0,
  totalAmount: 59.98
};

// Test function
export const testSaveOrder = async () => {
  try {
    console.log('Testing order save...');
    const result = await saveOrder(testOrder);
    console.log('Order save result:', result);
    return result;
  } catch (error) {
    console.error('Error testing order save:', error);
    return { success: false, error: error.message };
  }
};

// Run test if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  testSaveOrder();
}