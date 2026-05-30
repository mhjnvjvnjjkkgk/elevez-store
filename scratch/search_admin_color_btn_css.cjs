const fs = require('fs');
const path = require('path');

const adminCssPath = path.join(__dirname, '../admin-panel/admin.css');
const content = fs.readFileSync(adminCssPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for ".color-btn" in admin.css ---');
lines.forEach((line, index) => {
  if (line.includes('color-btn') || line.includes('color-swatch')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
