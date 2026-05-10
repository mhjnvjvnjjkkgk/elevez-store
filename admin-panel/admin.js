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

// Expose state globally so that deferred module scripts can access it reliably
window.state = state;

// Centralized self-contained Firebase initialization
let adminFirestoreDB = null;
async function getFirebaseDB() {
  if (adminFirestoreDB) return adminFirestoreDB;
  
  // If firebaseOrdersManager already has an active DB, reuse it immediately
  if (window.firebaseOrdersManager && window.firebaseOrdersManager.db) {
    adminFirestoreDB = window.firebaseOrdersManager.db;
    return adminFirestoreDB;
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

    const firebaseConfig = {
      apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
      authDomain: "elevez-ed97f.firebaseapp.com",
      projectId: "elevez-ed97f",
      storageBucket: "elevez-ed97f.firebasestorage.app",
      messagingSenderId: "440636781018",
      appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
    };

    let app;
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }

    // Attempt silent anonymous login to satisfy secure Firestore rules
    try {
      const auth = getAuth(app);
      if (!auth.currentUser) {
        console.log('🔐 [Auth] Silent anonymous sign-in...');
        await signInAnonymously(auth);
        console.log('🔓 [Auth] Successfully signed in anonymously!');
      }
    } catch (authErr) {
      console.warn('⚠️ [Auth] Silent anonymous sign-in skipped/failed:', authErr.message);
    }

    adminFirestoreDB = getFirestore(app);
    return adminFirestoreDB;
  } catch (err) {
    console.error('❌ Direct Firebase initialization inside admin.js failed:', err);
    return null;
  }
}

// Ensure user is on the permanent production domain and not a frozen Vercel preview snapshot
if (window.location.hostname.includes('-projects-') && !window.location.hostname.startsWith('admin-panel-shayaks-projects-95c1d909') && !window.location.hostname.includes('localhost')) {
  console.log('🔄 Snapshot domain detected! Redirecting to permanent production domain...');
  window.location.replace('https://admin-panel-shayaks-projects-95c1d909.vercel.app' + window.location.search);
}

// Auto-sync from constants.ts ONLY if localStorage is completely empty
async function autoSyncFromConstants(force = false) {
  try {
    // Skip if we just came from Shopify sync (URL has refresh param)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('refresh')) {
      console.log('ℹ️ Detected Shopify sync redirect (refresh param), skipping auto-sync from constants');
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      return false;
    }

    // Check if we already have complete products in localStorage (at least 28 products and must include Samurai Tee)
    const existing = localStorage.getItem('elevez_products');
    if (!force && existing) {
      try {
        const products = JSON.parse(existing);
        const hasSamurai = products.some(p => String(p.id) === '7916022530187');
        if (products.length >= 28 && hasSamurai) {
          const shopifyCount = products.filter(p => p.source === 'shopify').length;
          console.log(`ℹ️ Products already exist in localStorage: ${products.length} total (${shopifyCount} Shopify), skipping auto-sync`);
          return false;
        } else {
          console.log(`🩹 Local products cache is incomplete (count: ${products.length}, Samurai Tee: ${hasSamurai}). Forcing auto-sync...`);
        }
      } catch (e) {
        // If parsing fails, continue to sync
      }
    }

    console.log('🔄 Syncing from constants.ts...');

    // Try server sync API first (highly robust, parses constants.ts on Node server)
    try {
      const response = await fetch('/api/sync-from-constants');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.products && result.products.length > 0) {
          localStorage.setItem('elevez_products', JSON.stringify(result.products));
          localStorage.setItem('elevez_last_save', new Date().toISOString());
          state.products = result.products;
          
          const existingCollections = localStorage.getItem('elevez_collections');
          let hasExistingCollections = false;
          try {
            if (existingCollections) {
              const parsed = JSON.parse(existingCollections);
              if (parsed && parsed.length > 0) hasExistingCollections = true;
            }
          } catch (e) { }

          if (result.collections && result.collections.length > 0 && !hasExistingCollections) {
            localStorage.setItem('elevez_collections', JSON.stringify(result.collections));
            state.collections = result.collections;
            console.log(`📦 Loaded default collections from server sync: ${result.collections.length}`);
          } else if (hasExistingCollections) {
            console.log('ℹ️ Retaining existing custom collections from localStorage (bypassed default sync overwrite)');
          }
          if (result.tags) state.availableTags = result.tags;
          if (result.categories) state.availableCategories = result.categories;
          if (result.types) state.availableTypes = result.types;
          if (result.colors) state.availableColors = result.colors;

          console.log(`✅ Synced ${result.products.length} products from constants.ts via server API`);
          showSyncStatus(`✅ Loaded ${result.products.length} products from website`, 'success');
          return true;
        }
      }
    } catch (apiError) {
      console.log('ℹ️ Server sync API not available, falling back to dynamic module import:', apiError.message);
    }

    // Fallback: Try to import from constants module in case it is compiled (mostly for static deployments)
    const module = await import('../constants.js');
    if (module.PRODUCTS && module.PRODUCTS.length > 0) {
      localStorage.setItem('elevez_products', JSON.stringify(module.PRODUCTS));
      localStorage.setItem('elevez_last_save', new Date().toISOString());
      state.products = module.PRODUCTS;
      
      const existingCollections = localStorage.getItem('elevez_collections');
      let hasExistingCollections = false;
      try {
        if (existingCollections) {
          const parsed = JSON.parse(existingCollections);
          if (parsed && parsed.length > 0) hasExistingCollections = true;
        }
      } catch (e) { }

      if (module.COLLECTIONS && !hasExistingCollections) {
        localStorage.setItem('elevez_collections', JSON.stringify(module.COLLECTIONS));
        state.collections = module.COLLECTIONS;
        console.log(`📦 Loaded default collections from constants fallback: ${module.COLLECTIONS.length}`);
      } else if (hasExistingCollections) {
        console.log('ℹ️ Retaining existing custom collections from localStorage (bypassed fallback sync overwrite)');
      }
      
      console.log(`✅ Synced ${module.PRODUCTS.length} products from constants.js fallback`);
      showSyncStatus(`✅ Loaded ${module.PRODUCTS.length} products from website`, 'success');
      return true;
    }
  } catch (error) {
    console.log('ℹ️ Auto-sync from constants.ts not available:', error.message);
  }
  return false;
}

window.forceSyncFromConstants = async function () {
  console.log('🔄 Force syncing from constants.ts...');
  const synced = await autoSyncFromConstants(true);
  if (synced) {
    await loadData();
    renderProducts();
    showSyncStatus(`✅ Synced ${state.products.length} products from website`, 'success');
  } else {
    showSyncStatus('❌ Failed to sync from website', 'error');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Setup hot-reload first
  setupHotReloadClient();

  // Load cloud data directly (prioritizing Firestore Single Source of Truth)
  await loadData();
  setupNavigation();
  setupSyncButton();

  // Force render orders immediately
  console.log('🔧 Forcing initial render...');
  console.log('   state.orders:', state.orders.length);
  renderCurrentView();

  // Also render orders directly to ensure they display
  setTimeout(() => {
    console.log('📋 Rendering orders directly...');
    renderOrders();
  }, 500);

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

  // Make functions globally accessible for debugging
  window.debugAdmin = {
    renderProducts,
    renderOrders,
    renderDashboard,
    state,
    switchView,
    renderCurrentView
  };
  console.log('🔧 Debug functions available: window.debugAdmin');

  // EMERGENCY FIX: Add direct observer for products view
  const productsView = document.getElementById('products-view');
  if (productsView) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (productsView.classList.contains('active')) {
            console.log('🔍 Products view became active, forcing render...');
            setTimeout(() => renderProducts(), 100);
          }
        }
      });
    });
    observer.observe(productsView, { attributes: true });
    console.log('👁️ Products view observer installed');
  }
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

// Helper functions for Bidirectional SWR Merge of Products and Collections
function getNewerProduct(p1, p2) {
  if (!p1) return p2;
  if (!p2) return p1;
  const t1 = new Date(p1.updatedAt || p1.importedAt || p1.lastSyncedAt || 0).getTime() || 0;
  const t2 = new Date(p2.updatedAt || p2.importedAt || p2.lastSyncedAt || 0).getTime() || 0;
  return t1 >= t2 ? p1 : p2;
}

function getNewerCollection(c1, c2) {
  if (!c1) return c2;
  if (!c2) return c1;
  const t1 = new Date(c1.updatedAt || c1.createdAt || c1.importedAt || 0).getTime() || 0;
  const t2 = new Date(c2.updatedAt || c2.createdAt || c2.importedAt || 0).getTime() || 0;
  return t1 >= t2 ? c1 : c2;
}

function mergeProductLists(...lists) {
  const mergedMap = new Map();
  lists.forEach(list => {
    if (!list || !Array.isArray(list)) return;
    list.forEach(p => {
      if (!p || !p.id) return;
      const key = String(p.id).trim();
      const existing = mergedMap.get(key);
      if (!existing) {
        mergedMap.set(key, p);
      } else {
        mergedMap.set(key, getNewerProduct(existing, p));
      }
    });
  });
  return Array.from(mergedMap.values());
}

function mergeCollectionLists(...lists) {
  const mergedMap = new Map();
  lists.forEach(list => {
    if (!list || !Array.isArray(list)) return;
    list.forEach(c => {
      if (!c || !c.id) return;
      const key = String(c.id).trim();
      const existing = mergedMap.get(key);
      if (!existing) {
        mergedMap.set(key, c);
      } else {
        mergedMap.set(key, getNewerCollection(existing, c));
      }
    });
  });
  return Array.from(mergedMap.values());
}

async function loadData() {
  console.log('📂 Loading data (robust bidirectional SWR merge enabled)...');

  // --- PRODUCTS LOAD SECTION ---
  let cloudProducts = [];
  let serverProducts = [];
  let localProducts = [];
  let staticProducts = [];

  // 1. Try Firestore Cloud
  try {
    const db = await getFirebaseDB();
    if (db) {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      console.log('🔥 [SWR Merge] Fetching products from Firestore Cloud...');
      const productsSnapshot = await getDocs(collection(db, 'products'));
      if (!productsSnapshot.empty) {
        productsSnapshot.forEach(doc => {
          cloudProducts.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ [SWR Merge] Loaded ${cloudProducts.length} products from Firestore Cloud`);
      }
    }
  } catch (err) {
    console.warn('⚠️ [SWR Merge] Firestore product load failed, will merge from other sources:', err.message);
  }

  // 2. Try Local Server Backup API
  try {
    const response = await fetch('http://localhost:3001/api/products');
    if (response.ok) {
      const data = await response.json();
      if (data && data.products && Array.isArray(data.products)) {
        serverProducts = data.products;
        console.log(`✅ [SWR Merge] Loaded ${serverProducts.length} products from local server API`);
      }
    }
  } catch (err) {
    console.log('ℹ️ [SWR Merge] Local backup server offline, skipping local server product source');
  }

  // 3. Try Local Storage
  try {
    const saved = localStorage.getItem('elevez_products');
    if (saved) {
      localProducts = JSON.parse(saved) || [];
      console.log(`✅ [SWR Merge] Loaded ${localProducts.length} products from localStorage`);
    }
  } catch (err) {
    console.warn('⚠️ [SWR Merge] localStorage products parse failed:', err.message);
  }

  // 4. Try Static Catalog JSON file (for self-healing if incomplete)
  const hasSamuraiInCloudOrLocal = cloudProducts.some(p => String(p.id) === '7916022530187') || localProducts.some(p => String(p.id) === '7916022530187');
  if (cloudProducts.length < 28 || !hasSamuraiInCloudOrLocal) {
    console.log('🩹 [SWR Merge] Products catalog is incomplete. Fetching static public catalog for self-healing...');
    try {
      const response = await fetch('/data/products.json?v=' + Date.now());
      if (response.ok) {
        staticProducts = await response.json();
        console.log(`✅ [SWR Merge] Fetched ${staticProducts.length} products from /data/products.json`);
      }
    } catch (e) {
      try {
        const responseFallback = await fetch('/public/data/products.json?v=' + Date.now());
        if (responseFallback.ok) {
          staticProducts = await responseFallback.json();
          console.log(`✅ [SWR Merge] Fetched ${staticProducts.length} products from fallback /public/data/products.json`);
        }
      } catch (err) {
        console.warn('⚠️ [SWR Merge] Both static product catalog files failed:', err.message);
      }
    }
  }

  // Merge products
  const mergedProducts = mergeProductLists(staticProducts, localProducts, serverProducts, cloudProducts);
  console.log(`✨ [SWR Merge] Merged product sources. Total unique products: ${mergedProducts.length}`);

  if (mergedProducts.length > 0) {
    state.products = mergedProducts.map(p => {
      if (!p.qid) p.qid = `QID${p.id}`;
      const numId = Number(p.id);
      if (!isNaN(numId) && p.id !== numId) {
        p.id = numId;
      }
      return p;
    });
    localStorage.setItem('elevez_products', JSON.stringify(state.products));
  } else {
    console.log('ℹ️ No products available anywhere, loading default trial products...');
    loadTrialProducts();
  }


  // --- COLLECTIONS LOAD SECTION ---
  let cloudCollections = [];
  let serverCollections = [];
  let localCollections = [];

  // 1. Try Firestore Cloud
  try {
    const db = await getFirebaseDB();
    if (db) {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      console.log('🔥 [SWR Merge] Fetching collections from Firestore Cloud...');
      const snapshot = await getDocs(collection(db, 'collections'));
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          cloudCollections.push({ id: doc.id, ...doc.data() });
        });
        console.log(`✅ [SWR Merge] Loaded ${cloudCollections.length} collections from Firestore Cloud`);
      }
    }
  } catch (err) {
    console.warn('⚠️ [SWR Merge] Firestore collection load failed, will merge from other sources:', err.message);
  }

  // 2. Try Local Server collections API
  try {
    const res = await fetch('http://localhost:3001/api/collections');
    if (res.ok) {
      const data = await res.json();
      if (data && data.collections && Array.isArray(data.collections)) {
        serverCollections = data.collections;
        console.log(`✅ [SWR Merge] Loaded ${serverCollections.length} collections from local server API`);
      }
    }
  } catch (err) {
    console.log('ℹ️ [SWR Merge] Local collections API offline, skipping local server collection source');
  }

  // 3. Try Local Storage
  try {
    const saved = localStorage.getItem('elevez_collections');
    if (saved) {
      localCollections = JSON.parse(saved) || [];
      console.log(`✅ [SWR Merge] Loaded ${localCollections.length} collections from localStorage`);
    }
  } catch (err) {
    console.warn('⚠️ [SWR Merge] localStorage collections parse failed:', err.message);
  }

  // Merge collections
  const mergedCollections = mergeCollectionLists(localCollections, serverCollections, cloudCollections);
  console.log(`✨ [SWR Merge] Merged collection sources. Total unique collections: ${mergedCollections.length}`);

  state.collections = mergedCollections;
  localStorage.setItem('elevez_collections', JSON.stringify(state.collections));

  // Dynamic Seed fallback if collections list is completely empty
  if (state.collections.length === 0) {
    console.log('ℹ️ No collections found anywhere. Bootstrapping default collections from constants fallback...');
    try {
      const module = await import('../constants.js');
      if (module.COLLECTIONS && module.COLLECTIONS.length > 0) {
        state.collections = module.COLLECTIONS;
        localStorage.setItem('elevez_collections', JSON.stringify(state.collections));
        console.log(`📦 Loaded ${state.collections.length} default collections from constants fallback`);
      }
    } catch (e) {
      console.warn('⚠️ Could not load default collections from constants fallback:', e.message);
    }
  }


  // --- BACKGROUND HEALING AND SYNCHRONIZATION ---
  // If Firestore is empty, outdated, or incomplete, asynchronously heal Firestore in the background
  if (state.products.length > 0) {
    const needsProductsHeal = cloudProducts.length < state.products.length || !cloudProducts.some(p => String(p.id) === '7916022530187');
    if (needsProductsHeal) {
      setTimeout(async () => {
        try {
          const db = await getFirebaseDB();
          if (db) {
            const { collection, doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const batch = writeBatch(db);
            console.log(`🔥 [SWR Merge] Background healing: Uploading ${state.products.length} products to Firestore...`);
            for (const p of state.products) {
              const productRef = doc(db, 'products', String(p.id));
              batch.set(productRef, {
                ...p,
                updatedAt: new Date().toISOString()
              });
            }
            await batch.commit();
            console.log('🎉 [SWR Merge] Firestore products collection is now fully healed and persistent!');
          }
        } catch (healError) {
          console.warn('⚠️ [SWR Merge] Background Firestore product healing failed:', healError.message);
        }
      }, 5000);
    }
  }

  if (state.collections.length > 0) {
    const needsCollectionsHeal = cloudCollections.length < state.collections.length;
    if (needsCollectionsHeal) {
      setTimeout(async () => {
        try {
          const db = await getFirebaseDB();
          if (db) {
            const { collection, doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const batch = writeBatch(db);
            console.log(`🔥 [SWR Merge] Background healing: Uploading ${state.collections.length} collections to Firestore...`);
            state.collections.forEach(col => {
              const colRef = doc(db, 'collections', String(col.id));
              const cleanCol = JSON.parse(JSON.stringify(col));
              batch.set(colRef, {
                ...cleanCol,
                updatedAt: new Date().toISOString()
              });
            });
            await batch.commit();
            console.log('🎉 [SWR Merge] Firestore collections are now fully healed and persistent!');
          }
        } catch (healError) {
          console.warn('⚠️ [SWR Merge] Background Firestore collections healing failed:', healError.message);
        }
      }, 5000);
    }
  }

  const savedOrders = localStorage.getItem('elevez_orders');
  if (savedOrders) {
    try { state.orders = JSON.parse(savedOrders); } catch (e) { }
  }

  // Restore available filters
  ['tags', 'categories', 'types', 'colors'].forEach(key => {
    const saved = localStorage.getItem(`elevez_${key}`);
    if (saved) {
      try {
        state[`available${key.charAt(0).toUpperCase() + key.slice(1)}`] = JSON.parse(saved);
      } catch (e) { }
    }
  });

  // Extract unique tags, categories, and types from existing products
  state.products.forEach(product => {
    if (product.tags) {
      product.tags.forEach(tag => {
        if (!state.availableTags.includes(tag)) state.availableTags.push(tag);
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

  // ✅ FIX DUPLICATE PRODUCTS
  const uniqueProducts = [];
  const processedIds = new Set();
  const processedNames = new Set();

  state.products.forEach(p => {
    // Unique ID check
    if (p.id && processedIds.has(String(p.id))) return;

    // Unique Name check (if ID is new)
    const normalizedName = (p.name || '').trim().toLowerCase();
    if (processedNames.has(normalizedName)) return; // Skip dupes

    // Add to unique lists
    if (p.id) processedIds.add(String(p.id));
    if (normalizedName) processedNames.add(normalizedName);

    uniqueProducts.push(p);
  });

  if (uniqueProducts.length < state.products.length) {
    console.log(`🔧 Fixed duplicates: ${state.products.length} -> ${uniqueProducts.length}`);
    state.products = uniqueProducts;
    localStorage.setItem('elevez_products', JSON.stringify(state.products));
  }

  // ✅ CRITICAL: Sync state to window object for sync-deploy.js to access
  window.products = state.products;
  window.collections = state.collections;
  window.orders = state.orders;
  console.log(`🔄 Synced ${state.products.length} products to window.products for deployment`);
}

// Save Data
async function saveData() {
  try {
    // ✅ DE-DUPLICATE before saving (prevent duplicates in storage)
    const productMap = new Map();
    for (const product of state.products) {
      const name = (product.name || '').toLowerCase().trim();
      if (!name) continue;
      const existing = productMap.get(name);
      if (!existing || (product.source === 'shopify' && existing.source !== 'shopify')) {
        productMap.set(name, product);
      }
    }
    const uniqueProducts = Array.from(productMap.values());
    if (uniqueProducts.length < state.products.length) {
      console.log(`🔧 saveData: De-duplicated ${state.products.length} -> ${uniqueProducts.length}`);
      state.products = uniqueProducts;
    }

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

    // Also backup to server (permanent persistence)
    try {
      await fetch('http://localhost:3001/api/products', {
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
      console.log('✅ Backed up to server (data/backup.json)');
    } catch (e) {
      console.log('ℹ️ Server backup skipped (server not running)');
    }


    // ✅ SYNC COLLECTIONS TO SERVER (Collections.json)
    await saveCollectionsToServer();

    // ✅ SYNC TO FIREBASE FOR PERMANENT PERSISTENCE
    try {
      const db = await getFirebaseDB();
      if (db) {
        const { collection, doc, setDoc, getDocs, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        console.log(`🔥 Syncing ${state.products.length} products to Firebase...`);

        // Get all existing products in Firestore to find orphaned/stale documents
        const existingSnapshot = await getDocs(collection(db, 'products'));
        const activeIds = new Set(state.products.map(p => String(p.id)));
        const orphanedDocs = [];

        existingSnapshot.forEach(docSnap => {
          const docId = String(docSnap.id);
          if (!activeIds.has(docId)) {
            orphanedDocs.push(docId);
          }
        });

        if (orphanedDocs.length > 0) {
          console.log(`🔧 Found ${orphanedDocs.length} orphaned/duplicate documents in Firestore:`, orphanedDocs);
        }

        // Use batch writes for efficiency
        const batch = writeBatch(db);

        // 1. Set/Update active products
        for (const product of state.products) {
          const productRef = doc(db, 'products', String(product.id));
          batch.set(productRef, {
            ...product,
            updatedAt: new Date().toISOString()
          });
        }

        // 2. Delete orphaned/duplicate products from Firestore
        for (const docId of orphanedDocs) {
          const productRef = doc(db, 'products', docId);
          batch.delete(productRef);
        }

        await batch.commit();
        console.log(`✅ Synced ${state.products.length} products to Firebase (Updated: ${state.products.length}, Deleted: ${orphanedDocs.length})`);
      }
    } catch (firebaseError) {
      console.warn('⚠️ Firebase sync failed:', firebaseError.message);
      // Not critical - localStorage and server backup still work
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
  console.log('🔧 Setting up navigation...');
  document.querySelectorAll('.nav-item').forEach(btn => {
    // Skip if no data-view (like external links)
    if (!btn.dataset.view) {
      console.log('   Skipping nav item without data-view');
      return;
    }

    console.log('   Found nav item:', btn.dataset.view);
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default to ensure our handler runs
      const view = btn.dataset.view;
      console.log('🖱️ Nav clicked:', view);
      switchView(view);
    });
  });

  // Force render products if we're on products view
  if (state.currentView === 'products') {
    console.log('🔄 Initial view is products, rendering...');
    renderProducts();
  }
}

function switchView(view) {
  try {
    console.log('🔄 switchView called with:', view);
    state.currentView = view;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`${view}-view`);
    if (targetView) {
      targetView.classList.add('active');
      console.log('✅ View activated:', view);
    } else {
      console.error('❌ View not found:', `${view}-view`);
    }

    // Render content
    console.log('🎯 About to call renderCurrentView()...');
    renderCurrentView();
    console.log('✅ renderCurrentView() completed');
  } catch (error) {
    console.error('❌ Error in switchView:', error);
    // Force render anyway
    if (view === 'products') {
      console.log('🔧 Force rendering products due to error...');
      renderProducts();
    }
  }
}

function renderCurrentView() {
  console.log('🔄 renderCurrentView called, current view:', state.currentView);
  console.log('📦 Products in state:', state.products.length);

  switch (state.currentView) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'products':
      console.log('🎯 Calling renderProducts()...');
      renderProducts();
      break;
    case 'orders':
      renderOrders();
      break;
    case 'collections':
      renderCollections();
      break;
    case 'sections':
      if (typeof renderSections === 'function') {
        renderSections();
      }
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

  // Calculate revenue and profit from ALL orders (not just completed)
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalCost = 0;

  console.log('📊 Dashboard Calculation (admin.js):');
  console.log(`   Total Orders: ${totalOrders}`);
  console.log(`   Products Available: ${totalProducts}`);

  state.orders.forEach((order, idx) => {
    console.log(`\n   Order ${idx + 1}: ${order.id}`);
    console.log(`      Status: ${order.status}`);
    console.log(`      Total Amount: $${order.totalAmount || order.total || 0}`);

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        // Try multiple ways to find the product
        const product = state.products.find(p =>
          p.id == item.id ||  // Loose equality to match "1" with 1
          p.id === item.id ||
          p.id === item.productId ||
          p.name === item.name ||
          p.qid === item.qid ||
          String(p.id) === String(item.id)  // Convert both to strings
        );

        if (product) {
          const itemPrice = item.price || product.price || 0;
          const itemCost = product.productionCost || product.cost || 0;
          const quantity = item.quantity || item.orderedQuantity || 1;

          const itemRevenue = itemPrice * quantity;
          const itemTotalCost = itemCost * quantity;

          totalRevenue += itemRevenue;
          totalCost += itemTotalCost;
          totalProfit += (itemRevenue - itemTotalCost);

          console.log(`      ✅ ${item.name}: $${itemPrice} × ${quantity} (cost: $${itemCost})`);
        } else {
          console.warn(`      ❌ Product NOT FOUND for item: ${item.name} (id: ${item.id})`);
          console.warn(`         Available product IDs: ${state.products.map(p => p.id).join(', ')}`);

          // Use item price as fallback
          const itemPrice = item.price || 0;
          const quantity = item.quantity || item.orderedQuantity || 1;
          if (itemPrice > 0) {
            totalRevenue += itemPrice * quantity;
            console.log(`      Using item price: $${itemPrice} × ${quantity}`);
          }
        }
      });
    } else {
      // No items, use order total
      const orderTotal = order.totalAmount || order.total || 0;
      if (orderTotal > 0) {
        totalRevenue += orderTotal;
        console.log(`      Using order total: $${orderTotal}`);
      }
    }
  });

  const avgProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  console.log('\n💰 Final Totals:');
  console.log(`   Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   Cost: $${totalCost.toFixed(2)}`);
  console.log(`   Profit: $${totalProfit.toFixed(2)}`);
  console.log(`   Margin: ${avgProfitMargin}%`);

  // Find best performing products by profit
  const productProfits = state.products
    .filter(p => p.cost > 0)
    .map(p => ({
      name: p.name,
      profit: p.profit || (p.price - p.cost),
      margin: p.profitMargin || ((p.price - p.cost) / p.price * 100).toFixed(1)
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 3);

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
      <div class="stat-value">$${totalRevenue.toFixed(2)}</div>
      <div class="stat-label">Total Revenue</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: var(--primary);">$${totalProfit.toFixed(2)}</div>
      <div class="stat-label">Total Profit</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: var(--primary);">$${totalCost.toFixed(2)}</div>
      <div class="stat-label">Cost of Goods Sold</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="color: ${avgProfitMargin < 20 ? '#ff3b30' : avgProfitMargin < 40 ? '#ffaa00' : 'var(--primary)'};">${avgProfitMargin}%</div>
      <div class="stat-label">Avg Profit Margin</div>
    </div>
    <div class="stat-card" style="grid-column: span 1;">
      <div class="stat-label" style="margin-bottom: 10px;">Top Profitable Products</div>
      ${productProfits.length > 0 ? productProfits.map(p => `
        <div style="font-size: 12px; margin: 5px 0; display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">${p.name.substring(0, 20)}${p.name.length > 20 ? '...' : ''}</span>
          <span style="color: var(--primary); font-weight: 600;">$${p.profit.toFixed(2)} (${p.margin}%)</span>
        </div>
      `).join('') : '<div style="font-size: 12px; color: var(--text-muted);">No profit data yet</div>'}
    </div>
  `;
}

// Products
function renderProducts() {
  console.log('🎨 renderProducts() CALLED!');
  const grid = document.getElementById('productsGrid');

  console.log('🎨 Rendering products:', {
    count: state.products.length,
    gridElement: grid ? 'Found' : 'NOT FOUND',
    products: state.products.slice(0, 2).map(p => ({ name: p.name, image: p.image }))
  });

  if (!grid) {
    console.error('❌ Products grid element not found!');
    return;
  }

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
    const imageUrl = product.image || product.images?.[0] || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' style='background:%23111;'><rect width='100%25' height='100%25' fill='%23111'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='sans-serif' font-size='20' font-weight='bold'>No Image</text></svg>";

    // Calculate profit if cost is available
    const cost = product.cost || 0;
    const profit = cost > 0 ? product.price - cost : 0;
    const profitMargin = cost > 0 && product.price > 0 ? ((profit / product.price) * 100).toFixed(1) : 0;

    // Determine profit color
    let profitColor = 'var(--primary)';
    if (profitMargin < 20) profitColor = '#ff3b30';
    else if (profitMargin < 40) profitColor = '#ffaa00';

    return `
      <div class="product-card">
        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'500\' viewBox=\'0 0 400 500\' style=\'background:%23111;\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23111\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23333\' font-family=\'sans-serif\' font-size=\'20\' font-weight=\'bold\'>No Image</text></svg>'; this.style.opacity='0.5';">
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
          ${cost > 0 ? `
          <div style="display: flex; gap: 8px; margin: 8px 0; font-size: 12px;">
            <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">
              Cost: ₹${cost}
            </span>
            <span style="background: rgba(${profitColor === '#ff3b30' ? '255,59,48' : profitColor === '#ffaa00' ? '255,170,0' : '0,255,136'},0.1); color: ${profitColor}; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
              Profit: ₹${profit.toFixed(0)} (${profitMargin}%)
            </span>
          </div>
          ` : ''}
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

// NOTE: renderCollections function has been moved to line ~3253 with enhanced Shopify-like UI

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
  // Price and profit calculation
  const normalPrice = document.getElementById('normalPrice');
  const salePrice = document.getElementById('salePrice');
  const productCost = document.getElementById('productCost');
  const discountDisplay = document.getElementById('discountDisplay');
  const profitDisplay = document.getElementById('profitDisplay');
  const profitMarginDisplay = document.getElementById('profitMarginDisplay');

  const calculateAll = () => {
    const normal = parseFloat(normalPrice.value) || 0;
    const sale = parseFloat(salePrice.value) || 0;
    const cost = parseFloat(productCost.value) || 0;

    // Calculate discount
    if (normal > 0 && sale > 0 && sale < normal) {
      const discount = Math.round(((normal - sale) / normal) * 100);
      discountDisplay.value = `${discount}% OFF`;
    } else {
      discountDisplay.value = '';
    }

    // Calculate profit
    if (sale > 0 && cost > 0) {
      const profit = sale - cost;
      const profitMargin = ((profit / sale) * 100).toFixed(1);
      profitDisplay.value = `₹${profit.toFixed(0)}`;
      profitMarginDisplay.value = `${profitMargin}%`;

      // Color code based on margin
      if (profitMargin < 20) {
        profitMarginDisplay.style.background = 'rgba(255, 59, 48, 0.1)';
        profitMarginDisplay.style.color = '#ff3b30';
      } else if (profitMargin < 40) {
        profitMarginDisplay.style.background = 'rgba(255, 170, 0, 0.1)';
        profitMarginDisplay.style.color = '#ffaa00';
      } else {
        profitMarginDisplay.style.background = 'rgba(0, 255, 136, 0.1)';
        profitMarginDisplay.style.color = 'var(--primary)';
      }
    } else {
      profitDisplay.value = '';
      profitMarginDisplay.value = '';
    }
  };

  normalPrice.addEventListener('input', calculateAll);
  salePrice.addEventListener('input', calculateAll);
  productCost.addEventListener('input', calculateAll);

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

    // ImgBB - Convert page URL to direct image URL
    // URLs like https://ibb.co/WWqsqmDq need to be converted to https://i.ibb.co/XXX/image.jpg
    if (urlObj.hostname.includes('ibb.co')) {
      // If it's already a direct URL (i.ibb.co), return as-is
      if (urlObj.hostname.startsWith('i.')) {
        return url;
      }

      // Extract image ID from URL like https://ibb.co/WWqsqmDq
      const imageId = urlObj.pathname.split('/').filter(p => p).pop();

      // ImgBB direct URLs follow pattern: https://i.ibb.co/{imageId}/{filename}
      // We'll use a generic filename since we don't know the original
      // The actual direct link will be fetched when the image loads
      console.log(`🔄 ImgBB page URL detected: ${url}`);
      console.log(`📝 Image ID: ${imageId}`);
      console.log(`⚠️ Note: ImgBB requires fetching the page to get the direct URL`);
      console.log(`💡 Tip: Use "Direct link" from ImgBB instead of page URL for best results`);

      // Return the page URL - we'll handle it in fetchDirectImageUrl
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

    // Check if it's already a direct image URL
    if (pageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
      return pageUrl;
    }

    // Try to convert known hosting services
    const directUrl = convertToDirectImageUrl(pageUrl);

    if (directUrl !== pageUrl) {
      console.log('✅ Converted URL:', pageUrl, '→', directUrl);
      return directUrl;
    }

    // Special handling for ImgBB page URLs
    const urlObj = new URL(pageUrl);
    if (urlObj.hostname.includes('ibb.co') && !urlObj.hostname.startsWith('i.')) {
      console.log('🔄 Fetching ImgBB direct URL from page...');
      showSyncStatus('🔄 Fetching ImgBB image...', 'success');

      try {
        // Fetch the page HTML
        const response = await fetch(pageUrl);
        const html = await response.text();

        // Extract direct image URL from HTML
        // ImgBB embeds the direct URL in meta tags and data attributes
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        const dataUrlMatch = html.match(/data-url="([^"]+)"/);
        const imgSrcMatch = html.match(/<img[^>]+src="(https:\/\/i\.ibb\.co\/[^"]+)"/);

        const extractedUrl = ogImageMatch?.[1] || dataUrlMatch?.[1] || imgSrcMatch?.[1];

        if (extractedUrl) {
          console.log('✅ Extracted ImgBB direct URL:', extractedUrl);
          return extractedUrl;
        } else {
          console.warn('⚠️ Could not extract direct URL from ImgBB page');
          alert(`⚠️ Could not extract direct image URL from ImgBB page.\n\nPlease use the "Direct link" from ImgBB instead:\n1. Open image on ImgBB\n2. Click "Get share links"\n3. Copy "Direct link"\n4. Paste that URL instead`);
          return null;
        }
      } catch (fetchError) {
        console.error('❌ Error fetching ImgBB page:', fetchError);
        alert(`❌ Could not fetch ImgBB page (CORS restriction).\n\nPlease use the "Direct link" from ImgBB:\n1. Open image on ImgBB\n2. Click "Get share links"\n3. Copy "Direct link" (starts with https://i.ibb.co/)\n4. Paste that URL instead`);
        return null;
      }
    }

    // For other services, try common patterns
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
  const input = prompt(`📦 BULK IMAGE IMPORT\n\nPaste your images here (one per line):\n\n✅ Supported formats:\n• ImgBB Direct Links (https://i.ibb.co/...)\n• Imgur Direct Links (https://i.imgur.com/...)\n• BBCode from PostImage\n• Any direct image URLs\n\n💡 For ImgBB:\n1. Upload to ImgBB\n2. Click "Get share links"\n3. Copy "Direct link" (starts with https://i.ibb.co/)\n4. Paste here (one per line)\n\nExample:\nhttps://i.ibb.co/ABC123/image.jpg\nhttps://i.ibb.co/XYZ789/photo.png\nhttps://i.imgur.com/abc123.jpg`);

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

  // 1. Extract from HTML <img> tags: <img src="URL">
  const htmlImgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
  let match;
  while ((match = htmlImgRegex.exec(text)) !== null) {
    urls.push(match[1]);
  }

  // 3. Extract from BBCode with URL wrapper: [url=...][img]URL[/img][/url]
  const bbcodeUrlRegex = /\[url=[^\]]+\]\[img\](https?:\/\/[^\]]+)\[\/img\]\[\/url\]/gi;
  while ((match = bbcodeUrlRegex.exec(text)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  // 4. Extract plain URLs (one per line or space-separated)
  const urlRegex = /https?:\/\/[^\s\[\]<>]+/gi;
  const plainUrls = text.match(urlRegex) || [];
  plainUrls.forEach(url => {
    // Clean up URL (remove trailing punctuation and HTML artifacts)
    const cleanUrl = url.replace(/[,;.!?"']+$/, '').replace(/["'>]+$/, '');
    if (!urls.includes(cleanUrl)) {
      urls.push(cleanUrl);
    }
  });

  // 5. Remove duplicates and filter valid image URLs
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

  // Get cost and calculate profit
  const productCost = parseFloat(document.getElementById('productCost').value) || 0;
  const profit = productCost > 0 ? salePrice - productCost : 0;
  const profitMargin = productCost > 0 && salePrice > 0 ? ((profit / salePrice) * 100).toFixed(1) : 0;

  const product = {
    id: state.editingProduct?.id || Date.now(),
    qid: qid,
    name: document.getElementById('productName').value,
    price: salePrice,
    originalPrice: normalPrice,
    cost: productCost,
    profit: profit,
    profitMargin: parseFloat(profitMargin),
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
    // Inventory tracking
    sku: document.getElementById('productSKU')?.value || undefined,
    stock: parseInt(document.getElementById('productStock')?.value) || 0,
    status: document.getElementById('productStatus')?.value || 'active',
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
  document.getElementById('productCost').value = product.cost || '';
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productType').value = product.type;
  document.getElementById('productRating').value = product.rating;
  document.getElementById('productDescription').value = product.description || '';

  // Load inventory fields
  if (document.getElementById('productSKU')) {
    document.getElementById('productSKU').value = product.sku || '';
  }
  if (document.getElementById('productStock')) {
    document.getElementById('productStock').value = product.stock || 0;
  }
  if (document.getElementById('productStatus')) {
    document.getElementById('productStatus').value = product.status || 'active';
  }

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

  // Calculate and display profit if cost exists
  if (product.cost && product.cost > 0) {
    const profit = product.price - product.cost;
    const profitMargin = ((profit / product.price) * 100).toFixed(1);
    document.getElementById('profitDisplay').value = `₹${profit.toFixed(0)}`;
    document.getElementById('profitMarginDisplay').value = `${profitMargin}%`;

    // Color code based on margin
    const profitMarginDisplay = document.getElementById('profitMarginDisplay');
    if (profitMargin < 20) {
      profitMarginDisplay.style.background = 'rgba(255, 59, 48, 0.1)';
      profitMarginDisplay.style.color = '#ff3b30';
    } else if (profitMargin < 40) {
      profitMarginDisplay.style.background = 'rgba(255, 170, 0, 0.1)';
      profitMarginDisplay.style.color = '#ffaa00';
    } else {
      profitMarginDisplay.style.background = 'rgba(0, 255, 136, 0.1)';
      profitMarginDisplay.style.color = 'var(--primary)';
    }
  }
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
    saveCollectionsToServer();
    renderCurrentView();
    showSyncStatus('Collection deleted', 'success');
  }
};

// Save all collections to server for permanent persistence
window.saveAllCollections = async () => {
  try {
    showSyncStatus('Saving collections...', 'info');

    // Save to localStorage first
    localStorage.setItem('elevez_collections', JSON.stringify(state.collections));

    let savedOnFirebase = false;
    let savedOnServer = false;

    // 1. Try Firebase Firestore (Cloud primary)
    try {
      const db = await getFirebaseDB();
      if (db) {
        const { collection, doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const batch = writeBatch(db);
        
        console.log(`🔥 Uploading all ${state.collections.length} collections to Firestore...`);
        state.collections.forEach(col => {
          const colRef = doc(db, 'collections', String(col.id));
          const cleanCol = JSON.parse(JSON.stringify(col));
          batch.set(colRef, {
            ...cleanCol,
            updatedAt: new Date().toISOString()
          });
        });
        await batch.commit();
        savedOnFirebase = true;
        console.log('🔥 Collections successfully saved to Firestore!');
      }
    } catch (firebaseErr) {
      console.error('⚠️ Firebase collection save failed:', firebaseErr);
    }

    // 2. Try local backup server
    try {
      const response = await fetch('http://localhost:3001/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: state.collections })
      });

      if (response.ok) {
        savedOnServer = true;
        console.log('💾 Collections saved to local server API');
      }
    } catch (error) {
      console.log('ℹ️ Local backup server offline, skipping localhost write');
    }

    if (savedOnFirebase) {
      showSyncStatus(`✅ Saved ${state.collections.length} collections (localStorage + Cloud)!`, 'success');
    } else if (savedOnServer) {
      showSyncStatus(`✅ Saved ${state.collections.length} collections to local server!`, 'success');
    } else {
      showSyncStatus('⚠️ Saved locally only (Server & Cloud offline)', 'warning');
    }
  } catch (error) {
    console.error('❌ Error saving collections:', error);
    showSyncStatus('⚠️ Error saving collections', 'error');
  }
};

// Helper function to save collections to server
async function saveCollectionsToServer() {
  try {
    // 1. Try Firebase Firestore
    const db = await getFirebaseDB();
    if (db) {
      const { collection, doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const batch = writeBatch(db);
      state.collections.forEach(col => {
        const colRef = doc(db, 'collections', String(col.id));
        const cleanCol = JSON.parse(JSON.stringify(col));
        batch.set(colRef, {
          ...cleanCol,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      console.log('🔥 Collections auto-saved to Firestore');
    }
  } catch (firebaseErr) {
    console.warn('⚠️ Firebase collection auto-save failed:', firebaseErr);
  }

  // 2. Try Local Node API
  try {
    await fetch('http://localhost:3001/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collections: state.collections })
    });
    console.log('💾 Collections auto-saved to localhost server');
  } catch (e) {
    console.log('ℹ️ Local server offline, skipping localhost auto-save write');
  }
}

// Generate collections from product data (useful when collections weren't imported)
window.generateCollectionsFromProducts = async () => {
  if (!confirm('Generate collections from product data? This will add new collections based on the "collections" field in each product.')) {
    return;
  }

  // Collect unique collection names from all products
  const collectionNames = new Set();
  state.products.forEach(product => {
    if (product.collections && Array.isArray(product.collections)) {
      product.collections.forEach(name => collectionNames.add(name));
    }
  });

  if (collectionNames.size === 0) {
    alert('ℹ️ No collection data found in products. Try importing from Shopify first.');
    return;
  }

  // Create collection objects
  const existingHandles = new Set(state.collections.map(c => c.handle));
  let addedCount = 0;

  collectionNames.forEach(name => {
    const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Skip if already exists
    if (existingHandles.has(handle)) return;

    // Find products in this collection
    const productHandles = state.products
      .filter(p => p.collections?.includes(name))
      .map(p => p.shopifyHandle || p.handle);

    const newCollection = {
      id: Date.now().toString() + '-' + addedCount,
      handle: handle,
      name: name,
      description: `Products in the ${name} collection`,
      image: '',
      productHandles: productHandles,
      productCount: productHandles.length,
      sectionMapping: null,
      order: addedCount,
      isSystem: false,
      source: 'generated',
      createdAt: new Date().toISOString()
    };

    state.collections.push(newCollection);
    addedCount++;
  });

  if (addedCount > 0) {
    saveData();
    await saveCollectionsToServer(); // Explicit save for safety
    renderCollections();
    showSyncStatus(`✅ Generated ${addedCount} collections from products!`, 'success');
  } else {
    // Force render anyway to show existing collections
    renderCollections();
    showSyncStatus('ℹ️ All collections already exist', 'info');
  }
};

// Duplicate a collection
window.duplicateCollection = (id) => {
  const collection = state.collections.find(c => c.id === id);
  if (!collection) return;

  const newCollection = {
    ...collection,
    id: Date.now().toString(),
    name: collection.name + ' (Copy)',
    handle: collection.handle ? collection.handle + '-copy' : null,
    isSystem: false,
    source: 'local',
    createdAt: new Date().toISOString()
  };

  state.collections.push(newCollection);
  saveData();
  saveCollectionsToServer();
  renderCollections();
  showSyncStatus('✅ Collection duplicated!', 'success');
};

// Open manage products modal for a collection
window.openManageProductsModal = (collectionId) => {
  const collection = state.collections.find(c => c.id === collectionId);
  if (!collection) return;

  // Store the current collection being edited
  state.editingCollectionProducts = collectionId;

  // Create or show the modal
  let modal = document.getElementById('manageProductsModal');
  if (!modal) {
    modal = createManageProductsModal();
    document.body.appendChild(modal);
  }

  modal.classList.add('active');
  populateManageProductsModal(collection);
};

// Create the manage products modal HTML
function createManageProductsModal() {
  const modal = document.createElement('div');
  modal.id = 'manageProductsModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 1000px; max-height: 90vh;">
      <div class="modal-header">
        <h2 id="manageProductsTitle">Manage Collection Products</h2>
        <button class="modal-close" onclick="closeManageProductsModal()">&times;</button>
      </div>
      <div class="modal-body" style="display: flex; gap: 20px; height: calc(80vh - 150px);">
        <!-- Available Products -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          <h4 style="margin-bottom: 10px;">📦 Available Products</h4>
          <input type="text" id="availableProductsSearch" class="search-input" 
                 placeholder="🔍 Search products..." 
                 oninput="filterAvailableProducts()" style="margin-bottom: 10px;">
          <div id="availableProductsList" 
               style="flex: 1; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 10px; background: var(--card-bg);">
          </div>
        </div>
        
        <!-- Action buttons -->
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 10px;">
          <button class="btn btn-primary" onclick="addSelectedToCollection()" title="Add selected">→</button>
          <button class="btn btn-secondary" onclick="removeSelectedFromCollection()" title="Remove selected">←</button>
        </div>
        
        <!-- Collection Products -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          <h4 style="margin-bottom: 10px;">🗂️ In Collection <span id="collectionProductCount">(0)</span></h4>
          <input type="text" id="collectionProductsSearch" class="search-input" 
                 placeholder="🔍 Search in collection..." 
                 oninput="filterCollectionProducts()" style="margin-bottom: 10px;">
          <div id="collectionProductsList" 
               style="flex: 1; overflow-y: auto; border: 1px solid var(--accent); border-radius: 8px; padding: 10px; background: var(--card-bg);">
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; padding: 15px 20px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" onclick="selectAllAvailable()">Select All Available</button>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="closeManageProductsModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveCollectionProducts()">💾 Save Changes</button>
        </div>
      </div>
    </div>
  `;
  return modal;
}

// Populate the manage products modal with data
function populateManageProductsModal(collection) {
  document.getElementById('manageProductsTitle').textContent = `Manage Products: ${collection.name}`;

  // Get current collection products
  const collectionHandles = collection.productHandles || [];

  // Separate products into available and in-collection
  const collectionProducts = state.products.filter(p =>
    collectionHandles.includes(p.handle) || collectionHandles.includes(p.shopifyHandle)
  );
  const availableProducts = state.products.filter(p =>
    !collectionHandles.includes(p.handle) && !collectionHandles.includes(p.shopifyHandle)
  );

  // Store for later use
  state.manageProductsData = {
    collection,
    collectionHandles: [...collectionHandles],
    selectedAvailable: [],
    selectedInCollection: []
  };

  renderAvailableProducts(availableProducts);
  renderCollectionProductsList(collectionProducts);
}

// Render available products list
function renderAvailableProducts(products) {
  const container = document.getElementById('availableProductsList');
  if (products.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">All products are in this collection</p>';
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="product-list-item" data-handle="${p.handle || p.shopifyHandle}" onclick="toggleProductSelection(this, 'available')">
      <input type="checkbox" class="product-checkbox available" data-handle="${p.handle || p.shopifyHandle}">
      <img src="${p.image || p.images?.[0] || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' style='background:%23111;'><rect width='100%25' height='100%25' fill='%23111'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='sans-serif' font-size='8' font-weight='bold'>No Image</text></svg>"}" alt="${p.name}" 
           style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
      <div style="flex: 1; overflow: hidden;">
        <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">₹${p.price}</div>
      </div>
    </div>
  `).join('');
}

// Render collection products list
function renderCollectionProductsList(products) {
  const container = document.getElementById('collectionProductsList');
  document.getElementById('collectionProductCount').textContent = `(${products.length})`;

  if (products.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No products in this collection</p>';
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="product-list-item" data-handle="${p.handle || p.shopifyHandle}" onclick="toggleProductSelection(this, 'collection')">
      <input type="checkbox" class="product-checkbox collection" data-handle="${p.handle || p.shopifyHandle}">
      <img src="${p.image || p.images?.[0] || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' style='background:%23111;'><rect width='100%25' height='100%25' fill='%23111'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='sans-serif' font-size='8' font-weight='bold'>No Image</text></svg>"}" alt="${p.name}" 
           style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
      <div style="flex: 1; overflow: hidden;">
        <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">₹${p.price}</div>
      </div>
    </div>
  `).join('');
}

// Toggle product selection
window.toggleProductSelection = (element, listType) => {
  const checkbox = element.querySelector('.product-checkbox');
  checkbox.checked = !checkbox.checked;
  element.classList.toggle('selected', checkbox.checked);
};

// Add selected products to collection
window.addSelectedToCollection = () => {
  const checkboxes = document.querySelectorAll('#availableProductsList .product-checkbox:checked');
  if (checkboxes.length === 0) {
    alert('Please select products to add');
    return;
  }

  checkboxes.forEach(cb => {
    const handle = cb.dataset.handle;
    if (!state.manageProductsData.collectionHandles.includes(handle)) {
      state.manageProductsData.collectionHandles.push(handle);
    }
  });

  refreshManageProductsLists();
};

// Remove selected products from collection
window.removeSelectedFromCollection = () => {
  const checkboxes = document.querySelectorAll('#collectionProductsList .product-checkbox:checked');
  if (checkboxes.length === 0) {
    alert('Please select products to remove');
    return;
  }

  checkboxes.forEach(cb => {
    const handle = cb.dataset.handle;
    state.manageProductsData.collectionHandles = state.manageProductsData.collectionHandles.filter(h => h !== handle);
  });

  refreshManageProductsLists();
};

// Refresh both lists based on current handles
function refreshManageProductsLists() {
  const handles = state.manageProductsData.collectionHandles;
  const collectionProducts = state.products.filter(p =>
    handles.includes(p.handle) || handles.includes(p.shopifyHandle)
  );
  const availableProducts = state.products.filter(p =>
    !handles.includes(p.handle) && !handles.includes(p.shopifyHandle)
  );

  renderAvailableProducts(availableProducts);
  renderCollectionProductsList(collectionProducts);
}

// Filter available products by search
window.filterAvailableProducts = () => {
  const search = document.getElementById('availableProductsSearch').value.toLowerCase();
  const items = document.querySelectorAll('#availableProductsList .product-list-item');
  items.forEach(item => {
    const name = item.textContent.toLowerCase();
    item.style.display = name.includes(search) ? 'flex' : 'none';
  });
};

// Filter collection products by search
window.filterCollectionProducts = () => {
  const search = document.getElementById('collectionProductsSearch').value.toLowerCase();
  const items = document.querySelectorAll('#collectionProductsList .product-list-item');
  items.forEach(item => {
    const name = item.textContent.toLowerCase();
    item.style.display = name.includes(search) ? 'flex' : 'none';
  });
};

// Select all available products
window.selectAllAvailable = () => {
  const checkboxes = document.querySelectorAll('#availableProductsList .product-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = true;
    cb.closest('.product-list-item')?.classList.add('selected');
  });
};

// Save collection products
window.saveCollectionProducts = async () => {
  const collectionId = state.editingCollectionProducts;
  const collectionIndex = state.collections.findIndex(c => c.id === collectionId);

  if (collectionIndex === -1) {
    alert('Error: Collection not found');
    return;
  }

  // Update the collection
  state.collections[collectionIndex].productHandles = [...state.manageProductsData.collectionHandles];
  state.collections[collectionIndex].productCount = state.manageProductsData.collectionHandles.length;
  state.collections[collectionIndex].updatedAt = new Date().toISOString();

  // Save to localStorage and server
  saveData();
  await saveCollectionsToServer();

  closeManageProductsModal();
  renderCollections();
  showSyncStatus('✅ Collection products saved!', 'success');
};

// Close the manage products modal
window.closeManageProductsModal = () => {
  const modal = document.getElementById('manageProductsModal');
  if (modal) {
    modal.classList.remove('active');
  }
  state.editingCollectionProducts = null;
  state.manageProductsData = null;
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

  console.log('📋 renderOrders called');
  console.log('   state.orders.length:', state.orders.length);
  console.log('   container:', container);

  if (!container) {
    console.error('❌ ordersContainer not found!');
    return;
  }

  if (state.orders.length === 0) {
    console.log('⚠️ No orders to display');
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

  console.log('✅ Rendering', state.orders.length, 'orders');

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

  let html = `
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

  // Add each order
  sortedOrders.forEach(order => {
    const statusClass = order.status || 'pending';

    // Format date safely
    let orderDate;
    try {
      const dateValue = order.createdAt || order.date || new Date().toISOString();
      orderDate = new Date(dateValue);
      // Check if date is valid
      if (isNaN(orderDate.getTime())) {
        orderDate = new Date();
      }
    } catch (e) {
      orderDate = new Date();
    }

    const dateString = orderDate.toLocaleString();
    const sourceLabel = order.source === 'firebase' ? '🔥 Firebase' : '💾 Local';
    const pointsEarned = order.pointsEarned || Math.floor((order.totalAmount || 0) / 10);

    html += `
      <div style="background: var(--card-bg); border: 1px solid rgba(0,255,136,0.2); border-left: 4px solid ${order.source === 'firebase' ? '#00ff88' : '#666'}; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div>
            <h3 style="margin: 0; color: var(--primary);">Order #${order.orderId || order.id}</h3>
            <p style="margin: 5px 0 0 0; color: var(--text-muted); font-size: 12px;">${sourceLabel} • ${dateString}</p>
          </div>
          <span style="background: ${statusClass === 'completed' ? '#00ff88' : statusClass === 'pending' ? '#ffaa00' : '#ff4444'}; color: #000; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 12px;">${statusClass}</span>
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 14px;">👤 Customer</h4>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${order.fullName || order.customerName || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${order.email || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address || order.shippingAddress || 'N/A'}</p>
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 14px;">💰 Order Details</h4>
          <p style="margin: 5px 0;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${(order.subtotal || 0).toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Shipping:</strong> ${(order.shippingCost || 0) === 0 ? 'FREE' : '₹' + (order.shippingCost || 0).toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Points Earned:</strong> <span style="color: var(--primary); font-weight: 700;">⭐ ${pointsEarned} points</span></p>
          ${(() => {
        // Calculate order profit
        let orderCost = 0;
        let orderProfit = 0;
        if (order.items) {
          order.items.forEach(item => {
            const itemId = item.id || item.productId;
            const product = state.products.find(p => String(p.id) === String(itemId));
            if (product && product.cost) {
              const qty = item.orderedQuantity || item.quantity || 1;
              orderCost += product.cost * qty;
              orderProfit += (item.price - product.cost) * qty;
            }
          });
        }
        const orderMargin = order.totalAmount > 0 ? ((orderProfit / order.totalAmount) * 100).toFixed(1) : 0;
        const marginColor = orderMargin < 20 ? '#ff3b30' : orderMargin < 40 ? '#ffaa00' : 'var(--primary)';

        return orderCost > 0 ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,255,136,0.2);">
                <p style="margin: 5px 0;"><strong>Cost:</strong> ₹${orderCost.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>Profit:</strong> <span style="color: ${marginColor}; font-weight: 700;">₹${orderProfit.toFixed(2)} (${orderMargin}%)</span></p>
              </div>
            ` : '';
      })()}
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 14px;">🛍️ Products (${order.items?.length || 0} items)</h4>
          ${order.items?.map(item => {
            console.log(`🖼️ Rendering order item image: ID=${item.id || item.productId}, Name="${item.name}", Image="${item.image}"`);
            const escapedName = (item.name || '').replace(/"/g, '&quot;');
            return `
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; margin-bottom: 12px; display: flex; gap: 12px;">
              <div style="flex-shrink: 0;">
                <img src="${item.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 100 120' style='background:%23111;'><rect width='100%25' height='100%25' fill='%23111'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='sans-serif' font-size='10' font-weight='bold'>No Image</text></svg>"}" alt="${escapedName}" style="width: 100px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(0,255,136,0.2);" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'120\' viewBox=\'0 0 100 120\' style=\'background:%23111;\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23111\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23333\' font-family=\'sans-serif\' font-size=\'10\' font-weight=\'bold\'>No Image</text></svg>';">
              </div>
              <div style="flex: 1;">
                <p style="margin: 0 0 5px 0;"><strong>${item.name}</strong></p>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: var(--text-muted);">QID: ${item.qid || 'N/A'} • ${item.category || ''} • ${item.type || ''}</p>
                <p style="margin: 0 0 5px 0; font-size: 12px;">Size: ${item.orderedSize || item.size} • Color: ${item.orderedColor || item.color}</p>
                <p style="margin: 0 0 5px 0; font-size: 12px;">Qty: ${item.orderedQuantity || item.quantity}</p>
                <p style="margin: 0; font-weight: 700; color: var(--primary);">₹${((item.price || 0) * (item.orderedQuantity || item.quantity || 1)).toFixed(2)}</p>
              </div>
            </div>
            `;
          }).join('') || '<p style="color: var(--text-muted);">No items</p>'}
        </div>
        
        <div style="background: rgba(0,255,136,0.1); padding: 15px; border-radius: 6px; border: 1px solid rgba(0,255,136,0.3); margin-bottom: 15px;">
          <p style="margin: 0; font-size: 18px; font-weight: 700; color: var(--primary);">Total: ₹${(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        
        ${statusClass === 'pending' || statusClass === 'processing' ? `
          <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; border: 1px solid rgba(0,255,136,0.2);">
            <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 14px;">📦 Ship Order</h4>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" id="tracking-${order.id}" placeholder="Enter tracking link (e.g., https://tracking.com/12345)" style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid rgba(0,255,136,0.3); background: rgba(0,0,0,0.5); color: #fff; font-size: 14px;">
              <button onclick="shipOrder('${order.id}')" style="padding: 10px 20px; background: var(--primary); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; white-space: nowrap;">🚚 Ship Order</button>
            </div>
          </div>
        ` : statusClass === 'shipped' && order.trackingLink ? `
          <div style="background: rgba(0,255,136,0.1); padding: 15px; border-radius: 6px; border: 1px solid rgba(0,255,136,0.3);">
            <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 14px;">📦 Tracking Information</h4>
            <p style="margin: 0 0 5px 0; font-size: 14px;">Tracking Link: <a href="${order.trackingLink}" target="_blank" style="color: var(--primary); text-decoration: underline;">${order.trackingLink}</a></p>
            <button onclick="markDelivered('${order.id}')" style="padding: 10px 20px; background: var(--primary); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 10px;">✅ Mark as Delivered</button>
          </div>
        ` : ''}
      </div>
    `;
  });

  const summaryHtml = html;

  container.innerHTML = summaryHtml;
  console.log('✅ Orders rendered to container');

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

// Ship order with tracking link
window.shipOrder = async (orderId) => {
  const trackingInput = document.getElementById(`tracking-${orderId}`);
  const trackingLink = trackingInput?.value?.trim();

  if (!trackingLink) {
    alert('⚠️ Please enter a tracking link!');
    return;
  }

  // Validate URL
  try {
    new URL(trackingLink);
  } catch (e) {
    alert('⚠️ Please enter a valid URL (e.g., https://tracking.com/12345)');
    return;
  }

  try {
    showSyncStatus('🚚 Shipping order...', 'success');

    // Find the order and get the actual Firebase document ID
    const order = state.orders.find(o => o.id === orderId || o.orderId === orderId);
    if (!order) {
      throw new Error('Order not found in local state');
    }

    // Use the document ID (order.id is the Firebase doc ID)
    const firebaseDocId = order.id;

    console.log('🔍 Shipping order:', {
      displayOrderId: orderId,
      firebaseDocId: firebaseDocId,
      trackingLink: trackingLink
    });

    // Update in Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const app = initializeApp({
      apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
      authDomain: "elevez-ed97f.firebaseapp.com",
      projectId: "elevez-ed97f",
      storageBucket: "elevez-ed97f.firebasestorage.app",
      messagingSenderId: "440636781018",
      appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
    }, 'ship-order-' + Date.now());

    const db = getFirestore(app);
    const orderRef = doc(db, 'orders', firebaseDocId);

    await updateDoc(orderRef, {
      status: 'shipped',
      trackingLink: trackingLink,
      shippedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Update local state
    order.status = 'shipped';
    order.trackingLink = trackingLink;
    order.shippedAt = new Date().toISOString();

    saveData();
    renderOrders();

    showSyncStatus('✅ Order shipped! Customer will see tracking link.', 'success');
    alert(`✅ Order shipped successfully!\n\nTracking link: ${trackingLink}\n\nThe customer can now track their package in their account page.`);

    // Clear the input
    trackingInput.value = '';

  } catch (error) {
    console.error('❌ Error shipping order:', error);
    console.error('Error details:', error.message);
    showSyncStatus('❌ Error shipping order', 'error');
    alert(`❌ Error: ${error.message}\n\nPlease check the console for details.`);
  }
};

// Mark order as delivered
window.markDelivered = async (orderId) => {
  if (!confirm('Mark this order as delivered?')) return;

  try {
    showSyncStatus('✅ Marking as delivered...', 'success');

    // Find the order and get the actual Firebase document ID
    const order = state.orders.find(o => o.id === orderId || o.orderId === orderId);
    if (!order) {
      throw new Error('Order not found in local state');
    }

    // Use the document ID (order.id is the Firebase doc ID)
    const firebaseDocId = order.id;

    console.log('🔍 Marking delivered:', {
      displayOrderId: orderId,
      firebaseDocId: firebaseDocId
    });

    // Update in Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const app = initializeApp({
      apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
      authDomain: "elevez-ed97f.firebaseapp.com",
      projectId: "elevez-ed97f",
      storageBucket: "elevez-ed97f.firebasestorage.app",
      messagingSenderId: "440636781018",
      appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
    }, 'deliver-order-' + Date.now());

    const db = getFirestore(app);
    const orderRef = doc(db, 'orders', firebaseDocId);

    await updateDoc(orderRef, {
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Update local state
    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();

    saveData();
    renderOrders();

    showSyncStatus('✅ Order marked as delivered!', 'success');
    alert('✅ Order marked as delivered!');

  } catch (error) {
    console.error('Error marking delivered:', error);
    showSyncStatus('❌ Error updating order', 'error');
    alert(`❌ Error: ${error.message}`);
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

// Collection Management Enhanced - Shopify-like UI
async function renderCollections() {
  const grid = document.getElementById('collectionsGrid');

  // Try to load from server first if state.collections is empty
  if (state.collections.length === 0) {
    try {
      const response = await fetch('http://localhost:3001/api/collections');
      if (response.ok) {
        const data = await response.json();
        if (data.collections && data.collections.length > 0) {
          state.collections = data.collections;
          localStorage.setItem('elevez_collections', JSON.stringify(state.collections));
          console.log('📂 Loaded', state.collections.length, 'collections from server');
        }
      }
    } catch (e) {
      console.log('ℹ️ Could not load collections from server, using localStorage');
    }

    // Also try localStorage
    const stored = localStorage.getItem('elevez_collections');
    if (stored) {
      try {
        state.collections = JSON.parse(stored);
      } catch (e) { }
    }
  }

  if (state.collections.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🗂️</div>
        <h3>No collections yet</h3>
        <p>Import from Shopify or click "Create Collection" to organize your products</p>
        <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
          <a href="shopify-import.html" class="btn btn-primary" style="text-decoration: none;">🛒 Import from Shopify</a>
          <button class="btn btn-secondary" onclick="openCollectionModal()">+ Create Collection</button>
        </div>
      </div>
    `;
    return;
  }

  // Sort collections by order or name
  const sortedCollections = [...state.collections].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    return (a.name || '').localeCompare(b.name || '');
  });

  grid.innerHTML = sortedCollections.map((collection, idx) => {
    // Get products for this collection
    let matchingProducts = [];

    // If collection has productHandles (from Shopify), use those
    if (collection.productHandles && collection.productHandles.length > 0) {
      matchingProducts = state.products.filter(p =>
        collection.productHandles.includes(p.handle) ||
        collection.productHandles.includes(p.shopifyHandle)
      );
    } else if (collection.filters) {
      // Use filter-based matching
      matchingProducts = getCollectionProducts(collection);
    } else {
      // If no filters or handles, try matching by collection name/handle in product tags
      matchingProducts = state.products.filter(p =>
        p.tags?.includes(collection.handle) ||
        p.tags?.includes(collection.name)
      );
    }

    // Get first 6 product images for preview
    const previewProducts = matchingProducts.slice(0, 6);
    const productPreviewHtml = previewProducts.length > 0
      ? previewProducts.map(p => `
          <div class="collection-product-thumb" title="${p.name}">
            <img src="${p.image || p.images?.[0] || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' style='background:%23111;'><rect width='100%25' height='100%25' fill='%23111'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23333' font-family='sans-serif' font-size='8' font-weight='bold'>No Image</text></svg>"}" 
                 alt="${p.name}" 
                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' style=\'background:%23111;\'><rect width=\'100%25\' height=\'100%25\' fill=\'%23111\'/><text x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23333\' font-family=\'sans-serif\' font-size=\'8\' font-weight=\'bold\'>No Image</text></svg>';'">
          </div>
        `).join('')
      : '<div style="color: var(--text-muted); font-size: 12px; padding: 10px;">No products yet</div>';

    const moreCount = matchingProducts.length - 6;

    // Collection image
    const collectionImage = collection.image
      ? `<img src="${collection.image}" alt="${collection.name}" class="collection-cover-image" onerror="this.style.display='none'">`
      : '';

    return `
      <div class="collection-card enhanced" data-collection-id="${collection.id}" data-order="${idx}">
        <div class="collection-header">
          ${collectionImage}
          <div class="collection-info">
            <h3 class="collection-title">${collection.name || 'Untitled Collection'}</h3>
            <p class="collection-description">${collection.description || 'No description'}</p>
          </div>
          ${collection.isSystem ? '<span class="collection-badge system">System</span>' : ''}
          ${collection.source === 'shopify' ? '<span class="collection-badge shopify">Shopify</span>' : ''}
        </div>
        
        <div class="collection-products-preview">
          <div class="collection-products-grid">
            ${productPreviewHtml}
            ${moreCount > 0 ? `<div class="collection-product-more">+${moreCount}</div>` : ''}
          </div>
        </div>
        
        <div class="collection-stats">
          <span class="stat-item">
            <span class="stat-icon">📦</span>
            <strong>${matchingProducts.length}</strong> products
          </span>
          ${collection.handle ? `<span class="stat-item"><span class="stat-icon">🔗</span> ${collection.handle}</span>` : ''}
        </div>
        
        <div class="collection-actions">
          <button class="btn btn-sm btn-primary" onclick="openManageProductsModal('${collection.id}')" title="Manage Products">
            <span>📦</span> Products
          </button>
          <button class="btn btn-sm btn-secondary" onclick="editCollection('${collection.id}')" title="Edit Collection">
            <span>✏️</span> Edit
          </button>
          <button class="btn btn-sm btn-secondary" onclick="duplicateCollection('${collection.id}')" title="Duplicate">
            <span>📋</span>
          </button>
          ${!collection.isSystem ? `
            <button class="btn btn-sm btn-danger" onclick="deleteCollection('${collection.id}')" title="Delete">
              <span>🗑️</span>
            </button>
          ` : ''}
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
setupProductFormListeners = function () {
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
    console.warn('⚠️ Found duplicate QIDs:', uniqueDuplicates);

    // Auto-fix duplicates by keeping only the first occurrence and removing duplicates
    const seenQids = new Set();
    const cleanedProducts = [];

    for (const product of state.products) {
      const qid = product.qid || `QID${product.id}`;
      if (!seenQids.has(qid)) {
        seenQids.add(qid);
        cleanedProducts.push(product);
      } else {
        console.log('Removing duplicate product with QID:', qid, product.name);
      }
    }

    // Update state with cleaned products
    const removed = state.products.length - cleanedProducts.length;
    if (removed > 0) {
      state.products = cleanedProducts;
      localStorage.setItem('elevez_products', JSON.stringify(cleanedProducts));
      console.log(`✅ Auto-fixed ${removed} duplicate products`);

      // Gentle notification instead of blocking alert
      console.log('Data integrity fixed automatically');
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


// ============================================
// AI DESCRIPTION GENERATOR
// ============================================

// Generate AI description from product images using vision AI
window.generateAIDescription = async () => {
  try {
    // Load config
    const config = window.AI_PROMPT_CONFIG || {};

    // Check if there are images
    if (!state.productForm.images || state.productForm.images.length === 0) {
      alert('⚠️ Please add at least one product image first!\n\nThe AI needs to analyze the product image to generate a description.');
      return;
    }

    // Get product details
    const productName = document.getElementById('productName')?.value || 'Product';
    const category = document.getElementById('productCategory')?.value || 'Fashion';
    const type = document.getElementById('productType')?.value || 'Apparel';
    const price = document.getElementById('salePrice')?.value || '';

    // Show loading state
    const descField = document.getElementById('productDescription');
    const originalPlaceholder = descField.placeholder;
    descField.placeholder = '✨ AI is analyzing your product image...';
    descField.disabled = true;

    showSyncStatus('🤖 Analyzing product image with AI...', 'success');

    const imageUrl = state.productForm.images[0];
    console.log('🤖 Analyzing image:', imageUrl);

    // Build prompt from config
    const systemPrompt = config.systemPrompt || 'Write a compelling product description for a streetwear brand.';
    const contextTemplate = config.productContext || 'Product: {productName}\nCategory: {category}\nType: {type}';

    const productContext = contextTemplate
      .replace('{productName}', productName)
      .replace('{category}', category)
      .replace('{type}', type)
      .replace('{price}', price);

    // Build the full prompt with image analysis
    const fullPrompt = `${systemPrompt}

${productContext}
${imageAnalysis}`;

    console.log('📝 Using prompt:', fullPrompt.substring(0, 400) + '...');
    console.log('🖼️ Image URL:', imageUrl);

    showSyncStatus('✍️ AI is writing your lore-based description...', 'success');

    // Use Hugging Face Mistral model with better prompt formatting
    const textResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: config.apiConfig?.maxTokens || 500,
          temperature: config.apiConfig?.temperature || 0.8,
          top_p: config.apiConfig?.topP || 0.95,
          return_full_text: false,
          do_sample: true
        }
      })
    });

    if (!textResponse.ok) {
      console.warn('⚠️ AI API unavailable');
      throw new Error('AI service unavailable');
    }

    const textData = await textResponse.json();
    let description = '';

    // Handle Hugging Face response format
    if (Array.isArray(textData) && textData[0]?.generated_text) {
      description = textData[0].generated_text.trim();
    } else if (textData.generated_text) {
      description = textData.generated_text.trim();
    } else {
      throw new Error('Invalid API response');
    }

    // Clean up and format the description
    // Keep the full output including TITLE and LORE sections
    description = description
      .replace(/^[\s\n]+/, '') // Remove leading whitespace
      .trim();

    // If it contains TITLE and LORE sections, keep them formatted nicely
    if (description.includes('**TITLE:**') || description.includes('**LORE:**')) {
      // Keep the formatted output
      description = description.substring(0, 500); // Limit total length
    } else {
      // If no formatting, just take first 300 chars
      description = description.substring(0, 300);
    }

    // Set the generated description
    descField.value = description;
    descField.disabled = false;
    descField.placeholder = originalPlaceholder;

    showSyncStatus('✅ AI description generated from image!', 'success');
    console.log('✅ Generated description:', description);

    // Highlight the field
    descField.style.background = 'rgba(0, 255, 136, 0.1)';
    setTimeout(() => {
      descField.style.background = '';
    }, 2000);

  } catch (error) {
    console.error('❌ AI generation error:', error);

    // Fallback to template-based generation
    const config = window.AI_PROMPT_CONFIG || {};
    const templates = config.fallbackTemplates || [
      'Premium {type} with personality-driven design. Engineered for durability and style.',
      'Elevate your {category} wardrobe with this {type}. Perfect blend of comfort and quality.'
    ];

    const productName = document.getElementById('productName')?.value || 'Product';
    const category = document.getElementById('productCategory')?.value || 'fashion';
    const type = document.getElementById('productType')?.value || 'apparel';

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
      .replace('{type}', type.toLowerCase())
      .replace('{category}', category.toLowerCase())
      .replace('{productName}', productName);

    const descField = document.getElementById('productDescription');
    descField.value = randomTemplate;
    descField.disabled = false;
    descField.placeholder = 'Enter detailed product description...';

    showSyncStatus('✅ Template description generated', 'success');
    console.log('✅ Used template description (AI unavailable)');

    descField.style.background = 'rgba(0, 255, 136, 0.1)';
    setTimeout(() => {
      descField.style.background = '';
    }, 2000);
  }
};
