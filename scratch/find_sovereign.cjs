const fs = require('fs');

try {
  const content = fs.readFileSync('constants.ts', 'utf8');
  const term = 'The Sovereign Serpent';
  const idx = content.indexOf(term);
  if (idx !== -1) {
    // Search backward for ID
    const contextBefore = content.substring(idx - 1000, idx);
    const idMatches = [...contextBefore.matchAll(/"id":\s*(\d+)/g)];
    const lastId = idMatches.length > 0 ? idMatches[idMatches.length - 1][1] : 'Not found';
    console.log('ID found before Sovereign Serpent:', lastId);

    // Search forward for colors
    const contextAfter = content.substring(idx, idx + 1000);
    const colorsMatch = contextAfter.match(/"colors":\s*\[([\s\S]*?)\]/);
    console.log('Colors found after Sovereign Serpent:', colorsMatch ? colorsMatch[0] : 'Not found');
  } else {
    console.log('Sovereign Serpent not found in constants.ts');
  }
} catch (e) {
  console.error('Error:', e);
}
