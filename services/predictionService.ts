import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export interface Prediction {
  id: string;
  type: 'churn' | 'revenue' | 'engagement' | 'tier_progression' | 'seasonal';
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timeframe: string;
  recommendations: string[];
  createdAt: Date;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'opportunity' | 'risk' | 'trend';
  actionItems: string[];
  estimatedROI: number;
  createdAt: Date;
}

export interface Anomaly {
  id: string;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
}

class PredictionService {
  private predictions: Map<string, Prediction> = new Map();
  private insights: Map<string, Insight> = new Map();
  private anomalies: Map<string, Anomaly> = new Map();

  /**
   * Predict churn risk
   */
  predictChurnRisk(user: Record<string, any>): Prediction {
    const predictionId = `pred_${Date.now()}`;

    // Simple churn prediction model
    let churnScore = 0;
    if (!user.lastActive || Date.now() - new Date(user.lastActive).getTime() > 30 * 24 * 60 * 60 * 1000) {
      churnScore += 40;
    }
    if ((user.totalPoints || 0) < 100) {
      churnScore += 30;
    }
    if ((user.orderCount || 0) === 0) {
      churnScore += 20;
    }
    if (user.tier === 'bronze') {
      churnScore += 10;
    }

    const confidence = Math.min(100, 50 + Math.random() * 40);
    const prediction: Prediction = {
      id: predictionId,
      type: 'churn',
      metric: `Churn Risk for ${user.email}`,
      currentValue: churnScore,
      predictedValue: Math.min(100, churnScore + Math.random() * 20),
      confidence,
      trend: churnScore > 50 ? 'up' : 'down',
      timeframe: 'Next 30 days',
      recommendations: [
        'Send re-engagement email',
        'Offer loyalty bonus',
        'Provide personalized discount',
      ],
      createdAt: new Date(),
    };

    this.predictions.set(predictionId, prediction);
    return prediction;
  }

  /**
   * Predict revenue potential
   */
  predictRevenuePotential(user: Record<string, any>): Prediction {
    const predictionId = `pred_${Date.now()}`;

    // Simple revenue prediction model
    const baseRevenue = (user.averageOrderValue || 50) * (user.orderCount || 1);
    const tierMultiplier = { bronze: 1, silver: 1.2, gold: 1.5, platinum: 2 }[user.tier] || 1;
    const engagementBoost = (user.totalPoints || 0) / 1000;

    const predictedRevenue = baseRevenue * tierMultiplier * (1 + engagementBoost);
    const confidence = Math.min(100, 60 + Math.random() * 30);

    const prediction: Prediction = {
      id: predictionId,
      type: 'revenue',
      metric: `Revenue Potential for ${user.email}`,
      currentValue: baseRevenue,
      predictedValue: predictedRevenue,
      confidence,
      trend: predictedRevenue > baseRevenue ? 'up' : 'down',
      timeframe: 'Next 90 days',
      recommendations: [
        'Increase discount frequency',
        'Promote premium products',
        'Create bundle offers',
      ],
      createdAt: new Date(),
    };

    this.predictions.set(predictionId, prediction);
    return prediction;
  }

  /**
   * Predict engagement level
   */
  predictEngagementLevel(user: Record<string, any>): Prediction {
    const predictionId = `pred_${Date.now()}`;

    // Simple engagement prediction model
    let engagementScore = 0;
    if (user.lastActive && Date.now() - new Date(user.lastActive).getTime() < 7 * 24 * 60 * 60 * 1000) {
      engagementScore += 40;
    }
    if ((user.totalPoints || 0) > 500) {
      engagementScore += 30;
    }
    if ((user.orderCount || 0) > 5) {
      engagementScore += 20;
    }
    if (user.tier !== 'bronze') {
      engagementScore += 10;
    }

    const confidence = Math.min(100, 55 + Math.random() * 35);
    const prediction: Prediction = {
      id: predictionId,
      type: 'engagement',
      metric: `Engagement Level for ${user.email}`,
      currentValue: engagementScore,
      predictedValue: Math.max(0, engagementScore + (Math.random() - 0.5) * 20),
      confidence,
      trend: engagementScore > 50 ? 'up' : 'down',
      timeframe: 'Next 60 days',
      recommendations: [
        'Send personalized recommendations',
        'Offer exclusive deals',
        'Invite to VIP program',
      ],
      createdAt: new Date(),
    };

    this.predictions.set(predictionId, prediction);
    return prediction;
  }

  /**
   * Generate insights
   */
  generateInsights(users: Record<string, any>[], orders: Record<string, any>[] = []): Insight[] {
    const insights: Insight[] = [];

    // Insight 1: High-value customer opportunity
    const highValueUsers = users.filter((u) => (u.totalPoints || 0) > 1000);
    if (highValueUsers.length > 0) {
      const insightId = `insight_${Date.now()}_1`;
      insights.push({
        id: insightId,
        title: 'High-Value Customer Opportunity',
        description: `${highValueUsers.length} customers have high engagement potential`,
        impact: 'high',
        category: 'opportunity',
        actionItems: [
          'Create VIP tier for top customers',
          'Offer exclusive products',
          'Provide dedicated support',
        ],
        estimatedROI: 35,
        createdAt: new Date(),
      });
    }

    // Insight 2: Churn risk alert
    const churnRiskUsers = users.filter(
      (u) =>
        (!u.lastActive || Date.now() - new Date(u.lastActive).getTime() > 30 * 24 * 60 * 60 * 1000) &&
        (u.totalPoints || 0) < 100
    );
    if (churnRiskUsers.length > 0) {
      const insightId = `insight_${Date.now()}_2`;
      insights.push({
        id: insightId,
        title: 'Churn Risk Alert',
        description: `${churnRiskUsers.length} customers at risk of churning`,
        impact: 'high',
        category: 'risk',
        actionItems: [
          'Launch re-engagement campaign',
          'Offer comeback discount',
          'Send personalized message',
        ],
        estimatedROI: 25,
        createdAt: new Date(),
      });
    }

    // Insight 3: Seasonal trend
    const insightId = `insight_${Date.now()}_3`;
    insights.push({
      id: insightId,
      title: 'Seasonal Trend Detected',
      description: 'Holiday season approaching - prepare inventory and promotions',
      impact: 'medium',
      category: 'trend',
      actionItems: [
        'Plan holiday promotions',
        'Stock popular items',
        'Create gift bundles',
      ],
      estimatedROI: 40,
      createdAt: new Date(),
    });

    return insights;
  }

  /**
   * Detect anomalies
   */
  detectAnomalies(metrics: Record<string, number>): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for unusual patterns
    const expectedRevenue = 5000;
    if (metrics.revenue && Math.abs(metrics.revenue - expectedRevenue) > expectedRevenue * 0.3) {
      const anomalyId = `anom_${Date.now()}_1`;
      anomalies.push({
        id: anomalyId,
        metric: 'Revenue',
        expectedValue: expectedRevenue,
        actualValue: metrics.revenue,
        deviation: ((metrics.revenue - expectedRevenue) / expectedRevenue) * 100,
        severity: Math.abs(metrics.revenue - expectedRevenue) > expectedRevenue * 0.5 ? 'high' : 'medium',
        description: `Revenue is ${metrics.revenue > expectedRevenue ? 'higher' : 'lower'} than expected`,
        detectedAt: new Date(),
      });
    }

    const expectedErrorRate = 0.5;
    if (metrics.errorRate && metrics.errorRate > expectedErrorRate * 2) {
      const anomalyId = `anom_${Date.now()}_2`;
      anomalies.push({
        id: anomalyId,
        metric: 'Error Rate',
        expectedValue: expectedErrorRate,
        actualValue: metrics.errorRate,
        deviation: ((metrics.errorRate - expectedErrorRate) / expectedErrorRate) * 100,
        severity: metrics.errorRate > expectedErrorRate * 5 ? 'critical' : 'high',
        description: 'Error rate is significantly higher than normal',
        detectedAt: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Get predictions
   */
  getPredictions(type?: Prediction['type']): Prediction[] {
    let predictions = Array.from(this.predictions.values());

    if (type) {
      predictions = predictions.filter((p) => p.type === type);
    }

    return predictions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get insights
   */
  getInsights(category?: Insight['category']): Insight[] {
    let insights = Array.from(this.insights.values());

    if (category) {
      insights = insights.filter((i) => i.category === category);
    }

    return insights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get anomalies
   */
  getAnomalies(severity?: Anomaly['severity']): Anomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (severity) {
      anomalies = anomalies.filter((a) => a.severity === severity);
    }

    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Save prediction to Firebase
   */
  async savePredictionToFirebase(prediction: Prediction): Promise<void> {
    try {
      const predictionsRef = collection(db, 'predictions');
      await addDoc(predictionsRef, {
        ...prediction,
        createdAt: Timestamp.fromDate(prediction.createdAt),
      });
    } catch (error) {
      console.error('Failed to save prediction:', error);
    }
  }
}

export const predictionService = new PredictionService();
