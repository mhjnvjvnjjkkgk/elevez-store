// ELEVEZ - Analytics & Insights Engine
// Advanced analytics with actionable insights

class AnalyticsInsights {
  constructor() {
    this.insights = [];
    this.init();
  }

  init() {
    console.log('📈 Analytics Insights initialized');
  }

  // Generate comprehensive insights
  async generateInsights() {
    this.insights = [];
    
    // Use dashboard metrics loader if available
    const products = window.dashboardMetrics ? 
      await window.dashboardMetrics.loadProducts() : 
      JSON.parse(localStorage.getItem('elevez_products') || '[]');
    
    const orders = window.dashboardMetrics ? 
      await window.dashboardMetrics.loadOrders() : 
      JSON.parse(localStorage.getItem('elevez_orders') || '[]');
    
    const users = window.dashboardMetrics ? 
      await window.dashboardMetrics.loadUsers() : 
      JSON.parse(localStorage.getItem('elevez_users') || '[]');
    
    // Revenue insights
    this.analyzeRevenue(orders);
    
    // Product insights
    this.analyzeProducts(products, orders);
    
    // Customer insights
    this.analyzeCustomers(users, orders);
    
    // Inventory insights
    this.analyzeInventory(products);
    
    // Trend insights
    this.analyzeTrends(orders);
    
    return this.insights;
  }

  // Analyze revenue patterns
  analyzeRevenue(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + (o.cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Low profit margin warning
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    if (profitMargin < 20) {
      this.insights.push({
        type: 'warning',
        category: 'revenue',
        title: 'Low Profit Margin',
        message: `Your profit margin is ${profitMargin.toFixed(1)}%. Consider increasing prices or reducing costs.`,
        action: 'Review pricing strategy',
        priority: 'high'
      });
    }
    
    // High average order value
    if (avgOrderValue > 100) {
      this.insights.push({
        type: 'success',
        category: 'revenue',
        title: 'High Average Order Value',
        message: `Your average order value is $${avgOrderValue.toFixed(2)}. Great job!`,
        action: 'Maintain quality and service',
        priority: 'low'
      });
    }
    
    // Revenue growth opportunity
    const last30Days = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });
    
    if (last30Days.length < 10) {
      this.insights.push({
        type: 'info',
        category: 'revenue',
        title: 'Growth Opportunity',
        message: `Only ${last30Days.length} orders in the last 30 days. Consider marketing campaigns.`,
        action: 'Launch promotion',
        priority: 'medium'
      });
    }
  }

  // Analyze product performance
  analyzeProducts(products, orders) {
    // Calculate sales per product
    const productSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
      });
    });
    
    // Find slow-moving products
    const slowMovers = products.filter(p => {
      const sales = productSales[p.id] || 0;
      return sales < 5 && p.stock > 10;
    });
    
    if (slowMovers.length > 0) {
      this.insights.push({
        type: 'warning',
        category: 'products',
        title: 'Slow-Moving Inventory',
        message: `${slowMovers.length} products have low sales but high stock. Consider discounts.`,
        action: 'Create clearance sale',
        priority: 'medium',
        data: slowMovers.slice(0, 3).map(p => p.name)
      });
    }
    
    // Find best performers
    const bestSellers = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (bestSellers.length > 0) {
      const topProduct = products.find(p => p.id === bestSellers[0][0]);
      if (topProduct) {
        this.insights.push({
          type: 'success',
          category: 'products',
          title: 'Top Performer',
          message: `"${topProduct.name}" is your best seller with ${bestSellers[0][1]} units sold.`,
          action: 'Stock up and promote',
          priority: 'low'
        });
      }
    }
    
    // Missing product images
    const noImages = products.filter(p => !p.image || p.image === '');
    if (noImages.length > 0) {
      this.insights.push({
        type: 'warning',
        category: 'products',
        title: 'Missing Product Images',
        message: `${noImages.length} products don't have images. This hurts conversions.`,
        action: 'Add product images',
        priority: 'high'
      });
    }
  }

  // Analyze customer behavior
  analyzeCustomers(users, orders) {
    // Customer retention
    const repeatCustomers = users.filter(u => (u.orders || []).length > 1);
    const retentionRate = users.length > 0 ? (repeatCustomers.length / users.length) * 100 : 0;
    
    if (retentionRate < 30) {
      this.insights.push({
        type: 'warning',
        category: 'customers',
        title: 'Low Customer Retention',
        message: `Only ${retentionRate.toFixed(1)}% of customers make repeat purchases.`,
        action: 'Implement loyalty program',
        priority: 'high'
      });
    }
    
    // High-value customers
    const highValueCustomers = users.filter(u => {
      const userOrders = orders.filter(o => o.userId === u.id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return totalSpent > 500;
    });
    
    if (highValueCustomers.length > 0) {
      this.insights.push({
        type: 'success',
        category: 'customers',
        title: 'VIP Customers',
        message: `You have ${highValueCustomers.length} high-value customers. Reward their loyalty!`,
        action: 'Send exclusive offers',
        priority: 'medium'
      });
    }
    
    // Inactive users
    const inactiveUsers = users.filter(u => {
      if (!u.lastActive) return true;
      const daysSinceActive = (Date.now() - new Date(u.lastActive).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 30;
    });
    
    if (inactiveUsers.length > users.length * 0.5) {
      this.insights.push({
        type: 'info',
        category: 'customers',
        title: 'Re-engagement Opportunity',
        message: `${inactiveUsers.length} users haven't been active in 30+ days.`,
        action: 'Send re-engagement email',
        priority: 'medium'
      });
    }
  }

  // Analyze inventory levels
  analyzeInventory(products) {
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
    const outOfStock = products.filter(p => p.stock === 0);
    const overStock = products.filter(p => p.stock > 100);
    
    // Low stock alert
    if (lowStock.length > 0) {
      this.insights.push({
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: `${lowStock.length} products are running low. Restock soon to avoid lost sales.`,
        action: 'Review and reorder',
        priority: 'high',
        data: lowStock.slice(0, 3).map(p => `${p.name} (${p.stock} left)`)
      });
    }
    
    // Out of stock
    if (outOfStock.length > 0) {
      this.insights.push({
        type: 'error',
        category: 'inventory',
        title: 'Out of Stock',
        message: `${outOfStock.length} products are out of stock. You're losing sales!`,
        action: 'Restock immediately',
        priority: 'critical',
        data: outOfStock.slice(0, 3).map(p => p.name)
      });
    }
    
    // Overstock
    if (overStock.length > 0) {
      this.insights.push({
        type: 'info',
        category: 'inventory',
        title: 'Overstock Items',
        message: `${overStock.length} products have high inventory. Consider promotions.`,
        action: 'Create bundle deals',
        priority: 'low'
      });
    }
  }

  // Analyze trends
  analyzeTrends(orders) {
    if (orders.length < 7) return;
    
    // Calculate daily orders for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayOrders = orders.filter(o => 
        new Date(o.createdAt).toDateString() === dateStr
      );
      
      last7Days.push({
        date: dateStr,
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }
    
    // Check for growth trend
    const firstHalf = last7Days.slice(0, 3).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = last7Days.slice(4, 7).reduce((sum, d) => sum + d.count, 0);
    
    if (secondHalf > firstHalf * 1.2) {
      this.insights.push({
        type: 'success',
        category: 'trends',
        title: 'Growing Sales',
        message: 'Your sales are trending up! Keep up the momentum.',
        action: 'Scale marketing efforts',
        priority: 'low'
      });
    } else if (secondHalf < firstHalf * 0.8) {
      this.insights.push({
        type: 'warning',
        category: 'trends',
        title: 'Declining Sales',
        message: 'Sales are trending down. Time to take action.',
        action: 'Launch promotion',
        priority: 'high'
      });
    }
  }

  // Render insights dashboard
  async renderInsightsDashboard() {
    const insights = await this.generateInsights();
    
    const container = document.getElementById('insightsDashboard');
    if (!container) return;
    
    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    const typeIcons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    
    const typeColors = {
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
      info: '#667eea'
    };
    
    const priorityBadges = {
      critical: '🔴 CRITICAL',
      high: '🟠 HIGH',
      medium: '🟡 MEDIUM',
      low: '🟢 LOW'
    };
    
    container.innerHTML = `
      <div class="insights-dashboard">
        <div class="insights-header">
          <h3>📊 Business Insights</h3>
          <button class="refresh-btn" onclick="analyticsInsights.renderInsightsDashboard()">
            🔄 Refresh
          </button>
        </div>
        
        ${insights.length === 0 ? `
          <div class="no-insights">
            <div class="no-insights-icon">🎉</div>
            <div class="no-insights-title">All Good!</div>
            <div class="no-insights-message">No critical insights at the moment. Keep up the great work!</div>
          </div>
        ` : `
          <div class="insights-grid">
            ${insights.map(insight => `
              <div class="insight-card ${insight.type}">
                <div class="insight-header">
                  <span class="insight-icon">${typeIcons[insight.type]}</span>
                  <div class="insight-title-group">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-category">${insight.category}</div>
                  </div>
                  <span class="insight-priority">${priorityBadges[insight.priority]}</span>
                </div>
                
                <div class="insight-message">${insight.message}</div>
                
                ${insight.data ? `
                  <div class="insight-data">
                    ${insight.data.map(item => `<div class="data-item">• ${item}</div>`).join('')}
                  </div>
                ` : ''}
                
                <div class="insight-action">
                  <span class="action-label">Recommended Action:</span>
                  <span class="action-text">${insight.action}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
}

// Initialize analytics insights
window.analyticsInsights = new AnalyticsInsights();

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .insights-dashboard {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
  }

  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .insights-header h3 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .refresh-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .insights-grid {
    display: grid;
    gap: 16px;
  }

  .insight-card {
    background: rgba(255, 255, 255, 0.05);
    border-left: 4px solid;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .insight-card.success { border-left-color: #00ff88; }
  .insight-card.warning { border-left-color: #ffaa00; }
  .insight-card.error { border-left-color: #ff4444; }
  .insight-card.info { border-left-color: #667eea; }

  .insight-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .insight-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .insight-icon {
    font-size: 24px;
  }

  .insight-title-group {
    flex: 1;
  }

  .insight-title {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .insight-category {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .insight-priority {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    white-space: nowrap;
  }

  .insight-message {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .insight-data {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .data-item {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 4px 0;
  }

  .insight-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }

  .action-text {
    font-size: 14px;
    color: #00ff88;
    font-weight: 600;
  }

  .no-insights {
    text-align: center;
    padding: 60px 20px;
  }

  .no-insights-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .no-insights-title {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
  }

  .no-insights-message {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 768px) {
    .insight-header {
      flex-wrap: wrap;
    }
    
    .insight-priority {
      width: 100%;
      text-align: center;
    }
  }
`;
document.head.appendChild(style);
