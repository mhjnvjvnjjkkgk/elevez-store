const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '../data/backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const products = backupData.products || [];

console.log('Total products:', products.length);

const categories = {};
products.forEach(p => {
  if (!categories[p.category]) categories[p.category] = [];
  categories[p.category].push(p);
});

for (const cat in categories) {
  console.log(`\nCategory: ${cat} (${categories[cat].length} products)`);
  categories[cat].forEach(p => {
    console.log(`  - [${p.id}] ${p.name} (Type: ${p.type}, Tags: ${p.tags?.join(', ')})`);
  });
}
