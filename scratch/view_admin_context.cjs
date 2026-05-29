const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '../admin-panel/admin.js');
const content = fs.readFileSync(adminJsPath, 'utf8');
const lines = content.split('\n');

const lineNumbers = [1037, 2998, 3509, 4082, 4168, 4242, 4575];

lineNumbers.forEach(lineNum => {
  console.log(`\n================ LINE ${lineNum} CONTEXT ================`);
  const start = Math.max(0, lineNum - 10);
  const end = Math.min(lines.length - 1, lineNum + 15);
  for (let i = start; i <= end; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
});
