import React, { useState, useEffect } from 'react';
import { performanceService, PerformanceDashboard } from '../services/performanceService';
import '../styles/performance-monitor.css';

interface PerformanceMonitorProps {
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  refreshInterval = 5000,
}) => {
  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null);
  const [timeWindow, setTimeWindow] = useState(60);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  useEffect(() => {
    const updateDashboard = () => {
      const data = performanceService.getDashboard(timeWindow);
      setDashboard(data);
    };

    updateDashboard();
    const interval = setInterval(updateDashboard, refreshInterval);

    return () => clearInterval(interval);
  }, [timeWindow, refreshInterval]);

  const handleResolveAlert = (alertId: string) => {
    performanceService.resolveAlert(alertId);
    setDashboard(performanceService.getDashboard(timeWindow));
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return '#10b981';
    if (value <= thresholds.warning) return '#f59e0b';
    return '#ef4444';
  };

  const recommendations = dashboard ? performanceService.getRecommendations() : [];

  return (
    <div className="performance-monitor">
      <div className="panel-header">
        <h2>Performance Monitor</h2>
        <div className="time-window-selector">
          <select value={timeWindow} onChange={(e) => setTimeWindow(parseInt(e.target.value))}>
            <option value={15}>Last 15 minutes</option>
            <option value={30}>Last 30 minutes</option>
            <option value={60}>Last 1 hour</option>
            <option value={240}>Last 4 hours</option>
            <option value={1440}>Last 24 hours</option>
          </select>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">API Response Time</div>
              <div
                className="metric-value"
                style={{
                  color: getStatusColor(dashboard.avgApiTime, { good: 200, warning: 500 }),
                }}
              >
                {dashboard.avgApiTime.toFixed(0)}ms
              </div>
              <div className="metric-status">
                {dashboard.avgApiTime <= 200
                  ? 'Excellent'
                  : dashboard.avgApiTime <= 500
                  ? 'Good'
                  : 'Slow'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Database Query Time</div>
              <div
                className="metric-value"
                style={{
                  color: getStatusColor(dashboard.avgDbTime, { good: 100, warning: 300 }),
                }}
              >
                {dashboard.avgDbTime.toFixed(0)}ms
              </div>
              <div className="metric-status">
                {dashboard.avgDbTime <= 100
                  ? 'Excellent'
                  : dashboard.avgDbTime <= 300
                  ? 'Good'
                  : 'Slow'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Cache Hit Rate</div>
              <div
                className="metric-value"
                style={{
                  color: getStatusColor(100 - dashboard.cacheHitRate, {
                    good: 30,
                    warning: 50,
                  }),
                }}
              >
                {dashboard.cacheHitRate.toFixed(1)}%
              </div>
              <div className="metric-status">
                {dashboard.cacheHitRate >= 80
                  ? 'Excellent'
                  : dashboard.cacheHitRate >= 60
                  ? 'Good'
                  : 'Low'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Error Rate</div>
              <div
                className="metric-value"
                style={{
                  color: getStatusColor(dashboard.errorRate, { good: 0.5, warning: 1 }),
                }}
              >
                {dashboard.errorRate.toFixed(2)}%
              </div>
              <div className="metric-status">
                {dashboard.errorRate <= 0.5
                  ? 'Excellent'
                  : dashboard.errorRate <= 1
                  ? 'Good'
                  : 'High'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Memory Usage</div>
              <div
                className="metric-value"
                style={{
                  color: getStatusColor(dashboard.memoryUsage, { good: 50, warning: 100 }),
                }}
              >
                {dashboard.memoryUsage.toFixed(0)}MB
              </div>
              <div className="metric-status">
                {dashboard.memoryUsage <= 50
                  ? 'Excellent'
                  : dashboard.memoryUsage <= 100
                  ? 'Good'
                  : 'High'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Uptime</div>
              <div className="metric-value" style={{ color: '#10b981' }}>
                {dashboard.uptime.toFixed(2)}%
              </div>
              <div className="metric-status">
                {dashboard.uptime >= 99.9 ? 'Excellent' : 'Good'}
              </div>
            </div>
          </div>

          {dashboard.alerts.length > 0 && (
            <div className="alerts-section">
              <h3>Active Alerts ({dashboard.alerts.length})</h3>
              <div className="alerts-list">
                {dashboard.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`alert-item severity-${alert.severity}`}
                    onClick={() => setSelectedAlert(alert.id)}
                  >
                    <div className="alert-header">
                      <span className="alert-type">{alert.type}</span>
                      <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                    </div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-details">
                      <span>Threshold: {alert.threshold}</span>
                      <span>Current: {alert.current.toFixed(2)}</span>
                    </div>
                    <button
                      className="btn-resolve"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveAlert(alert.id);
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>Recommendations</h3>
              <ul className="recommendations-list">
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="metrics-history">
            <h3>Recent Metrics</h3>
            <div className="metrics-table">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.metrics.slice(-20).map((metric) => (
                    <tr key={metric.id}>
                      <td>{metric.timestamp.toLocaleTimeString()}</td>
                      <td>{metric.type}</td>
                      <td>{metric.duration.toFixed(0)}ms</td>
                      <td>
                        <span className={`status ${metric.status}`}>{metric.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
