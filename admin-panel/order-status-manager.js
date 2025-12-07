// ELEVEZ - Advanced Order Status Manager
// Visual order pipeline with drag-and-drop and notifications

class OrderStatusManager {
  constructor() {
    this.statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    this.statusConfig = {
      pending: {
        label: 'Pending',
        icon: '⏳',
        color: '#ffaa00',
        next: 'processing'
      },
      processing: {
        label: 'Processing',
        icon: '⚙️',
        color: '#667eea',
        next: 'shipped'
      },
      shipped: {
        label: 'Shipped',
        icon: '🚚',
        color: '#00ddff',
        next: 'delivered'
      },
      delivered: {
        label: 'Delivered',
        icon: '✅',
        color: '#00ff88',
        next: null
      },
      cancelled: {
        label: 'Cancelled',
        icon: '❌',
        color: '#ff4444',
        next: null
      }
    };
    this.init();
  }

  init() {
    console.log('📦 Order Status Manager initialized');
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus, notify = true) {
    try {
      const orders = JSON.parse(localStorage.getItem('elevez_orders') || '[]');
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const order = orders[orderIndex];
      const oldStatus = order.status;

      // Update status
      order.status = newStatus;
      order.statusUpdatedAt = new Date().toISOString();
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        from: oldStatus,
        to: newStatus,
        timestamp: new Date().toISOString(),
        updatedBy: 'admin'
      });

      // Save to localStorage
      orders[orderIndex] = order;
      localStorage.setItem('elevez_orders', JSON.stringify(orders));

      // Sync to Firebase if available
      if (window.firebaseOrdersManager) {
        await window.firebaseOrdersManager.updateOrderStatus(orderId, newStatus);
      }

      // Show notification
      if (notify) {
        this.showStatusNotification(order, oldStatus, newStatus);
      }

      // Refresh orders view
      if (window.loadOrders) {
        window.loadOrders();
      }

      // Refresh dashboard
      if (window.refreshDashboard) {
        window.refreshDashboard();
      }

      return { success: true, order };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // Show status update notification
  showStatusNotification(order, oldStatus, newStatus) {
    const config = this.statusConfig[newStatus];
    const notification = document.createElement('div');
    notification.className = 'status-notification';
    notification.innerHTML = `
      <div class="status-notification-content">
        <span class="status-icon">${config.icon}</span>
        <div class="status-text">
          <div class="status-title">Order #${order.id.slice(0, 8)} updated</div>
          <div class="status-subtitle">${this.statusConfig[oldStatus].label} → ${config.label}</div>
        </div>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid ${config.color};
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Render order status pipeline
  renderOrderPipeline(order) {
    const currentStatus = order.status;
    const currentIndex = this.statuses.indexOf(currentStatus);

    return `
      <div class="order-pipeline">
        ${this.statuses.filter(s => s !== 'cancelled').map((status, index) => {
          const config = this.statusConfig[status];
          const isActive = status === currentStatus;
          const isCompleted = index < currentIndex;
          const isNext = index === currentIndex + 1;

          return `
            <div class="pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isNext ? 'next' : ''}"
                 data-status="${status}"
                 onclick="orderStatusManager.updateOrderStatus('${order.id}', '${status}')">
              <div class="step-icon" style="background: ${isActive || isCompleted ? config.color : 'rgba(255,255,255,0.1)'}">
                ${config.icon}
              </div>
              <div class="step-label">${config.label}</div>
              ${isNext ? '<div class="step-hint">Click to advance</div>' : ''}
            </div>
            ${index < this.statuses.length - 2 ? '<div class="pipeline-connector"></div>' : ''}
          `;
        }).join('')}
      </div>
      ${currentStatus !== 'cancelled' ? `
        <button class="cancel-order-btn" onclick="orderStatusManager.updateOrderStatus('${order.id}', 'cancelled')">
          ❌ Cancel Order
        </button>
      ` : ''}
    `;
  }

  // Render order status badge
  renderStatusBadge(status) {
    const config = this.statusConfig[status];
    return `
      <span class="status-badge" style="background: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}40;">
        ${config.icon} ${config.label}
      </span>
    `;
  }

  // Get orders by status
  getOrdersByStatus(status) {
    const orders = JSON.parse(localStorage.getItem('elevez_orders') || '[]');
    return orders.filter(o => o.status === status);
  }

  // Get status statistics
  getStatusStats() {
    const orders = JSON.parse(localStorage.getItem('elevez_orders') || '[]');
    const stats = {};

    this.statuses.forEach(status => {
      stats[status] = orders.filter(o => o.status === status).length;
    });

    return stats;
  }

  // Bulk status update
  async bulkUpdateStatus(orderIds, newStatus) {
    const results = [];

    for (const orderId of orderIds) {
      const result = await this.updateOrderStatus(orderId, newStatus, false);
      results.push(result);
    }

    // Show summary notification
    const successCount = results.filter(r => r.success).length;
    this.showBulkUpdateNotification(successCount, orderIds.length, newStatus);

    return results;
  }

  // Show bulk update notification
  showBulkUpdateNotification(successCount, totalCount, status) {
    const config = this.statusConfig[status];
    const notification = document.createElement('div');
    notification.className = 'status-notification';
    notification.innerHTML = `
      <div class="status-notification-content">
        <span class="status-icon">${config.icon}</span>
        <div class="status-text">
          <div class="status-title">Bulk Update Complete</div>
          <div class="status-subtitle">${successCount}/${totalCount} orders updated to ${config.label}</div>
        </div>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid ${config.color};
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize order status manager
window.orderStatusManager = new OrderStatusManager();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .status-notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon {
    font-size: 32px;
  }

  .status-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .status-title {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }

  .status-subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .order-pipeline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    margin: 16px 0;
  }

  .pipeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .pipeline-step:hover {
    transform: translateY(-4px);
  }

  .pipeline-step.next {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .step-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all 0.3s ease;
  }

  .pipeline-step.active .step-icon {
    box-shadow: 0 0 20px currentColor;
    transform: scale(1.1);
  }

  .step-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .step-hint {
    position: absolute;
    bottom: -24px;
    font-size: 10px;
    color: #00ff88;
    white-space: nowrap;
  }

  .pipeline-connector {
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    min-width: 40px;
  }

  .cancel-order-btn {
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(255, 68, 68, 0.2);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 8px;
    color: #ff4444;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-order-btn:hover {
    background: rgba(255, 68, 68, 0.3);
    border-color: rgba(255, 68, 68, 0.5);
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
`;
document.head.appendChild(style);
