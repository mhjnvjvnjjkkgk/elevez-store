const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '../data/backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const products = backupData.products || [];

console.log('ID\tCategory\tType\tName\tTags');
products.forEach(p => {
  console.log(`${p.id}\t${p.category}\t${p.type}\t${p.name.slice(0, 40)}\t${(p.tags || []).join(', ')}`);
});
