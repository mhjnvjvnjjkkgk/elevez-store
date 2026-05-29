const fs = require('fs');

try {
  const content = fs.readFileSync('constants.ts', 'utf8');
  
  // Find all products by matching objects inside the PRODUCTS array
  const idMatches = [...content.matchAll(/"id":\s*(\d+)/g)];
  console.log('Found ID matches count:', idMatches.length);
  
  // Let's print the first 20 IDs found
  idMatches.slice(0, 30).forEach((match, idx) => {
    console.log(`ID ${idx + 1}: ${match[1]}`);
  });

  // Find Sovereign Serpent details in constants.ts
  const sovIndex = content.indexOf('The Sovereign Serpent');
  if (sovIndex !== -1) {
    const context = content.substring(sovIndex - 1000, sovIndex + 1000);
    const idMatch = context.match(/"id":\s*(\d+)/);
    console.log('Sovereign Serpent ID near string:', idMatch ? idMatch[1] : 'Not found');
  }

  // Check backup.json
  const backupContent = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(backupContent);
  const products = db.products || [];
  console.log('Total products in backup.json:', products.length);
  const p14 = products.find(p => p.id === 14 || String(p.id) === '14');
  console.log('Product with ID 14 in backup.json:', p14 ? p14.name : 'None');
  const sovBackup = products.find(p => p.name.includes('Sovereign'));
  console.log('Sovereign in backup.json:', sovBackup ? { id: sovBackup.id, name: sovBackup.name, colors: sovBackup.colors } : 'None');
} catch (e) {
  console.error('Error:', e);
}
