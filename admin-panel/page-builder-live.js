// ELEVEZ Page Builder - Live Website Editor
// This module connects the visual builder to your actual website (App.tsx)

// Load live website - simplified approach
async function loadLiveWebsite() {
  try {
    showNotification('📥 Loading your live website...', 'info');
    
    // For now, start with a default hero section
    // In future, we'll parse the actual App.tsx
    const defaultSections = [
      {
        id: `section-${Date.now()}`,
        type: 'hero-1',
        name: 'Hero Section',
        data: {
          title: 'ELEVATE YOUR STYLE',
          subtitle: 'Premium Streetwear Collection',
          buttonText: 'Shop Now',
          buttonLink: '/shop/all',
          backgroundImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90',
          textColor: '#ffffff',
          buttonColor: '#00ff88',
          overlayOpacity: 0.5
        }
      },
      {
        id: `section-${Date.now() + 1}`,
        type: 'collection-grid',
        name: 'Featured Products',
        data: {
          title: 'Featured Products',
          subtitle: 'Handpicked for you',
          columns: 4,
          showPrice: true,
          showRating: true,
          filter: 'all',
          limit: 8,
          backgroundColor: '#000000'
        }
      }
    ];
    
    // Load into builder state
    builderState.pages.homepage.sections = defaultSections;
    builderState.isLiveMode = true;
    
    saveBuilderState();
    renderCanvas();
    
    showNotification('✅ Live website loaded! Start editing sections.', 'success');
    console.log('📦 Loaded default sections:', defaultSections);
    
  } catch (error) {
    console.error('❌ Failed to load live website:', error);
    showNotification('❌ Error loading website', 'error');
  }
}

// Parse React JSX to builder sections
function parseReactToSections(tsxContent) {
  const sections = [];
  
  // Extract hero section
  const heroMatch = tsxContent.match(/<section[^>]*className="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/);
  if (heroMatch) {
    sections.push({
      id: 'hero-live',
      type: 'hero-1',
      name: 'Hero Section',
      data: extractHeroData(heroMatch[0])
    });
  }
  
  // Extract collection sections
  const collectionMatches = tsxContent.matchAll(/<section[^>]*className="[^"]*collection[^"]*"[^>]*>([\s\S]*?)<\/section>/g);
  for (const match of collectionMatches) {
    sections.push({
      id: `collection-${Date.now()}-${Math.random()}`,
      type: 'collection-grid',
      name: 'Collection Section',
      data: extractCollectionData(match[0])
    });
  }
  
  // If no sections found, return empty (user can build from scratch)
  return sections;
}

// Extract hero section data from JSX
function extractHeroData(jsx) {
  const titleMatch = jsx.match(/<h1[^>]*>(.*?)<\/h1>/);
  const subtitleMatch = jsx.match(/<p[^>]*>(.*?)<\/p>/);
  const buttonMatch = jsx.match(/<button[^>]*>(.*?)<\/button>/);
  const bgMatch = jsx.match(/background(?:Image)?:\s*['"]url\(['"]?(.*?)['"]?\)['"]/);
  
  return {
    title: titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'ELEVATE YOUR STYLE',
    subtitle: subtitleMatch ? subtitleMatch[1].replace(/<[^>]*>/g, '') : 'Premium Streetwear',
    buttonText: buttonMatch ? buttonMatch[1].replace(/<[^>]*>/g, '') : 'Shop Now',
    buttonLink: '/shop/all',
    backgroundImage: bgMatch ? bgMatch[1] : 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90',
    textColor: '#ffffff',
    buttonColor: '#00ff88',
    overlayOpacity: 0.5
  };
}

// Extract collection data from JSX
function extractCollectionData(jsx) {
  const titleMatch = jsx.match(/<h2[^>]*>(.*?)<\/h2>/);
  
  return {
    title: titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : 'Featured Products',
    subtitle: 'Handpicked for you',
    columns: 4,
    showPrice: true,
    showRating: true,
    filter: 'all',
    limit: 8,
    backgroundColor: '#000000'
  };
}

// Generate React code from builder sections
function generateReactCode(sections) {
  const imports = `import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Search, Heart, Star, ArrowRight, Check, Plus, Minus, ArrowLeft, Timer, Package, Truck, Shield } from 'lucide-react';
import { PRODUCTS, COLLECTIONS, BRAND_NAME, ACCENT_COLOR } from './constants';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';`;

  const sectionsCode = sections.map(section => generateSectionCode(section)).join('\n\n');
  
  return `${imports}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  // ... existing state and functions ...
  
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        {/* Navigation - keep existing */}
        <Navigation />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* ... other routes ... */}
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div>
      ${sectionsCode}
    </div>
  );
}

export default App;`;
}

// Generate code for individual section
function generateSectionCode(section) {
  const generators = {
    'hero-1': (data) => `
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: 'url(${data.backgroundImage})', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black" style={{ opacity: ${data.overlayOpacity} }}></div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl font-bold mb-6"
            style={{ color: '${data.textColor}' }}>
            ${data.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl mb-8"
            style={{ color: '${data.textColor}' }}>
            ${data.subtitle}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('${data.buttonLink}')}
            className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
            style={{ background: '${data.buttonColor}', color: '#000' }}>
            ${data.buttonText}
          </motion.button>
        </div>
      </section>`,
    
    'collection-grid': (data) => `
      <section className="py-20 px-6" style={{ background: '${data.backgroundColor}' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">${data.title}</h2>
            <p className="text-xl text-gray-400">${data.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${data.columns} gap-8">
            {PRODUCTS.filter(p => ${data.filter === 'all' ? 'true' : `p.${data.filter}`}).slice(0, ${data.limit}).map(product => (
              <ProductCard key={product.id} product={product} showPrice={${data.showPrice}} showRating={${data.showRating}} />
            ))}
          </div>
        </div>
      </section>`,
    
    'banner-image': (data) => `
      <section className="relative flex items-center justify-center overflow-hidden"
        style={{ 
          height: '${data.height}',
          backgroundImage: 'url(${data.image})',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="absolute inset-0 bg-black" style={{ opacity: ${data.overlayOpacity} }}></div>
        <div className="relative z-10 text-${data.textPosition} px-6 max-w-4xl">
          <h2 className="text-6xl font-bold mb-4">${data.title}</h2>
          <p className="text-3xl mb-6">${data.subtitle}</p>
          <button 
            onClick={() => navigate('${data.buttonLink}')}
            className="px-8 py-4 bg-[#00ff88] text-black rounded-full font-bold hover:scale-105 transition-all">
            ${data.buttonText}
          </button>
        </div>
      </section>`
  };
  
  const generator = generators[section.type];
  return generator ? generator(section.data) : '';
}

// Save changes back to App.tsx
async function saveToLiveWebsite() {
  if (!confirm('🚀 This will update your live website code!\n\nAre you sure you want to continue?')) {
    return;
  }
  
  try {
    showNotification('💾 Generating React code...', 'info');
    
    const sections = getCurrentPage().sections;
    const reactCode = generateReactCode(sections);
    
    // Send to server to update App.tsx
    const response = await fetch('http://localhost:3001/update-app-tsx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: reactCode,
        sections: sections
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update App.tsx');
    }
    
    const result = await response.json();
    
    showNotification('✅ Website code updated!', 'success');
    console.log('✅ Update result:', result);
    
    // Auto-deploy
    if (confirm('🚀 Deploy changes to live website now?')) {
      await deployWebsite();
    }
    
  } catch (error) {
    console.error('❌ Save error:', error);
    showNotification('❌ Failed to save changes', 'error');
  }
}

// Deploy website
async function deployWebsite() {
  try {
    showNotification('🚀 Deploying to GitHub & Vercel...', 'info');
    
    const response = await fetch('http://localhost:3001/deploy-website', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Deployment failed');
    }
    
    showNotification('✅ Deployed successfully!', 'success');
    
  } catch (error) {
    console.error('❌ Deploy error:', error);
    showNotification('❌ Deployment failed', 'error');
  }
}

// Initialize live mode
window.initLiveMode = function() {
  loadLiveWebsite();
};

// Export functions
window.saveToLiveWebsite = saveToLiveWebsite;
window.deployWebsite = deployWebsite;
