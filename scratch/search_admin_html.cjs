const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../admin-panel/index.html');
const content = fs.readFileSync(indexHtmlPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches in index.html ---');
lines.forEach((line, index) => {
  if (line.includes('productCategory') || line.includes('collectionCategory') || line.includes('id="collections"') || line.includes('nav-collections')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
