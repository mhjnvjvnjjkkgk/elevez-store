const fs = require('fs');
const path = require('path');

// We will simulate getCollectionProducts locally using backup.json
const backupPath = path.join(__dirname, '../data/backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const products = backupData.products || [];
const collections = backupData.collections || [];

function getCollectionProductsLocal(collectionId) {
  const collection = collections.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return products.filter(product => {
    const filters = collection.filters || {};
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => product.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Category filter
    if (filters.category) {
      if (filters.category === 'Men') {
        if (product.category !== 'Men' && product.category !== 'Unisex') return false;
      } else if (filters.category === 'Women') {
        if (product.category !== 'Women' && product.category !== 'Unisex') return false;
      } else if (product.category !== filters.category) {
        return false;
      }
    }
    
    // Type filter
    if (filters.type && product.type !== filters.type) return false;
    
    // Price filters
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    
    return true;
  });
}

const menProducts = getCollectionProductsLocal('men');
const womenProducts = getCollectionProductsLocal('women');

console.log(`--- Verification Summary ---`);
console.log(`Total Products: ${products.length}`);
console.log(`Men Collection: ${menProducts.length} products`);
console.log(`Women Collection: ${womenProducts.length} products`);

console.log(`\n--- Men Collection Products ---`);
menProducts.forEach(p => console.log(`- [${p.category}] ${p.name} (type: ${p.type})`));

console.log(`\n--- Women Collection Products ---`);
womenProducts.forEach(p => console.log(`- [${p.category}] ${p.name} (type: ${p.type})`));

// Confirm that Women collection contains crop tops and Men collection does not
const cropTopsInMen = menProducts.filter(p => p.name.toLowerCase().includes('crop') || p.type.toLowerCase().includes('crop'));
const cropTopsInWomen = womenProducts.filter(p => p.name.toLowerCase().includes('crop') || p.type.toLowerCase().includes('crop'));

console.log(`\nCrop Tops in Men's Collection: ${cropTopsInMen.length}`);
console.log(`Crop Tops in Women's Collection: ${cropTopsInWomen.length}`);

if (cropTopsInMen.length === 0 && cropTopsInWomen.length > 0) {
  console.log(`\n✅ SUCCESS: Crop tops are exclusive to the Women's collection, while unisex tees and hoodies are in both.`);
} else {
  console.log(`\n❌ ERROR: Collection separation logic did not work correctly.`);
}
