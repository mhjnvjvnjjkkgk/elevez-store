const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const adminServerJsPath = path.join(__dirname, '../scripts/admin-server.js');
const appTsxPath = path.join(__dirname, '../App.tsx');

function findOccurrences(filePath, term) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n--- Matches for "${term}" in ${path.basename(filePath)} ---`);
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(term.toLowerCase())) {
      console.log(`Line ${index + 1}: ${line.trim().slice(0, 100)}`);
    }
  });
}

findOccurrences(adminJsPath, 'collection');
findOccurrences(adminServerJsPath, 'collection');
findOccurrences(appTsxPath, 'collection');
