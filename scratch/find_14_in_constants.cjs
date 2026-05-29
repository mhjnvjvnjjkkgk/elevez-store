const fs = require('fs');

try {
  const content = fs.readFileSync('constants.ts', 'utf8');
  // Let's parse all occurrences
  const matches = [...content.matchAll(/\{\s*"id":\s*(\d+)[\s\S]*?"name":\s*"\\?"The Sovereign Serpent/g)];
  console.log('Found Sovereign matches count:', matches.length);
  matches.forEach((m, idx) => {
    // Find the end of this product block
    let start = m.index;
    let braceCount = 1;
    let end = start + 1;
    while (end < content.length && braceCount > 0) {
      if (content[end] === '{') braceCount++;
      if (content[end] === '}') braceCount--;
      end++;
    }
    console.log(`Match ${idx + 1} ID:`, m[1]);
    console.log(content.substring(start, end));
  });
} catch (e) {
  console.error('Error:', e);
}
