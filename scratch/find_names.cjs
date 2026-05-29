const fs = require('fs');

try {
  const content = fs.readFileSync('data/backup.json', 'utf8');
  const db = JSON.parse(content);
  const products = db.products || [];
  products.forEach((p, idx) => {
    console.log(`Index ${idx}: ID=${p.id}, QID=${p.qid}, Name="${p.name}", Colors=${JSON.stringify(p.colors)}`);
  });
} catch (e) {
  console.error('Error:', e);
}
