const fs = require('fs');

try {
  const content = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(content);
  const products = db.products || [];
  const p14 = products.find(p => p.id === 14 || String(p.id) === '14' || p.shopifyId === '14' || p.handle === '14' || p.shopifyHandle === '14');
  console.log('Product with id or handle 14:', JSON.stringify(p14, null, 2));
} catch (e) {
  console.error('Error:', e);
}
