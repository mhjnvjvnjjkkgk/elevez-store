const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const content = fs.readFileSync(adminJsPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for "productHandles" or "saveCollections" in admin.js ---');
lines.forEach((line, index) => {
  if (line.includes('productHandles') || line.includes('saveCollections') || line.includes('api/save-') || line.includes('filters')) {
    if (line.trim().length > 0 && line.trim().length < 150) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  }
});
