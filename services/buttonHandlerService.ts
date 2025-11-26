// Button Handler Service
// Ensures all buttons work correctly with proper error handling and feedback

import { firebaseOptimizationService } from './firebaseOptimizationService';
import { userPointsService } from './userPointsService';
import { firebaseSyncService } from './firebaseSyncService';

export interface ButtonAction {
  id: string;
  label: string;
  action: () => Promise<boolean>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

class ButtonHandlerService {
  private activeButtons = new Map<string, boolean>();
  private buttonStates = new Map<string, any>();

  /**
   * Register button
   */
  registerButton(id: string, initialState?: any) {
    this.activeButtons.set(id, false);
    if (initialState) {
      this.buttonStates.set(id, initialState);
    }
  }

  /**
   * Unregister button
   */
  unregisterButton(id: string) {
    this.activeButtons.delete(id);
    this.buttonStates.delete(id);
  }

  /**
   * Check if button is active
   */
  isButtonActive(id: string): boolean {
    return this.activeButtons.get(id) || false;
  }

  /**
   * Set button state
   */
  setButtonState(id: string, state: any) {
    this.buttonStates.set(id, state);
  }

  /**
   * Get button state
   */
  getButtonState(id: string): any {
    return this.buttonStates.get(id);
  }

  /**
   * Handle button click with error handling
   */
  async handleButtonClick(
    id: string,
    action: () => Promise<boolean>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    try {
      // Prevent double clicks
      if (this.activeButtons.get(id)) {
        return false;
      }

      this.activeButtons.set(id, true);

      // Execute action
      const result = await action();

      if (result) {
        onSuccess?.();
        return true;
      } else {
        onError?.('Action failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
      console.error(`Error in button ${id}:`, error);
      return false;
    } finally {
      this.activeButtons.set(id, false);
    }
  }

  /**
   * Add to cart button handler
   */
  async handleAddToCart(
    userId: string,
    product: any,
    quantity: number,
    size: string,
    color: string
  ): Promise<boolean> {
    try {
      const cart = firebaseOptimizationService.getCachedData(`cart_${userId}`) || {
        items: [],
        subtotal: 0,
      };

      const cartId = `${product.id}-${size}-${color}`;
      const existingItem = cart.items.find((item: any) => item.cartId === cartId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          ...product,
          quantity,
          size,
          color,
          cartId,
        });
      }

      cart.subtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      await firebaseOptimizationService.syncDataImmediately(
        'carts',
        userId,
        cart,
        `cart_${userId}`
      );

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  /**
   * Remove from cart button handler
   */
  async handleRemoveFromCart(userId: string, cartId: string): Promise<boolean> {
    try {
      const cart = firebaseOptimizationService.getCachedData(`cart_${userId}`) || {
        items: [],
        subtotal: 0,
      };

      cart.items = cart.items.filter((item: any) => item.cartId !== cartId);
      cart.subtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      await firebaseOptimizationService.syncDataImmediately(
        'carts',
        userId,
        cart,
        `cart_${userId}`
      );

      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  /**
   * Update cart quantity button handler
   */
  async handleUpdateCartQuantity(
    userId: string,
    cartId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const cart = firebaseOptimizationService.getCachedData(`cart_${userId}`) || {
        items: [],
        subtotal: 0,
      };

      const item = cart.items.find((item: any) => item.cartId === cartId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }

      cart.subtotal = cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      await firebaseOptimizationService.syncDataImmediately(
        'carts',
        userId,
        cart,
        `cart_${userId}`
      );

      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  }

  /**
   * Checkout button handler
   */
  async handleCheckout(userId: string, orderData: any): Promise<boolean> {
    try {
      // Create order
      const result = await firebaseSyncService.syncOrder(userId, orderData);

      if (result.success) {
        // Clear cart
        await firebaseOptimizationService.syncDataImmediately(
          'carts',
          userId,
          { items: [], subtotal: 0 },
          `cart_${userId}`
        );

        // Add points
        const pointsEarned = Math.floor(orderData.total);
        const userPoints = await userPointsService.getUserPoints(userId);
        if (userPoints) {
          const newTotalPoints = (userPoints.totalPoints || 0) + pointsEarned;
          await firebaseOptimizationService.syncDataImmediately(
            'userPoints',
            userId,
            {
              points: newTotalPoints,
              tier: userPoints.tier,
              totalPointsEarned: newTotalPoints,
            },
            `points_${userId}`
          );
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error during checkout:', error);
      return false;
    }
  }

  /**
   * Apply discount button handler
   */
  async handleApplyDiscount(
    userId: string,
    discountCode: string,
    subtotal: number
  ): Promise<{ success: boolean; discountAmount?: number; error?: string }> {
    try {
      // Validate discount code
      const { checkoutDiscountService } = await import('./checkoutDiscountService');
      const result = checkoutDiscountService.calculateDiscount(discountCode, subtotal);

      if (!result.valid) {
        return { success: false, error: result.message };
      }

      // Log discount usage
      await firebaseSyncService.logActivity(
        userId,
        'redeem_points',
        `Applied discount: ${discountCode}`,
        { discountCode, discountAmount: result.discountAmount }
      );

      return { success: true, discountAmount: result.discountAmount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Redeem points button handler
   */
  async handleRedeemPoints(
    userId: string,
    pointsToRedeem: number
  ): Promise<boolean> {
    try {
      const userPoints = await userPointsService.getUserPoints(userId);
      if (!userPoints || (userPoints.totalPoints || 0) < pointsToRedeem) {
        return false;
      }

      const newPoints = (userPoints.totalPoints || 0) - pointsToRedeem;

      await firebaseOptimizationService.syncDataImmediately(
        'userPoints',
        userId,
        {
          points: newPoints,
          tier: userPoints.tier,
          totalPointsEarned: newPoints,
        },
        `points_${userId}`
      );

      // Log activity
      await firebaseSyncService.logActivity(
        userId,
        'redeem_points',
        `Redeemed ${pointsToRedeem} points`,
        { pointsRedeemed: pointsToRedeem }
      );

      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      return false;
    }
  }

  /**
   * Update profile button handler
   */
  async handleUpdateProfile(userId: string, profileData: any): Promise<boolean> {
    try {
      await firebaseOptimizationService.syncDataImmediately(
        'users',
        userId,
        profileData,
        `user_${userId}`
      );

      // Log activity
      await firebaseSyncService.logActivity(
        userId,
        'view',
        'Updated profile',
        { updatedFields: Object.keys(profileData) }
      );

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  /**
   * Add to wishlist button handler
   */
  async handleAddToWishlist(userId: string, productId: number): Promise<boolean> {
    try {
      const profile = firebaseOptimizationService.getCachedData(`user_${userId}`) || {
        wishlist: [],
      };

      if (!profile.wishlist) {
        profile.wishlist = [];
      }

      if (!profile.wishlist.includes(productId)) {
        profile.wishlist.push(productId);
      }

      await firebaseOptimizationService.syncDataImmediately(
        'users',
        userId,
        profile,
        `user_${userId}`
      );

      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }

  /**
   * Remove from wishlist button handler
   */
  async handleRemoveFromWishlist(userId: string, productId: number): Promise<boolean> {
    try {
      const profile = firebaseOptimizationService.getCachedData(`user_${userId}`) || {
        wishlist: [],
      };

      if (profile.wishlist) {
        profile.wishlist = profile.wishlist.filter((id: number) => id !== productId);
      }

      await firebaseOptimizationService.syncDataImmediately(
        'users',
        userId,
        profile,
        `user_${userId}`
      );

      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  /**
   * Batch button actions
   */
  async handleBatchActions(
    userId: string,
    actions: Array<{ collection: string; docId: string; data: any; operation: 'set' | 'update' }>
  ): Promise<boolean> {
    try {
      return await firebaseOptimizationService.batchSync(actions);
    } catch (error) {
      console.error('Error in batch actions:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return firebaseOptimizationService.getCacheStats();
  }

  /**
   * Clear cache
   */
  clearCache(key?: string) {
    if (key) {
      firebaseOptimizationService.clearCache(key);
    } else {
      firebaseOptimizationService.clearAllCache();
    }
  }
}

export const buttonHandlerService = new ButtonHandlerService();
