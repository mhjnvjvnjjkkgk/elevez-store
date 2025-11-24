# 🔧 LOYALTY SYSTEM - INTEGRATION CODE SNIPPETS

Copy and paste these code snippets to complete the integration.

---

## 1️⃣ FIREBASE SECURITY RULES

**Location:** Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Loyalty Profiles - Users can only read/write their own profile
    match /loyaltyProfiles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Points Transactions - Users can read their own, anyone can create
    match /pointsTransactions/{transactionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Discount Codes - Users can read/write their own codes
    match /discountCodes/{codeId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 2️⃣ CHECKOUT INTEGRATION

**Location:** Find your `Checkout` component in `App.tsx`

### Step 1: Add Imports (at the top of App.tsx)

```tsx
import { CheckoutDiscountSection } from './components/CheckoutDiscountSection';
import { useLoyalty } from './hooks/useLoyalty';
```

### Step 2: Add State & Hook (inside Checkout component)

```tsx
const Checkout = () => {
  const { items, cartTotal } = useCart();
  const { awardOrderPoints, markCodeAsUsed } = useLoyalty();
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; codeId: string } | null>(null);
  
  // Calculate final total with discount
  const finalTotal = cartTotal - (appliedDiscount?.amount || 0);
  
  // ... rest of your existing code
```

### Step 3: Add Discount Section (in JSX, before payment section)

```tsx
{/* Add this before your payment method selection */}
<div className="mb-6">
  <CheckoutDiscountSection
    onDiscountApplied={(amount, codeId) => setAppliedDiscount({ amount, codeId })}
    onDiscountRemoved={() => setAppliedDiscount(null)}
    appliedDiscount={appliedDiscount}
  />
</div>
```

### Step 4: Update Total Display

```tsx
{/* Replace your existing total display with this */}
<div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
  <div className="space-y-3">
    <div className="flex justify-between text-white/70">
      <span>Subtotal</span>
      <span>₹{cartTotal.toFixed(2)}</span>
    </div>
    
    {appliedDiscount && (
      <div className="flex justify-between text-green-400">
        <span>Discount</span>
        <span>-₹{appliedDiscount.amount.toFixed(2)}</span>
      </div>
    )}
    
    <div className="border-t border-white/10 pt-3">
      <div className="flex justify-between text-2xl font-bold text-white">
        <span>Total</span>
        <span>₹{finalTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>
</div>
```

### Step 5: Award Points on Order Completion

```tsx
// In your order completion handler (after successful payment)
const handleOrderComplete = async (orderId: string) => {
  try {
    // Award points for the order
    const pointsEarned = await awardOrderPoints(finalTotal, orderId);
    
    // Mark discount code as used if one was applied
    if (appliedDiscount) {
      await markCodeAsUsed(appliedDiscount.codeId);
    }
    
    // Show success message
    alert(`🎉 Order placed successfully! You earned ${pointsEarned} loyalty points!`);
    
    // Clear cart and redirect
    // ... your existing order completion code
    
  } catch (error) {
    console.error('Error processing order:', error);
    alert('Order placed but there was an issue with loyalty points. Please contact support.');
  }
};
```

---

## 3️⃣ ACCOUNT PAGE INTEGRATION

**Location:** Find your `Account` component in `App.tsx`

### Step 1: Add Import (at the top of App.tsx)

```tsx
import { AccountLoyaltySection } from './components/AccountLoyaltySection';
```

### Step 2: Add Loyalty Section (in Account component JSX)

**Option A: As a New Tab**

```tsx
const Account = ({ setCursorVariant }: any) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'rewards'>('profile');
  
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'profile' 
                ? 'bg-[#00ff88] text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'orders' 
                ? 'bg-[#00ff88] text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'rewards' 
                ? 'bg-[#00ff88] text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Rewards
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div>
            {/* Your existing profile content */}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {/* Your existing orders content */}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <AccountLoyaltySection />
          </div>
        )}
      </div>
    </div>
  );
};
```

**Option B: As a Separate Section (Simpler)**

```tsx
const Account = ({ setCursorVariant }: any) => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Your existing profile section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Profile</h2>
          {/* ... existing profile content ... */}
        </div>

        {/* Your existing orders section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Order History</h2>
          {/* ... existing orders content ... */}
        </div>

        {/* NEW: Loyalty Section */}
        <div>
          <AccountLoyaltySection />
        </div>

      </div>
    </div>
  );
};
```

---

## 4️⃣ TESTING CHECKLIST

After integration, test these scenarios:

### Test 1: New User Signup
```
1. Sign up with Google
2. Check Firebase → loyaltyProfiles collection
3. Verify user has 100 points
4. Check pointsTransactions for signup bonus
```

### Test 2: Phone Number Bonus
```
1. Go to /rewards
2. Scroll to "Claim Points" section
3. Enter phone number
4. Click "Claim Points"
5. Verify +100 points added
```

### Test 3: Social Sharing
```
1. Go to /rewards
2. Click Instagram share button
3. Verify +50 points added
4. Try clicking again - should show "Already claimed"
```

### Test 4: Order Points
```
1. Add items to cart (total ₹1000)
2. Go to checkout
3. Complete order
4. Verify points earned (100 pts for Bronze tier)
5. Check pointsTransactions
```

### Test 5: Tier Progression
```
1. Accumulate 500 points
2. Check if tier upgraded to Silver
3. Place order - verify 1.5x multiplier
```

### Test 6: Discount Redemption
```
1. Have at least 200 points
2. Go to /rewards
3. Click "Redeem Now" on 200pts option
4. Verify discount code generated
5. Copy code
```

### Test 7: Checkout Discount
```
1. Add items to cart
2. Go to checkout
3. Paste discount code
4. Click "Apply"
5. Verify price reduced
6. Complete order
7. Verify code marked as used
```

### Test 8: Account Dashboard
```
1. Go to /account
2. Scroll to Rewards section
3. Verify points display
4. Verify tier display
5. Verify active codes shown
6. Verify transaction history
```

---

## 5️⃣ TROUBLESHOOTING

### Issue: "Permission denied" errors

**Solution:** Make sure Firebase security rules are added (see Section 1)

### Issue: Points not updating

**Solution:** Check browser console for errors. Verify:
- User is signed in
- Firebase connection is working
- loyaltyProfiles collection exists

### Issue: Discount code not applying

**Solution:** Verify:
- Code hasn't expired (30 days)
- Code hasn't been used
- User owns the code
- Code is entered correctly (uppercase)

### Issue: Floating button not showing

**Solution:** 
- Make sure you're signed in
- Check if RewardsModal is imported
- Verify state is set up correctly

### Issue: TypeScript errors

**Solution:**
- Run `npm install` to ensure all dependencies
- Check that all imports are correct
- Verify file paths match your structure

---

## 6️⃣ OPTIONAL ENHANCEMENTS

### Add Toast Notifications

```tsx
// Install react-hot-toast
npm install react-hot-toast

// In App.tsx
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Add to App component
<Toaster position="top-right" />

// Use in order completion
toast.success(`🎉 You earned ${pointsEarned} points!`);
```

### Add Loading States

```tsx
const [isProcessingOrder, setIsProcessingOrder] = useState(false);

const handleOrderComplete = async () => {
  setIsProcessingOrder(true);
  try {
    // ... order logic
  } finally {
    setIsProcessingOrder(false);
  }
};
```

### Add Analytics Tracking

```tsx
// Track loyalty events
const trackLoyaltyEvent = (eventName: string, data: any) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, data);
  }
  
  // Or your analytics service
  console.log('Loyalty Event:', eventName, data);
};

// Use it
trackLoyaltyEvent('points_earned', { points: 100, reason: 'signup' });
trackLoyaltyEvent('tier_upgraded', { tier: 'Silver' });
trackLoyaltyEvent('discount_redeemed', { points: 500, discount: 30 });
```

---

## 7️⃣ DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Firebase security rules added
- [ ] All integrations tested
- [ ] Mobile responsive verified
- [ ] Error handling in place
- [ ] Analytics tracking set up
- [ ] User documentation created
- [ ] Support team trained
- [ ] Backup plan ready
- [ ] Monitoring set up
- [ ] Performance tested

---

## 🎉 YOU'RE DONE!

After completing these integrations, your loyalty system will be **100% functional**!

**Questions?** All code is documented and follows best practices.

**Need help?** Check the other documentation files:
- `LOYALTY-SYSTEM-COMPLETE.md` - Full technical docs
- `LOYALTY-QUICK-START.md` - Quick start guide
- `LOYALTY-VISUAL-SUMMARY.md` - Visual overview

🚀 **Happy coding!**
