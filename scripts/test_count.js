const fs = require('fs');
const path = require('path');

const constantsPath = path.join(__dirname, '..', 'constants.ts');
const content = fs.readFileSync(constantsPath, 'utf8');

// Find export const PRODUCTS
const startMatch = content.match(/export const PRODUCTS:\s*Product\[\]\s*=\s*\[/);
if (!startMatch) {
  console.log('Could not find PRODUCTS array start');
  process.exit(1);
}

const startIndex = startMatch.index + startMatch[0].length - 1; // start of '['

// Let's count matching brackets to extract the exact array string
let openBrackets = 0;
let endIndex = -1;
for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '[') openBrackets++;
  else if (content[i] === ']') {
    openBrackets--;
    if (openBrackets === 0) {
      endIndex = i;
      break;
    }
  }
}

if (endIndex === -1) {
  console.log('Could not find matching closing bracket for PRODUCTS array');
  process.exit(1);
}

const arrayStr = content.substring(startIndex, endIndex + 1);

// We have the array string. Let's write a simple evaluator or parser.
// Since it is valid JS/TS literal (except type annotations which shouldn't be inside the array), 
// we can evaluate it using a safe sandbox or a quick function construction.
try {
  const products = eval(arrayStr);
  console.log('Successfully parsed products count:', products.length);
  console.log('Product IDs and Names:');
  products.forEach((p, index) => {
    console.log(`${index + 1}. [ID: ${p.id}] [QID: ${p.qid}] - ${p.name} (${p.source || 'default'})`);
  });
} catch (e) {
  console.log('Error evaluating array string:', e.message);
  // Fallback to regex counting
  const idMatches = [...arrayStr.matchAll(/"id":\s*(\d+)/g)].map(m => m[1]);
  const nameMatches = [...arrayStr.matchAll(/"name":\s*"([^"]+)"/g)].map(m => m[1]);
  console.log('Regex counting fallback:');
  console.log('Found IDs:', idMatches.length);
  console.log('Found Names:', nameMatches.length);
}
