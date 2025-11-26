# Wave 3 Testing Guide - Discount Code System

## Quick Test Scenarios

### Scenario 1: Exit Intent Popup
**Goal**: Verify exit intent popup generates and displays discount code

**Steps:**
1. Open website at http://localhost:5173/
2. Move mouse to top of page (above header)
3. Exit intent popup should appear with "Wait! Don't Leave Yet"
4. Enter any email address
5. Click "Claim 15% Discount"
6. Verify:
   - ✓ Popup shows "Success! Here's Your Code"
   - ✓ Discount code displays (format: EXIT*****)
   - ✓ Copy button is visible
   - ✓ "Use this code at checkout to save 15%" message shows
   - ✓ "Code expires in 30 days" message shows
   - ✓ Popup auto-closes after ~4 seconds

**Expected Code Format:** `EXIT` + 8 random characters
**Example:** `EXITABC12345`

---

### Scenario 2: Newsletter Signup
**Goal**: Verify newsletter generates and displays discount code

**Steps:**
1. Scroll to bottom of home page
2. Find "Stay in the Loop" newsletter section
3. Enter email address
4. Click "Subscribe Now"
5. Verify:
   - ✓ Success message appears
   - ✓ Discount code displays (format: NEWS*****)
   - ✓ Copy button is visible
   - ✓ "Your 10% discount code:" label shows
   - ✓ Message shows "Welcome to our newsletter!"

**Expected Code Format:** `NEWS` + 8 random characters
**Example:** `NEWSXYZ98765`

---

### Scenario 3: Apply Discount at Checkout
**Goal**: Verify discount code validation and application at checkout

**Steps:**
1. Add any product to cart
2. Go to checkout
3. Fill in required fields (name, email, address, etc.)
4. Scroll to "Order Summary" on right side
5. Find "Have a discount code?" section
6. Paste a generated code (from exit intent or newsletter)
7. Click "Apply" button
8. Verify:
   - ✓ Button changes to "✓ Applied"
   - ✓ Green success message appears
   - ✓ "Discount (X%)" line appears in summary
   - ✓ Discount amount shows (e.g., "-₹150.00")
   - ✓ Total is reduced by discount amount
   - ✓ Input field is disabled

**Example Calculation:**
- Subtotal: ₹1000
- Discount Code: NEWS10% (10% off)
- Discount Amount: -₹100
- Shipping: ₹30 (COD) or FREE (UPI)
- Final Total: ₹930 (with COD) or ₹900 (with UPI)

---

### Scenario 4: Invalid Discount Code
**Goal**: Verify error handling for invalid codes

**Steps:**
1. Go to checkout
2. Enter invalid code (e.g., "INVALID123")
3. Click "Apply"
4. Verify:
   - ✓ Red error message appears
   - ✓ Message says "Invalid discount code"
   - ✓ Button remains "Apply" (not applied)
   - ✓ Total is NOT reduced

---

### Scenario 5: Expired Code (Manual Test)
**Goal**: Verify expired codes are rejected

**Note:** Codes expire after 30 days. To test:
1. Manually modify `discountService.ts` to set expiry to past date
2. Generate a code
3. Try to apply at checkout
4. Verify error message: "Discount code has expired"

---

### Scenario 6: Copy Button Functionality
**Goal**: Verify copy-to-clipboard works

**Steps:**
1. Generate a discount code (exit intent or newsletter)
2. Click copy button next to code
3. Verify:
   - ✓ Button icon changes to checkmark
   - ✓ Code is copied to clipboard
   - ✓ Can paste code elsewhere (Ctrl+V)
   - ✓ Icon reverts to copy icon after 2 seconds

---

### Scenario 7: Multiple Discounts (Edge Case)
**Goal**: Verify only one discount can be applied

**Steps:**
1. Go to checkout
2. Apply first discount code
3. Try to apply second discount code
4. Verify:
   - ✓ First discount remains applied
   - ✓ Second code is rejected or replaces first
   - ✓ Only one discount shown in summary

---

### Scenario 8: Newsletter Variants
**Goal**: Verify newsletter works in all variants

**Test Inline Variant (Default):**
1. Scroll to bottom of home page
2. See two-column layout with form on right
3. Subscribe and verify code appears

**Test Modal Variant (if implemented):**
1. Look for modal trigger
2. Click to open modal
3. Subscribe and verify code appears in modal

**Test Footer Variant (if implemented):**
1. Check footer section
2. Find compact newsletter form
3. Subscribe and verify code appears

---

## Test Data

### Pre-Generated Test Codes
You can manually create test codes by modifying `discountService.ts`:

```typescript
// Add to discountService.ts for testing
export const createTestCodes = () => {
  generateDiscountCode(10, 'newsletter', 1);  // 10% off
  generateDiscountCode(15, 'exit-intent', 1); // 15% off
  generateDiscountCode(20, 'loyalty', 5);     // 20% off, 5 uses
};
```

### Test Scenarios with Amounts
| Scenario | Subtotal | Code | Discount | Shipping | Total |
|----------|----------|------|----------|----------|-------|
| No discount | ₹1000 | - | - | ₹30 | ₹1030 |
| 10% off | ₹1000 | NEWS10% | -₹100 | ₹30 | ₹930 |
| 15% off | ₹1000 | EXIT15% | -₹150 | ₹30 | ₹880 |
| 20% off | ₹1000 | LOYAL20% | -₹200 | ₹30 | ₹830 |
| Free shipping + 10% | ₹1000 | NEWS10% | -₹100 | FREE | ₹900 |

---

## Browser Console Testing

### Check Generated Codes
```javascript
// In browser console, check if codes are being generated
// Look for discount code in exit intent popup or newsletter success message
```

### Validate Code Manually
```javascript
// Import and test validation
import { validateDiscountCode } from './services/discountService';
const result = validateDiscountCode('EXITABC12345');
console.log(result);
// Should output: { valid: true, percentage: 15, message: "15% discount applied!" }
```

---

## Common Issues & Solutions

### Issue: Exit Intent Popup Not Appearing
**Solution:**
- Make sure mouse is moved to very top of page (y <= 0)
- Check browser console for errors
- Verify ExitIntentPopup component is imported in App.tsx

### Issue: Discount Code Not Showing
**Solution:**
- Check if form was submitted (look for success message)
- Verify discountService.ts is imported correctly
- Check browser console for errors

### Issue: Discount Not Applied at Checkout
**Solution:**
- Verify code format (should be uppercase)
- Check if code is expired (30 days)
- Verify code hasn't been used more than max uses
- Check browser console for validation errors

### Issue: Total Not Updating
**Solution:**
- Verify discount percentage is being set correctly
- Check if discount amount calculation is correct
- Refresh page and try again
- Check browser console for errors

---

## Performance Testing

### Metrics to Monitor
- Exit intent popup load time: < 100ms
- Newsletter form submission: < 1s
- Discount validation: < 50ms
- Checkout page load: < 2s

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions and check:
   - No failed requests
   - Response times are reasonable
   - No console errors

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through discount code input
- [ ] Tab through copy button
- [ ] Tab through apply button
- [ ] Enter key submits form

### Screen Reader
- [ ] Code label is announced
- [ ] Copy button is announced
- [ ] Success/error messages are announced
- [ ] Discount amount is announced

---

## Mobile Testing

### Responsive Design
- [ ] Exit intent popup displays correctly on mobile
- [ ] Newsletter form is mobile-friendly
- [ ] Discount code is readable on small screens
- [ ] Copy button works on touch devices
- [ ] Checkout discount section is accessible

---

## Final Checklist

- [ ] Exit intent popup generates codes
- [ ] Newsletter generates codes
- [ ] Codes validate at checkout
- [ ] Discount amount calculates correctly
- [ ] Total updates with discount
- [ ] Copy button works
- [ ] Error messages display
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] All variants work (inline, modal, footer)
- [ ] Code format is correct (PREFIX + 8 chars)
- [ ] Expiry information displays
- [ ] Success messages are clear

---

## Reporting Issues

If you find issues, note:
1. **What you did** (step-by-step)
2. **What you expected** (desired outcome)
3. **What happened** (actual outcome)
4. **Browser & OS** (Chrome on Windows, Safari on Mac, etc.)
5. **Console errors** (if any)
6. **Screenshots** (if helpful)
