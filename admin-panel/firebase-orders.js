// Firebase Order Sync for Admin Panel
// This script fetches orders from Firebase and displays them in the admin panel with full product details

// Firebase configuration - using your actual credentials
const firebaseConfig = {
  apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
  authDomain: "elevez-ed97f.firebaseapp.com",
  projectId: "elevez-ed97f",
  storageBucket: "elevez-ed97f.firebasestorage.app",
  messagingSenderId: "440636781018",
  appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
};

// Initialize Firebase
let db = null;
let ordersListener = null;
let isFirebaseAvailable = false;

async function initFirebase() {
  try {
    console.log('🔄 Initializing Firebase for admin panel...');
    
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    console.log('📦 Firebase modules loaded');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseAvailable = true;
    
    console.log('✅ Firebase initialized for admin panel');
    console.log('📊 Project:', firebaseConfig.projectId);
    
    // Show status if function is available
    if (typeof showSyncStatus === 'function') {
      showSyncStatus('✅ Firebase connected - Real-time order sync active', 'success');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Error details:', error.message);
    
    // Show status if function is available
    if (typeof showSyncStatus === 'function') {
      showSyncStatus('⚠️ Firebase unavailable - Using local orders only', 'error');
    }
    
    isFirebaseAvailable = false;
    return false;
  }
}

// Get product details by ID (including trial products)
function getProductDetails(productId) {
  // Check in current products
  let product = state.products.find(p => p.id === productId);
  
  // If not found, check if it's a trial product
  if (!product) {
    const trialProducts = [
      {
        id: 1,
        qid: "NGH-001",
        name: "Neon Glitch Hoodie",
        price: 85,
        originalPrice: 170,
        category: "Men",
        type: "Hoodie",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"
      },
      {
        id: 2,
        qid: "VCT-002",
        name: "Vintage Crop Top",
        price: 45,
        originalPrice: 90,
        category: "Women",
        type: "Crop Top",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"
      },
      {
        id: 3,
        qid: "OST-003",
        name: "Oversized Street Tee",
        price: 35,
        originalPrice: 70,
        category: "Unisex",
        type: "Oversized T-Shirt",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
      }
    ];
    product = trialProducts.find(p => p.id === productId);
  }
  
  return product || {
    id: productId,
    qid: `UNKNOWN-${productId}`,
    name: "Unknown Product",
    price: 0,
    image: "https://via.placeholder.com/200x250?text=No+Image"
  };
}

async function syncOrdersFromFirebase() {
  console.log('🔄 syncOrdersFromFirebase called');
  
  if (!db) {
    console.log('📡 Firebase not initialized, initializing now...');
    const initialized = await initFirebase();
    if (!initialized) {
      console.log('⚠️ Firebase not available, using local orders only');
      return;
    }
  }
  
  try {
    console.log('📥 Setting up Firebase listener for orders...');
    const { collection, onSnapshot, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Listen to orders collection in real-time
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    
    ordersListener = onSnapshot(ordersQuery, (snapshot) => {
      const firebaseOrders = [];
      const newOrders = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // Track new orders for notifications
          newOrders.push(change.doc.id);
        }
      });
      
      snapshot.forEach((doc) => {
        const orderData = doc.data();
        
        // Enrich order with full product details
        const enrichedItems = orderData.items?.map(item => {
          const productDetails = getProductDetails(item.id);
          return {
            ...item,
            ...productDetails,
            orderedQuantity: item.quantity,
            orderedSize: item.size,
            orderedColor: item.color
          };
        }) || [];
        
        // Calculate points earned (10% of total amount, or use existing value)
        const pointsEarned = orderData.pointsEarned || Math.floor((orderData.totalAmount || 0) / 10);
        
        // 🆕 CALCULATE PROFIT AUTOMATICALLY
        let orderCost = 0;
        let orderProfit = 0;
        enrichedItems.forEach(item => {
          const product = state.products.find(p => p.id === item.id);
          if (product && product.cost) {
            const qty = item.orderedQuantity || item.quantity || 1;
            const itemCost = product.cost * qty;
            const itemRevenue = item.price * qty;
            orderCost += itemCost;
            orderProfit += (itemRevenue - itemCost);
          }
        });
        
        const orderProfitMargin = orderData.totalAmount > 0 ? ((orderProfit / orderData.totalAmount) * 100).toFixed(1) : 0;
        
        const enrichedOrder = {
          id: doc.id,
          orderId: doc.id,
          ...orderData,
          items: enrichedItems,
          source: 'firebase',
          status: orderData.status || 'pending',
          createdAt: orderData.createdAt || new Date().toISOString(),
          pointsEarned: pointsEarned,
          // 🆕 Profit data
          orderCost: orderCost,
          orderProfit: orderProfit,
          orderProfitMargin: parseFloat(orderProfitMargin),
          profitCalculatedAt: new Date().toISOString()
        };
        
        firebaseOrders.push(enrichedOrder);
        
        // 🆕 Show notification for NEW orders with profit (only if not already shown)
        if (newOrders.includes(doc.id)) {
          // Check if we've already shown notification for this order
          const shownNotifications = JSON.parse(localStorage.getItem('elevez_shown_notifications') || '[]');
          if (!shownNotifications.includes(doc.id)) {
            showNewOrderNotification(enrichedOrder);
            // Mark as shown
            shownNotifications.push(doc.id);
            localStorage.setItem('elevez_shown_notifications', JSON.stringify(shownNotifications));
          }
        }
      });
      
      console.log(`📦 Synced ${firebaseOrders.length} orders from Firebase`);
      
      // Merge with local orders (remove old firebase orders first)
      const localOrders = state.orders.filter(o => o.source !== 'firebase');
      state.orders = [...firebaseOrders, ...localOrders];
      
      // Save to localStorage
      localStorage.setItem('elevez_orders', JSON.stringify(state.orders));
      
      // Update UI
      if (state.currentView === 'orders') {
        renderOrders();
      }
      updateOrdersBadge();
      
      // Show notification for new orders
      if (firebaseOrders.length > 0) {
        const pendingCount = firebaseOrders.filter(o => o.status === 'pending').length;
        if (pendingCount > 0) {
          showSyncStatus(`🔔 ${pendingCount} new order(s) - Total: ${firebaseOrders.length}`, 'success');
        } else {
          showSyncStatus(`✅ ${firebaseOrders.length} orders synced`, 'success');
        }
      }
    }, (error) => {
      console.error('❌ Firebase sync error:', error);
      showSyncStatus('⚠️ Firebase sync error, using local orders', 'error');
      isFirebaseAvailable = false;
    });
    
  } catch (error) {
    console.error('❌ Error setting up Firebase listener:', error);
    showSyncStatus('⚠️ Could not connect to Firebase', 'error');
    isFirebaseAvailable = false;
  }
}

// Auto-sync orders every 10 seconds for real-time updates
function startAutoSync() {
  console.log('🔄 Starting real-time order sync...');
  
  // Initial sync
  syncOrdersFromFirebase();
  
  // Check connection every 10 seconds
  setInterval(() => {
    if (!isFirebaseAvailable) {
      console.log('🔄 Attempting to reconnect to Firebase...');
      syncOrdersFromFirebase();
    } else {
      console.log('✅ Firebase connection active');
    }
  }, 10000);
}

// Manual refresh function
window.refreshOrders = async () => {
  showSyncStatus('🔄 Refreshing orders...', 'success');
  await syncOrdersFromFirebase();
};

// Export functions and Firebase instance
window.syncOrdersFromFirebase = syncOrdersFromFirebase;
window.startAutoSync = startAutoSync;

// Export Firebase manager for dashboard metrics
window.firebaseOrdersManager = {
  get db() { return db; },
  get isFirebaseAvailable() { return isFirebaseAvailable; },
  initFirebase: initFirebase,
  syncOrdersFromFirebase: syncOrdersFromFirebase
};
