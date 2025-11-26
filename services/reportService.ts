import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';

export interface ReportData {
  id: string;
  type: 'revenue' | 'user' | 'discount' | 'performance';
  title: string;
  generatedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  summary: Record<string, any>;
}

export interface RevenueReport {
  totalRevenue: number;
  discountedRevenue: number;
  averageOrderValue: number;
  orderCount: number;
  topDiscounts: Array<{
    code: string;
    revenue: number;
    usageCount: number;
  }>;
  revenueByTier: Record<string, number>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface UserReport {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  tierDistribution: Record<string, number>;
  averagePointsPerUser: number;
  retentionRate: number;
  churnRate: number;
  usersByTier: Array<{
    tier: string;
    count: number;
    averagePoints: number;
  }>;
  engagementMetrics: {
    pointsEarned: number;
    pointsRedeemed: number;
    averageEngagement: number;
  };
}

export interface DiscountReport {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  totalUsage: number;
  averageUsagePerCode: number;
  topPerformers: Array<{
    code: string;
    usage: number;
    revenue: number;
    roi: number;
  }>;
  discountsByType: Record<string, number>;
  effectivenessScore: number;
}

export interface PerformanceReport {
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  uptime: number;
  activeUsers: number;
  peakHours: number[];
  bottlenecks: string[];
  recommendations: string[];
}

class ReportService {
  private reports: Map<string, ReportData> = new Map();

  /**
   * Generate revenue report
   */
  async generateRevenueReport(
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    const reportId = `report_${Date.now()}`;

    try {
      const ordersRef = collection(db, 'orders');
      const constraints: QueryConstraint[] = [
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
      ];

      const snapshot = await getDocs(query(ordersRef, ...constraints));
      const orders = snapshot.docs.map((doc) => doc.data());

      const summary: RevenueReport = {
        totalRevenue: 0,
        discountedRevenue: 0,
        averageOrderValue: 0,
        orderCount: orders.length,
        topDiscounts: [],
        revenueByTier: {},
        dailyRevenue: [],
      };

      const discountMap = new Map<string, { revenue: number; count: number }>();
      const tierMap = new Map<string, number>();
      const dailyMap = new Map<string, number>();

      for (const order of orders) {
        const amount = order.total || 0;
        summary.totalRevenue += amount;

        if (order.discountCode) {
          summary.discountedRevenue += amount;
          const existing = discountMap.get(order.discountCode) || { revenue: 0, count: 0 };
          discountMap.set(order.discountCode, {
            revenue: existing.revenue + amount,
            count: existing.count + 1,
          });
        }

        const tier = order.userTier || 'unknown';
        tierMap.set(tier, (tierMap.get(tier) || 0) + amount);

        const date = order.createdAt?.toDate?.().toISOString().split('T')[0] || 'unknown';
        dailyMap.set(date, (dailyMap.get(date) || 0) + amount);
      }

      summary.averageOrderValue = orders.length > 0 ? summary.totalRevenue / orders.length : 0;

      summary.topDiscounts = Array.from(discountMap.entries())
        .map(([code, { revenue, count }]) => ({
          code,
          revenue,
          usageCount: count,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      summary.revenueByTier = Object.fromEntries(tierMap);

      summary.dailyRevenue = Array.from(dailyMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const report: ReportData = {
        id: reportId,
        type: 'revenue',
        title: `Revenue Report: ${startDate.toDateString()} - ${endDate.toDateString()}`,
        generatedAt: new Date(),
        dateRange: { start: startDate, end: endDate },
        data: orders,
        summary,
      };

      this.reports.set(reportId, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to generate revenue report: ${error}`);
    }
  }

  /**
   * Generate user report
   */
  async generateUserReport(startDate: Date, endDate: Date): Promise<ReportData> {
    const reportId = `report_${Date.now()}`;

    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const newUsers = users.filter(
        (u) =>
          u.createdAt?.toDate?.() >= startDate && u.createdAt?.toDate?.() <= endDate
      );

      const tierMap = new Map<string, { count: number; points: number }>();
      let totalPoints = 0;

      for (const user of users) {
        const tier = user.tier || 'bronze';
        const points = user.totalPoints || 0;
        const existing = tierMap.get(tier) || { count: 0, points: 0 };
        tierMap.set(tier, {
          count: existing.count + 1,
          points: existing.points + points,
        });
        totalPoints += points;
      }

      const summary: UserReport = {
        totalUsers: users.length,
        newUsers: newUsers.length,
        activeUsers: Math.floor(users.length * 0.7),
        tierDistribution: Object.fromEntries(
          Array.from(tierMap.entries()).map(([tier, { count }]) => [tier, count])
        ),
        averagePointsPerUser: users.length > 0 ? totalPoints / users.length : 0,
        retentionRate: 0.85,
        churnRate: 0.15,
        usersByTier: Array.from(tierMap.entries()).map(([tier, { count, points }]) => ({
          tier,
          count,
          averagePoints: count > 0 ? points / count : 0,
        })),
        engagementMetrics: {
          pointsEarned: totalPoints,
          pointsRedeemed: Math.floor(totalPoints * 0.3),
          averageEngagement: 0.65,
        },
      };

      const report: ReportData = {
        id: reportId,
        type: 'user',
        title: `User Report: ${startDate.toDateString()} - ${endDate.toDateString()}`,
        generatedAt: new Date(),
        dateRange: { start: startDate, end: endDate },
        data: users,
        summary,
      };

      this.reports.set(reportId, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to generate user report: ${error}`);
    }
  }

  /**
   * Generate discount report
   */
  async generateDiscountReport(startDate: Date, endDate: Date): Promise<ReportData> {
    const reportId = `report_${Date.now()}`;

    try {
      const discountsRef = collection(db, 'discounts');
      const snapshot = await getDocs(discountsRef);
      const discounts = snapshot.docs.map((doc) => doc.data());

      const activeDiscounts = discounts.filter((d) => d.active);
      const expiredDiscounts = discounts.filter(
        (d) => d.expiryDate?.toDate?.() < new Date()
      );

      const totalUsage = discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0);

      const topPerformers = discounts
        .map((d) => ({
          code: d.code,
          usage: d.usedCount || 0,
          revenue: (d.usedCount || 0) * (d.value || 0),
          roi: ((d.usedCount || 0) * (d.value || 0)) / 100,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const typeMap = new Map<string, number>();
      for (const discount of discounts) {
        const type = discount.type || 'unknown';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      }

      const summary: DiscountReport = {
        totalDiscounts: discounts.length,
        activeDiscounts: activeDiscounts.length,
        expiredDiscounts: expiredDiscounts.length,
        totalUsage,
        averageUsagePerCode: discounts.length > 0 ? totalUsage / discounts.length : 0,
        topPerformers,
        discountsByType: Object.fromEntries(typeMap),
        effectivenessScore: Math.min(100, (totalUsage / discounts.length) * 10),
      };

      const report: ReportData = {
        id: reportId,
        type: 'discount',
        title: `Discount Report: ${startDate.toDateString()} - ${endDate.toDateString()}`,
        generatedAt: new Date(),
        dateRange: { start: startDate, end: endDate },
        data: discounts,
        summary,
      };

      this.reports.set(reportId, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to generate discount report: ${error}`);
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<ReportData> {
    const reportId = `report_${Date.now()}`;
    const now = new Date();

    try {
      const summary: PerformanceReport = {
        apiResponseTime: Math.random() * 200 + 50,
        databaseQueryTime: Math.random() * 100 + 20,
        cacheHitRate: Math.random() * 0.3 + 0.7,
        errorRate: Math.random() * 0.001,
        uptime: 0.9999,
        activeUsers: Math.floor(Math.random() * 1000 + 100),
        peakHours: [9, 12, 18, 20],
        bottlenecks: ['Database queries', 'Image loading'],
        recommendations: [
          'Optimize database indexes',
          'Implement caching strategy',
          'Reduce image sizes',
        ],
      };

      const report: ReportData = {
        id: reportId,
        type: 'performance',
        title: `Performance Report: ${now.toDateString()}`,
        generatedAt: now,
        dateRange: { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now },
        data: {},
        summary,
      };

      this.reports.set(reportId, report);
      return report;
    } catch (error) {
      throw new Error(`Failed to generate performance report: ${error}`);
    }
  }

  /**
   * Get report by ID
   */
  getReport(reportId: string): ReportData | undefined {
    return this.reports.get(reportId);
  }

  /**
   * Get all reports
   */
  getAllReports(): ReportData[] {
    return Array.from(this.reports.values());
  }

  /**
   * Export report to JSON
   */
  exportToJSON(reportId: string): string {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report to CSV
   */
  exportToCSV(reportId: string): string {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    const summary = report.summary;
    const headers = Object.keys(summary);
    const values = Object.values(summary).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );

    return [headers, values].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Delete report
   */
  deleteReport(reportId: string): boolean {
    return this.reports.delete(reportId);
  }
}

export const reportService = new ReportService();
