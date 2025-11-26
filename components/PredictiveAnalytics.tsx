import React, { useState, useEffect } from 'react';
import { predictionService, Prediction, Insight, Anomaly } from '../services/predictionService';
import '../styles/predictive-analytics.css';

interface PredictiveAnalyticsProps {
  users?: Record<string, any>[];
  orders?: Record<string, any>[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  users = [],
  orders = [],
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedTab, setSelectedTab] = useState<'predictions' | 'insights' | 'anomalies'>('predictions');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    // Generate predictions for first user
    if (users.length > 0) {
      const user = users[0];
      const churnPred = predictionService.predictChurnRisk(user);
      const revenuePred = predictionService.predictRevenuePotential(user);
      const engagementPred = predictionService.predictEngagementLevel(user);
      setPredictions([churnPred, revenuePred, engagementPred]);
    }

    // Generate insights
    const generatedInsights = predictionService.generateInsights(users, orders);
    setInsights(generatedInsights);

    // Detect anomalies
    const detectedAnomalies = predictionService.detectAnomalies({
      revenue: Math.random() * 10000,
      errorRate: Math.random() * 2,
    });
    setAnomalies(detectedAnomalies);
  }, [users, orders]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '•';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#999';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#999';
    }
  };

  const filteredPredictions = filterType
    ? predictions.filter((p) => p.type === filterType)
    : predictions;

  return (
    <div className="predictive-analytics">
      <div className="panel-header">
        <h2>Predictive Analytics</h2>
        <p>AI-powered insights and forecasts</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${selectedTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setSelectedTab('predictions')}
        >
          Predictions ({predictions.length})
        </button>
        <button
          className={`tab ${selectedTab === 'insights' ? 'active' : ''}`}
          onClick={() => setSelectedTab('insights')}
        >
          Insights ({insights.length})
        </button>
        <button
          className={`tab ${selectedTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setSelectedTab('anomalies')}
        >
          Anomalies ({anomalies.length})
        </button>
      </div>

      {selectedTab === 'predictions' && (
        <div className="tab-content">
          <div className="filter-bar">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Predictions</option>
              <option value="churn">Churn Risk</option>
              <option value="revenue">Revenue Potential</option>
              <option value="engagement">Engagement Level</option>
            </select>
          </div>

          <div className="predictions-grid">
            {filteredPredictions.map((pred) => (
              <div key={pred.id} className="prediction-card">
                <div className="prediction-header">
                  <h3>{pred.type.replace('_', ' ').toUpperCase()}</h3>
                  <span className="trend-icon">{getTrendIcon(pred.trend)}</span>
                </div>

                <div className="prediction-metric">
                  <span className="label">{pred.metric}</span>
                </div>

                <div className="prediction-values">
                  <div className="value-item">
                    <span className="label">Current</span>
                    <span className="value">{pred.currentValue.toFixed(1)}</span>
                  </div>
                  <div className="value-item">
                    <span className="label">Predicted</span>
                    <span className="value">{pred.predictedValue.toFixed(1)}</span>
                  </div>
                </div>

                <div className="confidence-bar">
                  <div className="bar-background">
                    <div
                      className="bar-fill"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                  <span className="confidence-text">{pred.confidence.toFixed(0)}% confidence</span>
                </div>

                <div className="timeframe">
                  <span>{pred.timeframe}</span>
                </div>

                <div className="recommendations">
                  <h4>Recommendations</h4>
                  <ul>
                    {pred.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'insights' && (
        <div className="tab-content">
          <div className="insights-list">
            {insights.map((insight) => (
              <div key={insight.id} className={`insight-card category-${insight.category}`}>
                <div className="insight-header">
                  <h3>{insight.title}</h3>
                  <span
                    className="impact-badge"
                    style={{ background: getImpactColor(insight.impact) }}
                  >
                    {insight.impact}
                  </span>
                </div>

                <p className="insight-description">{insight.description}</p>

                <div className="action-items">
                  <h4>Action Items</h4>
                  <ul>
                    {insight.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="insight-footer">
                  <span className="roi">Est. ROI: {insight.estimatedROI}%</span>
                  <span className="date">
                    {insight.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'anomalies' && (
        <div className="tab-content">
          <div className="anomalies-list">
            {anomalies.length === 0 ? (
              <div className="empty-state">
                <p>No anomalies detected</p>
              </div>
            ) : (
              anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`anomaly-card severity-${anomaly.severity}`}
                >
                  <div className="anomaly-header">
                    <h3>{anomaly.metric}</h3>
                    <span
                      className="severity-badge"
                      style={{ background: getSeverityColor(anomaly.severity) }}
                    >
                      {anomaly.severity}
                    </span>
                  </div>

                  <p className="anomaly-description">{anomaly.description}</p>

                  <div className="anomaly-values">
                    <div className="value-item">
                      <span className="label">Expected</span>
                      <span className="value">{anomaly.expectedValue.toFixed(2)}</span>
                    </div>
                    <div className="value-item">
                      <span className="label">Actual</span>
                      <span className="value">{anomaly.actualValue.toFixed(2)}</span>
                    </div>
                    <div className="value-item">
                      <span className="label">Deviation</span>
                      <span className="value">{anomaly.deviation.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="anomaly-footer">
                    <span className="detected">
                      Detected: {anomaly.detectedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
