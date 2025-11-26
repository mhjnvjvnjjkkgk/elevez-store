// Checkout Discount Service
// Handles discount application during checkout

export interface DiscountValidation {
  valid: boolean;
  message?: string;
  discount?: any;
  discountAmount?: number;
}

export class CheckoutDiscountService {
  private discounts: any[] = [];

  constructor() {
    this.loadDiscounts();
  }

  private loadDiscounts() {
    try {
      const saved = localStorage.getItem('discounts');
      this.discounts = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading discounts:', error);
      this.discounts = [];
    }
  }

  validateCode(code: string): DiscountValidation {
    const discount = this.discounts.find(d => d.code === code);
    
    if (!discount) {
      return { valid: false, message: 'Discount code not found' };
    }

    if (!discount.active) {
      return { valid: false, message: 'This discount code is inactive' };
    }

    const now = new Date();
    const endDate = new Date(discount.endDate);
    
    if (endDate < now) {
      return { valid: false, message: 'This discount code has expired' };
    }

    if (discount.usageCount >= discount.usageLimit) {
      return { valid: false, message: 'This discount code has reached its usage limit' };
    }

    return { valid: true, discount };
  }

  calculateDiscount(code: string, subtotal: number): DiscountValidation {
    const validation = this.validateCode(code);
    
    if (!validation.valid) {
      return validation;
    }

    const discount = validation.discount;
    let discountAmount = 0;

    // Check minimum purchase requirement
    if (subtotal < discount.minPurchase) {
      return {
        valid: false,
        message: `Minimum purchase of ₹${discount.minPurchase} required for this discount`
      };
    }

    switch (discount.type) {
      case 'percentage':
        discountAmount = (subtotal * discount.value) / 100;
        break;
      case 'fixed':
        discountAmount = discount.value;
        break;
      case 'free_shipping':
        discountAmount = 100; // Assume ₹100 shipping
        break;
      case 'bundle':
        discountAmount = (subtotal * discount.value) / 100;
        break;
    }

    // Apply max discount limit if set
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      valid: true,
      discount,
      discountAmount
    };
  }

  recordUsage(code: string): boolean {
    const discount = this.discounts.find(d => d.code === code);
    if (discount) {
      discount.usageCount++;
      localStorage.setItem('discounts', JSON.stringify(this.discounts));
      return true;
    }
    return false;
  }

  getDiscountDetails(code: string): any {
    return this.discounts.find(d => d.code === code);
  }

  getAllActiveDiscounts(): any[] {
    const now = new Date();
    return this.discounts.filter(d => 
      d.active && 
      new Date(d.endDate) > now &&
      d.usageCount < d.usageLimit
    );
  }
}

export const checkoutDiscountService = new CheckoutDiscountService();
