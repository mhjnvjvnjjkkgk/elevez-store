const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const indexHtmlPath = path.join(__dirname, '../admin-panel/index.html');

function searchFile(filePath, queries) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n--- Matches in ${path.basename(filePath)} ---`);
  lines.forEach((line, index) => {
    const matched = queries.some(q => line.toLowerCase().includes(q.toLowerCase()));
    if (matched && line.trim().length > 0 && line.trim().length < 150) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}

searchFile(adminJsPath, ['color', 'hex', 'eye', 'dropper', 'picker']);
searchFile(indexHtmlPath, ['color', 'hex', 'eye', 'dropper', 'picker']);
