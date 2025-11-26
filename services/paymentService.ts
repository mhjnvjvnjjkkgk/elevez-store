import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp } from 'firebase/firestore';

export interface PaymentIntent {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  stripePaymentIntentId: string;
  paymentMethod: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4: string;
  brand: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  createdAt: Date;
}

// Initialize Stripe (client-side)
export function initializeStripe() {
  // This would be called in a component with Stripe.js
  // For now, we're setting up the service structure
  return {
    initialized: true,
    message: 'Stripe initialized',
  };
}

// Create payment intent
export async function createPaymentIntent(
  userId: string,
  orderId: string,
  amount: number,
  currency: string = 'INR'
): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
  try {
    // In production, this would call your backend API
    // which would create a Stripe PaymentIntent
    const docRef = await addDoc(collection(db, 'paymentIntents'), {
      userId,
      orderId,
      amount,
      currency,
      status: 'pending',
      stripePaymentIntentId: '', // Will be set by backend
      paymentMethod: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      data: {
        id: docRef.id,
        userId,
        orderId,
        amount,
        currency,
        status: 'pending',
        stripePaymentIntentId: '',
        paymentMethod: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, error: 'Failed to create payment intent' };
  }
}

// Confirm payment
export async function confirmPayment(
  paymentIntentId: string,
  stripePaymentIntentId: string,
  paymentMethod: string
): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
  try {
    const docRef = doc(db, 'paymentIntents', paymentIntentId);
    
    await updateDoc(docRef, {
      status: 'processing',
      stripePaymentIntentId,
      paymentMethod,
      updatedAt: Timestamp.now(),
    });

    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    return {
      success: true,
      data: {
        id: docSnap.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      } as PaymentIntent,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: 'Failed to confirm payment' };
  }
}

// Handle payment success
export async function handlePaymentSuccess(
  paymentIntentId: string,
  stripePaymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'paymentIntents', paymentIntentId), {
      status: 'succeeded',
      stripePaymentIntentId,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling payment success:', error);
    return { success: false, error: 'Failed to process payment success' };
  }
}

// Handle payment failure
export async function handlePaymentFailure(
  paymentIntentId: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, 'paymentIntents', paymentIntentId), {
      status: 'failed',
      errorMessage,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling payment failure:', error);
    return { success: false, error: 'Failed to process payment failure' };
  }
}

// Get payment intent
export async function getPaymentIntent(paymentIntentId: string): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
  try {
    const docSnap = await getDoc(doc(db, 'paymentIntents', paymentIntentId));
    if (!docSnap.exists()) {
      return { success: false, error: 'Payment intent not found' };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as PaymentIntent,
    };
  } catch (error) {
    console.error('Error getting payment intent:', error);
    return { success: false, error: 'Failed to get payment intent' };
  }
}

// Add payment method
export async function addPaymentMethod(
  userId: string,
  paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: PaymentMethod; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'paymentMethods'), {
      ...paymentMethod,
      userId,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      data: {
        id: docRef.id,
        ...paymentMethod,
        userId,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error('Error adding payment method:', error);
    return { success: false, error: 'Failed to add payment method' };
  }
}

// Get payment methods
export async function getPaymentMethods(userId: string): Promise<{ success: boolean; data?: PaymentMethod[]; error?: string }> {
  try {
    // This would query Firestore for user's payment methods
    // For now, returning empty array
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return { success: false, error: 'Failed to get payment methods' };
  }
}

// Validate card
export function validateCard(cardNumber: string, expiryMonth: number, expiryYear: number, cvc: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate card number (Luhn algorithm)
  const sanitized = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) {
    errors.push('Invalid card number');
  } else {
    let sum = 0;
    let isEven = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) {
      errors.push('Invalid card number');
    }
  }

  // Validate expiry
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
    errors.push('Card has expired');
  }

  // Validate CVC
  if (!/^\d{3,4}$/.test(cvc)) {
    errors.push('Invalid CVC');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format card number
export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
}

// Get card brand
export function getCardBrand(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\s/g, '');
  
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(sanitized)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(sanitized)) return 'Mastercard';
  if (/^3[47][0-9]{13}$/.test(sanitized)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(sanitized)) return 'Discover';
  
  return 'Unknown';
}
