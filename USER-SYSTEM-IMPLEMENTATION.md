# User System Implementation Plan

## ✅ Phase 1: Exit Intent Email Storage (COMPLETE)
- Updated ExitIntentPopup.tsx to save emails to Firebase
- Stores: email, source, discountCode, totalPoints, tier, createdAt, subscribed

## 🔄 Phase 2: User Authentication Integration (IN PROGRESS)
### Tasks:
1. Create `ensureUserExists()` function in loyaltyService
2. Call this function whenever a user logs in or places an order
3. Store user data: email, name, uid, phone, totalPoints, tier, createdAt, lastLogin

## 📋 Phase 3: Admin Panel User Management
### Tasks:
1. Update admin panel to fetch all users from Firebase
2. Display users in a table with: email, points, tier, orders, lastLogin
3. Add "Edit Points" button for each user
4. Create modal to manually adjust user points
5. Sync changes back to Firebase in real-time

## 🎯 Phase 4: Rewards Page Dynamic Data
### Tasks:
1. Update RewardsPage hero section to fetch real user data
2. Replace hardcoded "100" with actual user points
3. Show real tier information
4. Display actual points earned from orders

## 💰 Phase 5: Order Points Integration
### Tasks:
1. Update order completion to calculate and award points
2. Points = (orderTotal / 10) * tierMultiplier
3. Save points transaction to Firebase
4. Update user's totalPoints
5. Show points earned in order confirmation

## 📊 Data Structure

### Users Collection
```typescript
{
  uid: string,
  email: string,
  name?: string,
  phone?: string,
  totalPoints: number,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  orderCount: number,
  totalSpent: number,
  createdAt: timestamp,
  lastLogin: timestamp,
  source: 'exit-intent' | 'signup' | 'order'
}
```

### Points Transactions Collection
```typescript
{
  userId: string,
  type: 'earn' | 'redeem' | 'admin-adjustment',
  points: number,
  reason: string,
  orderId?: string,
  timestamp: timestamp,
  adminNote?: string
}
```

## Implementation Order
1. ✅ Exit intent email storage
2. Create user management service
3. Update admin panel UI
4. Connect rewards page to real data
5. Integrate order points system
