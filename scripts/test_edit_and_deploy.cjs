const fs = require('fs');
const path = require('path');

async function testEditAndDeploy() {
  console.log('🧪 Starting Simulation of Edit & Deploy...');
  
  // 1. Fetch current data from backend server API
  console.log('   Fetching products from server API...');
  const res = await fetch('http://localhost:3001/api/sync-from-constants');
  if (!res.ok) {
    throw new Error('Failed to fetch from server API');
  }
  const currentData = await res.json();
  console.log(`   Fetched ${currentData.products.length} products successfully.`);

  // Find a shopify product to edit
  const originalProducts = JSON.parse(JSON.stringify(currentData.products));
  const productToEdit = currentData.products.find(p => p.id === 2); // Vintage Crop Top
  if (!productToEdit) {
    throw new Error('Could not find product with ID 2 (Vintage Crop Top) to edit');
  }

  const originalName = productToEdit.name;
  const originalPrice = productToEdit.price;
  console.log(`   Found product: "${originalName}" with price: ${originalPrice}`);

  // 2. Modify the product name and price
  productToEdit.name = "Vintage Crop Top (Test Edit)";
  productToEdit.price = 999; // Set high test price

  // 3. Post the update to /update-constants
  console.log('   Sending POST to /update-constants with edited product...');
  const updateRes = await fetch('http://localhost:3001/update-constants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: currentData.products,
      collections: currentData.collections,
      tags: currentData.tags,
      categories: currentData.categories,
      types: currentData.types,
      colors: currentData.colors
    })
  });

  if (!updateRes.ok) {
    throw new Error('Failed to post to /update-constants');
  }
  const updateResult = await updateRes.json();
  console.log('   Update result from server:', updateResult);

  // 4. Verify constants.ts has the test name
  const constantsPath = path.join(__dirname, '..', 'constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  if (constantsContent.includes("Vintage Crop Top (Test Edit)") && constantsContent.includes("999")) {
    console.log('   ✅ Verification SUCCESS: constants.ts was successfully updated with the test edit!');
  } else {
    throw new Error('constants.ts did not contain the updated name/price');
  }

  // 5. Revert the changes to keep constants.ts pristine
  console.log('   Reverting test changes back to original state...');
  productToEdit.name = originalName;
  productToEdit.price = originalPrice;

  const revertRes = await fetch('http://localhost:3001/update-constants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: originalProducts,
      collections: currentData.collections,
      tags: currentData.tags,
      categories: currentData.categories,
      types: currentData.types,
      colors: currentData.colors
    })
  });

  if (!revertRes.ok) {
    throw new Error('Failed to revert changes via /update-constants');
  }
  console.log('   ✅ Revert SUCCESS: constants.ts restored to original state!');
}

testEditAndDeploy().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
