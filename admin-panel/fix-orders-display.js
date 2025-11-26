// Fix Orders Display - Comprehensive Solution
// This script ensures orders are properly synced and displayed in the admin panel

console.log('🔧 Orders Display Fix Script Loaded');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
  authDomain: "elevez-ed97f.firebaseapp.com",
  projectId: "elevez-ed97f",
  storageBucket: "elevez-ed97f.firebasestorage.app",
  messagingSenderId: "440636781018",
  appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
};

let fixDb = null;

// Initialize Firebase for fix script
async function initFixFirebase() {
  try {
    console.log('🔄 Fix Script: Initializing Firebase...');
    
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const app = initializeApp(firebaseConfig, 'fix-orders-app');
    fixDb = getFirestore(app);
    
    console.log('✅ Fix Script: Firebase initialized');
    return true;
  } catch (error) {
    console.error('❌ Fix Script: Firebase initialization failed:', error);
    return false;
  }
}

// Force sync orders from Firebase
async function forceOrdersSync() {
  console.log('🔄 Force syncing orders from Firebase...');
  
  if (!fixDb) {
    const initialized = await initFixFirebase();
    if (!initialized) {
      console.error('❌ Cannot initialize Firebase');
      if (typeof showSyncStatus === 'function') {
        showSyncStatus('❌ Cannot connect to Firebase', 'error');
      }
      return false;
    }
  }
  
  try {
    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    console.log('📥 Fetching orders from Firebase...');
    const ordersRef = collection(fixDb, 'orders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);
    
    const firebaseOrders = [];
    snapshot.forEach((doc) => {
      const orderData = doc.data();
      
      // Enrich order with full product details
      const enrichedItems = orderData.items?.map(item => {
        // Try to get product details from state
        let productDetails = null;
        if (typeof state !== 'undefined' && state.products) {
          productDetails = state.products.find(p => p.id === item.id);
        }
        
        // If not found, use trial products or basic info
        if (!productDetails) {
          productDetails = {
            id: item.id,
            qid: item.qid || `UNKNOWN-${item.id}`,
            name: item.name || "Unknown Product",
            price: item.price || 0,
            image: item.image || "https://via.placeholder.com/200x250?text=No+Image",
            category: item.category || '',
            type: item.type || ''
          };
        }
        
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
      
      firebaseOrders.push({
        id: doc.id,
        orderId: doc.id,
        ...orderData,
        items: enrichedItems,
        source: 'firebase',
        status: orderData.status || 'pending',
        createdAt: orderData.createdAt || new Date().toISOString(),
        pointsEarned: pointsEarned
      });
    });
    
    console.log(`📦 Found ${firebaseOrders.length} orders in Firebase`);
    
    // Update state if available
    if (typeof state !== 'undefined') {
      // Remove old Firebase orders
      const localOrders = state.orders.filter(o => o.source !== 'firebase');
      
      // Merge with new Firebase orders
      state.orders = [...firebaseOrders, ...localOrders];
      
      console.log(`✅ Updated state.orders: ${state.orders.length} total orders`);
      console.log(`   - ${firebaseOrders.length} from Firebase`);
      console.log(`   - ${localOrders.length} local orders`);
      
      // Save to localStorage
      localStorage.setItem('elevez_orders', JSON.stringify(state.orders));
      console.log('💾 Saved to localStorage');
      
      // Update UI
      if (typeof updateOrdersBadge === 'function') {
        updateOrdersBadge();
      }
      
      if (typeof renderOrders === 'function' && state.currentView === 'orders') {
        renderOrders();
        console.log('🎨 Rendered orders view');
      }
      
      // Show success notification
      if (typeof showSyncStatus === 'function') {
        const pendingCount = firebaseOrders.filter(o => o.status === 'pending').length;
        showSyncStatus(`✅ Synced ${firebaseOrders.length} orders (${pendingCount} pending)`, 'success');
      }
      
      return true;
    } else {
      console.error('❌ state object not available');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error syncing orders:', error);
    if (typeof showSyncStatus === 'function') {
      showSyncStatus(`❌ Sync failed: ${error.message}`, 'error');
    }
    return false;
  }
}

// Check orders status
function checkOrdersStatus() {
  console.log('🔍 Checking orders status...');
  
  // Check localStorage
  const localOrders = localStorage.getItem('elevez_orders');
  const localOrdersArray = localOrders ? JSON.parse(localOrders) : [];
  console.log(`📦 LocalStorage: ${localOrdersArray.length} orders`);
  
  // Check state
  if (typeof state !== 'undefined') {
    console.log(`📊 State: ${state.orders.length} orders`);
    
    const firebaseOrders = state.orders.filter(o => o.source === 'firebase');
    const localOnlyOrders = state.orders.filter(o => o.source !== 'firebase');
    
    console.log(`   - ${firebaseOrders.length} from Firebase`);
    console.log(`   - ${localOnlyOrders.length} local only`);
    
    if (state.orders.length === 0) {
      console.warn('⚠️ No orders in state! Attempting to load from localStorage...');
      
      if (localOrdersArray.length > 0) {
        state.orders = localOrdersArray;
        console.log(`✅ Loaded ${state.orders.length} orders from localStorage`);
        
        if (typeof renderOrders === 'function' && state.currentView === 'orders') {
          renderOrders();
        }
      } else {
        console.warn('⚠️ No orders in localStorage either. Syncing from Firebase...');
        forceOrdersSync();
      }
    }
  } else {
    console.error('❌ state object not available');
  }
}

// Auto-fix on load
setTimeout(() => {
  console.log('🔧 Running auto-fix...');
  checkOrdersStatus();
}, 2000);

// Export functions
window.forceOrdersSync = forceOrdersSync;
window.checkOrdersStatus = checkOrdersStatus;

console.log('✅ Orders Display Fix Script Ready');
console.log('💡 Available commands:');
console.log('   - forceOrdersSync() - Force sync from Firebase');
console.log('   - checkOrdersStatus() - Check current status');
