# 🚀 Loyalty Rules - Quick Reference

## 📖 For Developers

### **Import the Service**
```typescript
import { loyaltyRulesService } from './services/loyaltyRulesService';
```

### **Calculate Points Earned**
```typescript
// Calculate points for a purchase
const points = await loyaltyRulesService.calculatePointsEarned(
  orderAmount,  // e.g., 100
  userTier      // e.g., 'gold'
);
// Returns: points with tier multiplier applied
```

### **Calculate User Tier**
```typescript
// Get tier based on total points
const tier = await loyaltyRulesService.calculateTier(totalPoints);
console.log(tier.id);          // 'gold'
console.log(tier.name);        // 'Gold'
console.log(tier.benefits);    // { discountPercentage: 10, ... }
```

### **Get Tier Benefits**
```typescript
// Get benefits for a specific tier
const benefits = await loyaltyRulesService.getTierBenefits('gold');
console.log(benefits.discountPercentage);    // 10
console.log(benefits.earningMultiplier);     // 1.5
console.log(benefits.freeShippingThreshold); // 200
```

### **Get Redemption Options**
```typescript
// Get available redemption options for user
const options = await loyaltyRulesService.getRedemptionOptions(
  userPoints,   // e.g., 500
  orderTotal    // e.g., 200
);
// Returns: array of redemption options user can afford
```

### **Subscribe to Rule Changes**
```typescript
// Listen for real-time rule updates
useEffect(() => {
  const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
    console.log('Rules updated!', rules);
    // Update your UI, recalculate points, etc.
  });
  
  return () => unsubscribe(); // Cleanup
}, []);
```

### **Get All Rules**
```typescript
// Get current rules (cached)
const rules = await loyaltyRulesService.getRules();
console.log(rules.pointsEarning.pointsPerDollar); // 0.1
console.log(rules.tiers);                          // Array of tiers
console.log(rules.redemption);                     // Array of options
console.log(rules.settings);                       // Settings object
```

---

## 🎨 For Admins

### **Open Loyalty Rules Panel**
```
admin-panel/loyalty-rules.html
```

### **Change Points Earning Rate**
1. Go to "Points Earning" tab
2. Change "Points Per Dollar" value
3. Click "Save All Changes"
4. Changes propagate instantly!

### **View Tier Configuration**
1. Go to "Tiers" tab
2. See all tier thresholds and benefits
3. (Future: Edit tiers directly)

### **View Redemption Options**
1. Go to "Redemption" tab
2. See all redemption options
3. (Future: Add/edit options)

### **Configure Settings**
1. Go to "Settings" tab
2. Set points expiration
3. Choose rounding rule
4. Enable/disable features

### **Preview Changes**
1. Go to "Preview" tab
2. See all current rules
3. Verify before saving

---

## 🔧 Common Use Cases

### **Award Points After Purchase**
```typescript
// In checkout service
const pointsEarned = await loyaltyRulesService.calculatePointsEarned(
  order.total,
  user.tier
);

await userPointsService.addPointsFromPurchase(
  user.id,
  order.total,
  order.id
);
```

### **Check User Tier**
```typescript
// Get user's current tier
const userPoints = await userPointsService.getUserPoints(userId);
const tier = await loyaltyRulesService.calculateTier(userPoints.totalPoints);

console.log(`User is ${tier.name} tier`);
console.log(`Earning multiplier: ${tier.benefits.earningMultiplier}x`);
```

### **Show Available Rewards**
```typescript
// In rewards page
const userPoints = await userPointsService.getUserPoints(userId);
const options = await loyaltyRulesService.getRedemptionOptions(
  userPoints.totalPoints,
  cartTotal
);

// Display options to user
options.forEach(option => {
  console.log(`${option.name}: ${option.pointsRequired} points`);
});
```

### **Apply Tier Discount**
```typescript
// At checkout
const tier = await loyaltyRulesService.calculateTier(userPoints);
const discount = tier.benefits.discountPercentage;

const discountAmount = (orderTotal * discount) / 100;
const finalTotal = orderTotal - discountAmount;
```

---

## 📊 Rule Structure

### **Points Earning**
```typescript
{
  pointsPerDollar: 0.1,  // 1 point per $10
  enabled: true,
  name: "Standard Earning Rate",
  description: "1 point for every $10 spent"
}
```

### **Tier Configuration**
```typescript
{
  id: "gold",
  name: "Gold",
  pointsRequired: 2500,
  benefits: {
    discountPercentage: 10,
    freeShippingThreshold: 200,
    earningMultiplier: 1.5,
    exclusiveAccess: true,
    prioritySupport: false
  },
  icon: "🥇",
  color: "#FFD700"
}
```

### **Redemption Option**
```typescript
{
  id: "redeem-100",
  name: "$10 Off",
  pointsRequired: 100,
  dollarValue: 10,
  minimumPurchase: 50,
  enabled: true,
  description: "Redeem 100 points for $10 off"
}
```

---

## ⚡ Performance Tips

1. **Use Caching** - Rules are cached in memory, first call loads from Firebase
2. **Subscribe Once** - Use `onRulesChange()` to get updates, don't poll
3. **Batch Calculations** - Calculate multiple users' points in parallel
4. **Avoid Redundant Calls** - Cache tier info in component state

---

## 🐛 Troubleshooting

### **Rules Not Loading**
```typescript
// Check Firebase connection
const rules = await loyaltyRulesService.getRules();
console.log('Rules:', rules);
```

### **Changes Not Propagating**
```typescript
// Verify listener is active
loyaltyRulesService.onRulesChange((rules) => {
  console.log('Listener working!', rules);
});
```

### **Incorrect Calculations**
```typescript
// Debug calculation
const points = await loyaltyRulesService.calculatePointsEarned(100, 'gold');
console.log('Points for $100 order (Gold tier):', points);
// Should be: 100 * 0.1 * 1.5 = 15 points
```

---

## 📚 API Reference

### **Methods**

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getRules()` | - | `Promise<LoyaltyRules>` | Get current rules |
| `calculatePointsEarned()` | `amount, tier?` | `Promise<number>` | Calculate points for purchase |
| `calculateTier()` | `totalPoints` | `Promise<TierConfig>` | Get tier for points |
| `getTierBenefits()` | `tierId` | `Promise<Benefits>` | Get tier benefits |
| `getRedemptionOptions()` | `points, total` | `Promise<RedemptionRule[]>` | Get available redemptions |
| `onRulesChange()` | `callback` | `() => void` | Subscribe to changes |

---

## 🎯 Best Practices

1. ✅ Always use `loyaltyRulesService` for calculations
2. ✅ Subscribe to rule changes in components
3. ✅ Handle async operations properly
4. ✅ Cache tier info to reduce Firebase reads
5. ✅ Test rule changes in staging first
6. ❌ Don't hardcode tier thresholds
7. ❌ Don't hardcode points calculations
8. ❌ Don't bypass the service

---

**Last Updated:** December 8, 2024  
**Version:** 1.0.0

**For more details, see:** `LOYALTY-RULES-ENGINE-COMPLETE.md`
