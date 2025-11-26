import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface CollectionAnalytics {
  id: string;
  collectionId: string;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  avgTimeSpent: number;
  uniqueVisitors: number;
  period: 'day' | 'week' | 'month';
  date: Date;
  timestamp: Date;
}

export interface CollectionPerformance {
  collectionId: string;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  avgTimeSpent: number;
  trend: 'up' | 'down' | 'stable';
}

class CollectionAnalyticsService {
  private analyticsRef = collection(db, 'collectionAnalytics');

  /**
   * Record collection view
   */
  async recordView(collectionId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const docId = `${collectionId}_${today.getTime()}`;
      const docRef = doc(db, 'collectionAnalytics', docId);

      const existingDoc = await getDocs(
        query(
          this.analyticsRef,
          where('collectionId', '==', collectionId),
          where('date', '==', Timestamp.fromDate(today))
        )
      );

      if (existingDoc.empty) {
        await setDoc(docRef, {
          collectionId,
          views: 1,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          avgTimeSpent: 0,
          uniqueVisitors: 1,
          period: 'day',
          date: today,
          timestamp: new Date()
        });
      } else {
        const existingData = existingDoc.docs[0].data();
        await updateDoc(existingDoc.docs[0].ref, {
          views: (existingData.views || 0) + 1,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  /**
   * Record collection click
   */
  async recordClick(collectionId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDocs = await getDocs(
        query(
          this.analyticsRef,
          where('collectionId', '==', collectionId),
          where('date', '==', Timestamp.fromDate(today))
        )
      );

      if (!existingDocs.empty) {
        const existingData = existingDocs.docs[0].data();
        await updateDoc(existingDocs.docs[0].ref, {
          clicks: (existingData.clicks || 0) + 1,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error recording click:', error);
      throw error;
    }
  }

  /**
   * Record conversion
   */
  async recordConversion(
    collectionId: string,
    revenue: number
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDocs = await getDocs(
        query(
          this.analyticsRef,
          where('collectionId', '==', collectionId),
          where('date', '==', Timestamp.fromDate(today))
        )
      );

      if (!existingDocs.empty) {
        const existingData = existingDocs.docs[0].data();
        await updateDoc(existingDocs.docs[0].ref, {
          conversions: (existingData.conversions || 0) + 1,
          revenue: (existingData.revenue || 0) + revenue,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error recording conversion:', error);
      throw error;
    }
  }

  /**
   * Get collection analytics for date range
   */
  async getAnalyticsByDateRange(
    collectionId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CollectionAnalytics[]> {
    try {
      const q = query(
        this.analyticsRef,
        where('collectionId', '==', collectionId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as CollectionAnalytics));
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Get collection performance
   */
  async getCollectionPerformance(
    collectionId: string
  ): Promise<CollectionPerformance> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const analytics = await this.getAnalyticsByDateRange(
        collectionId,
        thirtyDaysAgo,
        new Date()
      );

      const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
      const totalClicks = analytics.reduce((sum, a) => sum + (a.clicks || 0), 0);
      const totalConversions = analytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
      const totalRevenue = analytics.reduce((sum, a) => sum + (a.revenue || 0), 0);
      const avgTimeSpent = analytics.length > 0
        ? analytics.reduce((sum, a) => sum + (a.avgTimeSpent || 0), 0) / analytics.length
        : 0;

      const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

      // Determine trend
      const midpoint = Math.floor(analytics.length / 2);
      const firstHalf = analytics.slice(0, midpoint);
      const secondHalf = analytics.slice(midpoint);

      const firstHalfConversions = firstHalf.reduce((sum, a) => sum + (a.conversions || 0), 0);
      const secondHalfConversions = secondHalf.reduce((sum, a) => sum + (a.conversions || 0), 0);

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondHalfConversions > firstHalfConversions * 1.1) {
        trend = 'up';
      } else if (secondHalfConversions < firstHalfConversions * 0.9) {
        trend = 'down';
      }

      return {
        collectionId,
        totalViews,
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate,
        avgTimeSpent,
        trend
      };
    } catch (error) {
      console.error('Error getting collection performance:', error);
      throw error;
    }
  }

  /**
   * Get top performing collections
   */
  async getTopCollections(limit_count: number = 10): Promise<CollectionPerformance[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        this.analyticsRef,
        where('date', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('conversions', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      const collectionIds = new Set(snapshot.docs.map(doc => doc.data().collectionId));

      const performances: CollectionPerformance[] = [];
      for (const collectionId of collectionIds) {
        const performance = await this.getCollectionPerformance(collectionId);
        performances.push(performance);
      }

      return performances.sort((a, b) => b.totalConversions - a.totalConversions);
    } catch (error) {
      console.error('Error getting top collections:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    collectionId: string,
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const analytics = await this.getAnalyticsByDateRange(
        collectionId,
        startDate,
        endDate
      );

      if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      } else {
        // CSV format
        const headers = ['Date', 'Views', 'Clicks', 'Conversions', 'Revenue', 'Avg Time Spent'];
        const rows = analytics.map(a => [
          a.date.toISOString().split('T')[0],
          a.views,
          a.clicks,
          a.conversions,
          a.revenue.toFixed(2),
          a.avgTimeSpent.toFixed(2)
        ]);

        const csv = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        return csv;
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }
}

export const collectionAnalyticsService = new CollectionAnalyticsService();
