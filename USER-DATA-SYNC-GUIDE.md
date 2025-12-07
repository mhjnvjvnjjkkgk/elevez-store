# User Data Sync Guide

## Problem Fixed
User management panel was showing "N/A" for names and emails because user profile data wasn't being stored in the database.

## Solution Implemented

### 1. User Profile Sync Service
Created `services/userProfileSyncService.ts` that:
- Stores user profile data in `users` collection
- Tracks total spent per user
- Tracks order count per user
- Syncs automatically when orders are created

### 2. Automatic Sync on New Orders
Updated `services/orderPersistenceService.ts` to:
- Automatically sync user profile when order is created
- Update total spent and order count
- Store firstName, lastName, email, phone

### 3. Updated User Management Panels
Both `admin-panel/users-simple.html` and `admin-panel/users-management.html` now:
- Load user data from `users` collection
- Display full names (firstName + lastName)
- Show accurate email addresses
- Display correct total spent from database
- Show proper order counts

### 4. Sync Tool for Existing Orders
Created `admin-panel/sync-user-profiles.html` to:
- Scan all existing orders
- Extract user information
- Create/update user profiles
- Calculate totals and counts

## How to Use

### For New Orders
✅ **Automatic** - User profiles are synced automatically when orders are created

### For Existing Orders
Run this once to sync all existing order data:

```bash
SYNC-USER-PROFILES.bat
```

This will:
1. Open the sync tool
2. Click "Start Sync"
3. Wait for completion
4. All user data will be stored in database

### View User Data
```bash
TEST-USERS-MANAGEMENT-NOW.bat
```

## Database Structure

### users Collection
```javascript
{
  userId: "user123",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+91 1234567890",
  totalSpent: 5000,
  orderCount: 3,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### userPoints Collection
```javascript
{
  userId: "user123",
  points: 500,
  tier: "silver",
  totalPointsEarned: 500,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### orders Collection
```javascript
{
  userId: "user123",
  orderNumber: "ORD-123",
  total: 1500,
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+91 1234567890",
    // ... other address fields
  },
  // ... other order fields
}
```

## Points Calculation

Points are automatically calculated based on total spent:
- **1 point = ₹10 spent**
- Bronze: 0-499 points
- Silver: 500-1499 points
- Gold: 1500-2999 points
- Platinum: 3000+ points

## What Shows in User Management

- **Name**: Full name from user profile (firstName + lastName)
- **Email**: Email from user profile
- **Points**: Current points balance
- **Tier**: Current loyalty tier
- **Orders**: Number of orders placed
- **Total Spent**: Total amount spent (from database)

## Troubleshooting

### Still showing N/A?
1. Run `SYNC-USER-PROFILES.bat` to sync existing orders
2. Make sure Firebase rules allow reading from `users` collection
3. Check browser console for errors

### Total Spent not accurate?
1. Run the sync tool to recalculate from orders
2. New orders will automatically update totals

### Points not showing?
1. Points are stored in `userPoints` collection
2. Check if points were awarded for orders
3. Use admin panel to manually add points if needed

## Next Steps

All future orders will automatically:
✅ Create/update user profiles
✅ Update total spent
✅ Increment order count
✅ Award loyalty points

Just run the sync tool once for existing data, and everything will work automatically going forward!
