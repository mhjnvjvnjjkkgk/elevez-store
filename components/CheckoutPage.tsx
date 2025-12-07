import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle, Loader, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { CartItem } from '../types';
import { SHIPPING_METHODS, calculateTax, calculateTotal, Address, createOrder } from '../services/checkoutService';
import { checkoutDiscountService } from '../services/checkoutDiscountService';
import { userPointsService } from '../services/userPointsService';
import { firebaseSyncService } from '../services/firebaseSyncService';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutPageProps {
  cartItems: CartItem[];
  cartTotal: number;
  onCheckoutComplete?: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, cartTotal, onCheckoutComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checkout state
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
  });

  const [billingAddress, setBillingAddress] = useState<Partial<Address>>(shippingAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax, selectedShipping.cost, discountAmount);

  // Handle discount application
  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    const result = checkoutDiscountService.calculateDiscount(discountCode, subtotal);
    
    if (!result.valid) {
      setDiscountError(result.message || 'Invalid discount code');
      setDiscountAmount(0);
      setAppliedDiscount(null);
      return;
    }

    setDiscountAmount(result.discountAmount || 0);
    setAppliedDiscount(result.discount);
    setDiscountError(null);
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setAppliedDiscount(null);
    setDiscountError(null);
  };

  // Handle step navigation
  const handleNextStep = async () => {
    if (currentStep === 'cart') {
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Place order and sync to Firebase
      setLoading(true);
      try {
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        console.log('🛒 Creating order for user:', user.uid);
        
        // Calculate points to be earned (1 point per ₹10 spent)
        const pointsToEarn = Math.floor(total / 10);
        console.log('💰 Points to be earned:', pointsToEarn);
        
        // Create order with real user data - this saves to Firebase
        const orderResult = await createOrder(
          user.uid,
          cartItems,
          shippingAddress as Address,
          sameAsShipping ? (shippingAddress as Address) : (billingAddress as Address),
          selectedShipping,
          discountAmount
        );

        if (!orderResult.success || !orderResult.data) {
          console.error('❌ Failed to create order:', orderResult.error);
          setError(orderResult.error || 'Failed to create order');
          setLoading(false);
          return;
        }

        const order = orderResult.data;
        console.log('✅ Order created successfully:', order.orderNumber, 'ID:', order.id);
        console.log('📦 Order details:', {
          userId: order.userId,
          orderNumber: order.orderNumber,
          total: order.total,
          items: order.items.length,
          pointsEarned: pointsToEarn
        });

        // Add points to user account (1 point per ₹10 spent)
        console.log('💰 Adding points for purchase...');
        console.log(`Awarding ${pointsToEarn} points for order total ₹${order.total}`);
        
        await userPointsService.addPointsFromPurchase(
          user.uid,
          order.total,
          order.orderNumber,
          0.1 // 1 point per ₹10 (0.1 points per rupee)
        );

        // Sync user points to Firebase
        const userPoints = await userPointsService.getUserPoints(user.uid);
        if (userPoints) {
          await firebaseSyncService.syncUserPoints(
            user.uid,
            userPoints.totalPoints,
            userPoints.tier,
            userPoints.totalPoints
          );
          console.log('✅ Points synced to Firebase:', userPoints.totalPoints);
          console.log('✅ User tier:', userPoints.tier);
        } else {
          console.warn('⚠️ Could not load user points after purchase');
        }

        // Record discount usage if applied
        if (appliedDiscount) {
          checkoutDiscountService.recordUsage(appliedDiscount.code);
          await firebaseSyncService.syncDiscountUsage(
            user.uid,
            appliedDiscount.code,
            discountAmount,
            order.orderNumber
          );
          console.log('✅ Discount usage recorded');
        }

        // Log purchase activity
        await firebaseSyncService.logActivity(
          user.uid,
          'purchase',
          `Completed purchase: ${order.orderNumber}`,
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            itemCount: cartItems.length,
          }
        );
        console.log('✅ Activity logged');

        // Clear cart
        await firebaseSyncService.clearCart(user.uid);
        console.log('✅ Cart cleared');

        console.log('🎉 Order process complete! Order should now be visible in My Account');
        setCurrentStep('confirmation');
      } catch (err) {
        console.error('Error placing order:', err);
        setError('Error placing order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('cart');
    } else if (currentStep === 'payment') {
      setCurrentStep('shipping');
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation'];
    const stepLabels = ['Cart', 'Shipping', 'Payment', 'Confirmation'];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                steps.indexOf(currentStep) >= index
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-zinc-800 text-gray-400'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {steps.indexOf(currentStep) > index ? <Check size={20} /> : index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  steps.indexOf(currentStep) > index ? 'bg-[#00ff88]' : 'bg-zinc-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render cart review
  const renderCartReview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Order Review</h2>
      
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.cartId} className="flex gap-4 bg-zinc-900/50 p-4 rounded-lg border border-white/10">
            <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-400">
                {item.size} • {item.color} • Qty: {item.quantity}
              </p>
              <p className="text-[#00ff88] font-bold mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/10 space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (18%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{selectedShipping.cost.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#00ff88]">
            <span>Discount</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-[#00ff88]">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );

  // Render shipping address form
  const renderShippingForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Shipping Address</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={shippingAddress.firstName || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
          className="col-span-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={shippingAddress.lastName || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
          className="col-span-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        value={shippingAddress.email || ''}
        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
      />

      <input
        type="tel"
        placeholder="Phone Number"
        value={shippingAddress.phone || ''}
        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
      />

      <input
        type="text"
        placeholder="Street Address"
        value={shippingAddress.street || ''}
        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
        <input
          type="text"
          placeholder="State"
          value={shippingAddress.state || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Zip Code"
          value={shippingAddress.zipCode || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
        <input
          type="text"
          placeholder="Country"
          value={shippingAddress.country || ''}
          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
          className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
        />
      </div>

      {/* Shipping Methods */}
      <div className="space-y-3">
        <h3 className="font-bold">Shipping Method</h3>
        {SHIPPING_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-4 p-4 bg-zinc-900/50 border-2 rounded-lg cursor-pointer transition-all ${
              selectedShipping.id === method.id
                ? 'border-[#00ff88] bg-[#00ff88]/5'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name="shipping"
              checked={selectedShipping.id === method.id}
              onChange={() => setSelectedShipping(method)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <p className="font-bold">{method.name}</p>
              <p className="text-sm text-gray-400">{method.description}</p>
            </div>
            <p className="font-bold text-[#00ff88]">₹{method.cost}</p>
          </label>
        ))}
      </div>
    </motion.div>
  );

  // Render payment form
  const renderPaymentForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Payment Method</h2>

      <div className="space-y-3">
        <label className="flex items-center gap-4 p-4 bg-zinc-900/50 border-2 border-[#00ff88] rounded-lg cursor-pointer">
          <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
          <div>
            <p className="font-bold">Credit/Debit Card</p>
            <p className="text-sm text-gray-400">Visa, Mastercard, American Express</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 bg-zinc-900/50 border-2 border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-all">
          <input type="radio" name="payment" className="w-4 h-4" />
          <div>
            <p className="font-bold">UPI</p>
            <p className="text-sm text-gray-400">Google Pay, PhonePe, Paytm</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 bg-zinc-900/50 border-2 border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-all">
          <input type="radio" name="payment" className="w-4 h-4" />
          <div>
            <p className="font-bold">Net Banking</p>
            <p className="text-sm text-gray-400">All major banks supported</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 bg-zinc-900/50 border-2 border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-all">
          <input type="radio" name="payment" className="w-4 h-4" />
          <div>
            <p className="font-bold">Cash on Delivery</p>
            <p className="text-sm text-gray-400">Pay when you receive your order</p>
          </div>
        </label>
      </div>

      {/* Discount Code */}
      <div className="space-y-3">
        <h3 className="font-bold">Discount Code</h3>
        {appliedDiscount ? (
          <div className="bg-[#00ff88]/10 border border-[#00ff88] rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-[#00ff88]">{appliedDiscount.code}</p>
              <p className="text-sm text-gray-400">{appliedDiscount.name}</p>
              <p className="text-sm text-[#00ff88] font-bold mt-1">-₹{discountAmount.toFixed(2)}</p>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="p-2 hover:bg-[#00ff88]/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-[#00ff88]" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setDiscountError(null);
              }}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
            />
            <button
              onClick={handleApplyDiscount}
              className="px-6 py-3 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] rounded-lg font-bold transition-colors"
            >
              Apply
            </button>
          </div>
        )}
        {discountError && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle size={16} />
            {discountError}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render confirmation
  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6"
    >
      <div className="flex justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center"
        >
          <Check size={40} className="text-[#00ff88]" />
        </motion.div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-400">Thank you for your purchase</p>
      </div>

      <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/10 text-left space-y-3">
        <p className="text-sm text-gray-400">Order Number: <span className="text-white font-bold">ORD-123456789</span></p>
        <p className="text-sm text-gray-400">Total Amount: <span className="text-[#00ff88] font-bold">₹{total.toFixed(2)}</span></p>
        <p className="text-sm text-gray-400">Estimated Delivery: <span className="text-white font-bold">5-7 business days</span></p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg hover:bg-white transition-colors"
      >
        Continue Shopping
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2.5 xl:col-span-2.5">
            <AnimatePresence mode="wait">
              {currentStep === 'cart' && renderCartReview()}
              {currentStep === 'shipping' && renderShippingForm()}
              {currentStep === 'payment' && renderPaymentForm()}
              {currentStep === 'confirmation' && renderConfirmation()}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1.5 xl:col-span-1.5">
            <div className="sticky top-28 bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-lg">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">₹{selectedShipping.cost.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#00ff88]">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#00ff88]">₹{total.toFixed(2)}</span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                {currentStep !== 'cart' && currentStep !== 'confirmation' && (
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                )}
                {currentStep !== 'confirmation' && (
                  <button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#00ff88] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span className="hidden sm:inline">Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{currentStep === 'payment' ? 'Place Order' : 'Continue'}</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
