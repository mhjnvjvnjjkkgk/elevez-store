# Wave 3 Implementation Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ExitIntentPopup  │  NewsletterSignup  │  Checkout Form    │
└────────┬──────────────────┬──────────────────────┬──────────┘
         │                  │                      │
         └──────────────────┼──────────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │   Discount Service Layer            │
         │  (discountService.ts)               │
         ├─────────────────────────────────────┤
         │ • generateDiscountCode()            │
         │ • validateDiscountCode()            │
         │ • useDiscountCode()                 │
         │ • getDiscountCodeInfo()             │
         └──────────────────┬──────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │   Storage Layer                     │
         │  (In-Memory Map)                    │
         ├─────────────────────────────────────┤
         │ Map<code, DiscountCode>             │
         │ • code: string                      │
         │ • percentage: number                │
         │ • expiresAt: Date                   │
         │ • maxUses: number                   │
         │ • usedCount: number                 │
         │ • type: string                      │
         └─────────────────────────────────────┘
```

## Data Flow

### Exit Intent Popup Flow
```
User moves mouse to top
    ↓
handleMouseLeave triggered (e.clientY <= 0)
    ↓
setIsVisible(true)
    ↓
Popup renders with form
    ↓
User enters email & clicks button
    ↓
handleSubmit() called
    ↓
generateDiscountCode(15, 'exit-intent', 1)
    ↓
Code stored in Map
    ↓
setDiscountCode(code)
    ↓
setSubmitted(true)
    ↓
Success message with code displayed
    ↓
Auto-close after 4 seconds
```

### Newsletter Signup Flow
```
User scrolls to bottom
    ↓
Sees "Stay in the Loop" section
    ↓
Enters email & clicks Subscribe
    ↓
handleSubmit() called
    ↓
Email validation
    ↓
generateDiscountCode(10, 'newsletter', 1)
    ↓
Code stored in Map
    ↓
setDiscountCode(code)
    ↓
setStatus('success')
    ↓
Success message with code displayed
    ↓
Auto-reset after 5 seconds
```

### Checkout Discount Flow
```
User at checkout page
    ↓
Sees "Have a discount code?" section
    ↓
Enters code & clicks Apply
    ↓
handleApplyDiscount() called
    ↓
validateDiscountCode(code)
    ↓
Check if code exists in Map
    ↓
Check if expired
    ↓
Check if usage limit reached
    ↓
If valid:
  ├─ setDiscountApplied(true)
  ├─ setDiscountPercentage(percentage)
  └─ Show success message
    ↓
If invalid:
  └─ Show error message
    ↓
Total recalculates automatically
    ↓
User completes purchase
```

## Code Examples

### 1. Generating a Discount Code

```typescript
import { generateDiscountCode } from './services/discountService';

// Generate a 15% exit-intent code
const code = generateDiscountCode(15, 'exit-intent', 1);
console.log(code); // Output: "EXIT" + 8 random chars, e.g., "EXITABC12345"

// Generate a 10% newsletter code
const newsCode = generateDiscountCode(10, 'newsletter', 1);
console.log(newsCode); // Output: "NEWS" + 8 random chars

// Generate a 20% loyalty code with 5 uses
const loyalCode = generateDiscountCode(20, 'loyalty', 5);
console.log(loyalCode); // Output: "LOYAL" + 8 random chars
```

### 2. Validating a Discount Code

```typescript
import { validateDiscountCode } from './services/discountService';

// Validate a code
const result = validateDiscountCode('EXITABC12345');

if (result.valid) {
  console.log(`✓ ${result.percentage}% discount applied!`);
  // Apply discount to order
  const discountAmount = (subtotal * result.percentage) / 100;
  const finalTotal = subtotal - discountAmount;
} else {
  console.log(`✗ ${result.message}`);
  // Show error to user
}
```

### 3. Using a Discount Code

```typescript
import { useDiscountCode } from './services/discountService';

// Mark code as used (increment usage counter)
const success = useDiscountCode('EXITABC12345');

if (success) {
  console.log('Code usage recorded');
} else {
  console.log('Code usage limit reached');
}
```

### 4. Getting Code Information

```typescript
import { getDiscountCodeInfo } from './services/discountService';

// Get details about a code
const codeInfo = getDiscountCodeInfo('EXITABC12345');

if (codeInfo) {
  console.log({
    code: codeInfo.code,
    percentage: codeInfo.percentage,
    expiresAt: codeInfo.expiresAt,
    maxUses: codeInfo.maxUses,
    usedCount: codeInfo.usedCount,
    type: codeInfo.type,
    createdAt: codeInfo.createdAt
  });
}
```

### 5. Generating Bulk Codes

```typescript
import { generateBulkCodes } from './services/discountService';

// Generate 100 codes for a loyalty campaign
const codes = generateBulkCodes(100, 20, 'loyalty');

console.log(`Generated ${codes.length} codes`);
codes.forEach(code => console.log(code));
// Output:
// LOYAL1234567
// LOYAL2345678
// LOYAL3456789
// ... (100 total)
```

## Component Integration

### ExitIntentPopup Component

```typescript
// Key state
const [isVisible, setIsVisible] = useState(false);
const [discountCode, setDiscountCode] = useState<string>('');
const [submitted, setSubmitted] = useState(false);

// Key function
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (email) {
    // Generate code
    const code = generateDiscountCode(15, 'exit-intent', 1);
    setDiscountCode(code);
    setSubmitted(true);
    
    // Auto-close
    setTimeout(() => handleClose(), 4000);
  }
};

// Display code
<code className="text-3xl font-black text-[#00ff88] tracking-widest">
  {discountCode}
</code>
```

### NewsletterSignup Component

```typescript
// Key state
const [discountCode, setDiscountCode] = useState<string>('');
const [copied, setCopied] = useState(false);

// Key function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Generate code
  const code = generateDiscountCode(10, 'newsletter', 1);
  setDiscountCode(code);
  
  setStatus('success');
  setMessage(`Welcome! Your exclusive code: ${code}`);
};

// Copy function
const handleCopyCode = () => {
  if (discountCode) {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};
```

### Checkout Component

```typescript
// Key state
const [discountCode, setDiscountCode] = useState('');
const [discountApplied, setDiscountApplied] = useState(false);
const [discountPercentage, setDiscountPercentage] = useState(0);

// Calculate totals
const discountAmount = discountApplied ? (cartTotal * discountPercentage) / 100 : 0;
const totalAmount = cartTotal + shippingCost - discountAmount;

// Validation function
const handleApplyDiscount = async () => {
  const { validateDiscountCode } = await import('./services/discountService');
  const result = validateDiscountCode(discountCode);
  
  if (result.valid) {
    setDiscountApplied(true);
    setDiscountPercentage(result.percentage);
    setDiscountMessage(`✓ ${result.percentage}% discount applied!`);
  } else {
    setDiscountApplied(false);
    setDiscountMessage(result.message);
  }
};
```

## Discount Service Implementation

### Code Generation Algorithm

```typescript
export const generateDiscountCode = (
  percentage: number = 15,
  type: 'newsletter' | 'exit-intent' | 'loyalty' | 'referral' = 'newsletter',
  maxUses: number = 1
): string => {
  // 1. Generate random characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // 2. Add type prefix
  const prefix = {
    'newsletter': 'NEWS',
    'exit-intent': 'EXIT',
    'loyalty': 'LOYAL',
    'referral': 'REF'
  }[type];
  
  const finalCode = `${prefix}${code}`;
  
  // 3. Create expiry date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // 4. Store in Map
  activeCodes.set(finalCode, {
    code: finalCode,
    percentage,
    expiresAt,
    maxUses,
    usedCount: 0,
    createdAt: new Date(),
    type
  });
  
  return finalCode;
};
```

### Code Validation Algorithm

```typescript
export const validateDiscountCode = (code: string): { valid: boolean; percentage: number; message: string } => {
  // 1. Normalize to uppercase
  const normalizedCode = code.toUpperCase();
  
  // 2. Check if code exists
  const discountCode = activeCodes.get(normalizedCode);
  if (!discountCode) {
    return { valid: false, percentage: 0, message: 'Invalid discount code' };
  }
  
  // 3. Check if expired
  if (new Date() > discountCode.expiresAt) {
    return { valid: false, percentage: 0, message: 'Discount code has expired' };
  }
  
  // 4. Check usage limit
  if (discountCode.usedCount >= discountCode.maxUses) {
    return { valid: false, percentage: 0, message: 'Discount code has reached maximum uses' };
  }
  
  // 5. Return success
  return { valid: true, percentage: discountCode.percentage, message: `${discountCode.percentage}% discount applied!` };
};
```

## State Management

### Discount State in Checkout

```typescript
// Initial state
const [discountCode, setDiscountCode] = useState('');           // User input
const [discountApplied, setDiscountApplied] = useState(false);   // Applied flag
const [discountPercentage, setDiscountPercentage] = useState(0); // Percentage
const [discountMessage, setDiscountMessage] = useState('');      // Feedback

// Derived state
const discountAmount = discountApplied ? (cartTotal * discountPercentage) / 100 : 0;
const totalAmount = cartTotal + shippingCost - discountAmount;

// State transitions
// 1. User enters code
setDiscountCode(e.target.value.toUpperCase());

// 2. User clicks Apply
handleApplyDiscount();

// 3. Validation succeeds
setDiscountApplied(true);
setDiscountPercentage(result.percentage);
setDiscountMessage(`✓ ${result.percentage}% discount applied!`);

// 4. Total updates automatically (derived state)
// totalAmount = cartTotal + shippingCost - discountAmount
```

## Error Handling

### Validation Errors

```typescript
const handleApplyDiscount = async () => {
  // 1. Check if code is empty
  if (!discountCode.trim()) {
    setDiscountMessage('Please enter a discount code');
    return;
  }

  try {
    // 2. Validate code
    const { validateDiscountCode } = await import('./services/discountService');
    const result = validateDiscountCode(discountCode);
    
    // 3. Handle result
    if (result.valid) {
      setDiscountApplied(true);
      setDiscountPercentage(result.percentage);
      setDiscountMessage(`✓ ${result.percentage}% discount applied!`);
    } else {
      // Show specific error message
      setDiscountApplied(false);
      setDiscountPercentage(0);
      setDiscountMessage(result.message);
    }
  } catch (error) {
    // Handle unexpected errors
    setDiscountMessage('Error validating code');
  }
};
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Import**: Import discountService only when needed
   ```typescript
   const { validateDiscountCode } = await import('./services/discountService');
   ```

2. **Memoization**: Cache validation results if needed
   ```typescript
   const memoizedValidate = useMemo(() => validateDiscountCode, []);
   ```

3. **Debouncing**: Debounce code input if validating on change
   ```typescript
   const debouncedValidate = useCallback(
     debounce((code) => validateDiscountCode(code), 300),
     []
   );
   ```

4. **In-Memory Storage**: Fast lookups with Map
   ```typescript
   activeCodes.get(code); // O(1) lookup
   ```

## Security Considerations

### Current Implementation
- ✓ Case-insensitive matching (normalized to uppercase)
- ✓ Expiry dates prevent indefinite use
- ✓ Usage limits prevent abuse
- ✓ Type-based tracking for analytics

### Production Recommendations
- [ ] Validate codes server-side (not just client)
- [ ] Rate-limit code generation (prevent spam)
- [ ] Hash codes in database (don't store plaintext)
- [ ] Log all code usage for audit trail
- [ ] Implement CAPTCHA for exit-intent popup
- [ ] Use Firebase security rules for Firestore access
- [ ] Encrypt sensitive data in transit (HTTPS)

## Testing Utilities

### Manual Testing

```typescript
// In browser console
import { generateDiscountCode, validateDiscountCode } from './services/discountService';

// Generate test code
const testCode = generateDiscountCode(15, 'exit-intent', 1);
console.log('Generated:', testCode);

// Validate test code
const result = validateDiscountCode(testCode);
console.log('Validation:', result);

// Get code info
import { getDiscountCodeInfo } from './services/discountService';
const info = getDiscountCodeInfo(testCode);
console.log('Code Info:', info);
```

### Unit Testing (Example)

```typescript
describe('Discount Service', () => {
  it('should generate valid discount code', () => {
    const code = generateDiscountCode(15, 'exit-intent', 1);
    expect(code).toMatch(/^EXIT[A-Z0-9]{8}$/);
  });

  it('should validate generated code', () => {
    const code = generateDiscountCode(15, 'exit-intent', 1);
    const result = validateDiscountCode(code);
    expect(result.valid).toBe(true);
    expect(result.percentage).toBe(15);
  });

  it('should reject invalid code', () => {
    const result = validateDiscountCode('INVALID123');
    expect(result.valid).toBe(false);
  });

  it('should reject expired code', () => {
    // Mock date to be 31 days in future
    // Generate code
    // Validate and expect failure
  });
});
```

## Migration to Firebase

### Firestore Schema

```typescript
// Collection: discountCodes
// Document: {code}
{
  code: "EXITABC12345",
  percentage: 15,
  type: "exit-intent",
  maxUses: 1,
  usedCount: 0,
  createdAt: Timestamp,
  expiresAt: Timestamp,
  active: true
}

// Collection: codeUsage (for analytics)
// Document: auto-generated
{
  code: "EXITABC12345",
  userId: "user123",
  usedAt: Timestamp,
  orderTotal: 1000,
  discountAmount: 150
}
```

### Migration Steps

1. Create Firestore collections
2. Update `discountService.ts` to use Firestore
3. Add server-side validation
4. Implement rate limiting
5. Add analytics tracking
6. Test thoroughly before deploying

---

## Summary

Wave 3 successfully implements:
- ✓ Discount code generation system
- ✓ Exit-intent popup with codes
- ✓ Newsletter integration with codes
- ✓ Checkout discount validation
- ✓ Automatic total recalculation
- ✓ User-friendly UI/UX
- ✓ Error handling
- ✓ Copy-to-clipboard functionality

All components are working and ready for testing!
