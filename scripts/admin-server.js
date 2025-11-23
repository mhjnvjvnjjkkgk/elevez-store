// Simple server for admin panel to update constants.ts and handle image uploads
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Created images directory:', imagesDir);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/upload-image') {
    let body = [];
    
    req.on('data', chunk => {
      body.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const boundary = req.headers['content-type'].split('boundary=')[1];
        const bodyBuffer = Buffer.concat(body);
        const bodyString = bodyBuffer.toString('binary');
        
        // Parse multipart form data
        const parts = bodyString.split('--' + boundary);
        
        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data')) {
            const filenameMatch = part.match(/filename="(.+?)"/);
            if (filenameMatch) {
              const filename = filenameMatch[1];
              const contentStart = part.indexOf('\r\n\r\n') + 4;
              const contentEnd = part.lastIndexOf('\r\n');
              const fileContent = part.substring(contentStart, contentEnd);
              
              // Generate unique filename
              const timestamp = Date.now();
              const ext = path.extname(filename);
              const basename = path.basename(filename, ext);
              const uniqueFilename = `${basename}-${timestamp}${ext}`;
              const filepath = path.join(imagesDir, uniqueFilename);
              
              // Write file
              fs.writeFileSync(filepath, fileContent, 'binary');
              
              // Return URL
              const imageUrl = `/images/products/${uniqueFilename}`;
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                url: imageUrl,
                filename: uniqueFilename
              }));
              
              console.log(`✅ Image uploaded: ${uniqueFilename}`);
              return;
            }
          }
        }
        
        throw new Error('No file found in request');
        
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
        console.error('❌ Upload error:', error.message);
      }
    });
  } else if (req.method === 'POST' && req.url === '/save-products') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Save products to JSON file as backup
        const backupPath = path.join(__dirname, 'products-backup.json');
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Products backed up successfully',
          count: data.products?.length || 0
        }));
        
        console.log(`💾 Products backed up: ${data.products?.length || 0} products`);
        
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
        console.error('❌ Backup error:', error.message);
      }
    });
  } else if (req.method === 'GET' && req.url === '/load-products') {
    try {
      const backupPath = path.join(__dirname, 'products-backup.json');
      
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
        console.log('📦 Products loaded from backup');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ products: [], collections: [], orders: [] }));
        console.log('ℹ️ No backup file found');
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message
      }));
      console.error('❌ Load error:', error.message);
    }
  } else if (req.method === 'POST' && req.url === '/update-constants') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { products, collections, tags, categories, types, colors } = data;
        
        const tsCode = `import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Auto-synced from Admin Panel
// Last update: ${new Date().toLocaleString()}
export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

// Collections - Auto-filtered by tags and criteria
export const COLLECTIONS = ${JSON.stringify(collections, null, 2)};

// Available Tags
export const AVAILABLE_TAGS = ${JSON.stringify(tags, null, 2)};

// Available Categories (Custom)
export const AVAILABLE_CATEGORIES = ${JSON.stringify(categories, null, 2)};

// Available Types (Custom)
export const AVAILABLE_TYPES = ${JSON.stringify(types, null, 2)};

// Available Colors (Custom)
export const AVAILABLE_COLORS = ${JSON.stringify(colors, null, 2)};

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
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '✅ constants.ts updated successfully!',
          products: products.length,
          collections: collections.length,
          timestamp: new Date().toISOString()
        }));
        
        console.log(`✅ Updated constants.ts - ${products.length} products, ${collections.length} collections`);
        
        // Auto-commit and deploy
        console.log('🚀 Starting auto-deployment...');
        
        import('child_process').then(({ exec }) => {
          // Git add, commit, push
          exec('git add . && git commit -m "Auto-update: products and images" && git push', (error, stdout, stderr) => {
            if (error) {
              console.error('⚠️ Git error:', error.message);
              return;
            }
            console.log('✅ Git push successful!');
            console.log(stdout);
            
            // Trigger deployment (Firebase or Vercel will auto-deploy on push)
            console.log('🚀 Deployment triggered! Check your hosting dashboard.');
          });
        });
        
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
        console.error('❌ Error:', error.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Admin Server Running!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📝 Endpoint: POST /update-constants`);
  console.log(`✨ Admin panel can now auto-update constants.ts!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`👀 Watching for updates from admin panel...`);
});
