// Auto-update constants.ts from admin panel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read data from stdin (sent from admin panel)
let data = '';

process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  try {
    const { products, collections, tags, categories, types } = JSON.parse(data);
    
    const tsCode = `import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Auto-synced from Admin Panel at ${new Date().toLocaleString()}
// Last update: ${new Date().toISOString()}
export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

// Collections - Auto-filtered by tags and criteria
export const COLLECTIONS = ${JSON.stringify(collections, null, 2)};

// Available Tags
export const AVAILABLE_TAGS = ${JSON.stringify(tags, null, 2)};

// Available Categories (Custom)
export const AVAILABLE_CATEGORIES = ${JSON.stringify(categories, null, 2)};

// Available Types (Custom)
export const AVAILABLE_TYPES = ${JSON.stringify(types, null, 2)};

// Helper function to get products for a collection
export function getCollectionProducts(collectionId: string): Product[] {
  const collection = COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return PRODUCTS.filter(product => {
    const filters = collection.filters || {};
    
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag: string) => product.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) return false;
    
    // Type filter
    if (filters.type && product.type !== filters.type) return false;
    
    // Price filters
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    
    return true;
  });
}
`;
    
    // Write to constants.ts
    const constantsPath = path.join(__dirname, 'constants.ts');
    fs.writeFileSync(constantsPath, tsCode, 'utf8');
    
    console.log(JSON.stringify({
      success: true,
      message: 'constants.ts updated successfully',
      products: products.length,
      collections: collections.length,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }));
    process.exit(1);
  }
});
