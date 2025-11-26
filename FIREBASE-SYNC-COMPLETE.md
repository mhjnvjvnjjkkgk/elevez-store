# Firebase Real-Time Sync Implementation - Complete Guide

## Overview
All user data is now properly synced to Firebase with real user values. The system uses real-time listeners to keep data synchronized across all pages and devices.

## What's Synced to Firebase

### 1. User Profile
- Email (from Firebase Auth)
- Display Name (from Firebase Auth)
- Phone Number (user-provided)
- Profile Image (from Firebase Auth)
- Last Login timestamp
- Account creation date
- Active status

**Collection:** `users`
**Document ID:** User UID

### 2. User Cart
- Cart items with full details
- Subtotal calculation
- Last updated timestamp

**Collection:** `carts`
**Document ID:** User UID

### 3. User Orders
- Order number
- Items ordered
- Pricing (subtotal, tax, shipping, discount, total)
- Shipping address
- Billing address
- Order status
- Payment status
- Estimated delivery date
- Creation and update timestamps

**Collection:** `orders`
**Document ID:** Auto-generated

### 4. User Points & Loyalty
- Total points balance
- Tier level (Bronze, Silver, Gold, Platinum)
- Total points earned
- Last updated timestamp

**Collection:** `userPoints`
**Document ID:** User UID

### 5. User Activity Log
- Login events
- Purchase events
- Cart interactions
- Points redemptions
- Discount usage
- Timestamps and metadata

**Collection:** `activities`
**Document ID:** Auto-generated

### 6. Discount Usage
- Discount code used
- Discount amount applied
- Order ID associated
- Usage timestamp

**Collection:** `discounts`
**Document ID:** Auto-generated

## Services

### firebaseSyncService.ts
Main service for all Firebase sync operations.

**Key Methods:**

```typescript
// User Profile
syncUserProfile(userId, userData) - Sync user profile with real data
onUserProfileChange(userId, callback) - Real-time profile updates

// Cart
syncCart(userId, items) - Sync cart to Firebase
getCart(userId) - Get cart from Firebase
onCartChange(userId, callback) - Real-time cart updates
clearCart(userId) - Clear cart after order

// Orders
syncOrder(userId, orderData) - Sync order to Firebase
getUserOrders(userId) - Get all user orders
onOrdersChange(userId, callback) - Real-time order updates

// Points
syncUserPoints(userId, points, tier, totalPointsEarned) - Sync points
getUserPoints(userId) - Get user points
onPointsChange(userId, callback) - Real-time points updates

// Activity
logActivity(userId, type, description, metadata) - Log user activity
getUserActivity(userId, limit) - Get activity history

// Discount
syncDiscountUsage(userId, code, amount, orderId) - Log discount usage

// Dashboard
getUserDashboardData(userId) - Get all user data at once
```

## Hooks

### useFirebaseSync()
Main hook for real-time sync of all user data.

```typescript
const {
  profile,      // User profile
  cart,         // User cart
  orders,       // User orders
  points,       // User points
  recentActivity, // Recent activities
  userId,       // Current user ID
  loading,      // Loading state
  error,        // Error message
  syncCart,     // Function to sync cart
  syncOrder,    // Function to sync order
  logActivity,  // Function to log activity
  syncPoints,   // Function to sync points
  clearCart     // Function to clear cart
} = useFirebaseSync();
```

### useUserSync(userId)
Hook for syncing user profile only.

```typescript
const { profile, loading, error } = useUserSync(userId);
```

### useCartSync(userId)
Hook for syncing user cart.

```typescript
const { cart, loading, syncCart } = useCartSync(userId);
```

### usePointsSync(userId)
Hook for syncing user points.

```typescript
const { points, loading, syncPoints } = usePointsSync(userId);
```

### useOrdersSync(userId)
Hook for syncing user orders.

```typescript
const { orders, loading, syncOrder } = useOrdersSync(userId);
```

## Checkout Flow with Firebase Sync

1. **User Initiates Checkout**
   - Cart is synced to Firebase
   - User profile is verified

2. **Shipping Information**
   - Address is validated
   - Shipping method is selected

3. **Payment Processing**
   - Order is created with real user data
   - Order is synced to Firebase
   - Points are calculated and synced
   - Discount usage is logged
   - Activity is recorded
   - Cart is cleared

4. **Confirmation**
   - Order confirmation is displayed
   - Real-time updates are available

## Real User Data Integration

### Authentication
- User email from Firebase Auth
- User display name from Firebase Auth
- User UID for all operations

### Order Data
- Real shipping address from user input
- Real billing address from user input
- Real cart items with quantities and prices
- Real calculated totals (subtotal, tax, shipping, discount)

### Points System
- Real points earned based on order total
- Real tier calculation based on total points
- Real transaction history

### Activity Tracking
- Real login timestamps
- Real purchase records
- Real discount usage
- Real points redemptions

## Real-Time Updates

All data is updated in real-time across all pages:

```typescript
// Profile updates instantly when user info changes
const unsubscribe = firebaseSyncService.onUserProfileChange(userId, (profile) => {
  // Update UI with new profile data
});

// Cart updates instantly when items are added/removed
const unsubscribe = firebaseSyncService.onCartChange(userId, (cart) => {
  // Update UI with new cart data
});

// Points update instantly when earned or redeemed
const unsubscribe = firebaseSyncService.onPointsChange(userId, (points) => {
  // Update UI with new points data
});

// Orders update instantly when new orders are placed
const unsubscribe = firebaseSyncService.onOrdersChange(userId, (orders) => {
  // Update UI with new orders
});
```

## Usage Examples

### Syncing Cart
```typescript
import { firebaseSyncService } from '../services/firebaseSyncService';

// Sync cart items
await firebaseSyncService.syncCart(userId, cartItems);

// Get cart
const cart = await firebaseSyncService.getCart(userId);
```

### Creating and Syncing Order
```typescript
// Create order
const orderResult = await createOrder(
  userId,
  cartItems,
  shippingAddress,
  billingAddress,
  shippingMethod,
  discountAmount
);

// Sync to Firebase
const syncResult = await firebaseSyncService.syncOrder(userId, {
  orderNumber,
  items: cartItems,
  subtotal,
  tax,
  shipping: shippingMethod.cost,
  discount: discountAmount,
  total,
  status: 'pending',
  paymentStatus: 'pending',
  shippingAddress,
  updatedAt: new Date().toISOString(),
});
```

### Syncing Points
```typescript
// Add points from purchase
await userPointsService.addPointsFromPurchase(userId, total, orderId, 1);

// Get updated points
const userPoints = await userPointsService.getUserPoints(userId);

// Sync to Firebase
await firebaseSyncService.syncUserPoints(
  userId,
  userPoints.totalPoints,
  userPoints.tier,
  userPoints.totalPoints
);
```

### Logging Activity
```typescript
await firebaseSyncService.logActivity(
  userId,
  'purchase',
  `Completed purchase: ${orderNumber}`,
  {
    orderNumber,
    total,
    itemCount: cartItems.length,
  }
);
```

### Using Hooks in Components
```typescript
import { useFirebaseSync } from '../hooks/useFirebaseSync';

function Dashboard() {
  const {
    profile,
    cart,
    orders,
    points,
    recentActivity,
    loading,
    userId
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

## Firebase Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only user can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Carts collection - only user can read/write their own cart
    match /carts/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Orders collection - only user can read their own orders
    match /orders/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // User Points - only user can read their own points
    match /userPoints/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Activities - only user can read their own activities
    match /activities/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Discounts - only user can read their own discount usage
    match /discounts/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Data Flow Diagram

```
User Action
    ↓
Component (CheckoutPage, etc.)
    ↓
Service (checkoutService, userPointsService, etc.)
    ↓
firebaseSyncService
    ↓
Firebase Firestore
    ↓
Real-time Listeners
    ↓
Hooks (useFirebaseSync, etc.)
    ↓
Components (Dashboard, etc.)
```

## Verification

To verify Firebase sync is working:

1. **Check Firestore Console**
   - Go to Firebase Console
   - Navigate to Firestore Database
   - Check collections: users, carts, orders, userPoints, activities, discounts

2. **Check Real-Time Updates**
   - Open app in multiple tabs
   - Make changes in one tab
   - Verify updates appear in other tabs instantly

3. **Check Activity Logs**
   - View activities collection
   - Verify login, purchase, and redemption events are logged

4. **Check Order Data**
   - Place test order
   - Verify order appears in orders collection with all real data
   - Verify points are synced
   - Verify discount usage is logged

## Troubleshooting

### Data Not Syncing
1. Check Firebase configuration in `.env`
2. Verify user is authenticated
3. Check browser console for errors
4. Verify Firestore security rules allow access

### Real-Time Updates Not Working
1. Verify listeners are set up correctly
2. Check network connection
3. Verify Firestore rules allow read access
4. Check browser console for listener errors

### Points Not Updating
1. Verify userPointsService is called before firebaseSyncService
2. Check that user UID is correct
3. Verify Firestore has userPoints collection
4. Check security rules for userPoints collection

## Performance Optimization

- Real-time listeners are set up only when needed
- Listeners are cleaned up when components unmount
- Data is cached locally to reduce Firestore reads
- Batch operations are used where possible
- Indexes are created for frequently queried fields

## Next Steps

1. Deploy to production
2. Monitor Firestore usage and costs
3. Set up Firestore backups
4. Implement data retention policies
5. Add analytics to track user behavior
