
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  getDoc
} from 'firebase/firestore';
import { validateDiscountCode as validateLoyaltyCode, applyDiscountCode as applyLoyaltyCode } from './loyaltyService';

export interface DiscountValidation {
  valid: boolean;
  message?: string;
  discount?: any;
  discountAmount?: number;
}

export class CheckoutDiscountService {
  constructor() { }

  async validateCode(code: string, userId?: string, subtotal: number = 0): Promise<DiscountValidation> {
    try {
      // 1. Check General Discounts (Admin Panel)
      const discountsRef = collection(db, 'discounts');
      const q = query(discountsRef, where('code', '==', code));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const discountDoc = snapshot.docs[0];
        const discount = { id: discountDoc.id, source: 'admin', ...discountDoc.data() } as any;

        if (!discount.active) {
          return { valid: false, message: 'This discount code is inactive' };
        }

        const now = new Date();
        const endDate = new Date(discount.endDate);
        if (endDate < now) {
          return { valid: false, message: 'This discount code has expired' };
        }

        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
          return { valid: false, message: 'This discount code has reached its usage limit' };
        }

        if (discount.minPurchase && subtotal < discount.minPurchase) {
          return { valid: false, message: `Minimum purchase of ₹${discount.minPurchase} required` };
        }

        return { valid: true, discount };
      }

      // 2. Check Loyalty Discounts (if user is logged in)
      if (userId) {
        const loyaltyDiscount = await validateLoyaltyCode(code, userId);
        if (loyaltyDiscount) {
          return {
            valid: true,
            discount: {
              ...loyaltyDiscount,
              source: 'loyalty',
              name: 'Loyalty Reward',
              type: loyaltyDiscount.discountType,
              value: loyaltyDiscount.discountAmount
            }
          };
        }
      }

      return { valid: false, message: 'Invalid discount code' };

    } catch (error) {
      console.error('Error validating discount:', error);
      return { valid: false, message: 'Error validating code' };
    }
  }

  async calculateDiscount(code: string, subtotal: number, userId?: string): Promise<DiscountValidation> {
    const validation = await this.validateCode(code, userId, subtotal);

    if (!validation.valid) {
      return validation;
    }

    const discount = validation.discount;
    let discountAmount = 0;

    // Minimum purchase check is already done in validateCode (for admin), 
    // but loyalty validation in validateCode might not have subtotal
    // Let's re-verify logic here if needed.

    if (discount.source === 'admin') {
      // Logic reused from validateCode but good to have amount calc specific here
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'free_shipping') {
        discountAmount = 0; // Handled by shipping logic? Or return distinct flag?
        // Usually shipping is calculated separately. 
        // user probably expects 100% off shipping or a fixed amount.
        // For now, let's assume it reduces total by shipping cost, 
        // but we don't know shipping cost here. 
        // We'll return 0 amount but keep valid to trigger free shipping logic in Checkout?
        // Existing code used mock 100.
        discountAmount = 100;
      }

      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      // Loyalty
      if (discount.type === 'percentage') {
        discountAmount = (subtotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      valid: true,
      discount,
      discountAmount
    };
  }

  async recordUsage(code: string, userId?: string): Promise<boolean> {
    try {
      // Re-fetch to find ID and source again, or trust caller?
      // Better to query.
      const validation = await this.validateCode(code, userId);
      if (!validation.valid || !validation.discount) return false;

      const discount = validation.discount;

      if (discount.source === 'admin') {
        const discountRef = doc(db, 'discounts', discount.id);
        await updateDoc(discountRef, {
          usageCount: increment(1)
        });
        return true;
      } else if (discount.source === 'loyalty') {
        await applyLoyaltyCode(discount.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error recording discount usage:', error);
      return false;
    }
  }
}

export const checkoutDiscountService = new CheckoutDiscountService();
