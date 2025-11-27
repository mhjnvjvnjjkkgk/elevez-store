// Order Notification System
// Shows real-time notifications for new orders with profit data

// Show notification for new orders with profit
function showNewOrderNotification(order) {
  const profitColor = order.orderProfitMargin < 20 ? '#ff3b30' : order.orderProfitMargin < 40 ? '#ffaa00' : 'var(--primary)';
  
  // Create notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border: 2px solid var(--primary);
    border-radius: 12px;
    padding: 20px;
    min-width: 320px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0,255,136,0.3);
    z-index: 10001;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <style>
      @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    </style>
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
      <h3 style="margin: 0; color: var(--primary); font-size: 18px;">🔔 New Order!</h3>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 20px; padding: 0; line-height: 1;">×</button>
    </div>
    <div style="margin-bottom: 10px;">
      <p style="margin: 5px 0; font-size: 14px;"><strong>Order #${order.orderId.substring(0, 8)}</strong></p>
      <p style="margin: 5px 0; font-size: 14px;">Customer: ${order.fullName || 'N/A'}</p>
      <p style="margin: 5px 0; font-size: 14px;">Items: ${order.items?.length || 0}</p>
    </div>
    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
      <p style="margin: 5px 0; font-size: 14px;"><strong>Revenue:</strong> ₹${(order.totalAmount || 0).toFixed(2)}</p>
      ${order.orderCost > 0 ? `
        <p style="margin: 5px 0; font-size: 14px;"><strong>Cost:</strong> ₹${order.orderCost.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Profit:</strong> <span style="color: ${profitColor}; font-weight: 700;">₹${order.orderProfit.toFixed(2)} (${order.orderProfitMargin}%)</span></p>
      ` : '<p style="margin: 5px 0; font-size: 12px; color: var(--text-muted);">Add product costs to see profit</p>'}
    </div>
    <button onclick="switchView('orders'); this.parentElement.remove();" style="width: 100%; padding: 10px; background: var(--primary); color: var(--bg); border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">
      View Order
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 10000);
  
  console.log('🔔 New order notification shown:', order.orderId);
}

// Export
window.showNewOrderNotification = showNewOrderNotification;
