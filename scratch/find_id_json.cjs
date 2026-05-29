const fs = require('fs');

try {
  const content = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(content);
  const products = db.products || [];
  const product = products.find(p => p.id === 14);
  console.log('Product 14 details from backup.json:', JSON.stringify(product, null, 2));
} catch (e) {
  console.error('Error:', e);
}
