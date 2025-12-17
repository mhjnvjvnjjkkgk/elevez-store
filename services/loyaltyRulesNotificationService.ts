// Loyalty Rules Notification Service
// Handles user notifications when loyalty rules change

import { loyaltyRulesService, LoyaltyRules } from './loyaltyRulesService';

export interface RulesChangeNotification {
  type: 'earning_rate' | 'tier_threshold' | 'redemption' | 'settings';
  title: string;
  message: string;
  impact: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
}

class LoyaltyRulesNotificationService {
  private static instance: LoyaltyRulesNotificationService;
  private previousRules: LoyaltyRules | null = null;
  private notificationCallbacks: Array<(notification: RulesChangeNotification) => void> = [];

  private constructor() {
    this.initializeListener();
  }

  public static getInstance(): LoyaltyRulesNotificationService {
    if (!LoyaltyRulesNotificationService.instance) {
      LoyaltyRulesNotificationService.instance = new LoyaltyRulesNotificationService();
    }
    return LoyaltyRulesNotificationService.instance;
  }

  /**
   * Initialize real-time listener for rule changes
   */
  private initializeListener(): void {
    loyaltyRulesService.onRulesChange((newRules) => {
      if (!this.previousRules) {
        this.previousRules = newRules;
        return;
      }

      const notifications = this.detectChanges(this.previousRules, newRules);
      notifications.forEach(notification => {
        this.notifyListeners(notification);
      });

      this.previousRules = newRules;
    });
  }

  /**
   * Detect what changed between rule versions
   */
  private detectChanges(oldRules: LoyaltyRules, newRules: LoyaltyRules): RulesChangeNotification[] {
    const notifications: RulesChangeNotification[] = [];

    // Check earning rate changes
    if (oldRules.pointsEarning.pointsPerDollar !== newRules.pointsEarning.pointsPerDollar) {
      const oldRate = oldRules.pointsEarning.pointsPerDollar;
      const newRate = newRules.pointsEarning.pointsPerDollar;
      const percentChange = ((newRate - oldRate) / oldRate) * 100;

      notifications.push({
        type: 'earning_rate',
        title: 'Points Earning Rate Updated',
        message: `You now earn ${this.formatRate(newRate)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%)`,
        impact: percentChange > 0 ? 'positive' : 'negative',
        timestamp: new Date()
      });
    }

    // Check tier threshold changes
    for (let i = 0; i < oldRules.tiers.length; i++) {
      const oldTier = oldRules.tiers[i];
      const newTier = newRules.tiers[i];

      if (oldTier.pointsRequired !== newTier.pointsRequired) {
        notifications.push({
          type: 'tier_threshold',
          title: `${newTier.name} Tier Updated`,
          message: `Now requires ${newTier.pointsRequired} points (was ${oldTier.pointsRequired})`,
          impact: newTier.pointsRequired < oldTier.pointsRequired ? 'positive' : 'negative',
          timestamp: new Date()
        });
      }

      // Check tier benefits changes
      if (oldTier.benefits.discountPercentage !== newTier.benefits.discountPercentage) {
        notifications.push({
          type: 'tier_threshold',
          title: `${newTier.name} Discount Updated`,
          message: `Discount changed to ${newTier.benefits.discountPercentage}% (was ${oldTier.benefits.discountPercentage}%)`,
          impact: newTier.benefits.discountPercentage > oldTier.benefits.discountPercentage ? 'positive' : 'negative',
          timestamp: new Date()
        });
      }

      if (oldTier.benefits.earningMultiplier !== newTier.benefits.earningMultiplier) {
        notifications.push({
          type: 'tier_threshold',
          title: `${newTier.name} Earning Multiplier Updated`,
          message: `Now earn ${newTier.benefits.earningMultiplier}x points (was ${oldTier.benefits.earningMultiplier}x)`,
          impact: newTier.benefits.earningMultiplier > oldTier.benefits.earningMultiplier ? 'positive' : 'negative',
          timestamp: new Date()
        });
      }
    }

    // Check redemption changes
    for (let i = 0; i < Math.min(oldRules.redemption.length, newRules.redemption.length); i++) {
      const oldRedemption = oldRules.redemption[i];
      const newRedemption = newRules.redemption[i];

      if (oldRedemption.pointsRequired !== newRedemption.pointsRequired) {
        notifications.push({
          type: 'redemption',
          title: 'Redemption Option Updated',
          message: `${newRedemption.name} now costs ${newRedemption.pointsRequired} points (was ${oldRedemption.pointsRequired})`,
          impact: newRedemption.pointsRequired < oldRedemption.pointsRequired ? 'positive' : 'negative',
          timestamp: new Date()
        });
      }
    }

    return notifications;
  }

  /**
   * Format earning rate for display
   */
  private formatRate(rate: number): string {
    const dollarsPerPoint = 1 / rate;
    if (dollarsPerPoint >= 1) {
      return `1 point per $${dollarsPerPoint.toFixed(0)}`;
    } else {
      return `${rate.toFixed(1)} points per $1`;
    }
  }

  /**
   * Subscribe to rule change notifications
   */
  public onNotification(callback: (notification: RulesChangeNotification) => void): () => void {
    this.notificationCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: RulesChangeNotification): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Get notification history (last 10)
   */
  private notificationHistory: RulesChangeNotification[] = [];

  public getNotificationHistory(): RulesChangeNotification[] {
    return [...this.notificationHistory];
  }

  /**
   * Clear notification history
   */
  public clearHistory(): void {
    this.notificationHistory = [];
  }
}

export const loyaltyRulesNotificationService = LoyaltyRulesNotificationService.getInstance();
