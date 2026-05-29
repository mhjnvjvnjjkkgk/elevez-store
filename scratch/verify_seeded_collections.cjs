const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, '../constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

console.log('Men Collection in constants.ts:', content.includes('"id": "men"'));
console.log('Women Collection in constants.ts:', content.includes('"id": "women"'));

// Let's print out the COLLECTIONS array in constants.ts
const lines = content.split('\n');
let collectionsStart = -1;
let collectionsEnd = -1;
lines.forEach((line, index) => {
  if (line.includes('export const COLLECTIONS =')) {
    collectionsStart = index;
  }
  if (collectionsStart !== -1 && collectionsEnd === -1 && index > collectionsStart && line.startsWith('];')) {
    collectionsEnd = index;
  }
});

if (collectionsStart !== -1 && collectionsEnd !== -1) {
  console.log('COLLECTIONS in constants.ts:');
  console.log(lines.slice(collectionsStart, collectionsEnd + 1).join('\n'));
} else {
  console.log('Could not find COLLECTIONS array block');
}
