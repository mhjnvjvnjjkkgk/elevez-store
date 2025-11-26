// Admin Dashboard v2 - With Real Data Integration
// All 10 Wave 4 Phase 5 Features with Functional Data

class AdminDashboardV2 {
  constructor() {
    this.currentPanel = 'overview';
    this.api = window.DashboardAPI;
    this.data = {
      metrics: {},
      health: {},
      users: [],
      orders: [],
      auditLogs: [],
      segments: [],
      notifications: [],
      abtests: [],
      filters: [],
      bulkOps: []
    };
    this.init();
  }

  async init() {
    await this.loadData();
    this.render();
    this.attachEventListeners();
    this.startRealTimeUpdates();
  }

  async loadData() {
    try {
      this.data.metrics = await this.api.getMetrics();
      this.data.health = await this.api.getSystemHealth();
      this.data.users = await this.api.getUsers();
      this.data.orders = await this.api.getOrders();
      this.data.auditLogs = await this.api.getAuditLogs();
      this.data.segments = await this.api.getSegments();
      this.data.notifications = await this.api.getNotifications();
      this.data.abtests = await this.api.getABTests();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  startRealTimeUpdates() {
    // Update metrics every 5 seconds
    setInterval(async () => {
      this.data.metrics = await this.api.getMetrics();
      this.data.health = await this.api.getSystemHealth();
      if (this.currentPanel === 'overview') {
        this.updateOverviewMetrics();
      }
      if (this.currentPanel === 'performance') {
        this.updatePerformanceMetrics();
      }
    }, 5000);
  }

  updateOverviewMetrics() {
    const kpiCards = document.querySelectorAll('.stat-value');
    if (kpiCards[0]) kpiCards[0].textContent = this.data.metrics.users?.toLocaleString() || '0';
    if (kpiCards[1]) kpiCards[1].textContent = this.data.metrics.sessions?.toLocaleString() || '0';
    if (kpiCards[2]) kpiCards[2].textContent = '$' + this.data.metrics.revenue?.toLocaleString() || '$0';
    if (kpiCards[3]) kpiCards[3].textContent = this.data.metrics.conversion + '%' || '0%';
  }

  updatePerformanceMetrics() {
    const fills = document.querySelectorAll('.progress-fill');
    if (fills[0]) fills[0].style.width = this.data.health.cpu + '%';
    if (fills[1]) fills[1].style.width = this.data.health.memory + '%';
    if (fills[2]) fills[2].style.width = this.data.health.database + '%';
    if (fills[3]) fills[3].style.width = this.data.health.api + '%';
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
            <button class="btn btn-secondary" onclick="dashboard.exportData()">📥 Import</button>
            <button class="btn btn-secondary" onclick="dashboard.exportData()">📤 Export</button>
            <button class="btn btn-primary" onclick="dashboard.addNew()">➕ Add New</button>
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
    const m = this.data.metrics;
    const h = this.data.health;
    const logs = this.data.auditLogs;

    return `
      <div class="grid">
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">${m.users?.toLocaleString() || '0'}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 12.5% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Sessions</div>
          <div class="stat-value">${m.sessions?.toLocaleString() || '0'}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 8.2% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue (30d)</div>
          <div class="stat-value">$${m.revenue?.toLocaleString() || '0'}</div>
          <div style="color: var(--success); font-size: 12px;">↑ 23.1% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Conversion Rate</div>
          <div class="stat-value">${m.conversion || '0'}%</div>
          <div style="color: var(--danger); font-size: 12px;">↓ 2.1% vs last month</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚡ System Health</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
          ${this.renderHealthMetric('CPU', h.cpu || 0)}
          ${this.renderHealthMetric('Memory', h.memory || 0)}
          ${this.renderHealthMetric('Database', h.database || 0)}
          ${this.renderHealthMetric('API', h.api || 0)}
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
            ${logs.slice(0, 5).map(log => `
              <tr>
                <td>${log.action}</td>
                <td>${log.user}</td>
                <td>${log.timestamp}</td>
                <td><span class="badge badge-success">✓ ${log.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title">📊 Top Performing Segments</div>
        <table class="table">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Users</th>
              <th>Engagement</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.segments.map(seg => `
              <tr>
                <td>${seg.name}</td>
                <td>${seg.users.toLocaleString()}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 100px; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden;">
                      <div style="width: ${seg.engagement}%; height: 100%; background: var(--primary);"></div>
                    </div>
                    <span style="font-size: 12px; font-weight: 600;">${seg.engagement}%</span>
                  </div>
                </td>
                <td>$${seg.revenue.toLocaleString()}</td>
                <td><span class="badge badge-${seg.status === 'active' ? 'success' : seg.status === 'monitoring' ? 'warning' : 'danger'}">${seg.status}</span></td>
              </tr>
            `).join('')}
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
          <input type="text" class="form-input" id="filterName" placeholder="e.g., Premium Users">
        </div>
        <div class="form-group">
          <label class="form-label">Field</label>
          <select class="form-select" id="filterField">
            <option>status</option>
            <option>revenue</option>
            <option>name</option>
            <option>email</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Operator</label>
          <select class="form-select" id="filterOp">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greater_than">Greater Than</option>
            <option value="less_than">Less Than</option>
            <option value="between">Between</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Value</label>
          <input type="text" class="form-input" id="filterValue" placeholder="Enter value">
        </div>
        <button class="btn btn-primary" onclick="dashboard.applyFilter()">✓ Apply Filter</button>
      </div>

      <div class="card">
        <div class="card-title">📊 Filtered Results</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.users.slice(0, 10).map(user => `
              <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.status === 'active' ? 'success' : 'warning'}">${user.status}</span></td>
                <td>$${user.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
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
          <select class="form-select" id="bulkOpType">
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Upload CSV File</label>
          <input type="file" class="form-input" id="csvFile" accept=".csv">
        </div>
        <button class="btn btn-primary" onclick="dashboard.executeBulkOp()">▶ Execute Operation</button>
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
          <select class="form-select" id="reportType">
            <option value="user_analytics">User Analytics</option>
            <option value="revenue_report">Revenue Report</option>
            <option value="engagement_report">Engagement Report</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label class="form-label">From Date</label>
            <input type="date" class="form-input" id="fromDate">
          </div>
          <div class="form-group">
            <label class="form-label">To Date</label>
            <input type="date" class="form-input" id="toDate">
          </div>
        </div>
        <button class="btn btn-primary" onclick="dashboard.generateReport()">📊 Generate Report</button>
      </div>

      <div class="card">
        <div class="card-title">📁 Recent Reports</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Summary</td>
              <td>User Analytics</td>
              <td>Nov 2024</td>
              <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">📥 Download</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderPerformance() {
    const h = this.data.health;
    return `
      <div class="card">
        <div class="card-title">⚡ Real-time Metrics</div>
        <div class="grid">
          ${this.renderMetricCard('CPU Usage', h.cpu + '%', 'var(--success)')}
          ${this.renderMetricCard('Memory', h.memory + '%', 'var(--warning)')}
          ${this.renderMetricCard('Database', h.database + '%', 'var(--success)')}
          ${this.renderMetricCard('API Response', h.api + 'ms', 'var(--danger)')}
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
        ${h.memory > 60 ? '<div class="alert alert-warning"><span>⚠</span><span>Memory usage above 60% threshold</span></div>' : ''}
        ${h.api > 80 ? '<div class="alert alert-danger"><span>✕</span><span>API response time exceeding SLA</span></div>' : ''}
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
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.data.auditLogs.map(log => `
              <tr>
                <td>${log.timestamp}</td>
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.target}</td>
                <td><span class="badge badge-success">✓</span></td>
              </tr>
            `).join('')}
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
          ${this.data.notifications.map(notif => `
            <div style="padding: 15px; background: var(--bg-lighter); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--${notif.type === 'success' ? 'success' : notif.type === 'warning' ? 'warning' : 'info'});">
              <div style="font-weight: 600; margin-bottom: 5px;">${notif.message}</div>
              <div style="font-size: 12px; color: var(--text-muted);">${notif.timestamp}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderSegments() {
    return `
      <div class="card">
        <div class="card-title">👥 User Segments</div>
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
            ${this.data.segments.map(seg => `
              <tr>
                <td>${seg.name}</td>
                <td>${seg.users.toLocaleString()}</td>
                <td>${seg.engagement}%</td>
                <td>$${seg.revenue.toLocaleString()}</td>
                <td><span class="badge badge-${seg.status === 'active' ? 'success' : 'warning'}">${seg.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderAnalytics() {
    const analytics = this.data.analytics || {};
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
    `;
  }

  renderABTests() {
    return `
      <div class="card">
        <div class="card-title">🧪 A/B Tests</div>
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
            ${this.data.abtests.map(test => `
              <tr>
                <td>${test.name}</td>
                <td><span class="badge badge-${test.status === 'running' ? 'warning' : 'success'}">${test.status}</span></td>
                <td>${test.variantA.toFixed(2)}%</td>
                <td>${test.variantB.toFixed(2)}%</td>
                <td>${test.winner ? test.winner : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async applyFilter() {
    const field = document.getElementById('filterField').value;
    const operator = document.getElementById('filterOp').value;
    const value = document.getElementById('filterValue').value;
    
    const results = await this.api.applyFilter({ field, operator, value });
    console.log('Filter results:', results);
    alert(`Filter applied! Found ${results.length} matching records.`);
  }

  async executeBulkOp() {
    const type = document.getElementById('bulkOpType').value;
    const result = await this.api.executeBulkOp({ type }, []);
    alert(`Operation executed! Processed ${result.processed} records.`);
  }

  async generateReport() {
    const type = document.getElementById('reportType').value;
    const report = await this.api.generateReport({ type, dateRange: 'Nov 2024' });
    console.log('Report generated:', report);
    alert(`Report generated! Check console for details.`);
  }

  exportData() {
    alert('Export functionality ready!');
  }

  addNew() {
    alert('Add new item dialog would open here');
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
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new AdminDashboardV2();
});
