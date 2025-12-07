# Fix Firebase Permission Denied Error

## Problem
```
Permission denied on resource project elevez-ed97f
```

This means your Firestore Security Rules are blocking access to the data.

## Solution - Update Firestore Security Rules

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project: **elevez-ed97f**
3. Click "Firestore Database" in left menu
4. Click "Rules" tab at the top

### Step 2: Update Rules
Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow read/write to orders for authenticated users
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to userPoints for authenticated users
    match /userPoints/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to users for authenticated users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to pointsTransactions for authenticated users
    match /pointsTransactions/{transactionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to discountCodes for authenticated users
    match /discountCodes/{codeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to activities for authenticated users
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to carts for authenticated users
    match /carts/{cartId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write to addresses for authenticated users
    match /addresses/{addressId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish Rules
1. Click "Publish" button
2. Wait for confirmation
3. Rules are now active

## Alternative - Open Rules (For Development Only)

**⚠️ WARNING: Only use this for development/testing!**

If you want to allow all access temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Remember to secure this before going to production!**

## After Updating Rules

1. Wait 10-30 seconds for rules to propagate
2. Refresh your admin panel
3. Users should now load

## Verify Rules Are Working

1. Open browser console (F12)
2. Refresh the users management page
3. Should see: "Found X orders" instead of "Permission denied"

## If Still Not Working

### Check Authentication
The rules require `request.auth != null`, which means you must be signed in.

**For Admin Panel:**
You might need to add authentication to the admin panel, or use more permissive rules for admin operations.

**Quick Fix for Admin Panel:**
Add this rule for admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads (for admin panel)
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

This allows anyone to read data, but only authenticated users can write.

## Production-Ready Rules

For production, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Orders - users can only read their own
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only admins should update/delete
    }
    
    // UserPoints - users can only read their own
    match /userPoints/{userId} {
      allow read: if request.auth != null && 
                     userId == request.auth.uid;
      allow write: if false; // Only system should write
    }
    
    // Users - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && 
                     userId == request.auth.uid;
      allow write: if request.auth != null && 
                      userId == request.auth.uid;
    }
    
    // Transactions - users can only read their own
    match /pointsTransactions/{transactionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only system should write
    }
  }
}
```

## Quick Fix Summary

**For immediate fix (development):**
1. Go to Firebase Console → Firestore → Rules
2. Use the "Allow all reads" rule above
3. Click Publish
4. Wait 30 seconds
5. Refresh admin panel
6. Users should load!

**For production:**
- Use the production-ready rules
- Implement proper admin authentication
- Restrict access appropriately
