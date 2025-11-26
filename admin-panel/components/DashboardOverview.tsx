import React, { useState, useEffect } from 'react';

interface KPIData {
  label: string;
  value: string | number;
  change: number;
  icon: string;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const DashboardOverview: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData[]>([
    { label: 'Total Users', value: '12,543', change: 12.5, icon: '👥' },
    { label: 'Active Sessions', value: '2,341', change: 8.2, icon: '🔗' },
    { label: 'Revenue (30d)', value: '$45,231', change: 23.1, icon: '💰' },
    { label: 'Conversion Rate', value: '3.24%', change: -2.1, icon: '📈' },
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      action: 'Bulk user import',
      user: 'Admin User',
      timestamp: '2 hours ago',
      status: 'success',
    },
    {
      id: '2',
      action: 'Report generated',
      user: 'Analytics Team',
      timestamp: '4 hours ago',
      status: 'success',
    },
    {
      id: '3',
      action: 'Segment created',
      user: 'Marketing Team',
      timestamp: '6 hours ago',
      status: 'success',
    },
    {
      id: '4',
      action: 'A/B test started',
      user: 'Product Team',
      timestamp: '1 day ago',
      status: 'warning',
    },
  ]);

  const [systemHealth, setSystemHealth] = useState({
    cpu: 45,
    memory: 62,
    database: 38,
    api: 92,
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemHealth({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        database: Math.floor(Math.random() * 100),
        api: Math.floor(Math.random() * 100),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (value: number): string => {
    if (value < 50) return 'var(--success)';
    if (value < 75) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'success':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'error':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div className="grid grid-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div style={{ fontSize: '24px' }}>{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
              {kpi.change >= 0 ? '📈' : '📉'} {Math.abs(kpi.change)}% vs last month
            </div>
          </div>
        ))}
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-2">
        {/* System Health */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">⚡ System Health</div>
              <div className="card-subtitle">Real-time performance metrics</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(systemHealth).map(([key, value]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {key}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: getHealthColor(value) }}>
                    {value}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${value}%`,
                      height: '100%',
                      backgroundColor: getHealthColor(value),
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📋 Recent Activity</div>
              <div className="card-subtitle">Latest admin actions</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {activity.action}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {activity.user} • {activity.timestamp}
                  </div>
                </div>
                <span className={`badge ${getStatusBadgeClass(activity.status)}`}>
                  {activity.status === 'success' && '✓'}
                  {activity.status === 'warning' && '⚠'}
                  {activity.status === 'error' && '✕'}
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📊 Top Performing Segments</div>
            <div className="card-subtitle">User segments by engagement</div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Segment Name</th>
                <th>Users</th>
                <th>Engagement</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Premium Users</td>
                <td>2,341</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '85%',
                          height: '100%',
                          backgroundColor: 'var(--success)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>85%</span>
                  </div>
                </td>
                <td>$12,543</td>
                <td>
                  <span className="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Trial Users</td>
                <td>5,234</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '62%',
                          height: '100%',
                          backgroundColor: 'var(--warning)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>62%</span>
                  </div>
                </td>
                <td>$3,421</td>
                <td>
                  <span className="badge badge-warning">Monitoring</span>
                </td>
              </tr>
              <tr>
                <td>Inactive Users</td>
                <td>4,968</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100px',
                        height: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '28%',
                          height: '100%',
                          backgroundColor: 'var(--danger)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>28%</span>
                  </div>
                </td>
                <td>$1,234</td>
                <td>
                  <span className="badge badge-danger">At Risk</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
