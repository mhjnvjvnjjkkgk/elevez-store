import { useState, useCallback } from 'react';
import {
  PaymentIntent,
  PaymentMethod,
  createPaymentIntent,
  confirmPayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  getPaymentIntent,
  addPaymentMethod,
  validateCard,
  formatCardNumber,
  getCardBrand,
} from '../services/paymentService';

export interface PaymentState {
  paymentIntents: Map<string, PaymentIntent>;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PaymentState = {
  paymentIntents: new Map(),
  paymentMethods: [],
  selectedPaymentMethod: null,
  loading: false,
  error: null,
  success: false,
};

export function usePayment(userId: string | undefined) {
  const [state, setState] = useState<PaymentState>(initialState);

  // Create payment intent
  const createPayment = useCallback(
    async (orderId: string, amount: number, currency: string = 'INR') => {
      if (!userId) return;

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await createPaymentIntent(userId, orderId, amount, currency);
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            paymentIntents: new Map(prev.paymentIntents).set(result.data!.id, result.data!),
            loading: false,
          }));
          return result.data;
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Failed to create payment intent',
            loading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to create payment intent',
          loading: false,
        }));
      }
    },
    [userId]
  );

  // Confirm payment
  const confirmPaymentIntent = useCallback(
    async (paymentIntentId: string, stripePaymentIntentId: string, paymentMethod: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await confirmPayment(paymentIntentId, stripePaymentIntentId, paymentMethod);
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            paymentIntents: new Map(prev.paymentIntents).set(result.data!.id, result.data!),
            loading: false,
          }));
          return result.data;
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Failed to confirm payment',
            loading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to confirm payment',
          loading: false,
        }));
      }
    },
    []
  );

  // Handle payment success
  const processPaymentSuccess = useCallback(async (paymentIntentId: string, stripePaymentIntentId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await handlePaymentSuccess(paymentIntentId, stripePaymentIntentId);
      if (result.success) {
        setState(prev => ({
          ...prev,
          success: true,
          loading: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to process payment success',
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to process payment success',
        loading: false,
      }));
      return false;
    }
  }, []);

  // Handle payment failure
  const processPaymentFailure = useCallback(async (paymentIntentId: string, errorMessage: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await handlePaymentFailure(paymentIntentId, errorMessage);
      if (result.success) {
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to process payment failure',
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to process payment failure',
        loading: false,
      }));
      return false;
    }
  }, []);

  // Get payment intent
  const getPayment = useCallback(async (paymentIntentId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await getPaymentIntent(paymentIntentId);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          paymentIntents: new Map(prev.paymentIntents).set(result.data!.id, result.data!),
          loading: false,
        }));
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to get payment intent',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to get payment intent',
        loading: false,
      }));
    }
  }, []);

  // Add payment method
  const addPayment = useCallback(
    async (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
      if (!userId) return;

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await addPaymentMethod(userId, paymentMethod);
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            paymentMethods: [...prev.paymentMethods, result.data!],
            loading: false,
          }));
          return result.data;
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Failed to add payment method',
            loading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to add payment method',
          loading: false,
        }));
      }
    },
    [userId]
  );

  // Select payment method
  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({
      ...prev,
      selectedPaymentMethod: method,
    }));
  }, []);

  // Validate card
  const validateCardDetails = useCallback(
    (cardNumber: string, expiryMonth: number, expiryYear: number, cvc: string) => {
      return validateCard(cardNumber, expiryMonth, expiryYear, cvc);
    },
    []
  );

  // Format card number
  const formatCard = useCallback((cardNumber: string) => {
    return formatCardNumber(cardNumber);
  }, []);

  // Get card brand
  const detectCardBrand = useCallback((cardNumber: string) => {
    return getCardBrand(cardNumber);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Reset payment
  const resetPayment = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // State
    state,

    // Payment intent management
    createPayment,
    confirmPaymentIntent,
    processPaymentSuccess,
    processPaymentFailure,
    getPayment,

    // Payment method management
    addPayment,
    selectPaymentMethod,

    // Card utilities
    validateCardDetails,
    formatCard,
    detectCardBrand,

    // Utilities
    clearError,
    resetPayment,
  };
}
