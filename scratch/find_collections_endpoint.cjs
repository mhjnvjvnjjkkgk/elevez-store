const fs = require('fs');
const path = require('path');

const adminServerJsPath = path.join(__dirname, '../scripts/admin-server.js');
const content = fs.readFileSync(adminServerJsPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for "/api/collections" or "/collections" in admin-server.js ---');
lines.forEach((line, index) => {
  if (line.includes('/api/collections') || line.includes('/collections')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
