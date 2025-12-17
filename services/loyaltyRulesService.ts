// Loyalty Rules Service - Dynamic Rules Engine
// Centralized service for managing all loyalty program rules
// NO HARDCODED VALUES - Everything is configurable via Firebase

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../firebaseConfig';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface PointsEarningRule {
  id: string;
  name: string;
  description: string;
  pointsPerDollar: number; // How many points per $1 spent
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TierConfig {
  id: string;
  name: string;
  pointsRequired: number;
  color: string;
  benefits: {
    discountPercentage: number;
    freeShippingThreshold: number; // $0 means always free
    earningMultiplier: number; // 1.0 = normal, 1.5 = 50% bonus, 2.0 = double points
    exclusiveAccess: boolean;
    prioritySupport: boolean;
  };
  icon: string;
  description: string;
}

export interface RedemptionRule {
  id: string;
  name: string;
  pointsRequired: number;
  dollarValue: number; // How much $ discount you get
  enabled: boolean;
  minimumPurchase: number; // Minimum order value to redeem
  description: string;
}

export interface LoyaltyRules {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  
  // Points Earning
  pointsEarning: PointsEarningRule;
  
  // Tier System
  tiers: TierConfig[];
  
  // Redemption Rules
  redemption: RedemptionRule[];
  
  // Advanced Settings
  settings: {
    pointsExpireDays: number; // 0 = never expire
    allowPartialRedemption: boolean;
    roundingRule: 'floor' | 'ceil' | 'round';
    enableBonusEvents: boolean;
  };
}

// ============================================
// DEFAULT RULES (Fallback only)
// ============================================

const DEFAULT_RULES: LoyaltyRules = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system',
  
  pointsEarning: {
    id: 'default-earning',
    name: 'Standard Earning Rate',
    description: '1 point for every $10 spent',
    pointsPerDollar: 0.1, // 1 point per $10 = 0.1 points per $1
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  tiers: [
    {
      id: 'bronze',
      name: 'Bronze',
      pointsRequired: 0,
      color: '#cd7f32',
      benefits: {
        discountPercentage: 0,
        freeShippingThreshold: 500,
        earningMultiplier: 1.0,
        exclusiveAccess: false,
        prioritySupport: false,
      },
      icon: '🥉',
      description: 'Welcome tier - Start earning points',
    },
    {
      id: 'silver',
      name: 'Silver',
      pointsRequired: 1000,
      color: '#c0c0c0',
      benefits: {
        discountPercentage: 5,
        freeShippingThreshold: 300,
        earningMultiplier: 1.2,
        exclusiveAccess: false,
        prioritySupport: false,
      },
      icon: '🥈',
      description: 'Loyal member - 5% discount + 20% bonus points',
    },
    {
      id: 'gold',
      name: 'Gold',
      pointsRequired: 2500,
      color: '#ffd700',
      benefits: {
        discountPercentage: 10,
        freeShippingThreshold: 100,
        earningMultiplier: 1.5,
        exclusiveAccess: true,
        prioritySupport: false,
      },
      icon: '🥇',
      description: 'VIP member - 10% discount + 50% bonus points + exclusive access',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      pointsRequired: 5000,
      color: '#e5e4e2',
      benefits: {
        discountPercentage: 15,
        freeShippingThreshold: 0,
        earningMultiplier: 2.0,
        exclusiveAccess: true,
        prioritySupport: true,
      },
      icon: '💎',
      description: 'Elite member - 15% discount + double points + free shipping always + priority support',
    },
  ],
  
  redemption: [
    {
      id: 'redeem-100',
      name: '$10 Off',
      pointsRequired: 100,
      dollarValue: 10,
      enabled: true,
      minimumPurchase: 50,
      description: 'Redeem 100 points for $10 off (minimum $50 purchase)',
    },
    {
      id: 'redeem-250',
      name: '$25 Off',
      pointsRequired: 250,
      dollarValue: 25,
      enabled: true,
      minimumPurchase: 100,
      description: 'Redeem 250 points for $25 off (minimum $100 purchase)',
    },
    {
      id: 'redeem-500',
      name: '$50 Off',
      pointsRequired: 500,
      dollarValue: 50,
      enabled: true,
      minimumPurchase: 150,
      description: 'Redeem 500 points for $50 off (minimum $150 purchase)',
    },
  ],
  
  settings: {
    pointsExpireDays: 365, // Points expire after 1 year
    allowPartialRedemption: false,
    roundingRule: 'floor',
    enableBonusEvents: true,
  },
};

// ============================================
// LOYALTY RULES SERVICE (Singleton)
// ============================================

class LoyaltyRulesService {
  private static instance: LoyaltyRulesService;
  private db = getFirestore();
  private rulesCollection = 'loyaltyRules';
  private rulesDocId = 'current';
  
  // Cached rules
  private cachedRules: LoyaltyRules | null = null;
  private isLoading = false;
  private listeners: Array<(rules: LoyaltyRules) => void> = [];
  private unsubscribe: (() => void) | null = null;
  
  private constructor() {
    console.log('🎯 LoyaltyRulesService initialized');
    this.initializeRealTimeListener();
  }
  
  // Singleton pattern
  public static getInstance(): LoyaltyRulesService {
    if (!LoyaltyRulesService.instance) {
      LoyaltyRulesService.instance = new LoyaltyRulesService();
    }
    return LoyaltyRulesService.instance;
  }
  
  // ============================================
  // REAL-TIME LISTENER
  // ============================================
  
  private initializeRealTimeListener() {
    try {
      const rulesRef = doc(this.db, this.rulesCollection, this.rulesDocId);
      
      this.unsubscribe = onSnapshot(rulesRef, (snapshot) => {
        if (snapshot.exists()) {
          this.cachedRules = snapshot.data() as LoyaltyRules;
          console.log('🔄 Loyalty rules updated from Firebase:', this.cachedRules.version);
          
          // Notify all listeners
          this.notifyListeners(this.cachedRules);
        } else {
          console.log('⚠️ No loyalty rules found in Firebase, using defaults');
          this.cachedRules = DEFAULT_RULES;
          this.notifyListeners(this.cachedRules);
        }
      }, (error) => {
        console.error('❌ Error listening to loyalty rules:', error);
        this.cachedRules = DEFAULT_RULES;
        this.notifyListeners(this.cachedRules);
      });
      
      console.log('✅ Real-time listener initialized for loyalty rules');
    } catch (error) {
      console.error('❌ Failed to initialize real-time listener:', error);
      this.cachedRules = DEFAULT_RULES;
    }
  }
  
  // ============================================
  // EVENT EMITTER
  // ============================================
  
  public onRulesChange(callback: (rules: LoyaltyRules) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current rules if available
    if (this.cachedRules) {
      callback(this.cachedRules);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  private notifyListeners(rules: LoyaltyRules) {
    this.listeners.forEach(listener => {
      try {
        listener(rules);
      } catch (error) {
        console.error('❌ Error in rules change listener:', error);
      }
    });
  }
  
  // ============================================
  // GET RULES (with caching)
  // ============================================
  
  public async getRules(): Promise<LoyaltyRules> {
    // Return cached if available
    if (this.cachedRules) {
      return this.cachedRules;
    }
    
    // Prevent multiple simultaneous loads
    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.cachedRules) {
            clearInterval(checkInterval);
            resolve(this.cachedRules);
          }
        }, 100);
      });
    }
    
    this.isLoading = true;
    
    try {
      const rulesRef = doc(this.db, this.rulesCollection, this.rulesDocId);
      const rulesSnap = await getDoc(rulesRef);
      
      if (rulesSnap.exists()) {
        this.cachedRules = rulesSnap.data() as LoyaltyRules;
        console.log('✅ Loaded loyalty rules from Firebase');
      } else {
        console.log('⚠️ No rules found, initializing with defaults');
        await this.initializeDefaultRules();
        this.cachedRules = DEFAULT_RULES;
      }
      
      return this.cachedRules;
    } catch (error) {
      console.error('❌ Error loading loyalty rules:', error);
      console.log('📦 Using default rules as fallback');
      this.cachedRules = DEFAULT_RULES;
      return DEFAULT_RULES;
    } finally {
      this.isLoading = false;
    }
  }
  
  // ============================================
  // UPDATE RULES
  // ============================================
  
  public async updateRules(rules: Partial<LoyaltyRules>): Promise<boolean> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('❌ User not authenticated');
        return false;
      }
      
      const currentRules = await this.getRules();
      
      const updatedRules: LoyaltyRules = {
        ...currentRules,
        ...rules,
        version: this.incrementVersion(currentRules.version),
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.email || currentUser.uid,
      };
      
      const rulesRef = doc(this.db, this.rulesCollection, this.rulesDocId);
      await setDoc(rulesRef, updatedRules);
      
      console.log('✅ Loyalty rules updated successfully');
      
      // Cache will be updated by real-time listener
      return true;
    } catch (error) {
      console.error('❌ Error updating loyalty rules:', error);
      return false;
    }
  }
  
  // ============================================
  // INITIALIZE DEFAULT RULES
  // ============================================
  
  private async initializeDefaultRules(): Promise<void> {
    try {
      const rulesRef = doc(this.db, this.rulesCollection, this.rulesDocId);
      await setDoc(rulesRef, DEFAULT_RULES);
      console.log('✅ Initialized default loyalty rules in Firebase');
    } catch (error) {
      console.error('❌ Error initializing default rules:', error);
    }
  }
  
  // ============================================
  // HELPER METHODS
  // ============================================
  
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
  
  // ============================================
  // CALCULATION METHODS
  // ============================================
  
  /**
   * Calculate points earned from a purchase
   */
  public async calculatePointsEarned(orderAmount: number, userTier?: string): Promise<number> {
    const rules = await this.getRules();
    const earningRule = rules.pointsEarning;
    
    if (!earningRule.enabled) {
      console.warn('⚠️ Points earning is disabled');
      return 0;
    }
    
    // Base points
    let points = orderAmount * earningRule.pointsPerDollar;
    
    // Apply tier multiplier if user has a tier
    if (userTier) {
      const tier = rules.tiers.find(t => t.id === userTier);
      if (tier) {
        points *= tier.benefits.earningMultiplier;
        console.log(`💎 Applied ${tier.name} multiplier: ${tier.benefits.earningMultiplier}x`);
      }
    }
    
    // Apply rounding rule
    switch (rules.settings.roundingRule) {
      case 'floor':
        points = Math.floor(points);
        break;
      case 'ceil':
        points = Math.ceil(points);
        break;
      case 'round':
        points = Math.round(points);
        break;
    }
    
    console.log(`💰 Calculated points: $${orderAmount} → ${points} points (tier: ${userTier || 'none'})`);
    return points;
  }
  
  /**
   * Calculate tier based on total points
   */
  public async calculateTier(totalPoints: number): Promise<TierConfig> {
    const rules = await this.getRules();
    
    // Find the highest tier the user qualifies for
    const qualifiedTiers = rules.tiers
      .filter(tier => totalPoints >= tier.pointsRequired)
      .sort((a, b) => b.pointsRequired - a.pointsRequired);
    
    return qualifiedTiers[0] || rules.tiers[0]; // Default to first tier (Bronze)
  }
  
  /**
   * Get tier benefits
   */
  public async getTierBenefits(tierId: string): Promise<TierConfig['benefits'] | null> {
    const rules = await this.getRules();
    const tier = rules.tiers.find(t => t.id === tierId);
    return tier?.benefits || null;
  }
  
  /**
   * Get available redemption options
   */
  public async getRedemptionOptions(userPoints: number, orderTotal: number): Promise<RedemptionRule[]> {
    const rules = await this.getRules();
    
    return rules.redemption.filter(option => 
      option.enabled &&
      userPoints >= option.pointsRequired &&
      orderTotal >= option.minimumPurchase
    );
  }
  
  /**
   * Calculate discount from redeemed points
   */
  public async calculateRedemptionDiscount(redemptionId: string): Promise<number> {
    const rules = await this.getRules();
    const redemption = rules.redemption.find(r => r.id === redemptionId);
    return redemption?.dollarValue || 0;
  }
  
  // ============================================
  // CLEANUP
  // ============================================
  
  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
    this.cachedRules = null;
  }
}

// Export singleton instance
export const loyaltyRulesService = LoyaltyRulesService.getInstance();
