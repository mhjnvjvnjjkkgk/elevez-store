import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, where, Timestamp } from 'firebase/firestore';
import { DiscountCode, UserProfile } from '../types';

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'admin_add' | 'admin_remove';
  points: number;
  reason: string;
  adminId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AdminState {
  discounts: DiscountCode[];
  points: PointsTransaction[];
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  lastSync: Date;
  isSyncing: boolean;
}

export interface AdminContextType {
  state: AdminState;
  discounts: DiscountCode[];
  points: PointsTransaction[];
  users: UserProfile[];
  
  // Discount operations
  createDiscount: (code: DiscountCode) => Promise<void>;
  updateDiscount: (id: string, updates: Partial<DiscountCode>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
  
  // Points operations
  addPoints: (userId: string, amount: number, reason: string, adminId?: string) => Promise<void>;
  removePoints: (userId: string, amount: number, reason: string, adminId?: string) => Promise<void>;
  getPointsHistory: (userId: string) => PointsTransaction[];
  
  // User operations
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  
  // Sync operations
  sync: () => Promise<void>;
  
  // Event handlers
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
  emit: (event: string, data: any) => void;
}

export const DEFAULT_ADMIN_STATE: AdminState = {
  discounts: [],
  points: [],
  users: [],
  loading: false,
  error: null,
  lastSync: new Date(),
  isSyncing: false,
};

export class AdminContextService {
  private state: AdminState = { ...DEFAULT_ADMIN_STATE };
  private listeners: Map<string, Set<Function>> = new Map();
  private unsubscribers: (() => void)[] = [];

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    // Listen to discounts
    const discountsQuery = query(collection(db, 'discountCodes'));
    const unsubscribeDiscounts = onSnapshot(discountsQuery, (snapshot) => {
      this.state.discounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiscountCode[];
      this.emit('discounts:updated', this.state.discounts);
    }, (error) => {
      this.handleError('Failed to sync discounts', error);
    });
    this.unsubscribers.push(unsubscribeDiscounts);

    // Listen to points transactions
    const pointsQuery = query(collection(db, 'pointsTransactions'));
    const unsubscribePoints = onSnapshot(pointsQuery, (snapshot) => {
      this.state.points = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        } as PointsTransaction;
      });
      this.emit('points:updated', this.state.points);
    }, (error) => {
      this.handleError('Failed to sync points', error);
    });
    this.unsubscribers.push(unsubscribePoints);

    // Listen to users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      this.state.users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
      this.emit('users:updated', this.state.users);
    }, (error) => {
      this.handleError('Failed to sync users', error);
    });
    this.unsubscribers.push(unsubscribeUsers);
  }

  getState(): AdminState {
    return { ...this.state };
  }

  async createDiscount(code: DiscountCode): Promise<void> {
    try {
      this.state.isSyncing = true;
      const docRef = await addDoc(collection(db, 'discountCodes'), {
        ...code,
        createdAt: Timestamp.now(),
      });
      this.emit('discount:created', { id: docRef.id, ...code });
    } catch (error) {
      this.handleError('Failed to create discount', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  async updateDiscount(id: string, updates: Partial<DiscountCode>): Promise<void> {
    try {
      this.state.isSyncing = true;
      await updateDoc(doc(db, 'discountCodes', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      this.emit('discount:updated', { id, ...updates });
    } catch (error) {
      this.handleError('Failed to update discount', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  async deleteDiscount(id: string): Promise<void> {
    try {
      this.state.isSyncing = true;
      await deleteDoc(doc(db, 'discountCodes', id));
      this.emit('discount:deleted', { id });
    } catch (error) {
      this.handleError('Failed to delete discount', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  async addPoints(userId: string, amount: number, reason: string, adminId?: string): Promise<void> {
    try {
      this.state.isSyncing = true;
      const transaction: Omit<PointsTransaction, 'id'> = {
        userId,
        type: adminId ? 'admin_add' : 'earn',
        points: amount,
        reason,
        adminId,
        timestamp: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'pointsTransactions'), {
        ...transaction,
        timestamp: Timestamp.now(),
      });
      
      this.emit('points:added', { id: docRef.id, ...transaction });
    } catch (error) {
      this.handleError('Failed to add points', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  async removePoints(userId: string, amount: number, reason: string, adminId?: string): Promise<void> {
    try {
      this.state.isSyncing = true;
      const transaction: Omit<PointsTransaction, 'id'> = {
        userId,
        type: adminId ? 'admin_remove' : 'redeem',
        points: -amount,
        reason,
        adminId,
        timestamp: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'pointsTransactions'), {
        ...transaction,
        timestamp: Timestamp.now(),
      });
      
      this.emit('points:removed', { id: docRef.id, ...transaction });
    } catch (error) {
      this.handleError('Failed to remove points', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  getPointsHistory(userId: string): PointsTransaction[] {
    return this.state.points.filter(p => p.userId === userId);
  }

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      this.state.isSyncing = true;
      await updateDoc(doc(db, 'users', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      this.emit('user:updated', { id, ...updates });
    } catch (error) {
      this.handleError('Failed to update user', error);
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  async sync(): Promise<void> {
    try {
      this.state.isSyncing = true;
      this.state.lastSync = new Date();
      this.emit('sync:started', {});
      
      // Sync is handled by real-time listeners
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.emit('sync:completed', { timestamp: this.state.lastSync });
    } catch (error) {
      this.handleError('Sync failed', error);
      this.emit('sync:error', { error });
      throw error;
    } finally {
      this.state.isSyncing = false;
    }
  }

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(handler);
    }
  }

  emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.state.error = message;
    this.emit('error', { message, error });
  }

  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
    this.listeners.clear();
  }
}

// Singleton instance
let instance: AdminContextService | null = null;

export function getAdminContextService(): AdminContextService {
  if (!instance) {
    instance = new AdminContextService();
  }
  return instance;
}

export function resetAdminContextService(): void {
  if (instance) {
    instance.cleanup();
    instance = null;
  }
}
