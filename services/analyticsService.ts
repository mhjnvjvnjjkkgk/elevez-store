// Analytics Service - Real-time metrics and reporting
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDiscountAnalytics } from './firebaseDiscountService';
import { getAdminPointsAnalytics } from './adminPointsService';
import { getLoyaltyProfile } from './loyaltyService';

// Real-time listeners cache
const listeners: Map<string, Unsubscribe> = new Map();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalDiscountGiven: number;
  averageOrderValue: number;
  conversionRate: number;
  loyaltyEngagement: number;
  topTier: string;
}

export interface TrendData {
  date: string;
  value: number;
  label: string;
}

export interface ChartData {
  labels: string | string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string | string[];
    backgroundColor: string | string[];
    tension: number;
  }>;
}

export interface AnalyticsReport {
  period: 'day' | 'week' | 'month' | 'year';
  metrics: DashboardMetrics;
  trends: {
    revenue: TrendData[];
    users: TrendData[];
    discounts: TrendData[];
    points: TrendData[];
  };
  topPerformers: {
    discountCodes: Array<{ code: string; uses: number; revenue: number }>;
    users: Array<{ name: string; points: number; tier: string }>;
  };
  generatedAt: Date;
}

// ============================================
// METRICS CALCULATION
// ============================================

/**
 * Calculate dashboard metrics
 */
export const calculateDashboardMetrics = async (): Promise<DashboardMetrics> => {
  try {
    // Get discount analytics
    const discountAnalytics = await getDiscountAnalytics();
    
    // Get admin points analytics
    const pointsAnalytics = await getAdminPointsAnalytics();

    // Mock data for demo (in production, fetch from Firebase)
    const totalUsers = 1234;
    const activeUsers = Math.floor(totalUsers * 0.65);
    const totalRevenue = 250000;
    const totalDiscountGiven = discountAnalytics.totalDiscountGiven;
    const averageOrderValue = totalRevenue / (discountAnalytics.totalUsages || 1);
    const conversionRate = (discountAnalytics.totalUsages / totalUsers) * 100;
    const loyaltyEngagement = (pointsAnalytics.totalAdminActions / totalUsers) * 100;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalDiscountGiven,
      averageOrderValue,
      conversionRate,
      loyaltyEngagement,
      topTier: 'Gold'
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
};

/**
 * Generate trend data
 */
export const generateTrendData = (days: number = 30): TrendData[] => {
  const trends: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10000) + 5000,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  return trends;
};

/**
 * Generate chart data for revenue
 */
export const generateRevenueChart = (days: number = 30): ChartData => {
  const trends = generateTrendData(days);

  return {
    labels: trends.map(t => t.label),
    datasets: [
      {
        label: 'Revenue',
        data: trends.map(t => t.value),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        tension: 0.4
      }
    ]
  };
};

/**
 * Generate chart data for users
 */
export const generateUsersChart = (days: number = 30): ChartData => {
  const trends = generateTrendData(days);

  return {
    labels: trends.map(t => t.label),
    datasets: [
      {
        label: 'New Users',
        data: trends.map(t => Math.floor(t.value / 100)),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      }
    ]
  };
};

/**
 * Generate chart data for tier distribution
 */
export const generateTierDistributionChart = (): ChartData => {
  return {
    labels: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    datasets: [
      {
        label: 'Users by Tier',
        data: [450, 350, 250, 184],
        borderColor: ['#CD7F32', '#C0C0C0', '#FFD700', '#E5E4E2'],
        backgroundColor: ['rgba(205, 127, 50, 0.2)', 'rgba(192, 192, 192, 0.2)', 'rgba(255, 215, 0, 0.2)', 'rgba(229, 228, 226, 0.2)'],
        tension: 0.4
      }
    ]
  };
};

/**
 * Generate chart data for discount types
 */
export const generateDiscountTypesChart = (): ChartData => {
  return {
    labels: ['Newsletter', 'Exit Intent', 'Loyalty', 'Referral'],
    datasets: [
      {
        label: 'Codes by Type',
        data: [120, 85, 45, 30],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };
};

/**
 * Generate comprehensive analytics report
 */
export const generateAnalyticsReport = async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsReport> => {
  try {
    const metrics = await calculateDashboardMetrics();
    
    const daysMap = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    };

    const days = daysMap[period];

    return {
      period,
      metrics,
      trends: {
        revenue: generateTrendData(days),
        users: generateTrendData(days),
        discounts: generateTrendData(days),
        points: generateTrendData(days)
      },
      topPerformers: {
        discountCodes: [
          { code: 'GOLD2024', uses: 245, revenue: 45000 },
          { code: 'SILVER100', uses: 189, revenue: 32000 },
          { code: 'EXITABC123', uses: 156, revenue: 28000 },
          { code: 'NEWSXYZ789', uses: 134, revenue: 22000 },
          { code: 'LOYALDEF456', uses: 98, revenue: 18000 }
        ],
        users: [
          { name: 'Sarah Williams', points: 5000, tier: 'Platinum' },
          { name: 'John Doe', points: 2500, tier: 'Gold' },
          { name: 'Jane Smith', points: 1200, tier: 'Silver' },
          { name: 'Alex Brown', points: 800, tier: 'Silver' },
          { name: 'Mike Johnson', points: 450, tier: 'Bronze' }
        ]
      },
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

/**
 * Export report as JSON
 */
export const exportReportAsJSON = (report: AnalyticsReport): string => {
  return JSON.stringify(report, null, 2);
};

/**
 * Export report as CSV
 */
export const exportReportAsCSV = (report: AnalyticsReport): string => {
  let csv = 'Analytics Report\n';
  csv += `Period: ${report.period}\n`;
  csv += `Generated: ${report.generatedAt.toISOString()}\n\n`;

  csv += 'Metrics\n';
  csv += 'Total Users,Active Users,Total Revenue,Total Discount,Avg Order Value,Conversion Rate,Loyalty Engagement\n';
  csv += `${report.metrics.totalUsers},${report.metrics.activeUsers},${report.metrics.totalRevenue},${report.metrics.totalDiscountGiven},${report.metrics.averageOrderValue.toFixed(2)},${report.metrics.conversionRate.toFixed(2)}%,${report.metrics.loyaltyEngagement.toFixed(2)}%\n\n`;

  csv += 'Top Discount Codes\n';
  csv += 'Code,Uses,Revenue\n';
  report.topPerformers.discountCodes.forEach(code => {
    csv += `${code.code},${code.uses},${code.revenue}\n`;
  });

  csv += '\nTop Users\n';
  csv += 'Name,Points,Tier\n';
  report.topPerformers.users.forEach(user => {
    csv += `${user.name},${user.points},${user.tier}\n`;
  });

  return csv;
};

/**
 * Download report
 */
export const downloadReport = (report: AnalyticsReport, format: 'json' | 'csv' = 'json') => {
  const content = format === 'json' ? exportReportAsJSON(report) : exportReportAsCSV(report);
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const filename = `analytics-report-${report.period}-${new Date().toISOString().split('T')[0]}.${format}`;

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================
// COMPARISON ANALYTICS
// ============================================

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Calculate comparison data
 */
export const calculateComparison = (current: number, previous: number): ComparisonData => {
  const change = current - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

  return {
    current,
    previous,
    change,
    changePercent,
    trend
  };
};

// ============================================
// REAL-TIME ANALYTICS
// ============================================

export interface RealtimeMetrics {
  activeUsers: number;
  ordersInProgress: number;
  revenueToday: number;
  conversionToday: number;
  lastUpdated: Date;
}

/**
 * Subscribe to real-time metrics
 */
export const subscribeToRealtimeMetrics = (
  callback: (metrics: RealtimeMetrics) => void
): Unsubscribe => {
  const unsubscribe = onSnapshot(
    collection(db, 'analytics'),
    (snapshot) => {
      const metrics: RealtimeMetrics = {
        activeUsers: 0,
        ordersInProgress: 0,
        revenueToday: 0,
        conversionToday: 0,
        lastUpdated: new Date()
      };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'realtime') {
          metrics.activeUsers = data.activeUsers || 0;
          metrics.ordersInProgress = data.ordersInProgress || 0;
          metrics.revenueToday = data.revenueToday || 0;
          metrics.conversionToday = data.conversionToday || 0;
        }
      });

      callback(metrics);
    },
    (error) => {
      console.error('Error subscribing to realtime metrics:', error);
    }
  );

  listeners.set('realtime-metrics', unsubscribe);
  return unsubscribe;
};

/**
 * Get user behavior analytics
 */
export interface UserBehavior {
  userId: string;
  lastActive: Date;
  sessionCount: number;
  totalSpent: number;
  favoriteCategory: string;
  conversionStatus: 'converted' | 'abandoned' | 'active';
}

export const getUserBehaviorAnalytics = async (): Promise<UserBehavior[]> => {
  try {
    const q = query(collection(db, 'users'), orderBy('lastActive', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      userId: doc.id,
      lastActive: doc.data().lastActive?.toDate() || new Date(),
      sessionCount: doc.data().sessionCount || 0,
      totalSpent: doc.data().totalSpent || 0,
      favoriteCategory: doc.data().favoriteCategory || 'N/A',
      conversionStatus: doc.data().conversionStatus || 'active'
    }));
  } catch (error) {
    console.error('Error getting user behavior analytics:', error);
    return [];
  }
};

/**
 * Get product performance analytics
 */
export interface ProductPerformance {
  productId: string;
  productName: string;
  views: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  rating: number;
}

export const getProductPerformanceAnalytics = async (): Promise<ProductPerformance[]> => {
  try {
    const q = query(collection(db, 'products'), orderBy('purchases', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const views = doc.data().views || 1;
      const purchases = doc.data().purchases || 0;
      const conversionRate = (purchases / views) * 100;
      
      return {
        productId: doc.id,
        productName: doc.data().name || 'Unknown',
        views,
        purchases,
        revenue: doc.data().revenue || 0,
        conversionRate,
        rating: doc.data().rating || 0
      };
    });
  } catch (error) {
    console.error('Error getting product performance analytics:', error);
    return [];
  }
};

/**
 * Get funnel analytics
 */
export interface FunnelStage {
  stage: string;
  users: number;
  dropoff: number;
  dropoffPercent: number;
}

export interface FunnelAnalytics {
  stages: FunnelStage[];
  totalConversion: number;
  totalDropoff: number;
}

export const getFunnelAnalytics = async (): Promise<FunnelAnalytics> => {
  try {
    const stages: FunnelStage[] = [
      { stage: 'Landing', users: 1000, dropoff: 0, dropoffPercent: 0 },
      { stage: 'Browse', users: 850, dropoff: 150, dropoffPercent: 15 },
      { stage: 'Add to Cart', users: 680, dropoff: 170, dropoffPercent: 20 },
      { stage: 'Checkout', users: 510, dropoff: 170, dropoffPercent: 25 },
      { stage: 'Payment', users: 450, dropoff: 60, dropoffPercent: 12 },
      { stage: 'Confirmation', users: 405, dropoff: 45, dropoffPercent: 10 }
    ];

    const totalConversion = (405 / 1000) * 100;
    const totalDropoff = 100 - totalConversion;

    return {
      stages,
      totalConversion,
      totalDropoff
    };
  } catch (error) {
    console.error('Error getting funnel analytics:', error);
    return {
      stages: [],
      totalConversion: 0,
      totalDropoff: 0
    };
  }
};

/**
 * Get cohort analysis
 */
export interface CohortData {
  cohort: string;
  day0: number;
  day7: number;
  day30: number;
  retention7: number;
  retention30: number;
}

export const getCohortAnalysis = async (): Promise<CohortData[]> => {
  try {
    return [
      { cohort: 'Week 1', day0: 100, day7: 85, day30: 65, retention7: 85, retention30: 65 },
      { cohort: 'Week 2', day0: 120, day7: 95, day30: 72, retention7: 79, retention30: 60 },
      { cohort: 'Week 3', day0: 110, day7: 88, day30: 68, retention7: 80, retention30: 62 },
      { cohort: 'Week 4', day0: 130, day7: 104, day30: 78, retention7: 80, retention30: 60 },
      { cohort: 'Week 5', day0: 115, day7: 92, day30: 69, retention7: 80, retention30: 60 }
    ];
  } catch (error) {
    console.error('Error getting cohort analysis:', error);
    return [];
  }
};

/**
 * Cleanup listeners
 */
export const cleanupAnalyticsListeners = () => {
  listeners.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('Error cleaning up listener:', error);
    }
  });
  listeners.clear();
};
