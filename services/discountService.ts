// Discount Code Service - Generates and manages discount codes

interface DiscountCode {
  code: string;
  percentage: number;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  type: 'newsletter' | 'exit-intent' | 'loyalty' | 'referral';
}

// In-memory store (in production, use Firebase/Database)
const activeCodes: Map<string, DiscountCode> = new Map();

// Generate unique discount code
export const generateDiscountCode = (
  percentage: number = 15,
  type: 'newsletter' | 'exit-intent' | 'loyalty' | 'referral' = 'newsletter',
  maxUses: number = 1
): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 8-character code
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add prefix based on type
  const prefix = {
    'newsletter': 'NEWS',
    'exit-intent': 'EXIT',
    'loyalty': 'LOYAL',
    'referral': 'REF'
  }[type];
  
  const finalCode = `${prefix}${code}`;
  
  // Store the code
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry
  
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

// Validate and apply discount code
export const validateDiscountCode = (code: string): { valid: boolean; percentage: number; message: string } => {
  const discountCode = activeCodes.get(code.toUpperCase());
  
  if (!discountCode) {
    return { valid: false, percentage: 0, message: 'Invalid discount code' };
  }
  
  if (new Date() > discountCode.expiresAt) {
    return { valid: false, percentage: 0, message: 'Discount code has expired' };
  }
  
  if (discountCode.usedCount >= discountCode.maxUses) {
    return { valid: false, percentage: 0, message: 'Discount code has reached maximum uses' };
  }
  
  return { valid: true, percentage: discountCode.percentage, message: `${discountCode.percentage}% discount applied!` };
};

// Use a discount code (increment usage)
export const useDiscountCode = (code: string): boolean => {
  const discountCode = activeCodes.get(code.toUpperCase());
  
  if (discountCode && discountCode.usedCount < discountCode.maxUses) {
    discountCode.usedCount++;
    return true;
  }
  
  return false;
};

// Get discount code info
export const getDiscountCodeInfo = (code: string): DiscountCode | null => {
  return activeCodes.get(code.toUpperCase()) || null;
};

// Get all active codes (for admin)
export const getAllActiveCodes = (): DiscountCode[] => {
  return Array.from(activeCodes.values()).filter(code => new Date() < code.expiresAt);
};

// Create bulk codes for campaigns
export const generateBulkCodes = (
  count: number,
  percentage: number,
  type: 'newsletter' | 'exit-intent' | 'loyalty' | 'referral'
): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateDiscountCode(percentage, type));
  }
  return codes;
};
