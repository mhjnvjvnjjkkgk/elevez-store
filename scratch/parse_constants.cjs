const fs = require('fs');

try {
  let content = fs.readFileSync('constants.ts', 'utf8');
  // Strip helper function at the end
  const cutoffIndex = content.indexOf('export function getCollectionProducts');
  if (cutoffIndex !== -1) {
    content = content.substring(0, cutoffIndex);
  }
  // Strip import
  content = content.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
  // Strip export const PRODUCTS: Product[] =
  content = content.replace(/export\s+const\s+PRODUCTS\s*:\s*Product\[\]\s*=/g, 'const PRODUCTS =');
  // Strip other exports
  content = content.replace(/export\s+const\s+/g, 'const ');
  // Export PRODUCTS at the end
  content += '\nmodule.exports = { PRODUCTS };';
  
  // Save temporary JS file
  fs.writeFileSync('scratch/temp_constants.cjs', content, 'utf8');
  
  const { PRODUCTS } = require('./temp_constants.cjs');
  console.log('Total products in constants.ts:', PRODUCTS.length);
  PRODUCTS.forEach((p, idx) => {
    console.log(`${idx}: ID=${p.id}, QID=${p.qid}, Name="${p.name}", Colors=${JSON.stringify(p.colors)}`);
  });
  
  // Clean up
  fs.unlinkSync('scratch/temp_constants.cjs');
} catch (e) {
  console.error('Error:', e);
}
