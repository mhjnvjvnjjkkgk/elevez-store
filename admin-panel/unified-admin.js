// Admin Dashboard - Unified Control Panel
// All 10 Wave 4 Phase 5 Features Integrated

class AdminDashboard {
  constructor() {
    this.currentPanel = 'overview';
    this.data = {
      users: 12543,
      sessions: 2341,
      revenue: 45231,
      conversion: 3.24,
      filters: [],
      bulkOps: [],
      reports: [],
      segments: [],
      tests: [],
      notifications: []
    };
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="admin-container">
        ${this.renderSidebar()}
        ${this.renderMain()}
      </div>
    `;
  }

  renderSidebar() {
    const items = [
      { id: 'overview', label: 'Dashboard', icon: '📊' },
      { id: 'filters', label: 'Advanced Filters', icon: '🔍' },
      { id: 'bulk', label: 'Bulk Operations', icon: '⚙️' },
      { id: 'reports', label: 'Reports', icon: '📈' },
      { id: 'performance', label: 'Performance', icon: '⚡' },
      { id: 'audit', label: 'Audit Logs', icon: '📋' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'segments', label: 'Segments', icon: '👥' },
      { id: 'analytics', label: 'Analytics', icon: '🎯' },
      { id: 'abtests', label: 'A/B Tests', icon: '🧪' }
    ];

    return `
      <div class="sidebar scrollbar">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <span>📊</span>
            <span>Admin Panel</span>
          </div>
        </div>
        <nav>
          ${items.map(item => `
            <div class="nav-item ${this.currentPanel === item.id ? 'active' : ''}" 
                 data-panel="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
            </div>
          `).join('')}
        </nav>
      </div>
    `;
  }

  renderMain() {
    return `
      <div class="main-content">
        <div class="header">
          <div class="header-title">${this.getPanelTitle()}</div>
          <div class="header-actions">
            <button class="btn btn-secondary">📥 Import</button>
            <button class="btn btn-secondary">📤 Export</button>
            <button class="btn btn-primary">➕ Add New</button>
          </div>
        </div>
        <div class="content scrollbar">
          ${this.renderPanel()}
        </div>
      </div>
    `;
  }

  getPanelTitle() {
    const titles = {
      overview: 'Dashboard Overview',
      filters: 'Advanced Filters',
      bulk: 'Bulk Operations',
      reports: 'Reports & Analytics',
      performance: 'Performance Monitor',
      audit: 'Audit Logs',
      notifications: 'Notifications',
      segments: 'User Segments',
      analytics: 'Predictive Analytics',
      abtests: 'A/B Testing'
    };
    return titles[this.currentPanel] || 'Dashboard';
  }

  renderPanel() {
    switch(this.currentPanel) {
      case 'overview': return this.renderOverview();
      case 'filters': return this.renderFilters();
      case 'bulk': return this.renderBulkOps();
      case 'reports': return this.renderReports();
      case 'performance': return this.renderPerformance();
      case 'audit': return this.renderAudit();
      case 'notifications': return this.renderNotifications();
      case 'segments': return this.renderSegments();
      case 'analytics': return this.renderAnalytics();
      case 'abtests': return this.renderABTests();
      default: return this.renderOverview();
    }
  }

  renderOverview() {
    return `
      <div class="grid">
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">${this.data.users.toLocaleString()}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 12.5% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Sessions</div>
          <div class="stat-value">${this.data.sessions.toLocaleString()}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 8.2% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue (30d)</div>
          <div class="stat-value">$${this.data.revenue.toLocaleString()}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 23.1% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Conversion Rate</div>
          <div class="stat-value">${this.data.conversion}%</div>
          <div style="color: var(--danger); font-size: 12px;">↓ 2.1% vs last month</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚡ System Health</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
          ${this.renderHealthMetric('CPU', 45)}
          ${this.renderHealthMetric('Memory', 62)}
          ${this.renderHealthMetric('Database', 38)}
          ${this.renderHealthMetric('API', 92)}
        </div>
      </div>

      <div class="card">
        <div class="card-title">📋 Recent Activity</div>
        <table class="table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bulk user import</td>
              <td>Admin User</td>
              <td>2 hours ago</td>
              <td><span class="badge badge-success">✓ Success</span></td>
            </tr>
            <tr>
              <td>Report generated</td>
              <td>Analytics Team</td>
              <td>4 hours ago</td>
              <td><span class="badge badge-success">✓ Success</span></td>
            </tr>
            <tr>
              <td>Segment created</td>
              <td>Marketing Team</td>
              <td>6 hours ago</td>
              <td><span class="badge badge-success">✓ Success</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderHealthMetric(label, value) {
    const color = value < 50 ? 'var(--success)' : value < 75 ? 'var(--warning)' : 'var(--danger)';
    return `
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 600;">${label}</span>
          <span style="color: ${color}; font-weight: 700;">${value}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${value}%; background: linear-gradient(90deg, ${color}, ${color}80);"></div>
        </div>
      </div>
    `;
  }

  renderFilters() {
    return `
      <div class="card">
        <div class="card-title">🔍 Create Filter</div>
        <div class="form-group">
          <label class="form-label">Filter Name</label>
          <input type="text" class="form-input" placeholder="e.g., Premium Users">
        </div>
        <div class="form-group">
          <label class="form-label">Field</label>
          <select class="form-select">
            <option>User Type</option>
            <option>Created Date</option>
            <option>Revenue</option>
            <option>Status</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Operator</label>
          <select class="form-select">
            <option>Equals</option>
            <option>Contains</option>
            <option>Greater Than</option>
            <option>Less Than</option>
            <option>Between</option>
            <option>Starts With</option>
            <option>Ends With</option>
            <option>Is Empty</option>
            <option>Is Not Empty</option>
            <option>In List</option>
            <option>Not In List</option>
            <option>Regex Match</option>
            <option>Date Range</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Value</label>
          <input type="text" class="form-input" placeholder="Enter value">
        </div>
        <button class="btn btn-primary">✓ Apply Filter</button>
      </div>

      <div class="card">
        <div class="card-title">📊 Active Filters</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Field</th>
              <th>Operator</th>
              <th>Value</th>
              <th>Results</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Premium Users</td>
              <td>User Type</td>
              <td>Equals</td>
              <td>Premium</td>
              <td>2,341</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderBulkOps() {
    return `
      <div class="card">
        <div class="card-title">⚙️ Bulk Operations</div>
        <div class="form-group">
          <label class="form-label">Operation Type</label>
          <select class="form-select">
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Upload CSV File</label>
          <input type="file" class="form-input" accept=".csv">
        </div>
        <div class="form-group">
          <label class="form-label">Preview (First 5 rows)</label>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td><span class="badge badge-success">Will Create</span></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Jane Smith</td>
                <td>jane@example.com</td>
                <td><span class="badge badge-success">Will Create</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary">▶ Execute Operation</button>
      </div>

      <div class="card">
        <div class="card-title">📊 Operation History</div>
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Operation</th>
              <th>Records</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 24, 2024</td>
              <td>Bulk Create Users</td>
              <td>500</td>
              <td><span class="badge badge-success">✓ Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderReports() {
    return `
      <div class="card">
        <div class="card-title">📈 Generate Report</div>
        <div class="form-group">
          <label class="form-label">Report Type</label>
          <select class="form-select">
            <option>User Analytics</option>
            <option>Revenue Report</option>
            <option>Engagement Report</option>
            <option>Conversion Report</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label class="form-label">From Date</label>
            <input type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">To Date</label>
            <input type="date" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Export Format</label>
          <select class="form-select">
            <option>PDF</option>
            <option>Excel</option>
            <option>CSV</option>
          </select>
        </div>
        <button class="btn btn-primary">📊 Generate Report</button>
      </div>

      <div class="card">
        <div class="card-title">📁 Recent Reports</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Format</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Summary</td>
              <td>User Analytics</td>
              <td>Nov 2024</td>
              <td>PDF</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">📥 Download</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderPerformance() {
    return `
      <div class="card">
        <div class="card-title">⚡ Real-time Metrics</div>
        <div class="grid">
          ${this.renderMetricCard('CPU Usage', '45%', 'var(--success)')}
          ${this.renderMetricCard('Memory', '62%', 'var(--warning)')}
          ${this.renderMetricCard('Database', '38%', 'var(--success)')}
          ${this.renderMetricCard('API Response', '92ms', 'var(--danger)')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">📊 Performance Trends</div>
        <div class="chart-container">
          <div class="chart-bar" style="height: 60%;"><div class="chart-bar-label">Mon</div></div>
          <div class="chart-bar" style="height: 75%;"><div class="chart-bar-label">Tue</div></div>
          <div class="chart-bar" style="height: 45%;"><div class="chart-bar-label">Wed</div></div>
          <div class="chart-bar" style="height: 80%;"><div class="chart-bar-label">Thu</div></div>
          <div class="chart-bar" style="height: 55%;"><div class="chart-bar-label">Fri</div></div>
          <div class="chart-bar" style="height: 70%;"><div class="chart-bar-label">Sat</div></div>
          <div class="chart-bar" style="height: 65%;"><div class="chart-bar-label">Sun</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🚨 Active Alerts</div>
        <div class="alert alert-warning">
          <span>⚠</span>
          <span>Memory usage above 60% threshold</span>
        </div>
        <div class="alert alert-danger">
          <span>✕</span>
          <span>API response time exceeding SLA</span>
        </div>
      </div>
    `;
  }

  renderMetricCard(label, value, color) {
    return `
      <div class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value" style="color: ${color};">${value}</div>
      </div>
    `;
  }

  renderAudit() {
    return `
      <div class="card">
        <div class="card-title">📋 Audit Logs</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label class="form-label">User</label>
            <input type="text" class="form-input" placeholder="Filter by user">
          </div>
          <div class="form-group">
            <label class="form-label">Action</label>
            <select class="form-select">
              <option>All Actions</option>
              <option>Create</option>
              <option>Update</option>
              <option>Delete</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Date Range</label>
            <input type="date" class="form-input">
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>14:30:45</td>
              <td>Admin User</td>
              <td>Create</td>
              <td>User #123 created</td>
              <td><span class="badge badge-success">✓</span></td>
            </tr>
            <tr>
              <td>14:25:12</td>
              <td>Jane Doe</td>
              <td>Update</td>
              <td>User #456 updated</td>
              <td><span class="badge badge-success">✓</span></td>
            </tr>
            <tr>
              <td>14:20:33</td>
              <td>John Smith</td>
              <td>Delete</td>
              <td>User #789 deleted</td>
              <td><span class="badge badge-success">✓</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderNotifications() {
    return `
      <div class="card">
        <div class="card-title">🔔 Notification Center</div>
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: var(--bg-lighter); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--success);">
            <div style="font-weight: 600; margin-bottom: 5px;">✓ System performance at 95%</div>
            <div style="font-size: 12px; color: var(--text-muted);">2 hours ago</div>
          </div>
          <div style="padding: 15px; background: var(--bg-lighter); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--info);">
            <div style="font-weight: 600; margin-bottom: 5px;">ℹ New user segment created</div>
            <div style="font-size: 12px; color: var(--text-muted);">4 hours ago</div>
          </div>
          <div style="padding: 15px; background: var(--bg-lighter); border-radius: 8px; border-left: 3px solid var(--warning);">
            <div style="font-weight: 600; margin-bottom: 5px;">⚠ Report generation delayed</div>
            <div style="font-size: 12px; color: var(--text-muted);">1 day ago</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚙️ Notification Preferences</div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" checked>
            <span>Email notifications</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" checked>
            <span>System alerts</span>
          </label>
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox">
            <span>Weekly digest</span>
          </label>
        </div>
      </div>
    `;
  }

  renderSegments() {
    return `
      <div class="card">
        <div class="card-title">👥 Create Segment</div>
        <div class="form-group">
          <label class="form-label">Segment Name</label>
          <input type="text" class="form-input" placeholder="e.g., High-Value Customers">
        </div>
        <div class="form-group">
          <label class="form-label">Conditions</label>
          <select class="form-select">
            <option>Revenue > $1000</option>
            <option>Last Login < 30 days</option>
            <option>Account Age > 1 year</option>
            <option>Engagement Score > 80</option>
          </select>
        </div>
        <button class="btn btn-primary">✓ Create Segment</button>
      </div>

      <div class="card">
        <div class="card-title">📊 Existing Segments</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
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
              <td>85%</td>
              <td>$12,543</td>
              <td><span class="badge badge-success">Active</span></td>
            </tr>
            <tr>
              <td>Trial Users</td>
              <td>5,234</td>
              <td>62%</td>
              <td>$3,421</td>
              <td><span class="badge badge-warning">Monitoring</span></td>
            </tr>
            <tr>
              <td>Inactive Users</td>
              <td>4,968</td>
              <td>28%</td>
              <td>$1,234</td>
              <td><span class="badge badge-danger">At Risk</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderAnalytics() {
    return `
      <div class="card">
        <div class="card-title">🎯 Predictive Analytics</div>
        <div class="grid">
          <div class="stat-card">
            <div class="stat-label">Churn Risk</div>
            <div class="stat-value" style="color: var(--danger);">342</div>
            <div style="color: var(--text-muted); font-size: 12px;">Users at risk (2.7%)</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Revenue Forecast</div>
            <div class="stat-value" style="color: var(--success);">$52K</div>
            <div style="color: var(--success); font-size: 12px;">↑ 15.7% next month</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Growth Trend</div>
            <div class="stat-value" style="color: var(--success);">↑ 8.2%</div>
            <div style="color: var(--text-muted); font-size: 12px;">User growth accelerating</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📊 Trend Analysis</div>
        <table class="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Trend</th>
              <th>Forecast</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>User Growth</td>
              <td>12,543</td>
              <td><span class="badge badge-success">↑ 8.2%</span></td>
              <td>13,500</td>
            </tr>
            <tr>
              <td>Engagement</td>
              <td>3.24%</td>
              <td><span class="badge badge-danger">↓ 2.1%</span></td>
              <td>3.17%</td>
            </tr>
            <tr>
              <td>Revenue</td>
              <td>$45,231</td>
              <td><span class="badge badge-success">↑ 23.1%</span></td>
              <td>$52,341</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderABTests() {
    return `
      <div class="card">
        <div class="card-title">🧪 Create A/B Test</div>
        <div class="form-group">
          <label class="form-label">Test Name</label>
          <input type="text" class="form-input" placeholder="e.g., Checkout Button Color">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label class="form-label">Variant A</label>
            <input type="text" class="form-input" placeholder="Control">
          </div>
          <div class="form-group">
            <label class="form-label">Variant B</label>
            <input type="text" class="form-input" placeholder="Treatment">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Traffic Split</label>
          <select class="form-select">
            <option>50% / 50%</option>
            <option>70% / 30%</option>
            <option>80% / 20%</option>
            <option>90% / 10%</option>
          </select>
        </div>
        <button class="btn btn-primary">▶ Start Test</button>
      </div>

      <div class="card">
        <div class="card-title">📊 Active Tests</div>
        <table class="table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Status</th>
              <th>Variant A</th>
              <th>Variant B</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Checkout Button</td>
              <td><span class="badge badge-warning">Running</span></td>
              <td>3.2%</td>
              <td>3.8%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Email Subject</td>
              <td><span class="badge badge-success">Completed</span></td>
              <td>2.1%</td>
              <td>2.8%</td>
              <td><span class="badge badge-success">B</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  attachEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentPanel = item.dataset.panel;
        this.render();
        this.attachEventListeners();
      });
    });
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AdminDashboard();
});
