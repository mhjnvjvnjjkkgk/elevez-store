// ELEVEZ - Enhanced Dashboard Metrics
// Real-time dashboard with live updates and analytics

class DashboardMetrics {
  constructor() {
    this.refreshInterval = null;
    this.metricsCache = {};
    this.init();
  }

  init() {
    console.log('📊 Dashboard Metrics initialized');
    this.startAutoRefresh();
  }

  // Load products from Firebase or localStorage
  async loadProducts() {
    try {
      // Try Firebase first
      if (window.firebaseOrdersManager && window.firebaseOrdersManager.isFirebaseAvailable) {
        console.log('🔥 Loading products from Firebase...');
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = window.firebaseOrdersManager.db;
        
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        productsSnapshot.forEach(doc => {
          products.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Loaded ${products.length} products from Firebase`);
        
        // Save to localStorage as backup
        localStorage.setItem('elevez_products', JSON.stringify(products));
        
        return products;
      }
    } catch (error) {
      console.warn('⚠️ Firebase products load failed:', error.message);
    }
    
    // Fall back to localStorage
    console.log('📦 Loading products from localStorage...');
    const products = JSON.parse(localStorage.getItem('elevez_products') || '[]');
    console.log(`✅ Loaded ${products.length} products from localStorage`);
    return products;
  }

  // Load orders from Firebase or localStorage
  async loadOrders() {
    try {
      // Try Firebase first
      if (window.firebaseOrdersManager && window.firebaseOrdersManager.isFirebaseAvailable) {
        console.log('🔥 Loading orders from Firebase...');
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = window.firebaseOrdersManager.db;
        
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = [];
        ordersSnapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Loaded ${orders.length} orders from Firebase`);
        
        // Save to localStorage as backup
        localStorage.setItem('elevez_orders', JSON.stringify(orders));
        
        return orders;
      }
    } catch (error) {
      console.warn('⚠️ Firebase orders load failed:', error.message);
    }
    
    // Fall back to localStorage
    console.log('📦 Loading orders from localStorage...');
    const orders = JSON.parse(localStorage.getItem('elevez_orders') || '[]');
    console.log(`✅ Loaded ${orders.length} orders from localStorage`);
    return orders;
  }

  // Load users from Firebase or localStorage
  async loadUsers() {
    try {
      // Try Firebase first
      if (window.firebaseOrdersManager && window.firebaseOrdersManager.isFirebaseAvailable) {
        console.log('🔥 Loading users from Firebase...');
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = window.firebaseOrdersManager.db;
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Loaded ${users.length} users from Firebase`);
        
        // Save to localStorage as backup
        localStorage.setItem('elevez_users', JSON.stringify(users));
        
        return users;
      }
    } catch (error) {
      console.warn('⚠️ Firebase users load failed:', error.message);
    }
    
    // Fall back to localStorage
    console.log('📦 Loading users from localStorage...');
    const users = JSON.parse(localStorage.getItem('elevez_users') || '[]');
    console.log(`✅ Loaded ${users.length} users from localStorage`);
    return users;
  }

  // Calculate comprehensive metrics
  async calculateMetrics() {
    try {
      // Load data from Firebase first, then fall back to localStorage
      const products = await this.loadProducts();
      const orders = await this.loadOrders();
      const users = await this.loadUsers();
      
      console.log('📊 Dashboard Data Loaded:');
      console.log(`   Products: ${products.length}`);
      console.log(`   Orders: ${orders.length}`);
      console.log(`   Users: ${users.length}`);

      // Product metrics
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.stock > 0).length;
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;

      // Order metrics
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const processingOrders = orders.filter(o => o.status === 'processing').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;

      // Revenue metrics - Calculate from actual product data
      let totalRevenue = 0;
      let totalCost = 0;
      
      orders.forEach(order => {
        // Calculate revenue and cost for each order item
        (order.items || []).forEach(item => {
          // Find the product in product manager
          const product = products.find(p => p.id === item.id || p.name === item.name);
          
          if (product) {
            // Use actual product price and production cost
            const itemPrice = item.price || product.price || 0;
            const itemCost = product.productionCost || product.cost || 0;
            const quantity = item.quantity || 1;
            
            // Add to totals
            totalRevenue += itemPrice * quantity;
            totalCost += itemCost * quantity;
            
            console.log(`📊 Order item: ${item.name}`);
            console.log(`   Price: $${itemPrice} × ${quantity} = $${(itemPrice * quantity).toFixed(2)}`);
            console.log(`   Cost: $${itemCost} × ${quantity} = $${(itemCost * quantity).toFixed(2)}`);
            console.log(`   Profit: $${((itemPrice - itemCost) * quantity).toFixed(2)}`);
          } else {
            // Product not found, use order total as fallback
            console.warn(`⚠️ Product not found for: ${item.name || item.id}`);
            totalRevenue += item.price * (item.quantity || 1);
          }
        });
      });
      
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
      
      console.log('💰 Revenue Calculation Summary:');
      console.log(`   Total Revenue: $${totalRevenue.toFixed(2)}`);
      console.log(`   Total Cost: $${totalCost.toFixed(2)}`);
      console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
      console.log(`   Profit Margin: ${profitMargin}%`);

      // User metrics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.lastActive && 
        (Date.now() - new Date(u.lastActive).getTime()) < 7 * 24 * 60 * 60 * 1000
      ).length;

      // Today's metrics - Calculate from actual product data
      const today = new Date().toDateString();
      const todayOrdersList = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todayOrders = todayOrdersList.length;
      
      let todayRevenue = 0;
      let todayCost = 0;
      
      todayOrdersList.forEach(order => {
        (order.items || []).forEach(item => {
          const product = products.find(p => p.id === item.id || p.name === item.name);
          if (product) {
            const itemPrice = item.price || product.price || 0;
            const itemCost = product.productionCost || product.cost || 0;
            const quantity = item.quantity || 1;
            
            todayRevenue += itemPrice * quantity;
            todayCost += itemCost * quantity;
          } else {
            todayRevenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      });
      
      const todayProfit = todayRevenue - todayCost;

      // Best selling products with accurate profit calculation
      const productSales = {};
      const productRevenue = {};
      const productCost = {};
      
      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const productId = item.id || item.name;
          const product = products.find(p => p.id === productId || p.name === item.name);
          
          if (product) {
            const itemPrice = item.price || product.price || 0;
            const itemCost = product.productionCost || product.cost || 0;
            const quantity = item.quantity || 1;
            
            productSales[productId] = (productSales[productId] || 0) + quantity;
            productRevenue[productId] = (productRevenue[productId] || 0) + (itemPrice * quantity);
            productCost[productId] = (productCost[productId] || 0) + (itemCost * quantity);
          }
        });
      });
      
      const bestSellers = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, quantity]) => {
          const product = products.find(p => p.id === id || p.name === id);
          const revenue = productRevenue[id] || 0;
          const cost = productCost[id] || 0;
          const profit = revenue - cost;
          
          return { 
            product, 
            quantity,
            revenue,
            cost,
            profit
          };
        });

      this.metricsCache = {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
          today: todayOrders
        },
        revenue: {
          total: totalRevenue,
          cost: totalCost,
          profit: totalProfit,
          margin: profitMargin,
          today: todayRevenue,
          todayCost: todayCost,
          todayProfit: todayProfit
        },
        users: {
          total: totalUsers,
          active: activeUsers
        },
        bestSellers
      };

      return this.metricsCache;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return null;
    }
  }

  // Render dashboard cards
  async renderDashboard() {
    const metrics = await this.calculateMetrics();
    if (!metrics) return;

    const container = document.getElementById('statsGrid');
    if (!container) return;

    container.innerHTML = `
      <!-- Revenue Card -->
      <div class="stat-card revenue-card">
        <div class="stat-header">
          <span class="stat-icon">💰</span>
          <h3>Revenue</h3>
        </div>
        <div class="stat-body">
          <div class="stat-main">$${metrics.revenue.total.toFixed(2)}</div>
          <div class="stat-details">
            <div class="stat-row">
              <span>Profit:</span>
              <span class="stat-profit">$${metrics.revenue.profit.toFixed(2)}</span>
            </div>
            <div class="stat-row">
              <span>Margin:</span>
              <span class="stat-margin">${metrics.revenue.margin}%</span>
            </div>
            <div class="stat-row">
              <span>Today:</span>
              <span>$${metrics.revenue.today.toFixed(2)}</span>
            </div>
            <div class="stat-row">
              <span>Today's Profit:</span>
              <span class="stat-profit">$${(metrics.revenue.todayProfit || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="stat-card orders-card">
        <div class="stat-header">
          <span class="stat-icon">📦</span>
          <h3>Orders</h3>
        </div>
        <div class="stat-body">
          <div class="stat-main">${metrics.orders.total}</div>
          <div class="stat-details">
            <div class="stat-row">
              <span>Pending:</span>
              <span class="badge badge-warning">${metrics.orders.pending}</span>
            </div>
            <div class="stat-row">
              <span>Processing:</span>
              <span class="badge badge-info">${metrics.orders.processing}</span>
            </div>
            <div class="stat-row">
              <span>Completed:</span>
              <span class="badge badge-success">${metrics.orders.completed}</span>
            </div>
            <div class="stat-row">
              <span>Today:</span>
              <span class="badge badge-primary">${metrics.orders.today}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Card -->
      <div class="stat-card products-card">
        <div class="stat-header">
          <span class="stat-icon">🛍️</span>
          <h3>Products</h3>
        </div>
        <div class="stat-body">
          <div class="stat-main">${metrics.products.total}</div>
          <div class="stat-details">
            <div class="stat-row">
              <span>In Stock:</span>
              <span class="badge badge-success">${metrics.products.active}</span>
            </div>
            <div class="stat-row">
              <span>Low Stock:</span>
              <span class="badge badge-warning">${metrics.products.lowStock}</span>
            </div>
            <div class="stat-row">
              <span>Out of Stock:</span>
              <span class="badge badge-danger">${metrics.products.outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Card -->
      <div class="stat-card users-card">
        <div class="stat-header">
          <span class="stat-icon">👥</span>
          <h3>Users</h3>
        </div>
        <div class="stat-body">
          <div class="stat-main">${metrics.users.total}</div>
          <div class="stat-details">
            <div class="stat-row">
              <span>Active (7d):</span>
              <span class="badge badge-success">${metrics.users.active}</span>
            </div>
            <div class="stat-row">
              <span>Inactive:</span>
              <span class="badge badge-muted">${metrics.users.total - metrics.users.active}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Best Sellers Card -->
      <div class="stat-card best-sellers-card" style="grid-column: span 2;">
        <div class="stat-header">
          <span class="stat-icon">🏆</span>
          <h3>Best Sellers</h3>
        </div>
        <div class="stat-body">
          <div class="best-sellers-list">
            ${metrics.bestSellers.map((item, index) => `
              <div class="best-seller-item">
                <span class="rank">#${index + 1}</span>
                <img src="${item.product?.image || ''}" alt="${item.product?.name || 'Product'}" class="product-thumb">
                <div class="product-info">
                  <div class="product-name">${item.product?.name || 'Unknown Product'}</div>
                  <div class="product-sales">${item.quantity} sold</div>
                  <div class="product-profit">Profit: $${item.profit.toFixed(2)}</div>
                </div>
                <div class="product-revenue">
                  <div class="revenue-amount">$${item.revenue.toFixed(2)}</div>
                  <div class="revenue-label">Revenue</div>
                </div>
              </div>
            `).join('') || '<div class="no-data">No sales yet</div>'}
          </div>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <div class="stat-card quick-actions-card">
        <div class="stat-header">
          <span class="stat-icon">⚡</span>
          <h3>Quick Actions</h3>
        </div>
        <div class="stat-body">
          <div class="quick-actions">
            <button class="quick-action-btn" onclick="document.querySelector('[data-view=products]').click()">
              <span>📦</span>
              <span>Add Product</span>
            </button>
            <button class="quick-action-btn" onclick="document.querySelector('[data-view=orders]').click()">
              <span>🛒</span>
              <span>View Orders</span>
            </button>
            <button class="quick-action-btn" onclick="window.forceSyncFromConstants()">
              <span>🔄</span>
              <span>Sync Products</span>
            </button>
            <button class="quick-action-btn" onclick="document.getElementById('syncBtn').click()">
              <span>🚀</span>
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Update order badge
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
      ordersBadge.textContent = metrics.orders.pending;
      ordersBadge.style.display = metrics.orders.pending > 0 ? 'flex' : 'none';
    }
  }

  // Start auto-refresh
  startAutoRefresh() {
    // DON'T render dashboard automatically - let admin.js handle the UI
    // Just calculate metrics in background
    this.calculateMetrics();

    // Refresh metrics every 30 seconds (but don't render)
    this.refreshInterval = setInterval(() => {
      this.calculateMetrics();
    }, 30000);
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Manual refresh
  refresh() {
    this.renderDashboard();
  }
}

// Initialize dashboard metrics
window.dashboardMetrics = new DashboardMetrics();

// Expose refresh function
window.refreshDashboard = () => {
  window.dashboardMetrics.refresh();
};
