const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, '../constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

const lines = content.split('\n');
let start = -1;
let end = -1;
lines.forEach((line, index) => {
  if (line.includes('export function getCollectionProducts')) {
    start = index;
  }
  if (start !== -1 && end === -1 && index > start && line.startsWith('}')) {
    end = index;
  }
});

if (start !== -1 && end !== -1) {
  console.log('Compiled getCollectionProducts in constants.ts:');
  console.log(lines.slice(start, end + 1).join('\n'));
} else {
  console.log('Function not found');
}
