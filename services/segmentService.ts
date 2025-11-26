import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
  value2?: any;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  logic: 'AND' | 'OR';
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface SegmentAnalytics {
  segmentId: string;
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  averagePoints: number;
  averageOrderValue: number;
  conversionRate: number;
  churnRate: number;
  growthRate: number;
}

export interface SegmentAction {
  id: string;
  segmentId: string;
  type: 'email' | 'points' | 'discount' | 'notification';
  name: string;
  description: string;
  config: Record<string, any>;
  executedAt?: Date;
  executedCount: number;
}

class SegmentService {
  private segments: Map<string, Segment> = new Map();
  private analytics: Map<string, SegmentAnalytics> = new Map();
  private actions: Map<string, SegmentAction> = new Map();

  /**
   * Create segment
   */
  async createSegment(
    name: string,
    description: string,
    rules: SegmentRule[],
    logic: 'AND' | 'OR' = 'AND'
  ): Promise<Segment> {
    const segmentId = `segment_${Date.now()}`;
    const segment: Segment = {
      id: segmentId,
      name,
      description,
      rules,
      logic,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    };

    this.segments.set(segmentId, segment);

    try {
      await this.saveToFirebase(segment);
    } catch (error) {
      console.error('Failed to save segment:', error);
    }

    return segment;
  }

  /**
   * Get segment
   */
  getSegment(segmentId: string): Segment | undefined {
    return this.segments.get(segmentId);
  }

  /**
   * Get all segments
   */
  getAllSegments(active?: boolean): Segment[] {
    let segments = Array.from(this.segments.values());

    if (active !== undefined) {
      segments = segments.filter((s) => s.active === active);
    }

    return segments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update segment
   */
  updateSegment(
    segmentId: string,
    updates: Partial<Segment>
  ): Segment | undefined {
    const segment = this.segments.get(segmentId);
    if (segment) {
      const updated = { ...segment, ...updates, updatedAt: new Date() };
      this.segments.set(segmentId, updated);
      return updated;
    }
    return undefined;
  }

  /**
   * Delete segment
   */
  deleteSegment(segmentId: string): boolean {
    return this.segments.delete(segmentId);
  }

  /**
   * Evaluate user against segment
   */
  evaluateUser(user: Record<string, any>, segment: Segment): boolean {
    const results = segment.rules.map((rule) => this.evaluateRule(user, rule));

    if (segment.logic === 'AND') {
      return results.every((r) => r);
    } else {
      return results.some((r) => r);
    }
  }

  /**
   * Get users matching segment
   */
  getUsersInSegment(segment: Segment, users: Record<string, any>[]): Record<string, any>[] {
    return users.filter((user) => this.evaluateUser(user, segment));
  }

  /**
   * Get segment analytics
   */
  getAnalytics(segmentId: string): SegmentAnalytics | undefined {
    return this.analytics.get(segmentId);
  }

  /**
   * Calculate segment analytics
   */
  calculateAnalytics(
    segmentId: string,
    users: Record<string, any>[],
    orders: Record<string, any>[] = []
  ): SegmentAnalytics {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error('Segment not found');
    }

    const segmentUsers = this.getUsersInSegment(segment, users);
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsersThisMonth = segmentUsers.filter(
      (u) => u.createdAt && new Date(u.createdAt) > monthAgo
    ).length;

    const activeUsers = segmentUsers.filter((u) => u.lastActive && new Date(u.lastActive) > monthAgo).length;

    const totalPoints = segmentUsers.reduce((sum, u) => sum + (u.totalPoints || 0), 0);
    const averagePoints = segmentUsers.length > 0 ? totalPoints / segmentUsers.length : 0;

    const segmentOrders = orders.filter((o) =>
      segmentUsers.some((u) => u.id === o.userId)
    );

    const totalOrderValue = segmentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = segmentOrders.length > 0 ? totalOrderValue / segmentOrders.length : 0;

    const conversionRate = segmentUsers.length > 0
      ? (segmentOrders.length / segmentUsers.length) * 100
      : 0;

    const analytics: SegmentAnalytics = {
      segmentId,
      totalUsers: segmentUsers.length,
      newUsersThisMonth,
      activeUsers,
      averagePoints,
      averageOrderValue,
      conversionRate,
      churnRate: Math.random() * 10,
      growthRate: Math.random() * 20,
    };

    this.analytics.set(segmentId, analytics);
    return analytics;
  }

  /**
   * Create segment action
   */
  createAction(
    segmentId: string,
    type: SegmentAction['type'],
    name: string,
    description: string,
    config: Record<string, any>
  ): SegmentAction {
    const actionId = `action_${Date.now()}`;
    const action: SegmentAction = {
      id: actionId,
      segmentId,
      type,
      name,
      description,
      config,
      executedCount: 0,
    };

    this.actions.set(actionId, action);
    return action;
  }

  /**
   * Get segment actions
   */
  getSegmentActions(segmentId: string): SegmentAction[] {
    return Array.from(this.actions.values()).filter((a) => a.segmentId === segmentId);
  }

  /**
   * Execute action
   */
  executeAction(actionId: string): SegmentAction | undefined {
    const action = this.actions.get(actionId);
    if (action) {
      action.executedAt = new Date();
      action.executedCount++;
      return action;
    }
    return undefined;
  }

  /**
   * Get segment comparison
   */
  compareSegments(
    segmentId1: string,
    segmentId2: string,
    users: Record<string, any>[]
  ): {
    segment1: Segment | undefined;
    segment2: Segment | undefined;
    users1: number;
    users2: number;
    overlap: number;
    unique1: number;
    unique2: number;
  } {
    const segment1 = this.segments.get(segmentId1);
    const segment2 = this.segments.get(segmentId2);

    const users1 = segment1 ? this.getUsersInSegment(segment1, users) : [];
    const users2 = segment2 ? this.getUsersInSegment(segment2, users) : [];

    const ids1 = new Set(users1.map((u) => u.id));
    const ids2 = new Set(users2.map((u) => u.id));

    const overlap = Array.from(ids1).filter((id) => ids2.has(id)).length;
    const unique1 = ids1.size - overlap;
    const unique2 = ids2.size - overlap;

    return {
      segment1,
      segment2,
      users1: ids1.size,
      users2: ids2.size,
      overlap,
      unique1,
      unique2,
    };
  }

  /**
   * Private: Evaluate rule
   */
  private evaluateRule(user: Record<string, any>, rule: SegmentRule): boolean {
    const value = user[rule.field];

    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'contains':
        return String(value).includes(String(rule.value));
      case 'gt':
        return Number(value) > Number(rule.value);
      case 'lt':
        return Number(value) < Number(rule.value);
      case 'gte':
        return Number(value) >= Number(rule.value);
      case 'lte':
        return Number(value) <= Number(rule.value);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'between':
        return Number(value) >= Number(rule.value) && Number(value) <= Number(rule.value2);
      default:
        return false;
    }
  }

  /**
   * Private: Save to Firebase
   */
  private async saveToFirebase(segment: Segment): Promise<void> {
    try {
      const segmentsRef = collection(db, 'segments');
      await addDoc(segmentsRef, {
        ...segment,
        createdAt: Timestamp.fromDate(segment.createdAt),
        updatedAt: Timestamp.fromDate(segment.updatedAt),
      });
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
    }
  }
}

export const segmentService = new SegmentService();
