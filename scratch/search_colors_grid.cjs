const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const content = fs.readFileSync(adminJsPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for "renderColorsGrid" in admin.js ---');
lines.forEach((line, index) => {
  if (line.includes('renderColorsGrid') || line.includes('colorsGrid')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
