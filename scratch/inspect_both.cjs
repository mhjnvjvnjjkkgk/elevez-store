const fs = require('fs');

try {
  const content = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(content);
  const products = db.products || [];
  
  console.log('Total products in backup.json:', products.length);
  
  const matches = products.filter(p => p.name.includes('Sovereign') || String(p.id) === '14' || String(p.id) === '1779147469445');
  
  matches.forEach((p, idx) => {
    console.log(`\nMatch ${idx}:`);
    console.log(`ID: ${p.id} (${typeof p.id})`);
    console.log(`QID: ${p.qid}`);
    console.log(`Name: "${p.name}"`);
    console.log(`Colors: ${JSON.stringify(p.colors)}`);
    console.log(`Price: ${p.price}`);
  });
} catch (e) {
  console.error(e);
}
