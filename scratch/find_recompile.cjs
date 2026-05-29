const fs = require('fs');
const path = require('path');

const adminServerJsPath = path.join(__dirname, '../scripts/admin-server.js');
const content = fs.readFileSync(adminServerJsPath, 'utf8');
const lines = content.split('\n');

// Find recompileConstants function
let startLine = -1;
let endLine = -1;
lines.forEach((line, index) => {
  if (line.includes('function recompileConstants') || line.includes('const recompileConstants =')) {
    startLine = index + 1;
  }
  if (startLine !== -1 && endLine === -1 && index + 1 > startLine && line.startsWith('}')) {
    endLine = index + 1;
  }
});

console.log(`recompileConstants defined at lines ${startLine} - ${endLine}`);
if (startLine !== -1 && endLine !== -1) {
  console.log(lines.slice(startLine - 5, endLine + 10).join('\n'));
} else {
  // Just print any lines matching 'recompileConstants'
  lines.forEach((line, index) => {
    if (line.includes('recompileConstants')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}
