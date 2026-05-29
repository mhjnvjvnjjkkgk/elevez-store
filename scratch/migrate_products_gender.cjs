const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '../data/backup.json');
const collectionsPath = path.join(__dirname, '../data/collections.json');
const publicProductsPath = path.join(__dirname, '../public/data/products.json');
const publicCollectionsPath = path.join(__dirname, '../public/data/collections.json');

if (!fs.existsSync(backupPath)) {
  console.error('Backup path does not exist');
  process.exit(1);
}

// 1. Read files
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const products = backupData.products || [];
let collections = [];
if (fs.existsSync(collectionsPath)) {
  const colParsed = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
  collections = Array.isArray(colParsed) ? colParsed : (colParsed.collections || []);
}

console.log(`Loaded ${products.length} products and ${collections.length} collections.`);

// 2. Migrate products categories
products.forEach(p => {
  const nameLower = (p.name || '').toLowerCase();
  const typeLower = (p.type || '').toLowerCase();
  const tagsLower = (p.tags || []).map(t => t.toLowerCase());

  const isCropTop = typeLower.includes('crop') || nameLower.includes('crop') || nameLower.includes('croptop') || tagsLower.includes('croptop') || tagsLower.includes('crop top');

  if (isCropTop) {
    p.category = 'Women';
  } else {
    // Normal tees, hoodies, oversized tees are Unisex
    p.category = 'Unisex';
  }
});

console.log('Migrated product categories.');

// Ensure categories metadata list has Men, Women, Unisex
backupData.categories = ['Men', 'Women', 'Unisex'];

// 3. Create or update Men and Women collections
// First remove any collections with handle 'men' or 'women' to avoid duplicates
collections = collections.filter(c => c.handle !== 'men' && c.handle !== 'women');

// Calculate matching product handles for Men
const menProducts = products.filter(p => p.category === 'Men' || p.category === 'Unisex');
const menHandles = menProducts.map(p => p.shopifyHandle || p.handle || String(p.id));

// Calculate matching product handles for Women
const womenProducts = products.filter(p => p.category === 'Women' || p.category === 'Unisex');
const womenHandles = womenProducts.map(p => p.shopifyHandle || p.handle || String(p.id));

const menCollection = {
  id: 'men',
  name: 'Men',
  handle: 'men',
  description: 'Men & Unisex Streetwear',
  image: '',
  isSystem: false,
  source: 'generated',
  order: collections.length,
  filters: {
    tags: [],
    category: 'Men',
    type: '',
    minPrice: 0,
    maxPrice: null // Infinity serializes to null in JSON
  },
  productHandles: menHandles,
  productCount: menHandles.length,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

const womenCollection = {
  id: 'women',
  name: 'Women',
  handle: 'women',
  description: 'Women & Unisex Streetwear',
  image: '',
  isSystem: false,
  source: 'generated',
  order: collections.length + 1,
  filters: {
    tags: [],
    category: 'Women',
    type: '',
    minPrice: 0,
    maxPrice: null
  },
  productHandles: womenHandles,
  productCount: womenHandles.length,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString()
};

collections.push(menCollection);
collections.push(womenCollection);

console.log(`Seeded Men collection (${menHandles.length} products) and Women collection (${womenHandles.length} products).`);

// 4. Save updates to all files
backupData.products = products;
backupData.collections = collections;

// Save backup.json
fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
console.log('Saved data/backup.json');

// Save collections.json
fs.writeFileSync(collectionsPath, JSON.stringify({ collections, lastUpdated: new Date().toISOString() }, null, 2), 'utf8');
console.log('Saved data/collections.json');

// Save public/data/products.json
const publicDir = path.dirname(publicProductsPath);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(publicProductsPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Saved public/data/products.json');

// Save public/data/collections.json
fs.writeFileSync(publicCollectionsPath, JSON.stringify(collections, null, 2), 'utf8');
console.log('Saved public/data/collections.json');

// Recompile constants.ts
const adminServerDir = path.join(__dirname, '..');
const adminServerModule = require(path.join(adminServerDir, 'scripts/admin-server.js'));
if (adminServerModule && typeof adminServerModule.recompileConstants === 'function') {
  adminServerModule.recompileConstants(backupData);
  console.log('Recompiled constants.ts via server module.');
} else {
  // If not exported, we will run the server endpoint trigger /update-constants or re-run the server file.
  console.log('Could not recompile directly via module require. Will compile via admin server HTTP request.');
}
