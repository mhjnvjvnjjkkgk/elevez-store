// Simple server for admin panel to update constants.ts and handle image uploads
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const WS_PORT = 3002;

// Track connected clients for hot-reload
const connectedClients = new Set();

// Load GitHub configuration
let githubConfig = {
  username: 'YOUR-GITHUB-USERNAME',
  repository: 'YOUR-REPO-NAME',
  branch: 'main'
};

try {
  const configPath = path.join(__dirname, '..', 'github-config.json');
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    githubConfig = { ...githubConfig, ...JSON.parse(configData) };
    console.log('✅ GitHub config loaded:', githubConfig.username + '/' + githubConfig.repository);
  }
} catch (e) {
  console.log('ℹ️ Using default GitHub config. Update github-config.json for GitHub URLs.');
}

// Function to generate GitHub raw URL
function getGitHubRawUrl(filename) {
  const { username, repository, branch } = githubConfig;
  return `https://raw.githubusercontent.com/${username}/${repository}/${branch}/public/images/products/${filename}`;
}

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Created images directory:', imagesDir);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy to Vite dev server for visual builder
  if (req.method === 'GET' && req.url.startsWith('/vite-proxy')) {
    const targetUrl = req.url.replace('/vite-proxy', '');
    const viteUrl = `http://localhost:5173${targetUrl || '/'}`;

    // Proxy the request to Vite
    import('http').then(({ default: http }) => {
      http.get(viteUrl, (viteRes) => {
        res.writeHead(viteRes.statusCode, {
          ...viteRes.headers,
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'ALLOWALL'
        });
        viteRes.pipe(res);
      }).on('error', (err) => {
        console.error('❌ Vite proxy error:', err.message);
        res.writeHead(502);
        res.end('Vite dev server not running. Start it with: npm run dev');
      });
    });
    return;
  }

  // Serve App.tsx for the page builder
  if (req.method === 'GET' && req.url === '/App.tsx') {
    const appPath = path.join(__dirname, '..', 'App.tsx');

    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
      console.log('📄 Served App.tsx to page builder');
      return;
    } else {
      res.writeHead(404);
      res.end('App.tsx not found');
      return;
    }
  }

  // Serve unified dashboard and assets
  if (req.method === 'GET' && req.url === '/dashboard') {
    const dashboardPath = path.join(__dirname, '..', 'admin-panel', 'unified-admin.html');
    if (fs.existsSync(dashboardPath)) {
      const content = fs.readFileSync(dashboardPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      console.log('✅ Served dashboard');
      return;
    } else {
      res.writeHead(404);
      res.end('Dashboard not found: ' + dashboardPath);
      console.log('❌ Dashboard not found at:', dashboardPath);
      return;
    }
  }

  // Serve unified admin CSS
  if (req.method === 'GET' && req.url === '/unified-admin.css') {
    const cssPath = path.join(__dirname, '..', 'admin-panel', 'unified-admin.css');
    if (fs.existsSync(cssPath)) {
      const content = fs.readFileSync(cssPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve unified admin JS
  if (req.method === 'GET' && req.url === '/unified-admin.js') {
    const jsPath = path.join(__dirname, '..', 'admin-panel', 'unified-admin.js');
    if (fs.existsSync(jsPath)) {
      const content = fs.readFileSync(jsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve dashboard API
  if (req.method === 'GET' && req.url === '/dashboard-api.js') {
    const apiPath = path.join(__dirname, '..', 'admin-panel', 'dashboard-api.js');
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve unified admin v2 JS
  if (req.method === 'GET' && req.url === '/unified-admin-v2.js') {
    const jsPath = path.join(__dirname, '..', 'admin-panel', 'unified-admin-v2.js');
    if (fs.existsSync(jsPath)) {
      const content = fs.readFileSync(jsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve Discount Panel Files
  const discountFiles = [
    'discount-panel.html',
    'discount-service.js',
    'discount-panel-app.js',
    'firebase-config.js'
  ];

  // Strip query string for file lookup
  const urlWithoutQuery = req.url.split('?')[0];
  const requestedFile = urlWithoutQuery.startsWith('/') ? urlWithoutQuery.slice(1) : urlWithoutQuery;

  if (req.method === 'GET' && discountFiles.includes(requestedFile)) {
    const filePath = path.join(__dirname, '..', 'admin-panel', requestedFile);
    if (fs.existsSync(filePath)) {
      let contentType = 'text/plain';
      if (requestedFile.endsWith('.html')) contentType = 'text/html; charset=utf-8';
      else if (requestedFile.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';

      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      console.log(`✅ Served ${requestedFile}`);
      return;
    }
  }

  // Serve Loyalty & User Management Pages
  const loyaltyFiles = [
    'loyalty-rules.html',
    'loyalty-admin-complete.html',
    'users-management.html',
    'user-points-panel.html',
    'test-loyalty-rules-system.html',
    'test-loyalty-sync.html'
  ];

  if (req.method === 'GET' && loyaltyFiles.includes(requestedFile)) {
    const filePath = path.join(__dirname, '..', 'admin-panel', requestedFile);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      console.log(`✅ Served loyalty/user page: ${requestedFile}`);
      return;
    }
  }

  // Serve discount management system
  if (req.method === 'GET' && req.url === '/discount-management') {
    const discountPath = path.join(__dirname, '..', 'admin-panel', 'discount-management.html');
    if (fs.existsSync(discountPath)) {
      const content = fs.readFileSync(discountPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve discount management CSS
  if (req.method === 'GET' && req.url === '/discount-management.css') {
    const cssPath = path.join(__dirname, '..', 'admin-panel', 'discount-management.css');
    if (fs.existsSync(cssPath)) {
      const content = fs.readFileSync(cssPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve discount service JS
  if (req.method === 'GET' && req.url === '/discount-service.js') {
    const servicePath = path.join(__dirname, '..', 'admin-panel', 'discount-service.js');
    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve discount management JS
  if (req.method === 'GET' && req.url === '/discount-management.js') {
    const jsPath = path.join(__dirname, '..', 'admin-panel', 'discount-management.js');
    if (fs.existsSync(jsPath)) {
      const content = fs.readFileSync(jsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(content);
      return;
    }
  }

  // Serve admin panel files - handle root, /index.html, and /admin-panel routes
  if (req.method === 'GET' && (urlWithoutQuery === '/' || urlWithoutQuery === '/index.html' || urlWithoutQuery.startsWith('/admin-panel'))) {
    let filePath;

    // Handle root path and /index.html - serve index.html
    if (urlWithoutQuery === '/' || urlWithoutQuery === '/index.html') {
      filePath = path.join(__dirname, '..', 'admin-panel', 'index.html');
    } else {
      filePath = path.join(__dirname, '..', urlWithoutQuery);
    }

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const adminPanelDir = path.join(__dirname, '..', 'admin-panel');

    if (!normalizedPath.startsWith(adminPanelDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // If it's a directory, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Serve the file
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    } else {
      res.writeHead(404);
      res.end('Not Found: ' + filePath);
      return;
    }
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

              // Generate URLs
              const localUrl = `/images/products/${uniqueFilename}`;
              const githubUrl = getGitHubRawUrl(uniqueFilename);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                url: localUrl,
                githubUrl: githubUrl,
                filename: uniqueFilename,
                message: 'Image uploaded. Will be available on GitHub after sync & deploy.'
              }));

              console.log(`✅ Image uploaded: ${uniqueFilename}`);
              console.log(`📍 Local URL: ${localUrl}`);
              console.log(`🌐 GitHub URL: ${githubUrl}`);

              // Auto-commit image to git
              import('child_process').then(({ exec }) => {
                const relativePath = `public/images/products/${uniqueFilename}`;
                exec(`git add "${relativePath}"`, (error) => {
                  if (!error) {
                    console.log(`📦 Image added to git: ${uniqueFilename}`);
                  }
                });
              });
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
  } else if (req.method === 'POST' && req.url === '/update-app-tsx') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { code, sections } = data;

        // Backup current App.tsx
        const appPath = path.join(__dirname, '..', 'App.tsx');
        const backupPath = path.join(__dirname, '..', `App.tsx.backup.${Date.now()}`);

        if (fs.existsSync(appPath)) {
          fs.copyFileSync(appPath, backupPath);
          console.log('📦 Backed up App.tsx');
        }

        // Write new App.tsx
        fs.writeFileSync(appPath, code, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '✅ App.tsx updated successfully!',
          backup: backupPath,
          sections: sections.length
        }));

        console.log(`✅ Updated App.tsx with ${sections.length} sections`);

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
        console.error('❌ Error updating App.tsx:', error.message);
      }
    });
  } else if (req.method === 'POST' && req.url === '/sync-deploy') {
    // New unified sync and deploy endpoint
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        console.log('\n🚀 SYNC & DEPLOY INITIATED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Products: ${data.products || 0}`);
        console.log(`🗂️  Collections: ${data.collections || 0}`);
        console.log(`⏰ Timestamp: ${data.timestamp}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        import('child_process').then(({ exec }) => {
          // Step 1: Add all files
          console.log('📦 Step 1/3: Adding files to git...');
          exec('git add .', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Git add failed:', error.message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                error: 'Git add failed: ' + error.message
              }));
              return;
            }

            // Step 2: Commit
            const timestamp = new Date().toLocaleString();
            const commitMessage = `Admin Panel Sync: ${data.products || 0} products - ${timestamp}`;
            console.log(`💾 Step 2/3: Committing changes...`);
            console.log(`   Message: "${commitMessage}"`);

            exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
              // Check if there's nothing to commit (not an error)
              if (error && !error.message.includes('nothing to commit')) {
                console.error('❌ Git commit failed:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  error: 'Git commit failed: ' + error.message
                }));
                return;
              }

              if (error && error.message.includes('nothing to commit')) {
                console.log('ℹ️  No changes to commit');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: 'No changes to deploy',
                  noChanges: true
                }));
                return;
              }

              console.log('✅ Committed successfully!');

              // Step 3: Push to GitHub
              console.log('🚀 Step 3/3: Pushing to GitHub...');
              exec('git push origin main', (error, stdout, stderr) => {
                if (error) {
                  // Try master branch as fallback
                  exec('git push origin master', (error2, stdout2, stderr2) => {
                    if (error2) {
                      console.error('❌ Git push failed:', error2.message);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({
                        success: false,
                        error: 'Git push failed: ' + error2.message
                      }));
                      return;
                    }

                    console.log('✅ Pushed to GitHub (master branch)!');
                    console.log('🎉 DEPLOYMENT COMPLETE!');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🌐 Vercel will auto-deploy in 1-2 minutes');
                    console.log('📊 Check: https://vercel.com/dashboard');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      success: true,
                      message: 'Successfully deployed to GitHub!',
                      branch: 'master'
                    }));
                  });
                  return;
                }

                console.log('✅ Pushed to GitHub (main branch)!');
                console.log(stdout);
                console.log('\n🎉 DEPLOYMENT COMPLETE!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📊 Deployment Status:');
                console.log('   1. GitHub: ✅ Push successful');
                console.log('   2. Vercel: 🔄 Building...');
                console.log('   3. Live Site: ⏳ Will update in 1-2 minutes');
                console.log('');
                console.log('🌐 Check deployment:');
                console.log('   - Vercel: https://vercel.com/dashboard');
                console.log('   - GitHub: https://github.com/mhjnvjvnjjkkgk/elevez-store');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: 'Successfully deployed to GitHub!',
                  branch: 'main'
                }));
              });
            });
          });
        });

      } catch (error) {
        console.error('❌ Sync & Deploy error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/deploy-website') {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Auto-deploy using existing git workflow
    import('child_process').then(({ exec }) => {
      exec('git add . && git commit -m "Visual builder update" && git push origin main', (error, stdout, stderr) => {
        if (error) {
          console.error('⚠️ Deploy error:', error.message);
        } else {
          console.log('✅ Deployed to GitHub!');
          console.log(stdout);
        }
      });
    });

    res.end(JSON.stringify({
      success: true,
      message: 'Deployment started'
    }));
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
        const constantsPath = path.join(__dirname, '..', 'constants.ts');
        fs.writeFileSync(constantsPath, tsCode, 'utf8');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '✅ constants.ts updated successfully! Collections page will auto-update.',
          products: products.length,
          collections: collections.length,
          timestamp: new Date().toISOString()
        }));

        console.log(`✅ Updated constants.ts - ${products.length} products, ${collections.length} collections`);
        console.log(`📄 Collections page will show all ${products.length} products automatically`);

        // Auto-commit and deploy with enhanced error handling
        console.log('🚀 Starting auto-deployment...');

        import('child_process').then(({ exec }) => {
          // Step 1: Add all files including images
          console.log('📦 Adding files to git...');
          exec('git add .', (error, stdout, stderr) => {
            if (error) {
              console.error('⚠️ Git add error:', error.message);
              console.log('ℹ️ Make sure git is initialized: git init');
              return;
            }

            // Step 2: Commit with timestamp
            const timestamp = new Date().toLocaleString();
            const commitMessage = `Auto-update: ${products.length} products and images - ${timestamp}`;
            console.log(`💾 Committing: "${commitMessage}"`);

            exec(`git commit -m "${commitMessage}"`, (error, stdout, stderr) => {
              if (error) {
                // Check if it's "nothing to commit" (not an error)
                if (error.message.includes('nothing to commit')) {
                  console.log('ℹ️ No changes to commit');
                } else {
                  console.error('⚠️ Git commit error:', error.message);
                }
                return;
              }

              console.log('✅ Committed successfully!');

              // Step 3: Push to GitHub
              console.log('🚀 Pushing to GitHub...');
              exec('git push origin main', (error, stdout, stderr) => {
                if (error) {
                  // Try 'master' branch if 'main' fails
                  console.log('ℹ️ Trying master branch...');
                  exec('git push origin master', (error2, stdout2, stderr2) => {
                    if (error2) {
                      console.error('⚠️ Git push error:', error2.message);
                      console.log('ℹ️ Make sure remote is set: git remote add origin <url>');
                      return;
                    }
                    console.log('✅ Pushed to GitHub (master branch)!');
                    console.log('🚀 Deployment triggered! Changes will be live in 1-2 minutes.');
                  });
                } else {
                  console.log('✅ Pushed to GitHub (main branch)!');
                  console.log(stdout);
                  console.log('');
                  console.log('🚀 VERCEL DEPLOYMENT TRIGGERED!');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('📊 Deployment Status:');
                  console.log('   1. GitHub: ✅ Push successful');
                  console.log('   2. Vercel: 🔄 Building...');
                  console.log('   3. Live Site: ⏳ Will update in 1-2 minutes');
                  console.log('');
                  console.log('🌐 Check deployment:');
                  console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
                  console.log('   - GitHub Repo: https://github.com/mhjnvjvnjjkkgk/elevez-store');
                  console.log('');
                  console.log('✨ Your changes will be live soon!');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                }
              });
            });
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
    // Try to serve from admin-panel directory if not handled above
    // Strip query string from URL
    const urlPath = req.url.split('?')[0];
    const potentialAssetPath = path.join(__dirname, '..', 'admin-panel', urlPath);
    if (fs.existsSync(potentialAssetPath) && fs.statSync(potentialAssetPath).isFile()) {
      const ext = path.extname(potentialAssetPath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const content = fs.readFileSync(potentialAssetPath);

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }

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

  // Setup WebSocket for hot-reload
  setupHotReload();
});

// Setup hot-reload with WebSocket
function setupHotReload() {
  try {
    const wss = new WebSocketServer({ port: WS_PORT });

    console.log(`🔥 Hot-Reload Server: ws://localhost:${WS_PORT}`);

    wss.on('connection', (ws) => {
      connectedClients.add(ws);
      console.log(`✅ Client connected for hot-reload (${connectedClients.size} total)`);

      ws.on('close', () => {
        connectedClients.delete(ws);
        console.log(`❌ Client disconnected (${connectedClients.size} remaining)`);
      });
    });

    // Watch admin panel files for changes
    const adminPanelDir = path.join(__dirname, '..', 'admin-panel');

    fs.watch(adminPanelDir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.js') || filename.endsWith('.css') || filename.endsWith('.html'))) {
        console.log(`📝 File changed: ${filename}`);

        // Notify all connected clients to reload
        connectedClients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({ type: 'reload', file: filename }));
          }
        });

        console.log(`🔄 Sent reload signal to ${connectedClients.size} client(s)`);
      }
    });

  } catch (error) {
    console.warn('⚠️ Hot-reload not available:', error.message);
  }
}
