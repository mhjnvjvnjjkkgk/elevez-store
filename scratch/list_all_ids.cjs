const fs = require('fs');

try {
  const backupContent = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(backupContent);
  const backupProducts = db.products || [];

  const constantsContent = fs.readFileSync('constants.ts', 'utf8');
  const idMatches = [...constantsContent.matchAll(/"id":\s*(\d+)/g)].map(m => m[1]);
  
  console.log('--- BACKUP.JSON ---');
  backupProducts.forEach((p, idx) => {
    console.log(`${idx}: ID=${p.id}, QID=${p.qid}, Name="${p.name.substring(0, 30)}"`);
  });

  console.log('\n--- CONSTANTS.TS ---');
  // Match product blocks
  const productsMatch = constantsContent.match(/export const PRODUCTS: Product\[\] = ([\s\S]*?);/);
  if (productsMatch) {
    // Just find ID and Name pairings near each other in constants.ts
    const nameMatches = [...constantsContent.matchAll(/"id":\s*(\d+)[\s\S]*?"name":\s*"\\?"([^"]+)"/g)];
    nameMatches.forEach((m, idx) => {
      console.log(`${idx}: ID=${m[1]}, Name="${m[2].substring(0, 30)}"`);
    });
  }
} catch (e) {
  console.error('Error:', e);
}
