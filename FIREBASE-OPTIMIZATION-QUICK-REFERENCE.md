# Firebase Optimization - Quick Reference

## Import Services & Hooks

```typescript
// Optimization Service
import { firebaseOptimizationService } from '../services/firebaseOptimizationService';

// Button Handler Service
import { buttonHandlerService } from '../services/buttonHandlerService';

// Optimized Hooks
import {
  useOptimizedFirebaseSync,
  useOptimizedCart,
  useOptimizedPoints,
  useOptimizedOrders,
  useOptimizedDataSync
} from '../hooks/useOptimizedFirebaseSync';
```

## Using Main Hook

```typescript
function MyComponent() {
  const {
    profile,      // User profile
    cart,         // Shopping cart
    orders,       // User orders
    points,       // Loyalty points
    loading,      // Loading state
    error,        // Error message
    userId,       // Current user ID
    syncProfile,  // Sync profile
    syncCart,     // Sync cart
    syncPoints,   // Sync points
    queueOperation, // Queue operation
    clearCache    // Clear cache
  } = useOptimizedFirebaseSync();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile?.displayName}</h1>
      <p>Points: {points?.points}</p>
    </div>
  );
}
```

## Using Specialized Hooks

```typescript
// Cart Hook
const { cart, loading, updateCart, clearCart } = useOptimizedCart(userId);

// Points Hook
const { points, loading, updatePoints } = useOptimizedPoints(userId);

// Orders Hook
const { orders, loading } = useOptimizedOrders(userId);

// Custom Data Hook
const { data, loading, syncData } = useOptimizedDataSync(
  'collectionName',
  userId,
  'cacheKey'
);
```

## Button Handlers

### Add to Cart
```typescript
const handleAddToCart = async (product, quantity, size, color) => {
  const success = await buttonHandlerService.handleAddToCart(
    userId,
    product,
    quantity,
    size,
    color
  );
  if (success) alert('Added to cart');
};
```

### Remove from Cart
```typescript
const handleRemoveFromCart = async (cartId) => {
  const success = await buttonHandlerService.handleRemoveFromCart(userId, cartId);
  if (success) alert('Removed from cart');
};
```

### Update Cart Quantity
```typescript
const handleUpdateQuantity = async (cartId, quantity) => {
  const success = await buttonHandlerService.handleUpdateCartQuantity(
    userId,
    cartId,
    quantity
  );
  if (success) alert('Quantity updated');
};
```

### Checkout
```typescript
const handleCheckout = async (orderData) => {
  const success = await buttonHandlerService.handleCheckout(userId, orderData);
  if (success) {
    alert('Order placed');
    navigate('/confirmation');
  }
};
```

### Apply Discount
```typescript
const handleApplyDiscount = async (code, subtotal) => {
  const result = await buttonHandlerService.handleApplyDiscount(
    userId,
    code,
    subtotal
  );
  if (result.success) {
    alert(`Discount: ₹${result.discountAmount}`);
  } else {
    alert(result.error);
  }
};
```

### Redeem Points
```typescript
const handleRedeemPoints = async (pointsToRedeem) => {
  const success = await buttonHandlerService.handleRedeemPoints(
    userId,
    pointsToRedeem
  );
  if (success) alert('Points redeemed');
};
```

### Update Profile
```typescript
const handleUpdateProfile = async (profileData) => {
  const success = await buttonHandlerService.handleUpdateProfile(
    userId,
    profileData
  );
  if (success) alert('Profile updated');
};
```

### Add to Wishlist
```typescript
const handleAddToWishlist = async (productId) => {
  const success = await buttonHandlerService.handleAddToWishlist(userId, productId);
  if (success) alert('Added to wishlist');
};
```

### Remove from Wishlist
```typescript
const handleRemoveFromWishlist = async (productId) => {
  const success = await buttonHandlerService.handleRemoveFromWishlist(
    userId,
    productId
  );
  if (success) alert('Removed from wishlist');
};
```

## Cache Management

### Get Cached Data
```typescript
const data = firebaseOptimizationService.getCachedData('key');
```

### Set Cached Data
```typescript
// Without TTL
firebaseOptimizationService.setCachedData('key', data);

// With 1 hour TTL
firebaseOptimizationService.setCachedData('key', data, 3600000);
```

### Clear Cache
```typescript
// Clear specific key
firebaseOptimizationService.clearCache('key');

// Clear all cache
firebaseOptimizationService.clearAllCache();
```

### Get Cache Stats
```typescript
const stats = firebaseOptimizationService.getCacheStats();
console.log(`Size: ${stats.size} items`);
console.log(`Total: ${stats.totalSize} bytes`);
```

## Real-Time Listeners

### Set Up Listener
```typescript
const unsubscribe = firebaseOptimizationService.setupRealtimeListener(
  'collectionName',
  userId,
  (data) => {
    console.log('Data updated:', data);
  },
  'cacheKey'
);

// Clean up
unsubscribe();
```

### Set Up Query Listener
```typescript
const unsubscribe = firebaseOptimizationService.setupQueryListener(
  'collectionName',
  'fieldName',
  'fieldValue',
  (data) => {
    console.log('Query results:', data);
  },
  'cacheKey'
);

// Clean up
unsubscribe();
```

## Sync Operations

### Sync Data Immediately
```typescript
const success = await firebaseOptimizationService.syncDataImmediately(
  'collectionName',
  docId,
  data,
  'cacheKey'
);
```

### Batch Sync
```typescript
const success = await firebaseOptimizationService.batchSync([
  {
    collection: 'users',
    docId: userId,
    data: profileData,
    operation: 'update'
  },
  {
    collection: 'carts',
    docId: userId,
    data: cartData,
    operation: 'set'
  }
]);
```

### Queue Operation
```typescript
firebaseOptimizationService.queueSyncOperation('updateProfile', {
  name: 'John',
  email: 'john@example.com'
});
```

## Common Patterns

### Add to Cart with Loading State
```typescript
const [loading, setLoading] = useState(false);

const handleAddToCart = async (product) => {
  setLoading(true);
  try {
    const success = await buttonHandlerService.handleAddToCart(
      userId,
      product,
      1,
      'M',
      'Black'
    );
    if (success) {
      alert('Added to cart');
    }
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={() => handleAddToCart(product)} disabled={loading}>
    {loading ? 'Adding...' : 'Add to Cart'}
  </button>
);
```

### Display Cart with Auto-Sync
```typescript
function ShoppingCart() {
  const { cart, loading, updateCart } = useOptimizedCart(userId);

  if (loading) return <div>Loading cart...</div>;

  return (
    <div>
      <h1>Cart ({cart?.items.length || 0})</h1>
      {cart?.items.map(item => (
        <div key={item.cartId}>
          <p>{item.name}</p>
          <p>₹{item.price}</p>
          <p>Qty: {item.quantity}</p>
        </div>
      ))}
      <p>Total: ₹{cart?.subtotal}</p>
    </div>
  );
}
```

### Display Points with Auto-Update
```typescript
function PointsDisplay() {
  const { points, loading } = useOptimizedPoints(userId);

  if (loading) return <div>Loading points...</div>;

  return (
    <div>
      <p>Points: {points?.points}</p>
      <p>Tier: {points?.tier}</p>
    </div>
  );
}
```

### Checkout Flow
```typescript
async function handleCheckout() {
  const orderData = {
    orderNumber: `ORD-${Date.now()}`,
    items: cart.items,
    subtotal: cart.subtotal,
    tax: calculateTax(cart.subtotal),
    shipping: 100,
    discount: discountAmount,
    total: calculateTotal(cart.subtotal, tax, 100, discountAmount),
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const success = await buttonHandlerService.handleCheckout(userId, orderData);
  
  if (success) {
    alert('Order placed successfully');
    navigate('/confirmation');
  } else {
    alert('Checkout failed');
  }
}
```

## Data Persistence

### Automatic Persistence
- All data is automatically saved to localStorage
- Data persists across page reloads
- Automatic sync to Firestore

### Manual Persistence
```typescript
// Save to cache
firebaseOptimizationService.setCachedData('key', data);

// Load from cache
const data = firebaseOptimizationService.getCachedData('key');

// Sync to Firestore
await firebaseOptimizationService.syncDataImmediately(
  'collection',
  docId,
  data,
  'cacheKey'
);
```

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const success = await buttonHandlerService.handleAddToCart(
    userId,
    product,
    quantity,
    size,
    color
  );
  if (success) {
    showSuccess('Added to cart');
  } else {
    showError('Failed to add to cart');
  }
} catch (error) {
  showError(error.message);
}
```

### With Loading State
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    const success = await buttonHandlerService.handleAddToCart(...);
    if (!success) {
      setError('Action failed');
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Performance Tips

1. Use specialized hooks when possible
2. Implement loading states
3. Show user feedback
4. Handle errors gracefully
5. Use cache for offline support
6. Batch operations when possible
7. Clean up listeners on unmount

## Troubleshooting

### Data Not Persisting
- Check localStorage is enabled
- Verify Firestore rules
- Check browser console

### Real-Time Updates Not Working
- Verify listeners are set up
- Check network connection
- Verify Firestore rules

### Buttons Not Responding
- Check user is authenticated
- Verify button handler is called
- Check browser console for errors

## Files Reference

- `services/firebaseOptimizationService.ts` - Main optimization service
- `hooks/useOptimizedFirebaseSync.ts` - React hooks
- `services/buttonHandlerService.ts` - Button handlers
- `FIREBASE-OPTIMIZATION-COMPLETE.md` - Detailed guide
- `FIREBASE-FULL-OPTIMIZATION-SUMMARY.md` - Full summary

## Status

✅ All features implemented
✅ All buttons working
✅ Real-time updates working
✅ Data persistence working
✅ Error handling implemented
✅ Performance optimized

**Ready for production!** 🚀
