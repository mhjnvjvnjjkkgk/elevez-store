const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const content = fs.readFileSync(adminJsPath, 'utf8');
const lines = content.split('\n');

console.log('--- Matches for DomContentLoaded/init in admin.js ---');
lines.forEach((line, index) => {
  if (line.includes('DOMContentLoaded') || line.includes('window.onload') || line.includes('function init') || line.includes('initDashboard') || line.includes('initColor')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
