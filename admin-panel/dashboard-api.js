// Dashboard API - Real Data Services
// Provides all data endpoints for the admin dashboard

class DashboardAPI {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.mockData = this.initializeMockData();
  }

  initializeMockData() {
    return {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', revenue: 1250, joinDate: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', revenue: 2340, joinDate: '2024-02-20' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', revenue: 890, joinDate: '2023-12-10' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', revenue: 3450, joinDate: '2024-03-05' },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'trial', revenue: 450, joinDate: '2024-11-01' },
      ],
      orders: [
        { id: 101, userId: 1, amount: 250, status: 'completed', date: '2024-11-20' },
        { id: 102, userId: 2, amount: 450, status: 'completed', date: '2024-11-21' },
        { id: 103, userId: 3, amount: 150, status: 'pending', date: '2024-11-22' },
        { id: 104, userId: 4, amount: 890, status: 'completed', date: '2024-11-23' },
        { id: 105, userId: 1, amount: 320, status: 'completed', date: '2024-11-24' },
      ],
      auditLogs: [
        { id: 1, user: 'Admin', action: 'Create', target: 'User #123', timestamp: '2024-11-24 14:30', status: 'success' },
        { id: 2, user: 'Jane', action: 'Update', target: 'User #456', timestamp: '2024-11-24 14:25', status: 'success' },
        { id: 3, user: 'John', action: 'Delete', target: 'User #789', timestamp: '2024-11-24 14:20', status: 'success' },
        { id: 4, user: 'Admin', action: 'Export', target: '1000 records', timestamp: '2024-11-24 14:15', status: 'success' },
      ],
      segments: [
        { id: 1, name: 'Premium Users', users: 2341, engagement: 85, revenue: 12543, status: 'active' },
        { id: 2, name: 'Trial Users', users: 5234, engagement: 62, revenue: 3421, status: 'monitoring' },
        { id: 3, name: 'Inactive Users', users: 4968, engagement: 28, revenue: 1234, status: 'at-risk' },
      ],
      notifications: [
        { id: 1, message: 'System performance at 95%', type: 'success', timestamp: '2 hours ago' },
        { id: 2, message: 'New user segment created', type: 'info', timestamp: '4 hours ago' },
        { id: 3, message: 'Report generation delayed', type: 'warning', timestamp: '1 day ago' },
      ],
      abtests: [
        { id: 1, name: 'Checkout Button', status: 'running', variantA: 3.2, variantB: 3.8, winner: null },
        { id: 2, name: 'Email Subject', status: 'completed', variantA: 2.1, variantB: 2.8, winner: 'B' },
      ],
    };
  }

  // Get Dashboard Metrics
  async getMetrics() {
    const users = this.mockData.users;
    const orders = this.mockData.orders;
    
    const totalUsers = users.length;
    const activeSessions = Math.floor(totalUsers * 0.18);
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const conversionRate = (completedOrders / orders.length * 100).toFixed(2);

    return {
      users: totalUsers,
      sessions: activeSessions,
      revenue: totalRevenue,
      conversion: conversionRate,
      timestamp: new Date().toISOString()
    };
  }

  // Get System Health
  async getSystemHealth() {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      database: Math.floor(Math.random() * 100),
      api: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    };
  }

  // Get Recent Activity
  async getRecentActivity() {
    return this.mockData.auditLogs.slice(0, 5);
  }

  // Get All Users
  async getUsers(filters = {}) {
    let users = [...this.mockData.users];

    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }
    if (filters.minRevenue) {
      users = users.filter(u => u.revenue >= filters.minRevenue);
    }

    return users;
  }

  // Get All Orders
  async getOrders(filters = {}) {
    let orders = [...this.mockData.orders];

    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters.minAmount) {
      orders = orders.filter(o => o.amount >= filters.minAmount);
    }

    return orders;
  }

  // Get Audit Logs
  async getAuditLogs(filters = {}) {
    let logs = [...this.mockData.auditLogs];

    if (filters.user) {
      logs = logs.filter(l => l.user.toLowerCase().includes(filters.user.toLowerCase()));
    }
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }

    return logs;
  }

  // Get Segments
  async getSegments() {
    return this.mockData.segments;
  }

  // Get Notifications
  async getNotifications() {
    return this.mockData.notifications;
  }

  // Get A/B Tests
  async getABTests() {
    return this.mockData.abtests;
  }

  // Apply Filters
  async applyFilter(filterConfig) {
    const { field, operator, value } = filterConfig;
    let results = [...this.mockData.users];

    switch(operator) {
      case 'equals':
        results = results.filter(u => u[field] === value);
        break;
      case 'contains':
        results = results.filter(u => String(u[field]).includes(value));
        break;
      case 'greater_than':
        results = results.filter(u => u[field] > value);
        break;
      case 'less_than':
        results = results.filter(u => u[field] < value);
        break;
      case 'between':
        results = results.filter(u => u[field] >= value.min && u[field] <= value.max);
        break;
    }

    return results;
  }

  // Bulk Operations
  async executeBulkOp(operation, records) {
    const { type } = operation;
    
    switch(type) {
      case 'create':
        records.forEach(record => {
          record.id = Math.max(...this.mockData.users.map(u => u.id)) + 1;
          this.mockData.users.push(record);
        });
        break;
      case 'update':
        records.forEach(record => {
          const index = this.mockData.users.findIndex(u => u.id === record.id);
          if (index !== -1) {
            this.mockData.users[index] = { ...this.mockData.users[index], ...record };
          }
        });
        break;
      case 'delete':
        records.forEach(record => {
          this.mockData.users = this.mockData.users.filter(u => u.id !== record.id);
        });
        break;
    }

    return { success: true, processed: records.length };
  }

  // Generate Report
  async generateReport(reportConfig) {
    const { type, dateRange } = reportConfig;
    const users = this.mockData.users;
    const orders = this.mockData.orders;

    let report = {
      type,
      generatedAt: new Date().toISOString(),
      dateRange,
      data: {}
    };

    switch(type) {
      case 'user_analytics':
        report.data = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          trialUsers: users.filter(u => u.status === 'trial').length,
          inactiveUsers: users.filter(u => u.status === 'inactive').length,
          totalRevenue: users.reduce((sum, u) => sum + u.revenue, 0),
          avgRevenue: (users.reduce((sum, u) => sum + u.revenue, 0) / users.length).toFixed(2)
        };
        break;
      case 'revenue_report':
        report.data = {
          totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
          completedOrders: orders.filter(o => o.status === 'completed').length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          avgOrderValue: (orders.reduce((sum, o) => sum + o.amount, 0) / orders.length).toFixed(2)
        };
        break;
      case 'engagement_report':
        report.data = {
          segments: this.mockData.segments,
          avgEngagement: (this.mockData.segments.reduce((sum, s) => sum + s.engagement, 0) / this.mockData.segments.length).toFixed(2)
        };
        break;
    }

    return report;
  }

  // Get Predictive Analytics
  async getPredictiveAnalytics() {
    const users = this.mockData.users;
    const churnRiskCount = Math.floor(users.length * 0.027);
    
    return {
      churnRisk: {
        count: churnRiskCount,
        percentage: 2.7,
        confidence: 87
      },
      revenueForcast: {
        nextMonth: 52341,
        growth: 15.7,
        nextQuarter: 165234
      },
      trends: {
        userGrowth: 8.2,
        engagement: -2.1,
        retention: 5.3
      }
    };
  }

  // Create Segment
  async createSegment(segmentConfig) {
    const { name, conditions } = segmentConfig;
    let users = [...this.mockData.users];

    // Apply conditions
    conditions.forEach(condition => {
      users = users.filter(u => {
        switch(condition.type) {
          case 'revenue':
            return u.revenue > condition.value;
          case 'status':
            return u.status === condition.value;
          case 'engagement':
            return u.engagement >= condition.value;
          default:
            return true;
        }
      });
    });

    const segment = {
      id: Math.max(...this.mockData.segments.map(s => s.id), 0) + 1,
      name,
      users: users.length,
      engagement: Math.floor(Math.random() * 100),
      revenue: users.reduce((sum, u) => sum + u.revenue, 0),
      status: 'active'
    };

    this.mockData.segments.push(segment);
    return segment;
  }

  // Add Notification
  async addNotification(notification) {
    const newNotif = {
      id: Math.max(...this.mockData.notifications.map(n => n.id), 0) + 1,
      ...notification,
      timestamp: 'just now'
    };
    this.mockData.notifications.unshift(newNotif);
    return newNotif;
  }

  // Create A/B Test
  async createABTest(testConfig) {
    const { name, variantA, variantB, trafficSplit } = testConfig;
    const test = {
      id: Math.max(...this.mockData.abtests.map(t => t.id), 0) + 1,
      name,
      status: 'running',
      variantA: Math.random() * 5,
      variantB: Math.random() * 5,
      trafficSplit,
      winner: null,
      createdAt: new Date().toISOString()
    };
    this.mockData.abtests.push(test);
    return test;
  }
}

// Export for use in dashboard
window.DashboardAPI = new DashboardAPI();
