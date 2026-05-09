const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = [
  'data/backup.json',
  'public/data/products.json',
  'admin-panel/products-backup.json'
];

files.forEach(f => {
  const filePath = path.join(root, f);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let count = 'unknown';
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data && data.products) {
        count = data.products.length;
      } else {
        count = Object.keys(data).length + ' (generic keys)';
      }
      console.log(`${f} exists, count: ${count}`);
    } catch (e) {
      console.log(`Error parsing ${f}: ${e.message}`);
    }
  } else {
    console.log(`${f} does not exist`);
  }
});
