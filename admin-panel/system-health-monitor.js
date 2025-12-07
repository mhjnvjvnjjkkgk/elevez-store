// ELEVEZ - System Health Monitor
// Real-time system health monitoring and diagnostics

class SystemHealthMonitor {
  constructor() {
    this.healthStatus = {
      localStorage: 'unknown',
      firebase: 'unknown',
      api: 'unknown',
      performance: 'unknown'
    };
    this.metrics = {
      loadTime: 0,
      memoryUsage: 0,
      apiLatency: 0,
      errorCount: 0
    };
    this.init();
  }

  init() {
    console.log('🏥 System Health Monitor initialized');
    this.startMonitoring();
  }

  // Check localStorage health
  checkLocalStorage() {
    try {
      const testKey = '_health_check_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      const products = JSON.parse(localStorage.getItem('elevez_products') || '[]');
      const orders = JSON.parse(localStorage.getItem('elevez_orders') || '[]');
      const users = JSON.parse(localStorage.getItem('elevez_users') || '[]');
      
      this.healthStatus.localStorage = 'healthy';
      return {
        status: 'healthy',
        products: products.length,
        orders: orders.length,
        users: users.length,
        size: this.getLocalStorageSize()
      };
    } catch (error) {
      this.healthStatus.localStorage = 'error';
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Get localStorage size
  getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2) + ' KB';
  }

  // Check Firebase connection
  async checkFirebase() {
    try {
      if (window.firebaseOrdersManager) {
        this.healthStatus.firebase = 'healthy';
        return {
          status: 'healthy',
          connected: true,
          message: 'Firebase connected'
        };
      } else {
        this.healthStatus.firebase = 'warning';
        return {
          status: 'warning',
          connected: false,
          message: 'Firebase not initialized'
        };
      }
    } catch (error) {
      this.healthStatus.firebase = 'error';
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Check API health
  async checkAPI() {
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        timeout: 5000
      });
      const latency = Date.now() - startTime;
      
      this.metrics.apiLatency = latency;
      
      if (response.ok) {
        this.healthStatus.api = 'healthy';
        return {
          status: 'healthy',
          latency: latency + 'ms',
          message: 'API responding'
        };
      } else {
        this.healthStatus.api = 'warning';
        return {
          status: 'warning',
          latency: latency + 'ms',
          message: 'API returned error'
        };
      }
    } catch (error) {
      this.healthStatus.api = 'error';
      return {
        status: 'error',
        error: 'API not reachable',
        message: 'Make sure admin server is running on port 3001'
      };
    }
  }

  // Check performance
  checkPerformance() {
    try {
      const performance = window.performance;
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      
      this.metrics.loadTime = loadTime;
      
      // Check memory if available
      if (performance.memory) {
        this.metrics.memoryUsage = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      }
      
      let status = 'healthy';
      if (loadTime > 3000) status = 'warning';
      if (loadTime > 5000) status = 'error';
      
      this.healthStatus.performance = status;
      
      return {
        status,
        loadTime: loadTime + 'ms',
        memoryUsage: this.metrics.memoryUsage + ' MB',
        message: status === 'healthy' ? 'Performance good' : 'Performance degraded'
      };
    } catch (error) {
      this.healthStatus.performance = 'unknown';
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  // Run all health checks
  async runHealthChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      localStorage: this.checkLocalStorage(),
      firebase: await this.checkFirebase(),
      api: await this.checkAPI(),
      performance: this.checkPerformance()
    };
    
    return results;
  }

  // Get overall health status
  getOverallHealth() {
    const statuses = Object.values(this.healthStatus);
    
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    return 'unknown';
  }

  // Render health dashboard
  async renderHealthDashboard() {
    const results = await this.runHealthChecks();
    const overallHealth = this.getOverallHealth();
    
    const container = document.getElementById('healthDashboard');
    if (!container) return;
    
    const statusColors = {
      healthy: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4444',
      unknown: '#888888'
    };
    
    const statusIcons = {
      healthy: '✅',
      warning: '⚠️',
      error: '❌',
      unknown: '❓'
    };
    
    container.innerHTML = `
      <div class="health-dashboard">
        <div class="health-header">
          <h3>System Health</h3>
          <div class="overall-status" style="color: ${statusColors[overallHealth]}">
            ${statusIcons[overallHealth]} ${overallHealth.toUpperCase()}
          </div>
        </div>
        
        <div class="health-checks">
          <!-- LocalStorage Check -->
          <div class="health-check-card">
            <div class="check-header">
              <span class="check-icon">${statusIcons[results.localStorage.status]}</span>
              <span class="check-title">LocalStorage</span>
              <span class="check-status" style="color: ${statusColors[results.localStorage.status]}">
                ${results.localStorage.status}
              </span>
            </div>
            <div class="check-details">
              ${results.localStorage.status === 'healthy' ? `
                <div class="detail-row">
                  <span>Products:</span>
                  <span>${results.localStorage.products}</span>
                </div>
                <div class="detail-row">
                  <span>Orders:</span>
                  <span>${results.localStorage.orders}</span>
                </div>
                <div class="detail-row">
                  <span>Users:</span>
                  <span>${results.localStorage.users}</span>
                </div>
                <div class="detail-row">
                  <span>Size:</span>
                  <span>${results.localStorage.size}</span>
                </div>
              ` : `
                <div class="error-message">${results.localStorage.error}</div>
              `}
            </div>
          </div>
          
          <!-- Firebase Check -->
          <div class="health-check-card">
            <div class="check-header">
              <span class="check-icon">${statusIcons[results.firebase.status]}</span>
              <span class="check-title">Firebase</span>
              <span class="check-status" style="color: ${statusColors[results.firebase.status]}">
                ${results.firebase.status}
              </span>
            </div>
            <div class="check-details">
              <div class="detail-row">
                <span>Status:</span>
                <span>${results.firebase.message}</span>
              </div>
              ${results.firebase.error ? `
                <div class="error-message">${results.firebase.error}</div>
              ` : ''}
            </div>
          </div>
          
          <!-- API Check -->
          <div class="health-check-card">
            <div class="check-header">
              <span class="check-icon">${statusIcons[results.api.status]}</span>
              <span class="check-title">Admin API</span>
              <span class="check-status" style="color: ${statusColors[results.api.status]}">
                ${results.api.status}
              </span>
            </div>
            <div class="check-details">
              ${results.api.latency ? `
                <div class="detail-row">
                  <span>Latency:</span>
                  <span>${results.api.latency}</span>
                </div>
              ` : ''}
              <div class="detail-row">
                <span>Status:</span>
                <span>${results.api.message}</span>
              </div>
              ${results.api.error ? `
                <div class="error-message">${results.api.error}</div>
              ` : ''}
            </div>
          </div>
          
          <!-- Performance Check -->
          <div class="health-check-card">
            <div class="check-header">
              <span class="check-icon">${statusIcons[results.performance.status]}</span>
              <span class="check-title">Performance</span>
              <span class="check-status" style="color: ${statusColors[results.performance.status]}">
                ${results.performance.status}
              </span>
            </div>
            <div class="check-details">
              <div class="detail-row">
                <span>Load Time:</span>
                <span>${results.performance.loadTime}</span>
              </div>
              ${results.performance.memoryUsage ? `
                <div class="detail-row">
                  <span>Memory:</span>
                  <span>${results.performance.memoryUsage}</span>
                </div>
              ` : ''}
              <div class="detail-row">
                <span>Status:</span>
                <span>${results.performance.message}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="health-actions">
          <button class="health-btn" onclick="systemHealthMonitor.runHealthChecks().then(r => systemHealthMonitor.renderHealthDashboard())">
            🔄 Refresh Checks
          </button>
          <button class="health-btn" onclick="systemHealthMonitor.exportHealthReport()">
            📥 Export Report
          </button>
          <button class="health-btn" onclick="systemHealthMonitor.clearCache()">
            🗑️ Clear Cache
          </button>
        </div>
        
        <div class="health-footer">
          <small>Last checked: ${new Date(results.timestamp).toLocaleString()}</small>
        </div>
      </div>
    `;
  }

  // Export health report
  async exportHealthReport() {
    const results = await this.runHealthChecks();
    const report = JSON.stringify(results, null, 2);
    
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('Health report exported', 'success');
  }

  // Clear cache
  clearCache() {
    if (confirm('Are you sure you want to clear the cache? This will not delete your data.')) {
      // Clear only cache-related items
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes('_cache') || key.includes('_temp')
      );
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      this.showNotification('Cache cleared successfully', 'success');
      this.renderHealthDashboard();
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `health-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#667eea'};
      color: #000;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Start monitoring
  startMonitoring() {
    // Run initial check
    this.renderHealthDashboard();
    
    // Auto-refresh every 60 seconds
    setInterval(() => {
      this.renderHealthDashboard();
    }, 60000);
  }
}

// Initialize system health monitor
window.systemHealthMonitor = new SystemHealthMonitor();

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .health-dashboard {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
  }

  .health-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .health-header h3 {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .overall-status {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .health-checks {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .health-check-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .health-check-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .check-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .check-icon {
    font-size: 24px;
  }

  .check-title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }

  .check-status {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .check-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .detail-row span:first-child {
    color: rgba(255, 255, 255, 0.5);
  }

  .error-message {
    color: #ff4444;
    font-size: 13px;
    padding: 8px;
    background: rgba(255, 68, 68, 0.1);
    border-radius: 6px;
  }

  .health-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .health-btn {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .health-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .health-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    .health-checks {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(style);
