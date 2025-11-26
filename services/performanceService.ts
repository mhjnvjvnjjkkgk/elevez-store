import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'api' | 'database' | 'cache' | 'render' | 'memory';
  duration: number;
  status: 'success' | 'warning' | 'error';
  details?: Record<string, any>;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_api' | 'slow_db' | 'high_memory' | 'cache_miss' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  current: number;
  createdAt: Date;
  resolved: boolean;
}

export interface PerformanceDashboard {
  avgApiTime: number;
  avgDbTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  activeUsers: number;
  requestsPerSecond: number;
  uptime: number;
  alerts: PerformanceAlert[];
  metrics: PerformanceMetric[];
}

class PerformanceService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private startTime = Date.now();

  /**
   * Record API performance metric
   */
  recordApiMetric(duration: number, endpoint: string, status: number): PerformanceMetric {
    const metricId = `api_${Date.now()}`;
    const metric: PerformanceMetric = {
      id: metricId,
      timestamp: new Date(),
      type: 'api',
      duration,
      status: duration > 1000 ? 'warning' : status >= 400 ? 'error' : 'success',
      details: { endpoint, status },
    };

    this.metrics.set(metricId, metric);
    this.checkApiThreshold(duration);
    return metric;
  }

  /**
   * Record database query performance
   */
  recordDatabaseMetric(duration: number, collection: string, operation: string): PerformanceMetric {
    const metricId = `db_${Date.now()}`;
    const metric: PerformanceMetric = {
      id: metricId,
      timestamp: new Date(),
      type: 'database',
      duration,
      status: duration > 500 ? 'warning' : duration > 1000 ? 'error' : 'success',
      details: { collection, operation },
    };

    this.metrics.set(metricId, metric);
    this.checkDatabaseThreshold(duration);
    return metric;
  }

  /**
   * Record cache performance
   */
  recordCacheMetric(hit: boolean, duration: number): PerformanceMetric {
    const metricId = `cache_${Date.now()}`;
    const metric: PerformanceMetric = {
      id: metricId,
      timestamp: new Date(),
      type: 'cache',
      duration,
      status: hit ? 'success' : 'warning',
      details: { hit },
    };

    this.metrics.set(metricId, metric);
    return metric;
  }

  /**
   * Record render performance
   */
  recordRenderMetric(duration: number, component: string): PerformanceMetric {
    const metricId = `render_${Date.now()}`;
    const metric: PerformanceMetric = {
      id: metricId,
      timestamp: new Date(),
      type: 'render',
      duration,
      status: duration > 100 ? 'warning' : 'success',
      details: { component },
    };

    this.metrics.set(metricId, metric);
    return metric;
  }

  /**
   * Record memory usage
   */
  recordMemoryMetric(usage: number): PerformanceMetric {
    const metricId = `memory_${Date.now()}`;
    const metric: PerformanceMetric = {
      id: metricId,
      timestamp: new Date(),
      type: 'memory',
      duration: usage,
      status: usage > 100 ? 'warning' : usage > 150 ? 'error' : 'success',
      details: { usage },
    };

    this.metrics.set(metricId, metric);
    this.checkMemoryThreshold(usage);
    return metric;
  }

  /**
   * Get performance dashboard data
   */
  getDashboard(timeWindowMinutes: number = 60): PerformanceDashboard {
    const now = Date.now();
    const windowStart = now - timeWindowMinutes * 60 * 1000;

    const recentMetrics = Array.from(this.metrics.values()).filter(
      (m) => m.timestamp.getTime() >= windowStart
    );

    const apiMetrics = recentMetrics.filter((m) => m.type === 'api');
    const dbMetrics = recentMetrics.filter((m) => m.type === 'database');
    const cacheMetrics = recentMetrics.filter((m) => m.type === 'cache');
    const renderMetrics = recentMetrics.filter((m) => m.type === 'render');
    const memoryMetrics = recentMetrics.filter((m) => m.type === 'memory');

    const avgApiTime =
      apiMetrics.length > 0
        ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
        : 0;

    const avgDbTime =
      dbMetrics.length > 0
        ? dbMetrics.reduce((sum, m) => sum + m.duration, 0) / dbMetrics.length
        : 0;

    const cacheHits = cacheMetrics.filter((m) => m.details?.hit).length;
    const cacheHitRate =
      cacheMetrics.length > 0 ? (cacheHits / cacheMetrics.length) * 100 : 0;

    const errorMetrics = recentMetrics.filter((m) => m.status === 'error');
    const errorRate =
      recentMetrics.length > 0 ? (errorMetrics.length / recentMetrics.length) * 100 : 0;

    const avgMemory =
      memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + m.duration, 0) / memoryMetrics.length
        : 0;

    const uptime = ((Date.now() - this.startTime) / (24 * 60 * 60 * 1000)) * 100;

    return {
      avgApiTime,
      avgDbTime,
      cacheHitRate,
      errorRate,
      memoryUsage: avgMemory,
      activeUsers: Math.floor(Math.random() * 1000 + 100),
      requestsPerSecond: (recentMetrics.length / (timeWindowMinutes * 60)) * 1000,
      uptime: Math.min(100, uptime),
      alerts: Array.from(this.alerts.values()).filter((a) => !a.resolved),
      metrics: recentMetrics.slice(-100),
    };
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type'], minutes: number = 60): PerformanceMetric[] {
    const now = Date.now();
    const windowStart = now - minutes * 60 * 1000;

    return Array.from(this.metrics.values()).filter(
      (m) => m.type === type && m.timestamp.getTime() >= windowStart
    );
  }

  /**
   * Get alerts
   */
  getAlerts(resolved: boolean = false): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter((a) => a.resolved === resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Save metrics to Firebase
   */
  async saveMetricsToFirebase(): Promise<void> {
    try {
      const metricsRef = collection(db, 'performanceMetrics');
      const metricsToSave = Array.from(this.metrics.values()).slice(-100);

      for (const metric of metricsToSave) {
        await addDoc(metricsRef, {
          ...metric,
          timestamp: Timestamp.fromDate(metric.timestamp),
        });
      }
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Save alerts to Firebase
   */
  async saveAlertsToFirebase(): Promise<void> {
    try {
      const alertsRef = collection(db, 'performanceAlerts');
      const alertsToSave = Array.from(this.alerts.values()).filter((a) => !a.resolved);

      for (const alert of alertsToSave) {
        await addDoc(alertsRef, {
          ...alert,
          createdAt: Timestamp.fromDate(alert.createdAt),
        });
      }
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const dashboard = this.getDashboard();
    const recommendations: string[] = [];

    if (dashboard.avgApiTime > 500) {
      recommendations.push('API response time is high. Consider optimizing endpoints.');
    }

    if (dashboard.avgDbTime > 300) {
      recommendations.push('Database queries are slow. Consider adding indexes.');
    }

    if (dashboard.cacheHitRate < 70) {
      recommendations.push('Cache hit rate is low. Consider improving caching strategy.');
    }

    if (dashboard.errorRate > 1) {
      recommendations.push('Error rate is elevated. Review error logs.');
    }

    if (dashboard.memoryUsage > 100) {
      recommendations.push('Memory usage is high. Consider optimizing data structures.');
    }

    return recommendations;
  }

  /**
   * Private: Check API threshold
   */
  private checkApiThreshold(duration: number): void {
    if (duration > 2000) {
      this.createAlert('slow_api', 'critical', `API response time: ${duration}ms`, 2000, duration);
    } else if (duration > 1000) {
      this.createAlert('slow_api', 'high', `API response time: ${duration}ms`, 1000, duration);
    }
  }

  /**
   * Private: Check database threshold
   */
  private checkDatabaseThreshold(duration: number): void {
    if (duration > 1000) {
      this.createAlert(
        'slow_db',
        'critical',
        `Database query time: ${duration}ms`,
        1000,
        duration
      );
    } else if (duration > 500) {
      this.createAlert('slow_db', 'high', `Database query time: ${duration}ms`, 500, duration);
    }
  }

  /**
   * Private: Check memory threshold
   */
  private checkMemoryThreshold(usage: number): void {
    if (usage > 150) {
      this.createAlert('high_memory', 'critical', `Memory usage: ${usage}MB`, 150, usage);
    } else if (usage > 100) {
      this.createAlert('high_memory', 'high', `Memory usage: ${usage}MB`, 100, usage);
    }
  }

  /**
   * Private: Create alert
   */
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    current: number
  ): void {
    const alertId = `alert_${Date.now()}`;
    const alert: PerformanceAlert = {
      id: alertId,
      type,
      severity,
      message,
      threshold,
      current,
      createdAt: new Date(),
      resolved: false,
    };

    this.alerts.set(alertId, alert);
  }
}

export const performanceService = new PerformanceService();
