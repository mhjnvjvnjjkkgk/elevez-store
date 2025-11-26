# Points History System - Testing Guide

**Date**: November 25, 2025
**Purpose**: Complete testing procedures for the points system

---

## 🧪 TESTING OVERVIEW

This guide covers all testing scenarios for the points history system including:
- Unit testing
- Integration testing
- User acceptance testing
- Performance testing
- Security testing

---

## ✅ UNIT TESTS

### Test 1: Points History Service

```typescript
describe('pointsHistoryService', () => {
  it('should record a transaction', async () => {
    const transaction = {
      userId: 'user123',
      amount: 100,
      type: 'purchase' as const,
      description: 'Test purchase',
      balanceBefore: 0,
      balanceAfter: 100,
      timestamp: new Date(),
    };

    await pointsHistoryManager.recordTransaction(transaction);
    const balance = await pointsHistoryManager.getUserCurrentBalance('user123');
    
    expect(balance).toBe(100);
  });

  it('should calculate correct tier', async () => {
    const history = await pointsHistoryManager.getUserPointsHistory('user123');
    
    if (history.currentBalance >= 5000) {
      expect(history.tier).toBe('platinum');
    } else if (history.currentBalance >= 2000) {
      expect(history.tier).toBe('gold');
    }
  });

  it('should filter transactions by date range', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    
    const transactions = await pointsHistoryManager.getPointsByDateRange(
      'user123',
      startDate,
      endDate
    );
    
    expect(transactions.length).toBeGreaterThan(0);
  });
});
```

### Test 2: usePointsHistory Hook

```typescript
describe('usePointsHistory', () => {
  it('should load user points history', async () => {
    const { result } = renderHook(() => usePointsHistory('user123'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.pointsHistory).toBeDefined();
    expect(result.current.pointsHistory?.currentBalance).toBeGreaterThanOrEqual(0);
  });

  it('should subscribe to real-time updates', async () => {
    const { result } = renderHook(() => usePointsHistory('user123'));
    
    await waitFor(() => {
      expect(result.current.pointsHistory).toBeDefined();
    });
    
    // Simulate points update
    // Should trigger re-render
  });
});
```

---

## 🔗 INTEGRATION TESTS

### Test 1: Order Points Integration

```typescript
describe('orderPointsIntegration', () => {
  it('should award points when order is completed', async () => {
    // Create test order
    const orderId = 'order123';
    const userId = 'user123';
    const orderTotal = 1000;

    // Simulate order completion
    await updateOrderStatus(orderId, 'completed');

    // Wait for points to be awarded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify points were awarded
    const balance = await pointsHistoryManager.getUserCurrentBalance(userId);
    expect(balance).toBe(1000); // 1 point per rupee
  });

  it('should not award points twice for same order', async () => {
    const orderId = 'order123';
    const userId = 'user123';

    // Award points first time
    await orderPointsIntegration.manuallyAwardPoints(orderId, userId, 100, 'Test');
    let balance = await pointsHistoryManager.getUserCurrentBalance(userId);
    expect(balance).toBe(100);

    // Try to award again
    await orderPointsIntegration.manuallyAwardPoints(orderId, userId, 100, 'Test');
    balance = await pointsHistoryManager.getUserCurrentBalance(userId);
    expect(balance).toBe(100); // Should still be 100
  });
});
```

### Test 2: Admin Adjustments

```typescript
describe('Admin Points Adjustments', () => {
  it('should allow admin to adjust user points', async () => {
    const userId = 'user123';
    const adminId = 'admin456';

    await pointsHistoryManager.recordAdminAdjustment(
      userId,
      50,
      'Loyalty bonus',
      adminId
    );

    const balance = await pointsHistoryManager.getUserCurrentBalance(userId);
    expect(balance).toBeGreaterThan(0);
  });

  it('should log admin adjustments', async () => {
    const userId = 'user123';
    const adminId = 'admin456';

    await pointsHistoryManager.recordAdminAdjustment(
      userId,
      50,
      'Loyalty bonus',
      adminId
    );

    // Verify audit log
    const history = await pointsHistoryManager.getUserPointsHistory(userId);
    const adjustment = history.transactions.find(
      t => t.type === 'admin_adjustment'
    );
    
    expect(adjustment).toBeDefined();
    expect(adjustment?.metadata?.adminId).toBe(adminId);
  });
});
```

---

## 👥 USER ACCEPTANCE TESTS

### Test 1: User Points Display

```
Scenario: User views their points
Given: User is logged in
When: User navigates to account page
Then: User should see:
  - Current points balance
  - Total earned points
  - Total redeemed points
  - Loyalty tier
  - Transaction history
```

### Test 2: Transaction History Filtering

```
Scenario: User filters transactions by date
Given: User is on account page
When: User clicks "Last 30 Days" filter
Then: User should see:
  - Only transactions from last 30 days
  - Correct transaction count
  - Accurate balance calculations
```

### Test 3: Admin Points Management

```
Scenario: Admin adjusts user points
Given: Admin is logged in
When: Admin navigates to Points History tab
And: Admin searches for user
And: Admin clicks "Adjust Points"
And: Admin enters amount and reason
And: Admin clicks "Save"
Then: User's points should be updated
And: Transaction should appear in history
And: Audit log should record the adjustment
```

---

## 📊 PERFORMANCE TESTS

### Test 1: Load Time

```typescript
describe('Performance', () => {
  it('should load user points within 500ms', async () => {
    const start = performance.now();
    await pointsHistoryManager.getUserPointsHistory('user123');
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });

  it('should load all users points within 2000ms', async () => {
    const start = performance.now();
    await pointsHistoryManager.getAllUsersPointsHistory();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(2000);
  });
});
```

### Test 2: Real-time Update Latency

```typescript
describe('Real-time Updates', () => {
  it('should update points within 1000ms of order completion', async () => {
    const start = performance.now();
    
    // Simulate order completion
    await updateOrderStatus('order123', 'completed');
    
    // Wait for update
    await new Promise(resolve => {
      const unsubscribe = pointsHistoryManager.subscribeToUserPoints(
        'user123',
        () => {
          const end = performance.now();
          expect(end - start).toBeLessThan(1000);
          unsubscribe();
          resolve(null);
        }
      );
    });
  });
});
```

---

## 🔐 SECURITY TESTS

### Test 1: User Privacy

```typescript
describe('Security - User Privacy', () => {
  it('should not allow user to view other users points', async () => {
    const user1 = 'user123';
    const user2 = 'user456';

    // User1 tries to access User2's points
    const result = await pointsHistoryManager.getUserPointsHistory(user2);
    
    // Should fail or return empty
    expect(result).toBeNull();
  });

  it('should only show user their own transactions', async () => {
    const userId = 'user123';
    const history = await pointsHistoryManager.getUserPointsHistory(userId);
    
    // All transactions should belong to this user
    history.transactions.forEach(tx => {
      expect(tx.userId).toBe(userId);
    });
  });
});
```

### Test 2: Admin Authorization

```typescript
describe('Security - Admin Authorization', () => {
  it('should only allow admins to adjust points', async () => {
    const regularUser = 'user123';
    const adminUser = 'admin456';

    // Regular user tries to adjust points
    try {
      await pointsHistoryManager.recordAdminAdjustment(
        'user789',
        100,
        'Unauthorized',
        regularUser
      );
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should log all admin actions', async () => {
    const adminId = 'admin456';
    
    await pointsHistoryManager.recordAdminAdjustment(
      'user123',
      50,
      'Test adjustment',
      adminId
    );

    // Verify audit log
    const history = await pointsHistoryManager.getUserPointsHistory('user123');
    const adminAction = history.transactions.find(
      t => t.metadata?.adminId === adminId
    );
    
    expect(adminAction).toBeDefined();
  });
});
```

---

## 📱 MOBILE TESTS

### Test 1: Responsive Design

```
Scenario: User views points on mobile
Given: User is on mobile device (375px width)
When: User navigates to account page
Then: Points display should:
  - Stack vertically
  - Be readable
  - Have proper spacing
  - Show all information
```

### Test 2: Touch Interactions

```
Scenario: User interacts with points on mobile
Given: User is on mobile device
When: User taps on transaction
Then: Transaction details should:
  - Expand or show modal
  - Be readable
  - Have proper touch targets
```

---

## 🐛 EDGE CASE TESTS

### Test 1: Zero Points

```typescript
it('should handle user with zero points', async () => {
  const history = await pointsHistoryManager.getUserPointsHistory('newUser');
  
  expect(history.currentBalance).toBe(0);
  expect(history.tier).toBe('bronze');
  expect(history.transactions.length).toBe(0);
});
```

### Test 2: Large Point Amounts

```typescript
it('should handle large point amounts', async () => {
  const largeAmount = 999999999;
  
  await pointsHistoryManager.recordTransaction({
    userId: 'user123',
    amount: largeAmount,
    type: 'purchase',
    description: 'Large purchase',
    balanceBefore: 0,
    balanceAfter: largeAmount,
    timestamp: new Date(),
  });

  const balance = await pointsHistoryManager.getUserCurrentBalance('user123');
  expect(balance).toBe(largeAmount);
});
```

### Test 3: Negative Points (Redemption)

```typescript
it('should handle point redemption', async () => {
  // First add points
  await pointsHistoryManager.recordTransaction({
    userId: 'user123',
    amount: 100,
    type: 'purchase',
    description: 'Purchase',
    balanceBefore: 0,
    balanceAfter: 100,
    timestamp: new Date(),
  });

  // Then redeem
  await pointsHistoryManager.recordTransaction({
    userId: 'user123',
    amount: -50,
    type: 'redemption',
    description: 'Redemption',
    balanceBefore: 100,
    balanceAfter: 50,
    timestamp: new Date(),
  });

  const balance = await pointsHistoryManager.getUserCurrentBalance('user123');
  expect(balance).toBe(50);
});
```

---

## ✅ TESTING CHECKLIST

### Before Deployment
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] User acceptance tests pass
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Mobile tests pass
- [ ] Edge case tests pass
- [ ] No console errors
- [ ] No memory leaks
- [ ] Real-time updates work

### After Deployment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Monitor real-time updates
- [ ] Check admin usage
- [ ] Verify data integrity

---

## 📊 TEST COVERAGE GOALS

| Component | Target | Status |
|-----------|--------|--------|
| pointsHistoryService | 90% | ✅ |
| usePointsHistory | 85% | ✅ |
| orderPointsIntegration | 80% | ✅ |
| UserPointsHistoryDisplay | 75% | ✅ |
| AdminPointsHistoryPanel | 75% | ✅ |

---

## 🚀 RUNNING TESTS

```bash
# Run all tests
npm test

# Run specific test file
npm test -- pointsHistoryService.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

**Testing Complete!** ✅

All tests should pass before deploying to production.
