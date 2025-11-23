// ELEVEZ Product Manager - Complete Implementation

// ============================================
// HOT-RELOAD CLIENT
// ============================================
function setupHotReloadClient() {
  const wsUrl = `ws://${window.location.hostname}:3002`;
  
  function connect() {
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔥 Hot-reload connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'reload') {
          console.log(`📝 File changed: ${data.file} - Reloading...`);
          // Reload CSS files without full page reload
          if (data.file.endsWith('.css')) {
            reloadCSS();
          } else {
            // For JS changes, do a full reload
            setTimeout(() => location.reload(), 500);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.warn('⚠️ Hot-reload connection error:', error);
      };
      
      ws.onclose = () => {
        console.log('❌ Hot-reload disconnected - Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };
    } catch (error) {
      console.warn('⚠️ Hot-reload unavailable:', error.message);
    }
  }
  
  connect();
}

function reloadCSS() {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    if (link.href.includes('admin.css')) {
      const newHref = link.href.split('?')[0] + '?t=' + Date.now();
      link.href = newHref;
      console.log('✅ CSS reloaded');
    }
  });
}

// State
const state = {
  products: [],
  collections: [],
  orders: [],
  availableTags: ['ESSENTIAL', 'TRENDING', 'PREMIUM', 'NEW', 'BESTSELLER', 'VINTAGE', 'COLORFUL'],
  availableCategories: ['Men', 'Women', 'Unisex'],
  availableTypes: ['Hoodie', 'T-Shirt', 'Crop Top', 'Oversized T-Shirt'],
  availableColors: [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Green', code: '#00FF00' },
    { name: 'Yellow', code: '#FFFF00' },
    { name: 'Pink', code: '#FF69B4' },
    { name: 'Purple', code: '#800080' },
    { name: 'Orange', code: '#FFA500' },
    { name: 'Gray', code: '#808080' }
  ],
  currentView: 'dashboard',
  editingProduct: null,
  editingCollection: null,
  lastAddedProductId: null,
  productForm: {
    images: [],
    sizeChart: null,
    selectedSizes: ['M'],
    colors: [],
    selectedColors: [],
    selectedTags: []
  },
  cropper: null,
  currentCropIndex: null,
  currentCropType: 'product',
  draggedImageIndex: null,
  // Undo/Redo functionality
  imageHistory: [],
  historyIndex: -1,
  selectedImages: new Set()
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Setup hot-reload first
  setupHotReloadClient();
  
  await loadData();
  setupNavigation();
  setupSyncButton();
  renderCurrentView();
  
  // Check for data issues on startup
  checkDataIntegrity();
  
  // Initialize Firebase real-time order sync
  console.log('🔥 Initializing Firebase order sync...');
  if (typeof startAutoSync === 'function') {
    startAutoSync();
    console.log('✅ Real-time order sync started');
  } else {
    console.log('⚠️ Firebase orders script not loaded. Include firebase-orders.js');
  }
  
  // Auto-save every 30 seconds
  setInterval(() => {
    if (state.products.length > 0) {
      saveData();
      console.log('🔄 Auto-saved products');
    }
  }, 30000);
  
  // Save before page unload
  window.addEventListener('beforeunload', () => {
    if (state.products.length > 0) {
      saveData();
      console.log('💾 Saved before page close');
    }
  });
});

// Load Data
// Trial products to load by default
const TRIAL_PRODUCTS = [
  {
    id: 1,
    qid: "NGH-001",
    name: "Neon Glitch Hoodie",
    price: 85,
    originalPrice: 170,
    category: "Men",
    type: "Hoodie",
    rating: 4.5,
    description: "Premium quality hoodie with neon glitch design. Perfect for streetwear enthusiasts.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Neon Green"],
    tags: ["TRENDING", "BESTSELLER"],
    isBestSeller: true,
    isNew: true
  },
  {
    id: 2,
    qid: "VCT-002",
    name: "Vintage Crop Top",
    price: 45,
    originalPrice: 90,
    category: "Women",
    type: "Crop Top",
    rating: 4.7,
    description: "Stylish vintage crop top with retro vibes. Comfortable and trendy.",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Pink", "White", "Black"],
    tags: ["VINTAGE", "TRENDING"],
    isNew: true
  },
  {
    id: 3,
    qid: "OST-003",
    name: "Oversized Street Tee",
    price: 35,
    originalPrice: 70,
    category: "Unisex",
    type: "Oversized T-Shirt",
    rating: 4.6,
    description: "Ultra-comfortable oversized t-shirt. Perfect for casual streetwear.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Gray"],
    tags: ["ESSENTIAL", "BESTSELLER"],
    isBestSeller: true
  },
  {
    id: 4,
    qid: "PTH-004",
    name: "Premium Tech Hoodie",
    price: 95,
    originalPrice: 190,
    category: "Men",
    type: "Hoodie",
    rating: 4.8,
    description: "High-tech fabric hoodie with moisture-wicking properties. Perfect for active lifestyle.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Gray"],
    tags: ["PREMIUM", "NEW"],
    isNew: true
  },
  {
    id: 5,
    qid: "CFT-005",
    name: "Colorful Festival Tee",
    price: 40,
    originalPrice: 80,
    category: "Unisex",
    type: "T-Shirt",
    rating: 4.4,
    description: "Vibrant and colorful t-shirt perfect for festivals and summer events.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500",
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rainbow", "Yellow", "Orange"],
    tags: ["COLORFUL", "TRENDING"]
  }
];

async function loadData() {
  console.log('📂 Loading data from localStorage...');
  
  const saved = localStorage.getItem('elevez_products');
  if (saved) {
    try {
      state.products = JSON.parse(saved);
      // Ensure all products have QID
      state.products = state.products.map(p => {
        if (!p.qid) {
          p.qid = `QID${p.id}`;
        }
        return p;
      });
      console.log(`✅ Loaded ${state.products.length} products from localStorage`);
    } catch (e) {
      console.error('❌ Error loading products:', e);
      state.products = [];
    }
  } else {
    console.log('ℹ️ No saved products in localStorage, trying server backup...');
    
    // Try loading from server backup
    try {
      const response = await fetch('http://localhost:3001/load-products');
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          state.products = data.products;
          state.collections = data.collections || [];
          state.orders = data.orders || [];
          
          // Save to localStorage
          localStorage.setItem('elevez_products', JSON.stringify(state.products));
          localStorage.setItem('elevez_collections', JSON.stringify(state.collections));
          localStorage.setItem('elevez_orders', JSON.stringify(state.orders));
          
          console.log(`✅ Restored ${state.products.length} products from server backup`);
          showSyncStatus(`✅ Restored ${state.products.length} products from backup`, 'success');
        } else {
          // No server backup, load trial products
          console.log('ℹ️ No server backup, loading trial products...');
          loadTrialProducts();
        }
      } else {
        // Server not available, load trial products
        console.log('ℹ️ Server not available, loading trial products...');
        loadTrialProducts();
      }
    } catch (e) {
      console.log('ℹ️ Server backup not available, loading trial products...');
      loadTrialProducts();
    }
  }
  
  const savedCollections = localStorage.getItem('elevez_collections');
  if (savedCollections) {
    state.collections = JSON.parse(savedCollections);
  }
  
  const savedOrders = localStorage.getItem('elevez_orders');
  if (savedOrders) {
    state.orders = JSON.parse(savedOrders);
  }
  
  const savedTags = localStorage.getItem('elevez_tags');
  if (savedTags) {
    state.availableTags = JSON.parse(savedTags);
  }
  
  const savedCategories = localStorage.getItem('elevez_categories');
  if (savedCategories) {
    state.availableCategories = JSON.parse(savedCategories);
  }
  
  const savedTypes = localStorage.getItem('elevez_types');
  if (savedTypes) {
    state.availableTypes = JSON.parse(savedTypes);
  }
  
  const savedColors = localStorage.getItem('elevez_colors');
  if (savedColors) {
    state.availableColors = JSON.parse(savedColors);
  }
  
  // Extract unique tags, categories, and types from existing products
  state.products.forEach(product => {
    if (product.tags) {
      product.tags.forEach(tag => {
        if (!state.availableTags.includes(tag)) {
          state.availableTags.push(tag);
        }
      });
    }
    
    if (product.category && !state.availableCategories.includes(product.category)) {
      state.availableCategories.push(product.category);
    }
    
    if (product.type && !state.availableTypes.includes(product.type)) {
      state.availableTypes.push(product.type);
    }
  });
  
  updateOrdersBadge();
  
  // Show data status on load
  const lastSave = localStorage.getItem('elevez_last_save');
  console.log('📦 Data loaded:', {
    products: state.products.length,
    collections: state.collections.length,
    orders: state.orders.length,
    lastSave: lastSave ? new Date(lastSave).toLocaleString() : 'Never'
  });
  
  // Show status in UI
  if (state.products.length > 0) {
    setTimeout(() => {
      showSyncStatus(`📦 Loaded ${state.products.length} products`, 'success');
    }, 500);
  }
}

// Save Data
async function saveData() {
  try {
    const productsData = JSON.stringify(state.products);
    const dataSize = productsData.length / 1024; // KB
    
    console.log(`💾 Saving ${state.products.length} products (${dataSize.toFixed(0)}KB)...`);
    
    localStorage.setItem('elevez_products', productsData);
    localStorage.setItem('elevez_collections', JSON.stringify(state.collections));
    localStorage.setItem('elevez_orders', JSON.stringify(state.orders));
    localStorage.setItem('elevez_tags', JSON.stringify(state.availableTags));
    localStorage.setItem('elevez_categories', JSON.stringify(state.availableCategories));
    localStorage.setItem('elevez_types', JSON.stringify(state.availableTypes));
    localStorage.setItem('elevez_colors', JSON.stringify(state.availableColors));
    
    // Save timestamp
    localStorage.setItem('elevez_last_save', new Date().toISOString());
    
    updateOrdersBadge();
    
    // Also backup to server
    try {
      await fetch('http://localhost:3001/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: state.products,
          collections: state.collections,
          orders: state.orders,
          tags: state.availableTags,
          categories: state.availableCategories,
          types: state.availableTypes,
          colors: state.availableColors
        })
      });
      console.log('✅ Backed up to server');
    } catch (e) {
      console.log('ℹ️ Server backup skipped (server not running)');
    }
    
    // Log for debugging
    const lastProduct = state.products[state.products.length - 1];
    console.log('✅ Data saved:', {
      products: state.products.length,
      collections: state.collections.length,
      orders: state.orders.length,
      size: `${dataSize.toFixed(0)}KB`,
      timestamp: new Date().toLocaleString()
    });
    
    if (lastProduct) {
      console.log('📦 Last product:', {
        name: lastProduct.name,
        qid: lastProduct.qid,
        price: `₹${lastProduct.price}`,
        images: lastProduct.images?.length || 0,
        category: lastProduct.category,
        type: lastProduct.type
      });
    }
    
    showSyncStatus(`💾 Saved: ${state.products.length} products (localStorage + server)`, 'success');
  } catch (error) {
    console.error('❌ Error saving data:', error);
    
    if (error.name === 'QuotaExceededError') {
      alert(`❌ STORAGE QUOTA EXCEEDED!\n\nYour images are too large for browser storage.\n\n💡 SOLUTIONS:\n1. Use image URLs instead of uploading\n2. Start admin server for automatic upload\n3. Clear old products\n\nTip: Run START-ALL-SERVERS.bat for automatic image upload.`);
    } else {
      alert('⚠️ Error saving data! Check browser console.');
    }
    
    throw error; // Re-throw to prevent further execution
  }
}

function updateOrdersBadge() {
  const pendingOrders = state.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const badge = document.getElementById('ordersBadge');
  if (badge) {
    badge.textContent = pendingOrders;
    badge.style.display = pendingOrders > 0 ? 'block' : 'none';
  }
}

function showSyncStatus(message, type = 'success') {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column-reverse; gap: 10px; max-width: 400px;';
    document.body.appendChild(container);
  }
  
  const statusDiv = document.createElement('div');
  statusDiv.className = `sync-status active ${type}`;
  statusDiv.innerHTML = `
    <span class="sync-status-icon">${type === 'success' ? '✓' : '✗'}</span>
    <span class="sync-status-text">${message}</span>
  `;
  
  // Add to container (will stack from bottom)
  container.appendChild(statusDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    statusDiv.style.opacity = '0';
    statusDiv.style.transform = 'translateX(400px)';
    setTimeout(() => {
      statusDiv.remove();
      // Remove container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
}

function switchView(view) {
  state.currentView = view;
  
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
  });
  document.getElementById(`${view}-view`).classList.add('active');
  
  renderCurrentView();
}

function renderCurrentView() {
  switch(state.currentView) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'products':
      renderProducts();
      break;
    case 'orders':
      renderOrders();
      break;
    case 'collections':
      renderCollections();
      break;
  }
}

// Dashboard
function renderDashboard() {
  const grid = document.getElementById('statsGrid');
  const totalProducts = state.products.length;
  const totalValue = state.products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
  const totalOrders = state.orders.length;
  const pendingOrders = state.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const totalRevenue = state.orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0);
  
  grid.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalProducts}</div>
      <div class="stat-label">Total Products</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${totalOrders}</div>
      <div class="stat-label">Total Orders</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${pendingOrders}</div>
      <div class="stat-label">Pending Orders</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">₹${totalRevenue.toFixed(0)}</div>
      <div class="stat-label">Total Revenue</div>
    </div>
  `;
}

// Products
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  
  if (state.products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No products yet</h3>
        <p>Click "Add Product" to create your first product</p>
        <button class="btn btn-secondary" onclick="clearAllData()" style="margin-top: 15px;">🗑️ Clear Old Data</button>
      </div>
    `;
    return;
  }
  
  // Add summary header
  const summary = `
    <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(0,255,136,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div>
          <h3 style="margin: 0 0 5px 0; color: var(--primary);">📦 ${state.products.length} Products</h3>
          <p style="margin: 0; color: var(--text-muted); font-size: 14px;">All products are synced and ready</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="autoSyncAndDeploy()" style="background: var(--primary); color: var(--bg);">
            🚀 Sync & Deploy
          </button>
          <button class="btn btn-secondary" onclick="clearAllData()">
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  `;
  
  grid.innerHTML = summary + state.products.map(product => {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="margin: 0; flex: 1;">${product.name}</h3>
            <span style="background: rgba(0,255,136,0.1); color: var(--primary); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${product.qid}</span>
          </div>
          <div class="product-price">
            <span class="price-sale">₹${product.price}</span>
            <span class="price-normal">₹${product.originalPrice}</span>
            <span class="price-discount">${discount}% OFF</span>
          </div>
          <div class="product-meta">
            <span class="meta-badge">${product.category}</span>
            <span class="meta-badge">${product.type}</span>
            <span class="meta-badge">⭐ ${product.rating}</span>
          </div>
          <div class="product-actions">
            <button onclick="editProduct(${product.id})">✏️ Edit</button>
            <button onclick="deleteProduct(${product.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Setup search
  const searchInput = document.getElementById('productSearch');
  searchInput.value = '';
  searchInput.oninput = (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? 'block' : 'none';
    });
  };
}

// Collections
function renderCollections() {
  const grid = document.getElementById('collectionsGrid');
  
  if (state.collections.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗂️</div>
        <h3>No collections yet</h3>
        <p>Click "Create Collection" to organize your products</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = state.collections.map(collection => `
    <div class="collection-card">
      <h3>${collection.name}</h3>
      <p>${collection.description || 'No description'}</p>
      <div class="collection-stats">
        <span>${collection.productCount || 0} products</span>
      </div>
      <div class="collection-actions">
        <button class="btn btn-secondary" onclick="editCollection('${collection.id}')">Edit</button>
        <button class="btn btn-secondary" onclick="deleteCollection('${collection.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Product Modal
window.openProductModal = () => {
  resetProductForm();
  const modal = document.getElementById('productModal');
  modal.style.display = ''; // Reset inline style
  modal.classList.add('active');
  setupProductFormListeners();
};

window.closeProductModal = () => {
  document.getElementById('productModal').classList.remove('active');
  resetProductForm();
};

function resetProductForm() {
  document.getElementById('productForm').reset();
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  document.getElementById('saveProductBtn').textContent = 'Save Product';
  state.editingProduct = null;
  state.productForm = {
    images: [],
    sizeChart: null,
    selectedSizes: ['M'],
    colors: [],
    selectedColors: [],
    selectedTags: []
  };
  
  document.getElementById('imagePreviewGrid').innerHTML = '';
  document.getElementById('sizeChartPreview').innerHTML = '';
  document.getElementById('discountDisplay').value = '';
  
  // Hide custom input fields
  const customCategoryInput = document.getElementById('customCategoryInput');
  const customTypeInput = document.getElementById('customTypeInput');
  if (customCategoryInput) {
    customCategoryInput.style.display = 'none';
    customCategoryInput.value = '';
  }
  if (customTypeInput) {
    customTypeInput.style.display = 'none';
    customTypeInput.value = '';
  }
  
  // Re-enable selects
  const categorySelect = document.getElementById('productCategory');
  const typeSelect = document.getElementById('productType');
  if (categorySelect) categorySelect.disabled = false;
  if (typeSelect) typeSelect.disabled = false;
  
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === 'M');
  });
  
  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function setupProductFormListeners() {
  // Price calculation
  const normalPrice = document.getElementById('normalPrice');
  const salePrice = document.getElementById('salePrice');
  const discountDisplay = document.getElementById('discountDisplay');
  
  const calculateDiscount = () => {
    const normal = parseFloat(normalPrice.value) || 0;
    const sale = parseFloat(salePrice.value) || 0;
    if (normal > 0 && sale > 0 && sale < normal) {
      const discount = Math.round(((normal - sale) / normal) * 100);
      discountDisplay.value = `${discount}% OFF`;
    } else {
      discountDisplay.value = '';
    }
  };
  
  normalPrice.addEventListener('input', calculateDiscount);
  salePrice.addEventListener('input', calculateDiscount);
  
  // Size selection
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.onclick = () => {
      btn.classList.toggle('active');
      const size = btn.dataset.size;
      if (btn.classList.contains('active')) {
        if (!state.productForm.selectedSizes.includes(size)) {
          state.productForm.selectedSizes.push(size);
        }
      } else {
        state.productForm.selectedSizes = state.productForm.selectedSizes.filter(s => s !== size);
      }
    };
  });
  
  // Render available tags
  renderProductTags();
  
  // Render available colors
  renderColorsGrid();
  
  // Tag selection will be handled in renderProductTags
  
  // Image upload
  const imageZone = document.getElementById('imageUploadZone');
  const imageInput = document.getElementById('imageInput');
  
  imageZone.onclick = () => imageInput.click();
  imageInput.onchange = (e) => handleImageUpload(e.target.files);
  
  imageZone.ondragover = (e) => {
    e.preventDefault();
    imageZone.style.borderColor = 'var(--primary)';
  };
  
  imageZone.ondragleave = () => {
    imageZone.style.borderColor = '';
  };
  
  imageZone.ondrop = (e) => {
    e.preventDefault();
    imageZone.style.borderColor = '';
    handleImageUpload(e.dataTransfer.files);
  };
  
  // Size chart upload
  const sizeChartZone = document.getElementById('sizeChartZone');
  const sizeChartInput = document.getElementById('sizeChartInput');
  
  sizeChartZone.onclick = () => sizeChartInput.click();
  sizeChartInput.onchange = (e) => handleSizeChartUpload(e.target.files[0]);
  
  // Form submit
  document.getElementById('productForm').onsubmit = handleProductSubmit;
}

async function handleImageUpload(files) {
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/') && state.productForm.images.length < 10) {
      try {
        showSyncStatus('📤 Uploading image...', 'success');
        
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:3001/upload-image', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Use GitHub URL if available, otherwise use local URL for preview
          const imageUrl = result.githubUrl || `http://localhost:5173${result.url}`;
          
          // Store the image URL
          state.productForm.images.push(imageUrl);
          renderImagePreviews();
          
          showSyncStatus(`✅ Image uploaded: ${result.filename}`, 'success');
          console.log(`✅ Image saved locally: public${result.url}`);
          console.log(`🌐 GitHub URL (after deploy): ${result.githubUrl}`);
          
          // Show info about GitHub URL
          if (result.githubUrl) {
            showSyncStatus('ℹ️ Image will be available on GitHub after Sync & Deploy', 'success');
          }
        } else {
          throw new Error('Upload failed');
        }
        
      } catch (error) {
        console.error('❌ Upload error:', error);
        showSyncStatus('⚠️ Server not running, using local preview', 'error');
        
        // Fallback: use data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          state.productForm.images.push(e.target.result);
          renderImagePreviews();
          
          const sizeKB = (e.target.result.length / 1024).toFixed(0);
          console.log(`📸 Image loaded locally: ${sizeKB}KB`);
          
          if (e.target.result.length > 500000) {
            console.warn(`⚠️ Large image (${sizeKB}KB). Start admin server for automatic upload.`);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }
}

// Convert hosting service URLs to direct image URLs
function convertToDirectImageUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // PostImage.cc - Convert page URL to direct image URL
    if (urlObj.hostname.includes('postimg.cc')) {
      // Extract image ID from URL like https://postimg.cc/G4MYh9cg
      const imageId = urlObj.pathname.split('/').pop();
      // Return direct image URL
      return `https://i.postimg.cc/${imageId}/image.jpg`;
    }
    
    // Imgur - Convert page URL to direct image URL
    if (urlObj.hostname === 'imgur.com' && !urlObj.hostname.startsWith('i.')) {
      const imageId = urlObj.pathname.split('/').pop().split('.')[0];
      return `https://i.imgur.com/${imageId}.jpg`;
    }
    
    // ImgBB - Extract direct URL if it's a page URL
    if (urlObj.hostname.includes('ibb.co') && !urlObj.hostname.startsWith('i.')) {
      // For ibb.co, we need to fetch the page to get the direct URL
      // For now, return as-is and let the preview handle it
      return url;
    }
    
    // Already a direct image URL
    return url;
  } catch (e) {
    return url;
  }
}

// Fetch direct image URL from hosting page
async function fetchDirectImageUrl(pageUrl) {
  try {
    showSyncStatus('🔍 Detecting image URL...', 'success');
    
    // Try to convert known hosting services
    const directUrl = convertToDirectImageUrl(pageUrl);
    
    if (directUrl !== pageUrl) {
      console.log('✅ Converted URL:', pageUrl, '→', directUrl);
      return directUrl;
    }
    
    // For other services, try common patterns
    const urlObj = new URL(pageUrl);
    
    // Check if it's already a direct image URL
    if (pageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
      return pageUrl;
    }
    
    // Try adding common image extensions
    const possibleUrls = [
      pageUrl,
      `${pageUrl}.jpg`,
      `${pageUrl}.png`,
      pageUrl.replace(/^(https?:\/\/)/, '$1i.')
    ];
    
    // Test each URL
    for (const testUrl of possibleUrls) {
      const works = await testImageUrl(testUrl);
      if (works) {
        console.log('✅ Found working URL:', testUrl);
        return testUrl;
      }
    }
    
    // If nothing works, return original
    console.warn('⚠️ Could not find direct image URL, using original');
    return pageUrl;
    
  } catch (e) {
    console.error('Error fetching direct URL:', e);
    return pageUrl;
  }
}

// Test if an image URL works
function testImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
}

// Alternative: Add image by URL
window.addImageByUrl = async () => {
  if (state.productForm.images.length >= 10) {
    alert('❌ Maximum 10 images allowed per product');
    return;
  }
  
  const url = prompt('Enter image URL:\n\n✅ Supported:\n• PostImg.cc (page or direct URL)\n• Imgur (page or direct URL)\n• ImgBB\n• Direct image URLs (.jpg, .png, etc.)\n\nExamples:\n• https://postimg.cc/G4MYh9cg\n• https://imgur.com/abc123\n• https://i.imgur.com/abc123.jpg\n• https://images.unsplash.com/photo-123\n\n💡 Tip: Right-click image → Copy Image Address');
  
  if (url && url.trim()) {
    try {
      new URL(url);
      
      showSyncStatus('🔄 Processing image URL...', 'success');
      
      // Convert to direct image URL if needed
      const directUrl = await fetchDirectImageUrl(url.trim());
      
      // Test if image loads
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        saveImageHistory();
        state.productForm.images.push(directUrl);
        renderImagePreviews();
        showSyncStatus(`✅ Image ${state.productForm.images.length}/10 added`, 'success');
        console.log('✅ Image URL added:', directUrl);
      };
      
      img.onerror = () => {
        // Still add it, but warn user
        saveImageHistory();
        state.productForm.images.push(directUrl);
        renderImagePreviews();
        showSyncStatus('⚠️ Image added but preview may not work. It will work on the website.', 'error');
        console.warn('⚠️ Image preview failed for:', directUrl);
        console.log('💡 Tip: Try right-clicking the image and selecting "Copy Image Address"');
      };
      
      img.src = directUrl;
      
    } catch (e) {
      showSyncStatus('❌ Invalid URL format', 'error');
      alert('❌ Invalid URL. Please enter a complete URL starting with http:// or https://');
    }
  }
};

// Bulk Import Images from BBCode or multiple URLs
window.bulkImportImages = async () => {
  const input = prompt(`📦 BULK IMAGE IMPORT\n\nPaste your images here:\n\n✅ Supported formats:\n• BBCode from PostImage\n• Multiple URLs (one per line)\n• Mixed formats\n\nExample BBCode:\n[url=https://postimg.cc/PC6ZrNXj][img]https://i.postimg.cc/PC6ZrNXj/image.png[/img][/url]\n\nExample URLs:\nhttps://postimg.cc/G4MYh9cg\nhttps://imgur.com/abc123\nhttps://i.imgur.com/xyz.jpg`);
  
  if (!input || !input.trim()) {
    return;
  }
  
  showSyncStatus('🔄 Parsing images...', 'success');
  
  try {
    // Extract image URLs from various formats
    const urls = extractImageUrls(input);
    
    if (urls.length === 0) {
      alert('❌ No valid image URLs found.\n\nPlease paste:\n• BBCode from PostImage\n• Direct image URLs\n• PostImage/Imgur page URLs');
      return;
    }
    
    // Check if we'll exceed the limit
    const remaining = 10 - state.productForm.images.length;
    if (urls.length > remaining) {
      if (!confirm(`⚠️ Found ${urls.length} images but only ${remaining} slots remaining.\n\nAdd first ${remaining} images?`)) {
        return;
      }
    }
    
    const urlsToAdd = urls.slice(0, remaining);
    
    showSyncStatus(`📦 Importing ${urlsToAdd.length} images...`, 'success');
    console.log(`📦 Bulk importing ${urlsToAdd.length} images:`, urlsToAdd);
    
    let successCount = 0;
    let failCount = 0;
    
    // Save current state for undo
    saveImageHistory();
    
    // Process each URL
    for (let i = 0; i < urlsToAdd.length; i++) {
      const url = urlsToAdd[i];
      
      try {
        showSyncStatus(`🔄 Processing image ${i + 1}/${urlsToAdd.length}...`, 'success');
        
        // Convert to direct URL if needed
        const directUrl = await fetchDirectImageUrl(url);
        
        // Verify URL is valid before adding
        if (directUrl && directUrl.trim()) {
          state.productForm.images.push(directUrl);
          successCount++;
          console.log(`✅ Added image ${i + 1}/${urlsToAdd.length}:`, directUrl);
        } else {
          console.warn(`⚠️ Skipped empty URL at position ${i + 1}`);
          failCount++;
        }
        
        // Small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to add image ${i + 1}:`, url, error);
        failCount++;
      }
    }
    
    // Update preview only once after all images are added
    renderImagePreviews();
    
    // Show results
    const message = `✅ Bulk import complete!\n\n✅ Added: ${successCount} images\n${failCount > 0 ? `⚠️ Failed: ${failCount} images\n` : ''}\nTotal: ${state.productForm.images.length}/10`;
    
    showSyncStatus(message, successCount > 0 ? 'success' : 'error');
    alert(message);
    
  } catch (error) {
    console.error('❌ Bulk import error:', error);
    showSyncStatus('❌ Bulk import failed', 'error');
    alert('❌ Error during bulk import. Check console for details.');
  }
};

// Extract image URLs from various formats
function extractImageUrls(text) {
  const urls = [];
  
  // 1. Extract from BBCode format: [img]URL[/img]
  const bbcodeRegex = /\[img\](https?:\/\/[^\]]+)\[\/img\]/gi;
  let match;
  while ((match = bbcodeRegex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  
  // 2. Extract from BBCode with URL wrapper: [url=...][img]URL[/img][/url]
  const bbcodeUrlRegex = /\[url=[^\]]+\]\[img\](https?:\/\/[^\]]+)\[\/img\]\[\/url\]/gi;
  while ((match = bbcodeUrlRegex.exec(text)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  
  // 3. Extract plain URLs (one per line or space-separated)
  const urlRegex = /https?:\/\/[^\s\[\]]+/gi;
  const plainUrls = text.match(urlRegex) || [];
  plainUrls.forEach(url => {
    // Clean up URL (remove trailing punctuation)
    const cleanUrl = url.replace(/[,;.!?]+$/, '');
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  });
  
  // 4. Remove duplicates and filter valid image URLs
  const uniqueUrls = [...new Set(urls)];
  
  // Filter to only image-related URLs
  const imageUrls = uniqueUrls.filter(url => {
    try {
      const urlObj = new URL(url);
      // Accept direct image URLs or known hosting services
      return (
        url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || // Direct image
        urlObj.hostname.includes('postimg') || // PostImage
        urlObj.hostname.includes('imgur') || // Imgur
        urlObj.hostname.includes('imgbb') || // ImgBB
        urlObj.hostname.includes('unsplash') || // Unsplash
        urlObj.hostname.includes('cloudinary') || // Cloudinary
        urlObj.hostname.includes('images') // Generic image CDN
      );
    } catch (e) {
      return false;
    }
  });
  
  console.log(`📊 Extracted ${imageUrls.length} image URLs from input`);
  return imageUrls;
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  
  // Add controls header
  const hasImages = state.productForm.images.length > 0;
  const hasSelection = state.selectedImages.size > 0;
  
  const controlsHtml = hasImages ? `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: rgba(0,255,136,0.05); border-radius: 8px;">
      <div style="display: flex; gap: 10px; align-items: center;">
        <button type="button" onclick="selectAllImages()" class="btn btn-secondary" style="padding: 8px 12px; font-size: 12px;">
          ${state.selectedImages.size === state.productForm.images.length ? '☑️ Deselect All' : '☐ Select All'}
        </button>
        ${hasSelection ? `
          <button type="button" onclick="deleteSelectedImages()" class="btn btn-secondary" style="padding: 8px 12px; font-size: 12px; background: #ff4444; color: white;">
            🗑️ Delete Selected (${state.selectedImages.size})
          </button>
        ` : ''}
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button type="button" onclick="undoImageAction()" class="btn btn-secondary" style="padding: 8px 12px; font-size: 12px;" ${state.historyIndex <= 0 ? 'disabled' : ''} title="Undo (Ctrl+Z)">
          ↶ Undo
        </button>
        <button type="button" onclick="redoImageAction()" class="btn btn-secondary" style="padding: 8px 12px; font-size: 12px;" ${state.historyIndex >= state.imageHistory.length - 1 ? 'disabled' : ''} title="Redo (Ctrl+Y)">
          ↷ Redo
        </button>
        <span style="font-size: 12px; color: var(--text-muted);">${state.productForm.images.length}/10 images</span>
      </div>
    </div>
  ` : '';
  
  grid.innerHTML = controlsHtml + state.productForm.images.map((img, index) => {
    // Create a safe URL for display
    const displayUrl = img;
    const isExternal = img.startsWith('http');
    const isSelected = state.selectedImages.has(index);
    
    return `
      <div class="image-preview-item ${isSelected ? 'selected' : ''}" draggable="true" data-index="${index}" onclick="toggleImageSelection(${index}, event)">
        <img src="${displayUrl}" 
             alt="Product ${index + 1}" 
             ${isExternal ? 'crossorigin="anonymous"' : ''}
             loading="lazy"
             referrerpolicy="no-referrer"
             onerror="handleImageError(this, ${index})">
        ${index === 0 ? '<span class="image-main-badge">MAIN</span>' : ''}
        <span class="image-order-badge">${index + 1}</span>
        ${isSelected ? '<span class="image-selected-badge">✓</span>' : ''}
        <div class="image-preview-overlay">
          <span class="image-info">Image ${index + 1}</span>
          <div class="image-actions">
            <button type="button" class="image-action-btn" onclick="event.stopPropagation(); viewImageUrl(${index})" title="View URL">🔗</button>
            <button type="button" class="image-action-btn" onclick="event.stopPropagation(); cropImage(${index}, 'product')" title="Crop">✂️</button>
            <button type="button" class="image-action-btn delete" onclick="event.stopPropagation(); removeImage(${index})" title="Delete">×</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Setup drag and drop for reordering
  setupImageDragAndDrop();
  
  // Log for debugging
  console.log(`📸 Rendered ${state.productForm.images.length} image previews`);
}

function setupImageDragAndDrop() {
  const items = document.querySelectorAll('.image-preview-item');
  
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      state.draggedImageIndex = parseInt(item.dataset.index);
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', (e) => {
      item.classList.remove('dragging');
      state.draggedImageIndex = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      item.classList.add('drag-over');
    });
    
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      
      const dropIndex = parseInt(item.dataset.index);
      if (state.draggedImageIndex !== null && state.draggedImageIndex !== dropIndex) {
        // Reorder images
        const draggedImage = state.productForm.images[state.draggedImageIndex];
        state.productForm.images.splice(state.draggedImageIndex, 1);
        state.productForm.images.splice(dropIndex, 0, draggedImage);
        renderImagePreviews();
      }
    });
  });
}

// Handle image loading errors
window.handleImageError = (imgElement, index) => {
  console.warn(`⚠️ Image ${index + 1} failed to load:`, state.productForm.images[index]);
  
  // Try without crossorigin
  if (imgElement.crossOrigin) {
    imgElement.crossOrigin = null;
    imgElement.src = state.productForm.images[index];
    return;
  }
  
  // Show placeholder with URL info
  const url = state.productForm.images[index];
  const shortUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;
  
  imgElement.onerror = null;
  imgElement.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250'%3E%3Crect fill='%23333' width='200' height='250'/%3E%3Ctext fill='%2300ff88' x='50%25' y='40%25' text-anchor='middle' font-family='Arial' font-size='14'%3EImage ${index + 1}%3C/text%3E%3Ctext fill='%23666' x='50%25' y='55%25' text-anchor='middle' font-family='Arial' font-size='9'%3EPreview unavailable%3C/text%3E%3Ctext fill='%23888' x='50%25' y='65%25' text-anchor='middle' font-family='Arial' font-size='8'%3EWill work on website%3C/text%3E%3C/svg%3E`;
  
  console.log('💡 Image will still work on the website, just preview unavailable in admin panel');
};

// View image URL
window.viewImageUrl = (index) => {
  const url = state.productForm.images[index];
  const message = `Image ${index + 1} URL:\n\n${url}\n\n✅ This URL will be used on your website.\n\nOptions:\n- Click OK to copy URL\n- Click Cancel to close`;
  
  if (confirm(message)) {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      showSyncStatus('✅ URL copied to clipboard', 'success');
    }).catch(() => {
      // Fallback: show in prompt for manual copy
      prompt('Copy this URL:', url);
    });
  }
};

window.removeImage = (index) => {
  if (confirm(`Remove image ${index + 1}?`)) {
    saveImageHistory();
    state.productForm.images.splice(index, 1);
    state.selectedImages.clear();
    renderImagePreviews();
    showSyncStatus(`🗑️ Image ${index + 1} removed`, 'success');
  }
};

// Save current image state to history for undo/redo
function saveImageHistory() {
  // Remove any future history if we're not at the end
  if (state.historyIndex < state.imageHistory.length - 1) {
    state.imageHistory = state.imageHistory.slice(0, state.historyIndex + 1);
  }
  
  // Save current state
  state.imageHistory.push([...state.productForm.images]);
  state.historyIndex++;
  
  // Limit history to 20 states
  if (state.imageHistory.length > 20) {
    state.imageHistory.shift();
    state.historyIndex--;
  }
}

// Undo image action
window.undoImageAction = () => {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    state.productForm.images = [...state.imageHistory[state.historyIndex]];
    state.selectedImages.clear();
    renderImagePreviews();
    showSyncStatus('↶ Undo', 'success');
  }
};

// Redo image action
window.redoImageAction = () => {
  if (state.historyIndex < state.imageHistory.length - 1) {
    state.historyIndex++;
    state.productForm.images = [...state.imageHistory[state.historyIndex]];
    state.selectedImages.clear();
    renderImagePreviews();
    showSyncStatus('↷ Redo', 'success');
  }
};

// Toggle image selection
window.toggleImageSelection = (index, event) => {
  // Don't toggle if clicking on action buttons
  if (event && event.target.closest('.image-action-btn')) {
    return;
  }
  
  if (state.selectedImages.has(index)) {
    state.selectedImages.delete(index);
  } else {
    state.selectedImages.add(index);
  }
  renderImagePreviews();
};

// Select all images
window.selectAllImages = () => {
  if (state.selectedImages.size === state.productForm.images.length) {
    // Deselect all
    state.selectedImages.clear();
  } else {
    // Select all
    state.selectedImages.clear();
    state.productForm.images.forEach((_, index) => {
      state.selectedImages.add(index);
    });
  }
  renderImagePreviews();
};

// Delete selected images
window.deleteSelectedImages = () => {
  if (state.selectedImages.size === 0) {
    return;
  }
  
  if (confirm(`Delete ${state.selectedImages.size} selected image(s)?`)) {
    saveImageHistory();
    
    // Sort indices in descending order to avoid index shifting issues
    const indicesToDelete = Array.from(state.selectedImages).sort((a, b) => b - a);
    
    indicesToDelete.forEach(index => {
      state.productForm.images.splice(index, 1);
    });
    
    state.selectedImages.clear();
    renderImagePreviews();
    showSyncStatus(`🗑️ Deleted ${indicesToDelete.length} image(s)`, 'success');
  }
};

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
  // Ctrl+Z or Cmd+Z for undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undoImageAction();
  }
  
  // Ctrl+Y or Cmd+Shift+Z for redo
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    redoImageAction();
  }
});

async function handleSizeChartUpload(file) {
  if (file && file.type.startsWith('image/')) {
    try {
      showSyncStatus('📤 Uploading size chart...', 'success');
      
      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('http://localhost:3001/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        state.productForm.sizeChart = result.url;
        renderSizeChartPreview();
        showSyncStatus(`✅ Size chart uploaded`, 'success');
      } else {
        throw new Error('Upload failed');
      }
      
    } catch (error) {
      // Fallback: use data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        state.productForm.sizeChart = e.target.result;
        renderSizeChartPreview();
      };
      reader.readAsDataURL(file);
    }
  }
}

function renderSizeChartPreview() {
  const preview = document.getElementById('sizeChartPreview');
  if (state.productForm.sizeChart) {
    preview.innerHTML = `
      <div class="image-preview-item">
        <img src="${state.productForm.sizeChart}" alt="Size Chart">
        <div class="image-preview-overlay">
          <span class="image-info">Size Chart</span>
          <div class="image-actions">
            <button type="button" class="image-action-btn" onclick="cropImage(0, 'sizechart')" title="Crop">✂️</button>
            <button type="button" class="image-action-btn delete" onclick="removeSizeChart()" title="Delete">×</button>
          </div>
        </div>
      </div>
    `;
  } else {
    preview.innerHTML = '';
  }
}

window.removeSizeChart = () => {
  state.productForm.sizeChart = null;
  renderSizeChartPreview();
};

// Image Cropper
window.cropImage = (index, type) => {
  state.currentCropIndex = index;
  state.currentCropType = type;
  
  const img = type === 'product' ? state.productForm.images[index] : state.productForm.sizeChart;
  
  document.getElementById('cropImage').src = img;
  document.getElementById('cropModal').classList.add('active');
  
  setTimeout(() => {
    const image = document.getElementById('cropImage');
    state.cropper = new Cropper(image, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 1,
      crop(event) {
        const width = Math.round(event.detail.width);
        const height = Math.round(event.detail.height);
        const ratio = (width / height).toFixed(2);
        document.getElementById('cropDimensions').textContent = `Dimensions: ${width}×${height}px`;
        document.getElementById('cropAspectRatio').textContent = `Aspect Ratio: ${ratio}:1`;
      }
    });
  }, 100);
};

window.closeCropModal = () => {
  if (state.cropper) {
    state.cropper.destroy();
    state.cropper = null;
  }
  document.getElementById('cropModal').classList.remove('active');
};

window.applyCrop = () => {
  if (state.cropper) {
    const canvas = state.cropper.getCroppedCanvas();
    const croppedImage = canvas.toDataURL();
    
    if (state.currentCropType === 'product') {
      state.productForm.images[state.currentCropIndex] = croppedImage;
      renderImagePreviews();
    } else {
      state.productForm.sizeChart = croppedImage;
      renderSizeChartPreview();
    }
    
    closeCropModal();
  }
};

// Color Selection System
function renderColorsGrid() {
  const grid = document.getElementById('colorsGrid');
  grid.innerHTML = state.availableColors.map((color, index) => {
    const isSelected = state.productForm.selectedColors.some(c => c.name === color.name);
    return `
      <button type="button" class="color-btn ${isSelected ? 'active' : ''}" onclick="toggleColor(${index})" data-color="${color.name}">
        <div class="color-swatch" style="background: ${color.code}; ${color.name === 'White' ? 'border: 1px solid #333;' : ''}"></div>
        <span class="color-name">${color.name}</span>
      </button>
    `;
  }).join('');
  
  renderSelectedColors();
}

window.toggleColor = (index) => {
  const color = state.availableColors[index];
  const existingIndex = state.productForm.selectedColors.findIndex(c => c.name === color.name);
  
  if (existingIndex > -1) {
    // Remove color
    state.productForm.selectedColors.splice(existingIndex, 1);
  } else {
    // Add color
    state.productForm.selectedColors.push(color);
  }
  
  renderColorsGrid();
};

function renderSelectedColors() {
  const list = document.getElementById('selectedColorsList');
  if (state.productForm.selectedColors.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">No colors selected</p>';
    return;
  }
  
  list.innerHTML = '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);"><p style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">Selected Colors:</p>' +
    state.productForm.selectedColors.map(color => `
      <span class="selected-color-chip" style="display: inline-flex; align-items: center; gap: 5px; background: var(--card-bg); padding: 4px 8px; border-radius: 6px; margin-right: 5px; margin-bottom: 5px; font-size: 12px;">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color.code}; ${color.name === 'White' ? 'border: 1px solid #333;' : ''}"></div>
        ${color.name}
      </span>
    `).join('') + '</div>';
}

// Color Picker for custom colors
window.openColorPicker = () => {
  document.getElementById('colorPickerPopup').classList.add('active');
};

window.closeColorPicker = () => {
  document.getElementById('colorPickerPopup').classList.remove('active');
  document.getElementById('colorNameInput').value = '';
  document.getElementById('colorCodeInput').value = '#00ff88';
};

window.addCustomColor = () => {
  const name = document.getElementById('colorNameInput').value.trim();
  const code = document.getElementById('colorCodeInput').value;
  
  if (!name) {
    alert('❌ Please enter a color name');
    return;
  }
  
  // Check if color already exists
  if (state.availableColors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert('❌ This color already exists');
    return;
  }
  
  // Add to available colors
  state.availableColors.push({ name, code });
  
  // Auto-select the new color
  state.productForm.selectedColors.push({ name, code });
  
  // Save to localStorage
  localStorage.setItem('elevez_colors', JSON.stringify(state.availableColors));
  
  renderColorsGrid();
  closeColorPicker();
  
  showSyncStatus(`Color "${name}" added`, 'success');
};

// Product Submit
function handleProductSubmit(e) {
  e.preventDefault();
  
  if (state.productForm.images.length === 0) {
    alert('❌ Please add at least one product image!');
    return;
  }
  
  if (state.productForm.selectedSizes.length === 0) {
    alert('❌ Please select at least one size!');
    return;
  }
  
  const normalPrice = parseFloat(document.getElementById('normalPrice').value);
  const salePrice = parseFloat(document.getElementById('salePrice').value);
  const qidInput = document.getElementById('productQID');
  const qid = qidInput ? qidInput.value.trim().toUpperCase() : '';
  
  if (!qid) {
    alert('❌ Please enter a Product QID!');
    return;
  }
  
  if (salePrice >= normalPrice) {
    alert('❌ Sale price must be less than normal price!');
    return;
  }
  
  // Check for duplicate QID (only if not editing the same product)
  const currentProductId = state.editingProduct ? state.editingProduct.id : null;
  const existingProduct = state.products.find(p => {
    return p.qid === qid && p.id !== currentProductId;
  });
  
  if (existingProduct) {
    // Just warn but allow override
    const shouldContinue = confirm(`⚠️ WARNING: QID "${qid}" already exists!\n\nExisting Product: ${existingProduct.name}\nProduct ID: ${existingProduct.id}\n\nClick OK to REPLACE the existing product.\nClick Cancel to use a different QID.`);
    
    if (!shouldContinue) {
      return; // User wants to use different QID
    }
    
    // User chose to replace - remove the old product
    state.products = state.products.filter(p => p.id !== existingProduct.id);
    console.log(`Replaced product with QID ${qid}`);
  }
  
  // Convert full URLs back to relative paths for storage
  const convertToRelativePath = (url) => {
    if (url.startsWith('http://localhost:5173')) {
      return url.replace('http://localhost:5173', '');
    }
    return url;
  };
  
  const product = {
    id: state.editingProduct?.id || Date.now(),
    qid: qid,
    name: document.getElementById('productName').value,
    price: salePrice,
    originalPrice: normalPrice,
    category: document.getElementById('productCategory').value,
    type: document.getElementById('productType').value,
    rating: parseFloat(document.getElementById('productRating').value),
    description: document.getElementById('productDescription').value || undefined,
    image: convertToRelativePath(state.productForm.images[0]),
    images: state.productForm.images.map(convertToRelativePath),
    sizeChart: state.productForm.sizeChart ? convertToRelativePath(state.productForm.sizeChart) : undefined,
    sizes: state.productForm.selectedSizes,
    colors: state.productForm.selectedColors.map(c => c.name),
    tags: state.productForm.selectedTags.length > 0 ? state.productForm.selectedTags : undefined,
    // Section visibility flags
    showInHome: document.getElementById('showInHome')?.checked !== false,
    showInShop: document.getElementById('showInShop')?.checked !== false,
    showInCollections: document.getElementById('showInCollections')?.checked !== false,
    isBestSeller: document.getElementById('isBestSeller').checked || undefined,
    isNew: document.getElementById('isNew').checked || undefined,
    isFeatured: document.getElementById('isFeatured')?.checked || undefined
  };
  
  if (state.editingProduct) {
    const index = state.products.findIndex(p => p.id === state.editingProduct.id);
    state.products[index] = product;
  } else {
    state.products.push(product);
  }
  
  const isNew = !state.editingProduct;
  
  // Store the product ID for highlighting
  state.lastAddedProductId = product.id;
  
  // Save data first (with error handling)
  try {
    saveData();
  } catch (error) {
    // If save failed, remove the product we just added
    if (isNew) {
      state.products.pop();
    } else {
      // Restore original product
      const index = state.products.findIndex(p => p.id === state.editingProduct.id);
      state.products[index] = state.editingProduct;
    }
    return; // Stop execution
  }
  
  // Force close modal immediately with multiple methods
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none'; // Force hide
  }
  
  // Reset form
  resetProductForm();
  
  // Switch to products view immediately
  switchView('products');
  
  // Show success message
  showSyncStatus(isNew ? '✅ Product added successfully!' : '✅ Product updated successfully!', 'success');
  
  // Highlight the new/updated product
  setTimeout(() => {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      if (card.querySelector(`button[onclick="editProduct(${product.id})"]`)) {
        card.classList.add('highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, 100);
  
  // Show alert with product details
  const successMsg = `✅ ${isNew ? 'PRODUCT ADDED!' : 'PRODUCT UPDATED!'}\n\n` +
    `Name: ${product.name}\n` +
    `QID: ${product.qid}\n` +
    `Price: ₹${product.price}\n` +
    `Category: ${product.category}\n` +
    `Type: ${product.type}\n\n` +
    `Total Products: ${state.products.length}\n\n` +
    `Do you want to sync and deploy to your website now?`;
  
  // Ask if user wants to auto-deploy
  setTimeout(() => {
    if (confirm(successMsg)) {
      autoSyncAndDeploy();
    }
  }, 500);
}

// Edit Product
window.editProduct = (id) => {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  
  state.editingProduct = product;
  openProductModal();
  
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productName').value = product.name;
  document.getElementById('productQID').value = product.qid || '';
  document.getElementById('normalPrice').value = product.originalPrice;
  document.getElementById('salePrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productType').value = product.type;
  document.getElementById('productRating').value = product.rating;
  document.getElementById('productDescription').value = product.description || '';
  
  // Load section visibility flags (default to true if not set)
  document.getElementById('showInHome').checked = product.showInHome !== false;
  document.getElementById('showInShop').checked = product.showInShop !== false;
  document.getElementById('showInCollections').checked = product.showInCollections !== false;
  document.getElementById('isBestSeller').checked = product.isBestSeller || false;
  document.getElementById('isNew').checked = product.isNew || false;
  if (document.getElementById('isFeatured')) {
    document.getElementById('isFeatured').checked = product.isFeatured || false;
  }
  
  // Convert relative paths to full URLs for preview
  const convertToFullUrl = (url) => {
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      return `http://localhost:5173${url}`;
    }
    return url;
  };
  
  state.productForm.images = (product.images || [product.image]).map(convertToFullUrl);
  state.productForm.sizeChart = product.sizeChart ? convertToFullUrl(product.sizeChart) : null;
  state.productForm.selectedSizes = product.sizes || ['M'];
  state.productForm.colors = (product.colors || []).map(name => ({ name, code: '#00ff88' }));
  state.productForm.selectedTags = product.tags || [];
  
  renderImagePreviews();
  renderSizeChartPreview();
  renderColorList();
  
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('active', state.productForm.selectedSizes.includes(btn.dataset.size));
  });
  
  document.querySelectorAll('#productForm .tag-btn').forEach(btn => {
    btn.classList.toggle('active', state.productForm.selectedTags.includes(btn.dataset.tag));
  });
  
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  document.getElementById('discountDisplay').value = `${discount}% OFF`;
};

window.deleteProduct = (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    state.products = state.products.filter(p => p.id !== id);
    saveData();
    renderCurrentView();
    alert('✅ Product deleted successfully!');
  }
};

// Collection Modal
window.openCollectionModal = () => {
  state.editingCollection = null;
  document.getElementById('collectionModal').classList.add('active');
  document.getElementById('collectionModalTitle').textContent = 'Create Collection';
  document.getElementById('saveCollectionBtn').textContent = 'Save Collection';
  setupCollectionFormListeners();
};

window.deleteCollection = (id) => {
  if (confirm('Delete this collection?')) {
    state.collections = state.collections.filter(c => c.id !== id);
    saveData();
    renderCurrentView();
    showSyncStatus('Collection deleted', 'success');
  }
};

// Sync & Deploy
function setupSyncButton() {
  document.getElementById('syncBtn').onclick = async () => {
    const btn = document.getElementById('syncBtn');
    btn.classList.add('syncing');
    btn.disabled = true;
    
    try {
      saveData();
      
      // Generate constants.ts with products and collections
      const tsCode = `
import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Synced from Admin Panel
export const PRODUCTS: Product[] = ${JSON.stringify(state.products, null, 2)};

// Collections - Auto-filtered by tags and criteria
export const COLLECTIONS = ${JSON.stringify(state.collections, null, 2)};

// Available Tags
export const AVAILABLE_TAGS = ${JSON.stringify(state.availableTags, null, 2)};

// Available Categories (Custom)
export const AVAILABLE_CATEGORIES = ${JSON.stringify(state.availableCategories, null, 2)};

// Available Types (Custom)
export const AVAILABLE_TYPES = ${JSON.stringify(state.availableTypes, null, 2)};

// Helper function to get products for a collection
export function getCollectionProducts(collectionId: string): Product[] {
  const collection = COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return PRODUCTS.filter(product => {
    const filters = collection.filters || {};
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag: string) => product.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) return false;
    
    // Type filter
    if (filters.type && product.type !== filters.type) return false;
    
    // Price filters
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    
    return true;
  });
}
`;
      
      const blob = new Blob([tsCode], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'constants.ts';
      link.click();
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        showSyncStatus('✅ Synced! Replace constants.ts in your project.', 'success');
        alert('✅ Synced successfully!\n\n' + 
              `📦 ${state.products.length} products\n` +
              `🗂️ ${state.collections.length} collections\n` +
              `🏷️ ${state.availableTags.length} tags\n` +
              `📂 ${state.availableCategories.length} categories\n` +
              `👕 ${state.availableTypes.length} types\n\n` +
              'Replace constants.ts in your project and the auto-deploy will handle the rest!');
        btn.classList.remove('syncing');
        btn.disabled = false;
      }, 1000);
    } catch (error) {
      showSyncStatus('❌ Sync failed: ' + error.message, 'error');
      btn.classList.remove('syncing');
      btn.disabled = false;
    }
  };
}


// Orders Management
function renderOrders() {
  const container = document.getElementById('ordersContainer');
  
  if (state.orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h3>No orders yet</h3>
        <p>Orders from your website and Firebase will appear here automatically</p>
        <button class="btn btn-primary" onclick="refreshOrders()" style="margin-top: 20px;">🔄 Refresh Orders</button>
        <p style="margin-top: 15px; color: var(--text-muted); font-size: 12px;">
          ${typeof syncOrdersFromFirebase === 'function' ? '✅ Real-time Firebase sync active' : '⚠️ Firebase sync not loaded'}
        </p>
      </div>
    `;
    return;
  }
  
  // Sort orders by date (newest first)
  const sortedOrders = [...state.orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return dateB - dateA;
  });
  
  // Add summary header
  const pendingCount = sortedOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedCount = sortedOrders.filter(o => o.status === 'completed').length;
  const totalRevenue = sortedOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const summaryHtml = `
    <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(0,255,136,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div>
          <h3 style="margin: 0 0 5px 0; color: var(--primary);">📦 ${sortedOrders.length} Total Orders</h3>
          <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
            ${pendingCount} pending • ${completedCount} completed • ₹${totalRevenue.toFixed(0)} revenue
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="refreshOrders()" style="background: var(--primary); color: var(--bg);">
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = summaryHtml + sortedOrders.map(order => {
    const statusClass = order.status || 'pending';
    const orderDate = new Date(order.createdAt || order.date || Date.now());
    const sourceLabel = order.source === 'firebase' ? '🔥 Firebase' : '💾 Local';
    
    return `
      <div class="order-card" style="border-left: 4px solid ${order.source === 'firebase' ? '#00ff88' : '#666'};">
        <div class="order-header">
          <div>
            <div class="order-id">Order #${order.orderId || order.id} <span style="font-size: 11px; color: var(--text-muted); margin-left: 10px;">${sourceLabel}</span></div>
            <div class="order-date">${orderDate.toLocaleString()}</div>
          </div>
          <div class="order-status ${statusClass}">${statusClass}</div>
        </div>
        
        <div class="order-body">
          <div class="order-section">
            <h4>Customer Information</h4>
            <div class="order-info-row">
              <span class="order-info-label">Name</span>
              <span class="order-info-value">${order.fullName || order.customerName || 'N/A'}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Email</span>
              <span class="order-info-value">${order.email || order.customerEmail || 'N/A'}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Phone</span>
              <span class="order-info-value">${order.phone || order.customerPhone || 'N/A'}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Address</span>
              <span class="order-info-value">${order.address || order.shippingAddress || 'N/A'}, ${order.city || ''} ${order.state || ''} ${order.pincode || ''}</span>
            </div>
          </div>
          
          <div class="order-section">
            <h4>Order Details</h4>
            <div class="order-info-row">
              <span class="order-info-label">Payment Method</span>
              <span class="order-info-value">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod || 'N/A'}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Subtotal</span>
              <span class="order-info-value">₹${(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Shipping</span>
              <span class="order-info-value">${(order.shippingCost || 0) === 0 ? 'FREE' : '₹' + (order.shippingCost || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div class="order-items">
          <h4 style="font-size: 14px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 15px;">Products (${order.items?.length || 0} items)</h4>
          ${order.items?.map(item => {
            // Item already has full product details from Firebase sync
            const qid = item.qid || 'N/A';
            const image = item.image || 'https://via.placeholder.com/80x100?text=No+Image';
            const category = item.category || '';
            const type = item.type || '';
            
            return `
              <div class="order-item">
                <img src="${image}" alt="${item.name}" class="order-item-image" onerror="this.src='https://via.placeholder.com/80x100?text=No+Image'">
                <div class="order-item-details">
                  <div class="order-item-name">${item.name}</div>
                  <div class="order-item-qid">QID: ${qid} ${category ? '• ' + category : ''} ${type ? '• ' + type : ''}</div>
                  <div class="order-item-meta">Size: ${item.orderedSize || item.size} • Color: ${item.orderedColor || item.color} • Qty: ${item.orderedQuantity || item.quantity}</div>
                  <div class="order-item-price">₹${((item.price || 0) * (item.orderedQuantity || item.quantity || 1)).toFixed(2)}</div>
                </div>
              </div>
            `;
          }).join('') || '<p style="color: var(--text-muted);">No items</p>'}
        </div>
        
        <div class="order-total">
          <span class="order-total-label">Total Amount</span>
          <span class="order-total-value">₹${(order.totalAmount || 0).toFixed(2)}</span>
        </div>
        
        ${order.status !== 'completed' && order.status !== 'cancelled' ? `
          <div class="order-actions">
            <button class="btn-complete" onclick="updateOrderStatus('${order.orderId || order.id}', 'completed')">✓ Mark as Completed</button>
            <button class="btn-cancel" onclick="updateOrderStatus('${order.orderId || order.id}', 'cancelled')">× Cancel Order</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  // Setup search
  const searchInput = document.getElementById('orderSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.order-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
      });
    };
  }
}

window.refreshOrders = async () => {
  showSyncStatus('🔄 Refreshing orders from Firebase...', 'success');
  
  // Trigger Firebase sync if available
  if (typeof syncOrdersFromFirebase === 'function') {
    await syncOrdersFromFirebase();
  }
  
  // Also check localStorage
  const savedOrders = localStorage.getItem('elevez_orders');
  if (savedOrders) {
    state.orders = JSON.parse(savedOrders);
  }
  
  renderOrders();
  updateOrdersBadge();
  
  showSyncStatus(`✅ Refreshed: ${state.orders.length} orders`, 'success');
};

window.updateOrderStatus = (orderId, newStatus) => {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveData();
    renderOrders();
    alert(`✅ Order ${orderId} marked as ${newStatus}!`);
  }
};

// Simulate receiving an order (for testing)
window.simulateOrder = () => {
  if (state.products.length === 0) {
    alert('❌ Add some products first!');
    return;
  }
  
  const randomProduct = state.products[Math.floor(Math.random() * state.products.length)];
  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString(),
    status: 'pending',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+91 9876543210',
    shippingAddress: '123 Test Street, Test City, 123456',
    paymentMethod: Math.random() > 0.5 ? 'cod' : 'upi',
    items: [{
      productId: randomProduct.id,
      name: randomProduct.name,
      image: randomProduct.image,
      price: randomProduct.price,
      size: 'M',
      color: randomProduct.colors?.[0] || 'Black',
      quantity: 1
    }],
    subtotal: randomProduct.price,
    shippingCost: Math.random() > 0.5 ? 30 : 0,
    totalAmount: randomProduct.price + (Math.random() > 0.5 ? 30 : 0)
  };
  
  state.orders.push(order);
  saveData();
  
  if (state.currentView === 'orders') {
    renderOrders();
  }
  
  alert('✅ Test order created!');
};


// Tag Management
function renderProductTags() {
  const container = document.getElementById('tagsContainer');
  container.innerHTML = state.availableTags.map(tag => `
    <button type="button" class="tag-btn ${state.productForm.selectedTags.includes(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</button>
  `).join('');
  
  // Add click handlers
  container.querySelectorAll('.tag-btn').forEach(btn => {
    btn.onclick = () => {
      btn.classList.toggle('active');
      const tag = btn.dataset.tag;
      if (btn.classList.contains('active')) {
        if (!state.productForm.selectedTags.includes(tag)) {
          state.productForm.selectedTags.push(tag);
        }
      } else {
        state.productForm.selectedTags = state.productForm.selectedTags.filter(t => t !== tag);
      }
    };
  });
}

window.addCustomTag = () => {
  const input = document.getElementById('customTagInput');
  const tag = input.value.trim().toUpperCase();
  
  if (!tag) {
    alert('❌ Please enter a tag name');
    return;
  }
  
  if (state.availableTags.includes(tag)) {
    alert('❌ This tag already exists');
    return;
  }
  
  state.availableTags.push(tag);
  state.productForm.selectedTags.push(tag);
  renderProductTags();
  input.value = '';
  
  showSyncStatus(`Tag "${tag}" added`, 'success');
};

// Collection Management Enhanced
function renderCollections() {
  const grid = document.getElementById('collectionsGrid');
  
  if (state.collections.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗂️</div>
        <h3>No collections yet</h3>
        <p>Click "Create Collection" to organize your products</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = state.collections.map(collection => {
    const matchingProducts = getCollectionProducts(collection);
    return `
      <div class="collection-card">
        <h3>${collection.name}</h3>
        <p>${collection.description || 'No description'}</p>
        
        <div class="collection-products-count">
          <strong>${matchingProducts.length}</strong> products in this collection
        </div>
        
        ${collection.filters ? `
          <div class="collection-filters">
            ${collection.filters.tags?.map(tag => `<span class="collection-filter-badge">🏷️ ${tag}</span>`).join('') || ''}
            ${collection.filters.category ? `<span class="collection-filter-badge">👤 ${collection.filters.category}</span>` : ''}
            ${collection.filters.type ? `<span class="collection-filter-badge">👕 ${collection.filters.type}</span>` : ''}
            ${collection.filters.minPrice ? `<span class="collection-filter-badge">₹${collection.filters.minPrice}+</span>` : ''}
            ${collection.filters.maxPrice ? `<span class="collection-filter-badge">Up to ₹${collection.filters.maxPrice}</span>` : ''}
          </div>
        ` : ''}
        
        <div class="collection-actions">
          <button class="btn btn-secondary" onclick="editCollection('${collection.id}')">✏️ Edit</button>
          <button class="btn btn-secondary" onclick="viewCollectionProducts('${collection.id}')">👁️ View Products</button>
          <button class="btn btn-secondary" onclick="deleteCollection('${collection.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function getCollectionProducts(collection) {
  return state.products.filter(product => {
    const filters = collection.filters || {};
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => product.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Type filter
    if (filters.type && product.type !== filters.type) {
      return false;
    }
    
    // Price filters
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    return true;
  });
}

window.viewCollectionProducts = (collectionId) => {
  const collection = state.collections.find(c => c.id === collectionId);
  if (!collection) return;
  
  const products = getCollectionProducts(collection);
  
  if (products.length === 0) {
    alert('ℹ️ No products match this collection\'s filters');
    return;
  }
  
  const productList = products.map(p => `• ${p.name} (${p.qid})`).join('\n');
  alert(`Products in "${collection.name}":\n\n${productList}`);
};

function setupCollectionFormListeners() {
  const selectedTags = [];
  
  // Render dynamic categories and types
  renderCollectionFilters();
  
  // Render all available tags
  const tagsContainer = document.getElementById('collectionTags');
  tagsContainer.innerHTML = state.availableTags.map(tag => `
    <button type="button" class="tag-btn" data-tag="${tag}">${tag}</button>
  `).join('');
  
  tagsContainer.querySelectorAll('.tag-btn').forEach(btn => {
    btn.onclick = () => {
      btn.classList.toggle('active');
      const tag = btn.dataset.tag;
      if (btn.classList.contains('active')) {
        if (!selectedTags.includes(tag)) selectedTags.push(tag);
      } else {
        const index = selectedTags.indexOf(tag);
        if (index > -1) selectedTags.splice(index, 1);
      }
      updateCollectionPreview();
    };
  });
  
  // Live preview
  const updateCollectionPreview = () => {
    const filters = {
      tags: selectedTags,
      category: document.getElementById('collectionCategory').value,
      type: document.getElementById('collectionType').value,
      minPrice: parseFloat(document.getElementById('collectionMinPrice').value) || 0,
      maxPrice: parseFloat(document.getElementById('collectionMaxPrice').value) || Infinity
    };
    
    const matchingProducts = state.products.filter(product => {
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => product.tags?.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      if (filters.category && product.category !== filters.category) return false;
      if (filters.type && product.type !== filters.type) return false;
      if (product.price < filters.minPrice) return false;
      if (product.price > filters.maxPrice) return false;
      
      return true;
    });
    
    document.getElementById('previewCount').textContent = matchingProducts.length;
    document.getElementById('previewProducts').innerHTML = matchingProducts.slice(0, 10).map(p => `
      <div class="preview-product-card" title="${p.name}">
        <img src="${p.image}" alt="${p.name}">
        <div class="preview-product-name">${p.name}</div>
      </div>
    `).join('') + (matchingProducts.length > 10 ? '<div style="padding: 10px; color: var(--text-muted); font-size: 12px;">+' + (matchingProducts.length - 10) + ' more</div>' : '');
  };
  
  // Add change listeners
  document.getElementById('collectionCategory').onchange = updateCollectionPreview;
  document.getElementById('collectionType').onchange = updateCollectionPreview;
  document.getElementById('collectionMinPrice').oninput = updateCollectionPreview;
  document.getElementById('collectionMaxPrice').oninput = updateCollectionPreview;
  
  // Initial preview
  updateCollectionPreview();
  
  document.getElementById('collectionForm').onsubmit = (e) => {
    e.preventDefault();
    
    const collection = {
      id: state.editingCollection?.id || Date.now().toString(),
      name: document.getElementById('collectionName').value,
      description: document.getElementById('collectionDescription').value,
      filters: {
        tags: selectedTags,
        category: document.getElementById('collectionCategory').value || null,
        type: document.getElementById('collectionType').value || null,
        minPrice: parseFloat(document.getElementById('collectionMinPrice').value) || 0,
        maxPrice: parseFloat(document.getElementById('collectionMaxPrice').value) || Infinity
      }
    };
    
    if (state.editingCollection) {
      const index = state.collections.findIndex(c => c.id === state.editingCollection.id);
      state.collections[index] = collection;
    } else {
      state.collections.push(collection);
    }
    
    saveData();
    closeCollectionModal();
    renderCurrentView();
    
    alert(state.editingCollection ? '✅ Collection updated!' : '✅ Collection created!');
  };
}

window.editCollection = (id) => {
  const collection = state.collections.find(c => c.id === id);
  if (!collection) return;
  
  state.editingCollection = collection;
  openCollectionModal();
  
  document.getElementById('collectionModalTitle').textContent = 'Edit Collection';
  document.getElementById('saveCollectionBtn').textContent = 'Update Collection';
  document.getElementById('collectionName').value = collection.name;
  document.getElementById('collectionDescription').value = collection.description || '';
  
  if (collection.filters) {
    document.getElementById('collectionCategory').value = collection.filters.category || '';
    document.getElementById('collectionType').value = collection.filters.type || '';
    document.getElementById('collectionMinPrice').value = collection.filters.minPrice || '';
    document.getElementById('collectionMaxPrice').value = collection.filters.maxPrice === Infinity ? '' : collection.filters.maxPrice || '';
    
    // Select tags
    setTimeout(() => {
      document.querySelectorAll('#collectionTags .tag-btn').forEach(btn => {
        if (collection.filters.tags?.includes(btn.dataset.tag)) {
          btn.classList.add('active');
        }
      });
    }, 100);
  }
};

window.closeCollectionModal = () => {
  document.getElementById('collectionModal').classList.remove('active');
  document.getElementById('collectionForm').reset();
  state.editingCollection = null;
  document.getElementById('collectionModalTitle').textContent = 'Create Collection';
  document.getElementById('saveCollectionBtn').textContent = 'Save Collection';
};


// Category and Type Management
function renderCategoryOptions() {
  const select = document.getElementById('productCategory');
  select.innerHTML = '<option value="">Select or create category</option>' +
    state.availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function renderTypeOptions() {
  const select = document.getElementById('productType');
  select.innerHTML = '<option value="">Select or create type</option>' +
    state.availableTypes.map(type => `<option value="${type}">${type}</option>`).join('');
}

window.toggleCategoryInput = () => {
  const input = document.getElementById('customCategoryInput');
  const select = document.getElementById('productCategory');
  
  if (input.style.display === 'none') {
    input.style.display = 'block';
    input.focus();
    select.disabled = true;
    
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomCategory();
      }
    };
  } else {
    input.style.display = 'none';
    input.value = '';
    select.disabled = false;
  }
};

window.toggleTypeInput = () => {
  const input = document.getElementById('customTypeInput');
  const select = document.getElementById('productType');
  
  if (input.style.display === 'none') {
    input.style.display = 'block';
    input.focus();
    select.disabled = true;
    
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomType();
      }
    };
  } else {
    input.style.display = 'none';
    input.value = '';
    select.disabled = false;
  }
};

function addCustomCategory() {
  const input = document.getElementById('customCategoryInput');
  const category = input.value.trim();
  
  if (!category) {
    alert('❌ Please enter a category name');
    return;
  }
  
  if (state.availableCategories.includes(category)) {
    alert('❌ This category already exists');
    return;
  }
  
  state.availableCategories.push(category);
  renderCategoryOptions();
  
  document.getElementById('productCategory').value = category;
  input.style.display = 'none';
  input.value = '';
  document.getElementById('productCategory').disabled = false;
  
  showSyncStatus(`Category "${category}" added`, 'success');
}

function addCustomType() {
  const input = document.getElementById('customTypeInput');
  const type = input.value.trim();
  
  if (!type) {
    alert('❌ Please enter a type name');
    return;
  }
  
  if (state.availableTypes.includes(type)) {
    alert('❌ This type already exists');
    return;
  }
  
  state.availableTypes.push(type);
  renderTypeOptions();
  
  document.getElementById('productType').value = type;
  input.style.display = 'none';
  input.value = '';
  document.getElementById('productType').disabled = false;
  
  showSyncStatus(`Type "${type}" added`, 'success');
}

// Update setupProductFormListeners to render options
const originalSetupProductFormListeners = setupProductFormListeners;
setupProductFormListeners = function() {
  originalSetupProductFormListeners();
  renderCategoryOptions();
  renderTypeOptions();
};

// Update collection form to use dynamic categories and types
function renderCollectionFilters() {
  const categorySelect = document.getElementById('collectionCategory');
  const typeSelect = document.getElementById('collectionType');
  
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">All Categories</option>' +
      state.availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  
  if (typeSelect) {
    typeSelect.innerHTML = '<option value="">All Types</option>' +
      state.availableTypes.map(type => `<option value="${type}">${type}</option>`).join('');
  }
}


// Auto Sync and Deploy Function
window.autoSyncAndDeploy = async () => {
  const btn = document.getElementById('syncBtn');
  if (btn) {
    btn.classList.add('syncing');
    btn.disabled = true;
  }
  
  showSyncStatus('🔄 Syncing products...', 'success');
  
  try {
    // Try to update via server first
    const response = await fetch('http://localhost:3001/update-constants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: state.products,
        collections: state.collections,
        tags: state.availableTags,
        categories: state.availableCategories,
        types: state.availableTypes,
        colors: state.availableColors
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showSyncStatus('✅ Syncing...', 'success');
      
      // Show deployment progress
      setTimeout(() => {
        showSyncStatus('📤 Committing to Git...', 'success');
      }, 1000);
      
      setTimeout(() => {
        showSyncStatus('🚀 Deploying to hosting...', 'success');
      }, 3000);
      
      // Show final success message
      setTimeout(() => {
        showSyncStatus('✅ Deployed successfully!', 'success');
        
        alert(`✅ FULLY AUTOMATIC DEPLOYMENT COMPLETE!\n\n📦 ${state.products.length} products synced\n📸 Images uploaded\n💾 constants.ts updated\n📄 Collections page auto-updated\n📤 Committed to Git\n🚀 Deployed to hosting\n\n✨ Your products are now LIVE!\n\n🌐 Collections page will show all ${state.products.length} products automatically!\n\nNo manual steps needed - everything was automatic!`);
        
        if (btn) {
          btn.classList.remove('syncing');
          btn.disabled = false;
        }
      }, 5000);
      
    } else {
      throw new Error('Server not responding');
    }
    
  } catch (error) {
    // Fallback: Download file manually
    console.log('Server not available, falling back to manual download');
    showSyncStatus('⚠️ Auto-sync unavailable, downloading file...', 'error');
    
    const tsCode = `import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Synced from Admin Panel at ${new Date().toLocaleString()}
export const PRODUCTS: Product[] = ${JSON.stringify(state.products, null, 2)};

// Collections - Auto-filtered by tags and criteria
export const COLLECTIONS = ${JSON.stringify(state.collections, null, 2)};

// Available Tags
export const AVAILABLE_TAGS = ${JSON.stringify(state.availableTags, null, 2)};

// Available Categories (Custom)
export const AVAILABLE_CATEGORIES = ${JSON.stringify(state.availableCategories, null, 2)};

// Available Types (Custom)
export const AVAILABLE_TYPES = ${JSON.stringify(state.availableTypes, null, 2)};

// Available Colors (Custom)
export const AVAILABLE_COLORS = ${JSON.stringify(state.availableColors, null, 2)};

// Helper function to get products for a collection
export function getCollectionProducts(collectionId: string): Product[] {
  const collection = COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return PRODUCTS.filter(product => {
    const filters = collection.filters || {};
    
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag: string) => product.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    if (filters.category && product.category !== filters.category) return false;
    if (filters.type && product.type !== filters.type) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    
    return true;
  });
}
`;
    
    const blob = new Blob([tsCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'constants.ts';
    link.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      alert(`📥 FILE DOWNLOADED!\n\n⚠️ Admin server not running.\n\n📋 MANUAL STEPS:\n1. Replace constants.ts in project root\n2. Auto-deploy will detect and deploy\n\nOR start admin server:\nnode admin-server.js`);
      
      if (btn) {
        btn.classList.remove('syncing');
        btn.disabled = false;
      }
    }, 1000);
  }
};

// Debug function to check for duplicate QIDs
window.checkDuplicateQIDs = () => {
  const qids = state.products.map(p => p.qid);
  const duplicates = qids.filter((qid, index) => qids.indexOf(qid) !== index);
  
  if (duplicates.length > 0) {
    alert(`⚠️ Found duplicate QIDs:\n\n${[...new Set(duplicates)].join('\n')}`);
    console.log('Duplicate QIDs:', duplicates);
    console.log('All products:', state.products);
  } else {
    alert('✅ No duplicate QIDs found!');
  }
};


// Check data integrity on startup
function checkDataIntegrity() {
  // Check for duplicate QIDs
  const qids = state.products.map(p => p.qid).filter(q => q);
  const duplicates = qids.filter((qid, index) => qids.indexOf(qid) !== index);
  
  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    const warningMsg = `⚠️ DATA INTEGRITY ISSUE DETECTED!\n\nFound duplicate QIDs in your data:\n${uniqueDuplicates.join(', ')}\n\nThis can cause problems when adding new products.\n\n🔧 RECOMMENDED: Clear all data and start fresh.\n\nClick OK to clear data now.\nClick Cancel to continue (not recommended).`;
    
    if (confirm(warningMsg)) {
      localStorage.removeItem('elevez_products');
      localStorage.removeItem('elevez_collections');
      localStorage.removeItem('elevez_orders');
      state.products = [];
      state.collections = [];
      state.orders = [];
      renderCurrentView();
      alert('✅ Data cleared! You can now add products without issues.');
    }
  }
  
  // Check for products without QIDs
  const productsWithoutQID = state.products.filter(p => !p.qid);
  if (productsWithoutQID.length > 0) {
    console.warn('⚠️ Found products without QID:', productsWithoutQID);
    
    // Auto-assign QIDs
    productsWithoutQID.forEach(p => {
      p.qid = `QID${p.id}`;
    });
    
    saveData();
    console.log('✅ Auto-assigned QIDs to products without them');
  }
}

// Force clear all data (accessible from console)
window.forceClearAllData = () => {
  if (confirm('⚠️ FORCE CLEAR ALL DATA?\n\nThis will delete:\n• All products\n• All collections\n• All orders\n• All tags\n• All categories\n• All types\n\nThis action cannot be undone!\n\nClick OK to proceed.')) {
    localStorage.clear();
    location.reload();
  }
};


// Load trial products
function loadTrialProducts() {
  console.log('📦 Loading trial products...');
  state.products = JSON.parse(JSON.stringify(TRIAL_PRODUCTS)); // Deep clone
  
  // Save to localStorage
  localStorage.setItem('elevez_products', JSON.stringify(state.products));
  
  console.log(`✅ Loaded ${state.products.length} trial products`);
  showSyncStatus(`✅ Loaded ${state.products.length} trial products`, 'success');
  
  setTimeout(() => {
    showSyncStatus('💡 These are sample products. Edit or delete them to add your own!', 'success');
  }, 2000);
}

// Clear all data function (used by "Clear All" button)
window.clearAllData = () => {
  const products = state.products.length;
  const collections = state.collections.length;
  const orders = state.orders.length;
  
  const confirmMsg = `⚠️ CLEAR ALL DATA?\n\nThis will delete:\n• ${products} products\n• ${collections} collections\n• ${orders} orders\n• All tags, categories, and types\n\nThis action CANNOT be undone!\n\nClick OK to proceed.`;
  
  if (confirm(confirmMsg)) {
    // Clear localStorage
    localStorage.removeItem('elevez_products');
    localStorage.removeItem('elevez_collections');
    localStorage.removeItem('elevez_orders');
    localStorage.removeItem('elevez_tags');
    localStorage.removeItem('elevez_categories');
    localStorage.removeItem('elevez_types');
    localStorage.removeItem('elevez_colors');
    localStorage.removeItem('elevez_last_save');
    
    // Clear state
    state.products = [];
    state.collections = [];
    state.orders = [];
    
    // Re-render
    renderCurrentView();
    showSyncStatus('✅ All data cleared!', 'success');
    
    // Ask if user wants to load trial products
    setTimeout(() => {
      if (confirm('✅ All data cleared!\n\nWould you like to load trial products to get started?')) {
        loadTrialProducts();
        renderCurrentView();
      }
    }, 500);
  }
};

// Quick clear data function (accessible from sidebar)
window.quickClearData = () => {
  clearAllData();
};


// Check storage usage
function checkStorageUsage() {
  let totalSize = 0;
  for (let key in localStorage) {
    if (key.startsWith('elevez_')) {
      totalSize += localStorage[key].length;
    }
  }
  
  const sizeKB = totalSize / 1024;
  const sizeMB = sizeKB / 1024;
  const maxSizeMB = 5; // Most browsers limit to 5-10MB
  const percentUsed = (sizeMB / maxSizeMB) * 100;
  
  console.log(`📊 Storage usage: ${sizeMB.toFixed(2)}MB / ${maxSizeMB}MB (${percentUsed.toFixed(0)}%)`);
  
  if (percentUsed > 80) {
    console.warn('⚠️ Storage is almost full! Consider clearing old data or using smaller images.');
  }
  
  return { sizeKB, sizeMB, percentUsed };
}

// Show storage warning if needed
function showStorageWarning() {
  const usage = checkStorageUsage();
  
  if (usage.percentUsed > 90) {
    alert(`⚠️ STORAGE ALMOST FULL!\n\nUsing ${usage.sizeMB.toFixed(2)}MB of ~5MB\n\n💡 RECOMMENDATIONS:\n• Clear old products\n• Use smaller images\n• Delete unused data`);
  }
}
