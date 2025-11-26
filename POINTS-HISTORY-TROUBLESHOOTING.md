# Points History System - Troubleshooting Guide

**Date**: November 25, 2025
**Purpose**: Common issues and solutions

---

## 🔍 TROUBLESHOOTING BY SYMPTOM

### Issue 1: Points Not Displaying

**Symptom**: User points display shows "No points history found"

**Possible Causes**:
1. User not logged in
2. Firebase not initialized
3. Firestore rules blocking access
4. No points data in database

**Solutions**:

```typescript
// 1. Check if user is logged in
const { user } = useAuth();
console.log('User:', user?.uid);

// 2. Verify Firebase initialization
import { db } from '../firebaseConfig';
console.log('Firebase initialized:', !!db);

// 3. Check Firestore rules
// Go to Firebase Console > Firestore > Rules
// Verify user can read their own data

// 4. Check if data exists
// Go to Firebase Console > Firestore > Data
// Look for users/{userId}/pointsHistory
```

**Verification Steps**:
- [ ] User is logged in
- [ ] Firebase is initialized
- [ ] Firestore rules allow read access
- [ ] Data exists in Firestore
- [ ] No console errors

---

### Issue 2: Real-time Updates Not Working

**Symptom**: Points don't update when order is placed

**Possible Causes**:
1. orderPointsIntegration not initialized
2. Order status not set to 'completed'
3. Firebase subscription not working
4. Firestore rules blocking writes

**Solutions**:

```typescript
// 1. Verify initialization
import { orderPointsIntegration } from './services/orderPointsIntegrationService';

useEffect(() => {
  console.log('Initializing order points integration...');
  orderPointsIntegration.initialize();
  return () => orderPointsIntegration.cleanup();
}, []);

// 2. Check order status
// Verify order.status === 'completed' or 'paid'
console.log('Order status:', order.status);

// 3. Check subscription
const unsubscribe = pointsHistoryManager.subscribeToUserPoints(
  userId,
  (history) => {
    console.log('Points updated:', history.currentBalance);
  }
);

// 4. Check Firestore rules
// Verify admin can write to pointsTransactions
```

**Verification Steps**:
- [ ] orderPointsIntegration.initialize() called
- [ ] Order status is 'completed' or 'paid'
- [ ] Subscription callback is triggered
- [ ] Firestore rules allow writes
- [ ] No console errors

---

### Issue 3: Admin Dashboard Not Loading

**Symptom**: Admin dashboard shows error or blank screen

**Possible Causes**:
1. AdminPointsHistoryPanel not imported
2. Admin user not authenticated
3. Firebase rules blocking admin access
4. Component has errors

**Solutions**:

```typescript
// 1. Verify import
import { AdminPointsHistoryPanel } from './AdminPointsHistoryPanel';

// 2. Check admin authentication
const { user } = useAuth();
console.log('Admin user:', user?.uid);
console.log('Is admin:', user?.email?.includes('admin'));

// 3. Check Firestore rules
// Verify admin can read all users' data

// 4. Check component errors
// Open browser console
// Look for error messages
```

**Verification Steps**:
- [ ] AdminPointsHistoryPanel is imported
- [ ] Admin user is authenticated
- [ ] Firestore rules allow admin access
- [ ] No console errors
- [ ] Component renders

---

### Issue 4: Points Not Auto-Awarding

**Symptom**: Orders complete but points not awarded

**Possible Causes**:
1. orderPointsIntegration not initialized
2. Order listener not working
3. Points already awarded
4. Firebase rules blocking writes

**Solutions**:

```typescript
// 1. Verify initialization
console.log('Order integration initialized');

// 2. Check order listener
// Monitor Firestore for order changes
// Verify listener is triggered

// 3. Check if points already awarded
const history = await pointsHistoryManager.getUserPointsHistory(userId);
console.log('Current balance:', history.currentBalance);

// 4. Manually award points
await pointsHistoryManager.recordPurchasePoints(
  userId,
  orderId,
  amount,
  { productName: 'Test' }
);
```

**Verification Steps**:
- [ ] orderPointsIntegration initialized
- [ ] Order listener working
- [ ] Points not already awarded
- [ ] Firestore rules allow writes
- [ ] Manual award works

---

### Issue 5: Admin Adjustments Not Working

**Symptom**: Admin clicks "Save" but points don't update

**Possible Causes**:
1. Admin not authenticated
2. Firestore rules blocking writes
3. Form validation failing
4. Firebase error

**Solutions**:

```typescript
// 1. Check admin authentication
const { user } = useAuth();
if (!user) {
  console.error('User not authenticated');
  return;
}

// 2. Check form validation
if (!editAmount || !editReason) {
  console.error('Form validation failed');
  return;
}

// 3. Check Firebase rules
// Verify admin can write to pointsTransactions

// 4. Check for errors
try {
  await pointsHistoryManager.recordAdminAdjustment(
    userId,
    parseInt(editAmount),
    editReason,
    adminId
  );
} catch (error) {
  console.error('Error adjusting points:', error);
}
```

**Verification Steps**:
- [ ] Admin is authenticated
- [ ] Form fields are filled
- [ ] Firestore rules allow writes
- [ ] No console errors
- [ ] Points updated in database

---

### Issue 6: Data Export Not Working

**Symptom**: Export button doesn't download file

**Possible Causes**:
1. No data to export
2. Browser blocking download
3. JavaScript error
4. File too large

**Solutions**:

```typescript
// 1. Check if data exists
console.log('Users history:', usersHistory.length);

// 2. Check browser console for errors
// Look for download-related errors

// 3. Try manual export
const dataStr = JSON.stringify(usersHistory, null, 2);
console.log('Export data:', dataStr);

// 4. Check file size
const size = new Blob([dataStr]).size;
console.log('File size:', size, 'bytes');
```

**Verification Steps**:
- [ ] Data exists
- [ ] No browser errors
- [ ] File size reasonable
- [ ] Download works
- [ ] File contains correct data

---

### Issue 7: Mobile Display Issues

**Symptom**: Points display looks broken on mobile

**Possible Causes**:
1. CSS not responsive
2. Text too large
3. Layout broken
4. Touch interactions not working

**Solutions**:

```typescript
// 1. Check responsive CSS
// Verify media queries in component

// 2. Check text size
// Ensure text is readable on mobile

// 3. Check layout
// Verify grid/flex layout works on mobile

// 4. Test touch interactions
// Tap buttons to verify they work
```

**Verification Steps**:
- [ ] Display looks good on mobile
- [ ] Text is readable
- [ ] Layout is correct
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

### Issue 8: Performance Issues

**Symptom**: Points display is slow or laggy

**Possible Causes**:
1. Too many transactions
2. Inefficient queries
3. Large data set
4. Memory leak

**Solutions**:

```typescript
// 1. Check transaction count
const history = await pointsHistoryManager.getUserPointsHistory(userId);
console.log('Transactions:', history.transactions.length);

// 2. Check query performance
const start = performance.now();
await pointsHistoryManager.getUserPointsHistory(userId);
const end = performance.now();
console.log('Query time:', end - start, 'ms');

// 3. Check memory usage
// Open DevTools > Memory
// Take heap snapshot
// Look for memory leaks

// 4. Optimize queries
// Use date range filtering
// Implement pagination
```

**Verification Steps**:
- [ ] Query time < 500ms
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] No lag on interactions
- [ ] Performance acceptable

---

### Issue 9: Firebase Connection Issues

**Symptom**: "Firebase not initialized" or connection errors

**Possible Causes**:
1. Firebase config missing
2. Firebase not initialized
3. Network issues
4. Firebase service down

**Solutions**:

```typescript
// 1. Check Firebase config
import { firebaseConfig } from '../firebaseConfig';
console.log('Firebase config:', firebaseConfig);

// 2. Check Firebase initialization
import { db } from '../firebaseConfig';
console.log('Firestore:', db);

// 3. Check network
// Open DevTools > Network
// Look for failed requests

// 4. Check Firebase status
// Visit https://status.firebase.google.com/
```

**Verification Steps**:
- [ ] Firebase config exists
- [ ] Firebase initialized
- [ ] Network connection working
- [ ] Firebase service up
- [ ] No connection errors

---

### Issue 10: Tier Calculation Issues

**Symptom**: Tier shows incorrect value

**Possible Causes**:
1. Points balance incorrect
2. Tier calculation wrong
3. Stale data
4. Rounding error

**Solutions**:

```typescript
// 1. Check points balance
const history = await pointsHistoryManager.getUserPointsHistory(userId);
console.log('Current balance:', history.currentBalance);

// 2. Check tier calculation
// Bronze: 0-999
// Silver: 1000-1999
// Gold: 2000-4999
// Platinum: 5000+
console.log('Expected tier:', getTierForPoints(history.currentBalance));

// 3. Refresh data
await pointsHistoryManager.getUserPointsHistory(userId);

// 4. Check for rounding errors
console.log('Balance type:', typeof history.currentBalance);
```

**Verification Steps**:
- [ ] Points balance correct
- [ ] Tier calculation correct
- [ ] Data refreshed
- [ ] No rounding errors
- [ ] Tier displays correctly

---

## 🛠️ DEBUGGING TOOLS

### Browser Console
```javascript
// Check Firebase connection
console.log('Firebase:', firebase);

// Check user authentication
console.log('Current user:', auth.currentUser);

// Check Firestore data
console.log('Firestore:', db);

// Monitor real-time updates
pointsHistoryManager.subscribeToUserPoints(userId, (history) => {
  console.log('Points updated:', history);
});
```

### Firebase Console
1. Go to Firebase Console
2. Select your project
3. Go to Firestore Database
4. Check collections and data
5. Review security rules
6. Check error logs

### DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Check Network tab
5. Monitor Performance
6. Check Memory

---

## 📞 GETTING HELP

### Check Documentation
1. POINTS-HISTORY-QUICK-REFERENCE.md
2. POINTS-HISTORY-INTEGRATION-GUIDE.md
3. POINTS-HISTORY-SYSTEM-COMPLETE.md

### Check Code
1. Review component source
2. Check service implementations
3. Review hook implementations
4. Check error handling

### Check Logs
1. Browser console
2. Firebase console
3. Server logs
4. Error tracking service

---

## ✅ TROUBLESHOOTING CHECKLIST

- [ ] Checked browser console for errors
- [ ] Verified Firebase initialization
- [ ] Checked Firestore rules
- [ ] Verified data exists
- [ ] Checked network connection
- [ ] Verified user authentication
- [ ] Checked component props
- [ ] Reviewed documentation
- [ ] Tried manual testing
- [ ] Checked Firebase status

---

## 🚀 COMMON SOLUTIONS

### Solution 1: Clear Cache
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Solution 2: Restart Services
```bash
# Restart development server
npm run dev

# Restart Firebase emulator
firebase emulators:start
```

### Solution 3: Reinitialize Firebase
```typescript
// In App.tsx
useEffect(() => {
  orderPointsIntegration.cleanup();
  orderPointsIntegration.initialize();
}, []);
```

### Solution 4: Check Firestore Rules
```
// Allow users to read their own data
match /users/{userId}/pointsHistory {
  allow read: if request.auth.uid == userId;
}

// Allow admins to read all data
match /users/{userId}/pointsHistory {
  allow read: if isAdmin();
}
```

---

**Troubleshooting Complete!** ✅

If you still have issues, check the documentation or contact support.
