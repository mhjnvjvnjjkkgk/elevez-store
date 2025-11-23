// Complete Fix Script - Run this in browser console on admin panel page
// This will fix all products and sync them to the website

console.log('🔧 Starting Complete Fix...');

// Step 1: Get all products from localStorage
const products = JSON.parse(localStorage.getItem('elevez_products') || '[]');
console.log(`📦 Found ${products.length} products in localStorage`);

// Step 2: Fix image URLs - ensure they're proper URLs
const fixedProducts = products.map(product => {
  // Fix images array
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(img => {
      // If it's a data URL or already a full URL, keep it
      if (img.startsWith('data:') || img.startsWith('http')) {
        return img;
      }
      // If it's a relative path, convert to full URL
      if (img.startsWith('/')) {
        return `http://localhost:5173${img}`;
      }
      // Otherwise, assume it's an Unsplash or external URL
      return img;
    });
  } else {
    // If no images array, create one from the main image
    product.images = [product.image];
  }
  
  // Fix main image
  if (product.image) {
    if (!product.image.startsWith('data:') && !product.image.startsWith('http') && product.image.startsWith('/')) {
      product.image = `http://localhost:5173${product.image}`;
    }
  }
  
  // Ensure all required fields exist
  if (!product.qid) product.qid = `PROD-${product.id}`;
  if (!product.rating) product.rating = 4.5;
  if (!product.sizes) product.sizes = ['S', 'M', 'L', 'XL'];
  if (!product.colors) product.colors = ['Black', 'White'];
  if (!product.tags) product.tags = [];
  
  return product;
});

console.log('✅ Fixed all product image URLs');

// Step 3: Save fixed products back to localStorage
localStorage.setItem('elevez_products', JSON.stringify(fixedProducts));
console.log('✅ Saved fixed products to localStorage');

// Step 4: Sync to constants.ts via admin server
async function syncToWebsite() {
  try {
    console.log('🔄 Syncing to website...');
    
    const response = await fetch('http://localhost:3001/update-constants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: fixedProducts,
        collections: [],
        tags: ["ESSENTIAL", "TRENDING", "PREMIUM", "NEW", "BESTSELLER", "VINTAGE", "COLORFUL"],
        categories: ["Men", "Women", "Unisex"],
        types: ["Hoodie", "T-Shirt", "Crop Top", "Oversized T-Shirt"],
        colors: [
          { "name": "Black", "code": "#000000" },
          { "name": "White", "code": "#FFFFFF" },
          { "name": "Neon Green", "code": "#00ff88" },
          { "name": "Pink", "code": "#FF69B4" },
          { "name": "Gray", "code": "#808080" },
          { "name": "Navy", "code": "#000080" }
        ]
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Synced to constants.ts!', result);
      console.log('🌐 Refresh your website (http://localhost:5173) to see products');
      alert('✅ Complete! Products fixed and synced to website.\n\nRefresh http://localhost:5173 to see all products.');
    } else {
      console.error('❌ Sync failed:', response.statusText);
      alert('❌ Sync failed. Make sure admin server is running on port 3001');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error: ' + error.message + '\n\nMake sure admin server is running: node scripts/admin-server.js');
  }
}

// Step 5: Execute sync
syncToWebsite();

// Step 6: Show summary
console.log('\n📊 Summary:');
console.log(`Total products: ${fixedProducts.length}`);
console.log('Products:', fixedProducts.map(p => `${p.name} (${p.qid})`).join(', '));
console.log('\n✨ All done! Refresh admin panel to see fixed products.');
