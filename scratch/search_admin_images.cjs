const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const content = fs.readFileSync(adminJsPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for "productForm.images" in admin.js ---');
lines.forEach((line, index) => {
  if (line.includes('productForm.images') || line.includes('productForm') && line.includes('images')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
