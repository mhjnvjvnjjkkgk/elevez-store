const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, '../App.tsx');
const content = fs.readFileSync(appTsxPath, 'utf8');
const lines = content.split('\n');

console.log('--- Routes in App.tsx ---');
lines.forEach((line, index) => {
  if (line.includes('<Route') || line.includes('path="/shop') || line.includes('useParams')) {
    console.log(`Line ${index + 1}: ${line.trim().slice(0, 120)}`);
  }
});
