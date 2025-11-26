// DEBUG ORDERS - Run this in admin panel console (F12)

(async function debugOrders() {
  console.log('🔍 Starting debug...');
  console.log('=====================================');
  
  // Step 1: Check state
  console.log('1️⃣ Checking state.orders...');
  console.log('   state.orders exists:', typeof state !== 'undefined' && typeof state.orders !== 'undefined');
  console.log('   state.orders.length:', state?.orders?.length || 0);
  console.log('   state.orders:', state?.orders);
  
  // Step 2: Check localStorage
  console.log('\n2️⃣ Checking localStorage...');
  const localOrders = localStorage.getItem('elevez_orders');
  const parsedOrders = localOrders ? JSON.parse(localOrders) : [];
  console.log('   localStorage orders:', parsedOrders.length);
  console.log('   localStorage data:', parsedOrders);
  
  // Step 3: Check if renderOrders function exists
  console.log('\n3️⃣ Checking renderOrders function...');
  console.log('   renderOrders exists:', typeof renderOrders === 'function');
  
  // Step 4: Check current view
  console.log('\n4️⃣ Checking current view...');
  console.log('   state.currentView:', state?.currentView);
  console.log('   Orders view element:', document.getElementById('orders-view'));
  console.log('   Orders container:', document.getElementById('ordersContainer'));
  
  // Step 5: Force load orders from Firebase
  console.log('\n5️⃣ Force loading from Firebase...');
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const app = initializeApp({
      apiKey: "AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw",
      authDomain: "elevez-ed97f.firebaseapp.com",
      projectId: "elevez-ed97f",
      storageBucket: "elevez-ed97f.firebasestorage.app",
      messagingSenderId: "440636781018",
      appId: "1:440636781018:web:24d9b6d31d5aee537850e3"
    }, 'debug-' + Date.now());
    
    const db = getFirestore(app);
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);
    
    console.log('   Firebase orders found:', snapshot.size);
    
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderId: doc.id,
        ...data,
        source: 'firebase',
        pointsEarned: data.pointsEarned || Math.floor((data.totalAmount || 0) / 10)
      });
    });
    
    console.log('   Processed orders:', orders);
    
    // Step 6: Update state
    console.log('\n6️⃣ Updating state...');
    state.orders = orders;
    localStorage.setItem('elevez_orders', JSON.stringify(orders));
    console.log('   state.orders updated:', state.orders.length);
    
    // Step 7: Try to render
    console.log('\n7️⃣ Attempting to render...');
    
    if (typeof renderOrders === 'function') {
      console.log('   Calling renderOrders()...');
      renderOrders();
      console.log('   ✅ renderOrders() called');
    } else {
      console.error('   ❌ renderOrders function not found!');
    }
    
    // Step 8: Check if orders were rendered
    console.log('\n8️⃣ Checking if orders rendered...');
    const container = document.getElementById('ordersContainer');
    console.log('   Container innerHTML length:', container?.innerHTML?.length || 0);
    console.log('   Container has content:', (container?.innerHTML?.length || 0) > 100);
    
    // Step 9: Force switch to orders view
    console.log('\n9️⃣ Forcing switch to orders view...');
    if (typeof switchView === 'function') {
      switchView('orders');
      console.log('   ✅ Switched to orders view');
    }
    
    console.log('\n=====================================');
    console.log('🎉 DEBUG COMPLETE!');
    console.log('=====================================');
    console.log('\nIf orders still don\'t show, check:');
    console.log('1. Is the Orders tab active? (green highlight)');
    console.log('2. Is the orders-view div visible?');
    console.log('3. Are there any red errors above?');
    
    alert(`✅ Debug complete!\n\nFound ${orders.length} orders.\n\nCheck console for details.\n\nOrders should now display!`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    alert(`❌ Error: ${error.message}\n\nCheck console for details.`);
  }
})();
