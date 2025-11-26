import { useState, useCallback, useEffect } from 'react';
import { CartItem } from '../types';
import {
  Address,
  ShippingMethod,
  Order,
  SHIPPING_METHODS,
  calculateTax,
  calculateTotal,
  validateAddress,
  createOrder,
  getUserAddresses,
  addAddress,
  updateAddress,
} from '../services/checkoutService';

export interface CheckoutState {
  currentStep: 'cart' | 'shipping' | 'payment' | 'confirmation';
  shippingAddress: Partial<Address> | null;
  billingAddress: Partial<Address> | null;
  sameAsShipping: boolean;
  selectedShipping: ShippingMethod;
  discountCode: string;
  discountAmount: number;
  savedAddresses: Address[];
  loading: boolean;
  error: string | null;
  order: Order | null;
}

const initialState: CheckoutState = {
  currentStep: 'cart',
  shippingAddress: null,
  billingAddress: null,
  sameAsShipping: true,
  selectedShipping: SHIPPING_METHODS[0],
  discountCode: '',
  discountAmount: 0,
  savedAddresses: [],
  loading: false,
  error: null,
  order: null,
};

export function useCheckout(userId: string | undefined, cartItems: CartItem[], cartTotal: number) {
  const [state, setState] = useState<CheckoutState>(initialState);

  // Load saved addresses
  useEffect(() => {
    if (userId) {
      loadSavedAddresses();
    }
  }, [userId]);

  const loadSavedAddresses = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await getUserAddresses(userId);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          savedAddresses: result.data || [],
        }));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  }, [userId]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax, state.selectedShipping.cost, state.discountAmount);

  // Step navigation
  const goToStep = useCallback((step: CheckoutState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    const steps: CheckoutState['currentStep'][] = ['cart', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex < steps.length - 1) {
      setState(prev => ({ ...prev, currentStep: steps[currentIndex + 1] }));
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const steps: CheckoutState['currentStep'][] = ['cart', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, currentStep: steps[currentIndex - 1] }));
    }
  }, [state.currentStep]);

  // Address management
  const setShippingAddress = useCallback((address: Partial<Address>) => {
    setState(prev => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.sameAsShipping ? address : prev.billingAddress,
    }));
  }, []);

  const setBillingAddress = useCallback((address: Partial<Address>) => {
    setState(prev => ({
      ...prev,
      billingAddress: address,
    }));
  }, []);

  const setSameAsShipping = useCallback((same: boolean) => {
    setState(prev => ({
      ...prev,
      sameAsShipping: same,
      billingAddress: same ? prev.shippingAddress : prev.billingAddress,
    }));
  }, []);

  const saveAddress = useCallback(async (address: Omit<Address, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await addAddress(userId, address);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          savedAddresses: [...prev.savedAddresses, result.data!],
          loading: false,
        }));
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to save address',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to save address',
        loading: false,
      }));
    }
  }, [userId]);

  const updateSavedAddress = useCallback(async (addressId: string, updates: Partial<Address>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await updateAddress(addressId, updates);
      if (result.success) {
        setState(prev => ({
          ...prev,
          savedAddresses: prev.savedAddresses.map(addr =>
            addr.id === addressId ? { ...addr, ...updates } : addr
          ),
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to update address',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update address',
        loading: false,
      }));
    }
  }, []);

  // Shipping method
  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState(prev => ({
      ...prev,
      selectedShipping: method,
    }));
  }, []);

  // Discount code
  const applyDiscountCode = useCallback((code: string) => {
    // This would validate the code against your backend
    // For now, just store it
    setState(prev => ({
      ...prev,
      discountCode: code,
      // In production, validate and set discountAmount
    }));
  }, []);

  const setDiscountAmount = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      discountAmount: Math.min(amount, subtotal), // Can't exceed subtotal
    }));
  }, [subtotal]);

  // Validation
  const validateCheckout = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate shipping address
    if (!state.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      const validation = validateAddress(state.shippingAddress);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // Validate billing address if different
    if (!state.sameAsShipping && state.billingAddress) {
      const validation = validateAddress(state.billingAddress);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // Validate cart items
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [state.shippingAddress, state.billingAddress, state.sameAsShipping, cartItems]);

  // Create order
  const submitOrder = useCallback(async () => {
    if (!userId) return;

    const validation = validateCheckout();
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        error: validation.errors.join(', '),
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await createOrder(
        userId,
        cartItems,
        state.shippingAddress as Address,
        state.billingAddress as Address,
        state.selectedShipping,
        state.discountAmount
      );

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          order: result.data!,
          currentStep: 'confirmation',
          loading: false,
        }));
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to create order',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create order',
        loading: false,
      }));
    }
  }, [userId, cartItems, state.shippingAddress, state.billingAddress, state.selectedShipping, state.discountAmount, validateCheckout]);

  // Reset checkout
  const resetCheckout = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // State
    state,
    subtotal,
    tax,
    total,

    // Navigation
    goToStep,
    nextStep,
    prevStep,

    // Address management
    setShippingAddress,
    setBillingAddress,
    setSameAsShipping,
    saveAddress,
    updateSavedAddress,

    // Shipping
    setShippingMethod,

    // Discount
    applyDiscountCode,
    setDiscountAmount,

    // Validation & submission
    validateCheckout,
    submitOrder,
    resetCheckout,
  };
}
