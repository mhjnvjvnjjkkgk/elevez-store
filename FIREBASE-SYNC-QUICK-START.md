# Firebase Real-Time Sync - Quick Start Guide

## Overview
All user data is now automatically synced to Firebase with real user values. The system uses real-time listeners to keep data synchronized across all pages and devices.

## What Gets Synced

✅ **User Profile** - Email, name, phone, profile image, login timestamps
✅ **Shopping Cart** - Items, quantities, subtotals
✅ **Orders** - Complete order details with real user data
✅ **Loyalty Points** - Balance, tier, transaction history
✅ **Activity Logs** - Logins, purchases, redemptions
✅ **Discount Usage** - Codes applied, amounts, order references

## Using in Components

### Get All User Data
```typescript
import { useFirebaseSync } from '../hooks/useFirebaseSync';

function Dashboard() {
  const {
    profile,      // User profile
    cart,         // Shopping cart
    orders,       // User orders
    points,       // Loyalty points
    recentActivity, // Recent activities
    userId,       // Current user ID
    loading,      // Loading state
    error         // Error message
  } = useFirebaseSync();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {profile?.displayName}</h1>
      <p>Points: {points?.points}</p>
      <p>Tier: {points?.tier}</p>
      <p>Orders: {orders.length}</p>
    </div>
  );
}
```

### Get Specific Data
```typescript
import { useUserSync, useCartSync, usePointsSync, useOrdersSync } from '../hooks/useFirebaseSync';

// Profile only
const { profile, loading } = useUserSync(userId);

// Cart only
const { cart, loading, syncCart } = useCartSync(userId);

// Points only
const { points, loading, syncPoints } = usePointsSync(userId);

// Orders only
const { orders, loading, syncOrder } = useOrdersSync(userId);
```

## Manual Sync Operations

### Sync Cart
```typescript
import { firebaseSyncService } from '../services/firebaseSyncService';

await firebaseSyncService.syncCart(userId, cartItems);
```

### Sync Order
```typescript
await firebaseSyncService.syncOrder(userId, {
  orderNumber: 'ORD-123456',
  items: cartItems,
  subtotal: 5000,
  tax: 900,
  shipping: 100,
  discount: 500,
  total: 5500,
  status: 'pending',
  paymentStatus: 'pending',
  shippingAddress: addressData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Sync Points
```typescript
await firebaseSyncService.syncUserPoints(
  userId,
  5500,        // Current points
  'Gold',      // Tier
  15500        // Total points earned
);
```

### Log Activity
```typescript
await firebaseSyncService.logActivity(
  userId,
  'purchase',
  'Completed purchase: ORD-123456',
  {
    orderNumber: 'ORD-123456',
    total: 5500,
    itemCount: 3
  }
);
```

## Real-Time Listeners

### Listen to Profile Changes
```typescript
const unsubscribe = firebaseSyncService.onUserProfileChange(userId, (profile) => {
  console.log('Profile updated:', profile);
});

// Clean up when done
unsubscribe();
```

### Listen to Cart Changes
```typescript
const unsubscribe = firebaseSyncService.onCartChange(userId, (cart) => {
  console.log('Cart updated:', cart);
});
```

### Listen to Points Changes
```typescript
const unsubscribe = firebaseSyncService.onPointsChange(userId, (points) => {
  console.log('Points updated:', points);
});
```

### Listen to Orders Changes
```typescript
const unsubscribe = firebaseSyncService.onOrdersChange(userId, (orders) => {
  console.log('Orders updated:', orders);
});
```

## Checkout Flow

The checkout process automatically:

1. **Creates Order** with real user data
2. **Syncs to Firebase** immediately
3. **Calculates Points** based on order total
4. **Syncs Points** to Firebase
5. **Logs Discount Usage** if applied
6. **Records Activity** for the purchase
7. **Clears Cart** after successful order

No additional code needed - it's all handled in `CheckoutPage.tsx`!

## Data Structure

### User Profile
```typescript
{
  userId: string
  email: string
  displayName: string
  phoneNumber?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
  lastLogin: string
  isActive: boolean
}
```

### Order
```typescript
{
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  shippingAddress: Address
  createdAt: string
  updatedAt: string
}
```

### Points
```typescript
{
  userId: string
  points: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  totalPointsEarned: number
  updatedAt: string
}
```

### Activity
```typescript
{
  userId: string
  type: 'login' | 'purchase' | 'view' | 'add_to_cart' | 'remove_from_cart' | 'redeem_points' | 'claim_reward'
  description: string
  metadata?: any
  timestamp: string
}
```

## Common Tasks

### Display User's Orders
```typescript
const { orders, loading } = useOrdersSync(userId);

return (
  <div>
    {loading ? (
      <p>Loading orders...</p>
    ) : (
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.orderNumber} - ₹{order.total}
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

### Display User's Points
```typescript
const { points, loading } = usePointsSync(userId);

return (
  <div>
    {loading ? (
      <p>Loading points...</p>
    ) : (
      <div>
        <p>Points: {points?.points}</p>
        <p>Tier: {points?.tier}</p>
      </div>
    )}
  </div>
);
```

### Display Cart
```typescript
const { cart, loading } = useCartSync(userId);

return (
  <div>
    {loading ? (
      <p>Loading cart...</p>
    ) : (
      <div>
        <p>Items: {cart?.items.length}</p>
        <p>Subtotal: ₹{cart?.subtotal}</p>
      </div>
    )}
  </div>
);
```

## Troubleshooting

### Data Not Appearing
1. Check Firebase configuration in `.env`
2. Verify user is logged in
3. Check browser console for errors
4. Verify Firestore security rules

### Real-Time Updates Not Working
1. Check network connection
2. Verify listeners are set up
3. Check Firestore rules allow read access
4. Check browser console for errors

### Points Not Syncing
1. Verify order was created successfully
2. Check that userPointsService was called
3. Verify user UID is correct
4. Check Firestore userPoints collection

## Performance Tips

- Use specific hooks (useCartSync, usePointsSync) instead of useFirebaseSync when you only need one data type
- Clean up listeners when components unmount (hooks do this automatically)
- Avoid setting up multiple listeners for the same data
- Use real-time listeners only when you need live updates

## Security

All data is protected by Firestore security rules:
- Users can only read/write their own data
- Orders can only be created by authenticated users
- Points can only be modified by the user or admin
- Activities are logged automatically

## Files

- `services/firebaseSyncService.ts` - Main sync service
- `hooks/useFirebaseSync.ts` - React hooks for sync
- `components/CheckoutPage.tsx` - Checkout with sync
- `FIREBASE-SYNC-COMPLETE.md` - Detailed documentation
- `FIREBASE-SYNC-IMPLEMENTATION-SUMMARY.md` - Implementation details

## Next Steps

1. Test the checkout flow
2. Verify data appears in Firestore
3. Check real-time updates work
4. Monitor Firestore usage
5. Set up backups
6. Implement data retention policies
