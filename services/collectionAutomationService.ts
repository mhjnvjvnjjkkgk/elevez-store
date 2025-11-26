import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type TriggerType = 'product_added' | 'product_updated' | 'price_changed' | 'stock_changed' | 'scheduled';

export interface AutomationRule {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  trigger: TriggerType;
  condition: {
    field?: string;
    operator?: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
    value?: any;
    minValue?: number;
    maxValue?: number;
  };
  action: 'add' | 'remove' | 'update';
  enabled: boolean;
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class CollectionAutomationService {
  private rulesRef = collection(db, 'automationRules');

  /**
   * Get all automation rules
   */
  async getAllRules(): Promise<AutomationRule[]> {
    try {
      const snapshot = await getDocs(this.rulesRef);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastExecuted: doc.data().lastExecuted?.toDate()
      } as AutomationRule));
    } catch (error) {
      console.error('Error getting rules:', error);
      throw error;
    }
  }

  /**
   * Get rules for collection
   */
  async getRulesByCollection(collectionId: string): Promise<AutomationRule[]> {
    try {
      const q = query(
        this.rulesRef,
        where('collectionId', '==', collectionId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastExecuted: doc.data().lastExecuted?.toDate()
      } as AutomationRule));
    } catch (error) {
      console.error('Error getting rules by collection:', error);
      throw error;
    }
  }

  /**
   * Get enabled rules by trigger
   */
  async getRulesByTrigger(trigger: TriggerType): Promise<AutomationRule[]> {
    try {
      const q = query(
        this.rulesRef,
        where('trigger', '==', trigger),
        where('enabled', '==', true)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastExecuted: doc.data().lastExecuted?.toDate()
      } as AutomationRule));
    } catch (error) {
      console.error('Error getting rules by trigger:', error);
      throw error;
    }
  }

  /**
   * Create automation rule
   */
  async createRule(
    collectionId: string,
    name: string,
    description: string,
    trigger: TriggerType,
    condition: any,
    action: 'add' | 'remove' | 'update'
  ): Promise<string> {
    try {
      const newRule: Omit<AutomationRule, 'id'> = {
        collectionId,
        name,
        description,
        trigger,
        condition,
        action,
        enabled: true,
        executionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(this.rulesRef, newRule);
      return docRef.id;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }

  /**
   * Update automation rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<AutomationRule>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'automationRules', ruleId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  /**
   * Delete automation rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    try {
      const docRef = doc(db, 'automationRules', ruleId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }

  /**
   * Enable/disable rule
   */
  async toggleRule(ruleId: string, enabled: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'automationRules', ruleId);
      await updateDoc(docRef, {
        enabled,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
      throw error;
    }
  }

  /**
   * Execute rule
   */
  async executeRule(
    ruleId: string,
    productIds: string[],
    productCollectionService: any
  ): Promise<void> {
    try {
      const docRef = doc(db, 'automationRules', ruleId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Rule not found');
      }

      const rule = docSnap.data() as AutomationRule;

      if (!rule.enabled) {
        return;
      }

      // Execute action based on rule
      switch (rule.action) {
        case 'add':
          await productCollectionService.assignProductsToCollection(
            rule.collectionId,
            productIds
          );
          break;
        case 'remove':
          await productCollectionService.removeProductFromCollections(
            productIds,
            [rule.collectionId]
          );
          break;
        case 'update':
          // Update logic here
          break;
      }

      // Update execution count and last executed time
      await updateDoc(docRef, {
        executionCount: (rule.executionCount || 0) + 1,
        lastExecuted: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error executing rule:', error);
      throw error;
    }
  }

  /**
   * Check if product matches condition
   */
  matchesCondition(product: any, condition: any): boolean {
    if (!condition.field) return true;

    const value = product[condition.field];

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'in_range':
        return value >= condition.minValue && value <= condition.maxValue;
      default:
        return true;
    }
  }

  /**
   * Get rule statistics
   */
  async getRuleStats(): Promise<{
    totalRules: number;
    enabledRules: number;
    disabledRules: number;
    totalExecutions: number;
  }> {
    try {
      const rules = await this.getAllRules();

      return {
        totalRules: rules.length,
        enabledRules: rules.filter(r => r.enabled).length,
        disabledRules: rules.filter(r => !r.enabled).length,
        totalExecutions: rules.reduce((sum, r) => sum + (r.executionCount || 0), 0)
      };
    } catch (error) {
      console.error('Error getting rule stats:', error);
      throw error;
    }
  }
}

export const collectionAutomationService = new CollectionAutomationService();
