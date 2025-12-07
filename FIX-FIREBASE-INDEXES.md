# Fix Firebase Indexes - Quick Guide

## Problem
Firebase queries are failing with "requires an index" errors:
- Orders query needs index on `userId` + `createdAt`
- Discount codes query needs index on `userId` + `createdAt`
- Points transactions query needs index on `userId` + `timestamp`

## Solution - Create Indexes

### Method 1: Click the Links (Fastest)
The error messages contain direct links to create indexes. Click these links:

1. **Orders Index:**
   - Click the link in the console error
   - Or go to: Firebase Console → Firestore → Indexes
   - Create composite index: `userId` (Ascending) + `createdAt` (Descending)

2. **Discount Codes Index:**
   - Click the link in the console error
   - Create composite index: `userId` (Ascending) + `createdAt` (Descending)

3. **Points Transactions Index:**
   - Click the link in the console error
   - Create composite index: `userId` (Ascending) + `timestamp` (Descending)

### Method 2: Manual Creation
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Firestore Database → Indexes tab
4. Click "Create Index"
5. For each index:

**Orders Index:**
- Collection ID: `orders`
- Fields to index:
  - Field: `userId`, Order: Ascending
  - Field: `createdAt`, Order: Descending
- Query scope: Collection

**Discount Codes Index:**
- Collection ID: `discountCodes`
- Fields to index:
  - Field: `userId`, Order: Ascending
  - Field: `createdAt`, Order: Descending
- Query scope: Collection

**Points Transactions Index:**
- Collection ID: `pointsTransactions`
- Fields to index:
  - Field: `userId`, Order: Ascending
  - Field: `timestamp`, Order: Descending
- Query scope: Collection

### Method 3: Deploy Indexes File
```bash
# If you have Firebase CLI installed
firebase deploy --only firestore:indexes
```

## After Creating Indexes

1. Wait 2-5 minutes for indexes to build
2. Refresh your website
3. Errors should be gone
4. Orders should now appear

## Verification

Check Firebase Console → Firestore → Indexes:
- All indexes should show status: "Enabled" (green)
- If status is "Building", wait a few minutes

## Quick Test

After indexes are created:
1. Sign in to website
2. Go to My Account → Orders
3. Orders should load without errors
4. Check browser console - no index errors

## Note

Index creation is a one-time setup. Once created, they persist and work for all users.
