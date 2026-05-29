const fs = require('fs');
const path = require('path');

const collectionsPath = path.join(__dirname, '../data/collections.json');
const backupPath = path.join(__dirname, '../data/backup.json');

const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

console.log('--- COLLECTIONS SAMPLE ---');
if (collectionsData.collections && collectionsData.collections.length > 0) {
  console.log(JSON.stringify(collectionsData.collections.slice(0, 3), null, 2));
  console.log('Total collections:', collectionsData.collections.length);
} else {
  console.log('No collections found in list');
}

console.log('\n--- PRODUCTS SAMPLE ---');
const products = backupData.products || [];
console.log('Total products:', products.length);
if (products.length > 0) {
  const categories = new Set();
  const types = new Set();
  const tags = new Set();
  products.forEach(p => {
    if (p.category) categories.add(p.category);
    if (p.type) types.add(p.type);
    if (p.tags) p.tags.forEach(t => tags.add(t));
  });
  console.log('Categories:', Array.from(categories));
  console.log('Types:', Array.from(types));
  console.log('Some tags:', Array.from(tags).slice(0, 20));
  
  console.log('\nSample products (first 3):');
  console.log(JSON.stringify(products.slice(0, 3).map(p => ({
    id: p.id,
    name: p.name,
    handle: p.handle,
    category: p.category,
    type: p.type,
    tags: p.tags,
    price: p.price
  })), null, 2));

  // Let's check crop tops
  const cropTops = products.filter(p => p.name.toLowerCase().includes('crop') || (p.type && p.type.toLowerCase().includes('crop')));
  console.log('\nCrop tops found:', cropTops.length);
  console.log(cropTops.map(p => ({ name: p.name, category: p.category, type: p.type })));
}
