const fs = require('fs');
const path = require('path');

const collectionsPath = path.join(__dirname, '../data/collections.json');
const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
const collections = collectionsData.collections || [];

console.log('Collections matching men/women:');
collections.forEach(col => {
  const name = col.name.toLowerCase();
  const handle = col.handle.toLowerCase();
  if (name.includes('men') || name.includes('women') || handle.includes('men') || handle.includes('women')) {
    console.log(`- ID: ${col.id}, Name: ${col.name}, Handle: ${col.handle}, Source: ${col.source}, Filters:`, JSON.stringify(col.filters));
  }
});
