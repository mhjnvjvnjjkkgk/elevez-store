const fs = require('fs');

try {
  const content = fs.readFileSync('constants.ts', 'utf8');
  
  // Find where PRODUCTS starts
  const productsMatch = content.match(/export const PRODUCTS: Product\[\] = ([\s\S]*?);/);
  if (!productsMatch) {
    console.log('PRODUCTS array not found');
    process.exit(1);
  }
  
  // Parse products
  const products = eval(productsMatch[1]);
  const product = products.find(p => p.id === 14);
  console.log('Product 14 details:', JSON.stringify(product, null, 2));
} catch (e) {
  console.error('Error:', e);
}
