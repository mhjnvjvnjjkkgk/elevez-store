// Sync & Deploy Handler
// Commits all changes to GitHub and triggers Vercel deployment

class SyncDeployManager {
  constructor() {
    this.isDeploying = false;
    this.statusCallback = null;
  }

  // Set status update callback
  onStatusUpdate(callback) {
    this.statusCallback = callback;
  }

  // Update status
  updateStatus(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (this.statusCallback) {
      this.statusCallback(message, type);
    }
  }

  // Main sync and deploy function
  async syncAndDeploy() {
    if (this.isDeploying) {
      this.updateStatus('Deployment already in progress...', 'warning');
      return;
    }

    this.isDeploying = true;
    this.updateStatus('Starting sync and deploy...', 'info');

    try {
      // Step 1: Save current products to ensure everything is synced
      this.updateStatus('Saving products...', 'info');
      await this.saveProducts();

      // Step 2: Trigger Git commit and push
      this.updateStatus('Committing to GitHub...', 'info');
      const deployResult = await this.triggerDeploy();

      if (deployResult.success) {
        this.updateStatus('✅ Successfully deployed to GitHub!', 'success');
        this.updateStatus('Vercel will auto-deploy in 1-2 minutes', 'success');
        
        // Show success notification
        this.showSuccessNotification();
      } else {
        throw new Error(deployResult.error || 'Deployment failed');
      }

    } catch (error) {
      this.updateStatus(`❌ Error: ${error.message}`, 'error');
      this.showErrorNotification(error.message);
    } finally {
      this.isDeploying = false;
    }
  }

  // Save products before deploying
  async saveProducts() {
    const products = window.products || [];
    const collections = window.collections || [];
    const orders = window.orders || [];

    const response = await fetch('http://localhost:3001/save-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, collections, orders })
    });

    if (!response.ok) {
      throw new Error('Failed to save products');
    }

    return await response.json();
  }

  // Trigger deployment
  async triggerDeploy() {
    const response = await fetch('http://localhost:3001/sync-deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        products: window.products?.length || 0,
        collections: window.collections?.length || 0
      })
    });

    if (!response.ok) {
      throw new Error('Deployment request failed');
    }

    return await response.json();
  }

  // Show success notification
  showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'deploy-notification success';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🚀</div>
        <div class="notification-text">
          <h3>Deployment Successful!</h3>
          <p>Changes pushed to GitHub. Vercel will deploy in 1-2 minutes.</p>
          <div class="notification-links">
            <a href="https://github.com/mhjnvjvnjjkkgk/elevez-store" target="_blank">View on GitHub</a>
            <a href="https://vercel.com/dashboard" target="_blank">Vercel Dashboard</a>
          </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Show error notification
  showErrorNotification(error) {
    const notification = document.createElement('div');
    notification.className = 'deploy-notification error';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">❌</div>
        <div class="notification-text">
          <h3>Deployment Failed</h3>
          <p>${error}</p>
          <p style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
            Make sure the admin server is running and Git is configured.
          </p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }
}

// Create global instance
window.syncDeployManager = new SyncDeployManager();

// Initialize sync button
document.addEventListener('DOMContentLoaded', () => {
  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      // Disable button during deployment
      syncBtn.disabled = true;
      syncBtn.style.opacity = '0.6';
      syncBtn.innerHTML = '<span class="sync-icon spinning">🔄</span><span>Deploying...</span>';

      // Set status callback to update button text
      window.syncDeployManager.onStatusUpdate((message, type) => {
        const statusText = syncBtn.querySelector('span:last-child');
        if (statusText) {
          statusText.textContent = message;
        }
      });

      // Execute deployment
      await window.syncDeployManager.syncAndDeploy();

      // Re-enable button
      setTimeout(() => {
        syncBtn.disabled = false;
        syncBtn.style.opacity = '1';
        syncBtn.innerHTML = '<span class="sync-icon">🔄</span><span>Sync & Deploy</span>';
      }, 2000);
    });
  }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  .deploy-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
  }

  .deploy-notification.success {
    border-left: 4px solid #00ff88;
  }

  .deploy-notification.error {
    border-left: 4px solid #ff4444;
  }

  .notification-content {
    display: flex;
    gap: 15px;
    padding: 20px;
    align-items: flex-start;
  }

  .notification-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .notification-text {
    flex: 1;
  }

  .notification-text h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .notification-text p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  .notification-links {
    display: flex;
    gap: 15px;
    margin-top: 12px;
  }

  .notification-links a {
    font-size: 13px;
    color: #00ff88;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .notification-links a:hover {
    opacity: 0.7;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .notification-close:hover {
    background: #f0f0f0;
    color: #333;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .spinning {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
