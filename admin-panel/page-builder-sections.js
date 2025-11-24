// ELEVEZ Page Builder - Section Templates
// Phase 1: Pre-made section templates with full customization

// Section template definitions
const SECTION_TEMPLATES = {
  'hero-1': {
    type: 'hero-1',
    name: 'Hero - Center',
    category: 'hero',
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
  'hero-2': {
    type: 'hero-2',
    name: 'Hero - Split',
    category: 'hero',
    data: {
      title: 'NEW COLLECTION',
      subtitle: 'Street Ready Fashion',
      description: 'Discover our latest drops',
      buttonText: 'Explore',
      buttonLink: '/shop/all',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=90',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#00ff88'
    }
  },
  'hero-3': {
    type: 'hero-3',
    name: 'Hero - Video',
    category: 'hero',
    data: {
      title: 'ELEVEZ',
      subtitle: 'Where Style Meets Street',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      buttonText: 'Discover',
      buttonLink: '/shop/all',
      overlayColor: '#000000',
      overlayOpacity: 0.6
    }
  },
  'collection-grid': {
    type: 'collection-grid',
    name: 'Product Grid',
    category: 'collection',
    data: {
      title: 'Featured Products',
      subtitle: 'Handpicked for you',
      columns: 4,
      showPrice: true,
      showRating: true,
      filter: 'all', // all, bestseller, new, featured
      limit: 8,
      backgroundColor: '#000000'
    }
  },
  'collection-carousel': {
    type: 'collection-carousel',
    name: 'Product Carousel',
    category: 'collection',
    data: {
      title: 'Trending Now',
      subtitle: 'Hot picks this week',
      autoplay: true,
      autoplaySpeed: 3000,
      showDots: true,
      filter: 'trending',
      limit: 6
    }
  },
  'banner-image': {
    type: 'banner-image',
    name: 'Image Banner',
    category: 'banner',
    data: {
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90',
      title: 'SUMMER SALE',
      subtitle: 'Up to 50% OFF',
      buttonText: 'Shop Sale',
      buttonLink: '/shop/all',
      height: '500px',
      textPosition: 'center', // left, center, right
      overlayOpacity: 0.4
    }
  },
  'banner-video': {
    type: 'banner-video',
    name: 'Video Banner',
    category: 'banner',
    data: {
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'WATCH OUR STORY',
      subtitle: 'Behind the brand',
      height: '600px',
      autoplay: true,
      muted: true,
      loop: true
    }
  },
  'banner-text': {
    type: 'banner-text',
    name: 'Text Banner',
    category: 'banner',
    data: {
      title: 'FREE SHIPPING',
      subtitle: 'On orders over ₹2000',
      backgroundColor: '#00ff88',
      textColor: '#000000',
      height: '120px',
      fontSize: '24px'
    }
  }
};

// Render section HTML based on type
function renderSectionHTML(section) {
  const templates = {
    'hero-1': (data) => `
      <div class="hero-section hero-center" style="background-image: url('${data.backgroundImage}'); color: ${data.textColor};">
        <div class="hero-overlay" style="opacity: ${data.overlayOpacity};"></div>
        <div class="hero-content">
          <h1 class="hero-title editable" data-field="title">${data.title}</h1>
          <p class="hero-subtitle editable" data-field="subtitle">${data.subtitle}</p>
          <button class="hero-button editable" data-field="buttonText" style="background: ${data.buttonColor};" onclick="navigateTo('${data.buttonLink}')">${data.buttonText}</button>
        </div>
      </div>
    `,
    
    'hero-2': (data) => `
      <div class="hero-section hero-split" style="background: ${data.backgroundColor}; color: ${data.textColor};">
        <div class="hero-split-content">
          <div class="hero-text">
            <h1 class="hero-title editable" data-field="title">${data.title}</h1>
            <p class="hero-subtitle editable" data-field="subtitle">${data.subtitle}</p>
            <p class="hero-description editable" data-field="description">${data.description}</p>
            <button class="hero-button editable" data-field="buttonText" style="background: ${data.accentColor}; color: #000;" onclick="navigateTo('${data.buttonLink}')">${data.buttonText}</button>
          </div>
          <div class="hero-image">
            <img src="${data.image}" alt="Hero" class="editable-image" data-field="image">
          </div>
        </div>
      </div>
    `,
    
    'hero-3': (data) => `
      <div class="hero-section hero-video">
        <div class="hero-video-bg">
          <iframe src="${data.videoUrl}?autoplay=1&mute=1&loop=1&controls=0" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>
        <div class="hero-overlay" style="background: ${data.overlayColor}; opacity: ${data.overlayOpacity};"></div>
        <div class="hero-content">
          <h1 class="hero-title editable" data-field="title">${data.title}</h1>
          <p class="hero-subtitle editable" data-field="subtitle">${data.subtitle}</p>
          <button class="hero-button editable" data-field="buttonText" onclick="navigateTo('${data.buttonLink}')">${data.buttonText}</button>
        </div>
      </div>
    `,
    
    'collection-grid': (data) => `
      <div class="collection-section collection-grid" style="background: ${data.backgroundColor};">
        <div class="collection-header">
          <h2 class="collection-title editable" data-field="title">${data.title}</h2>
          <p class="collection-subtitle editable" data-field="subtitle">${data.subtitle}</p>
        </div>
        <div class="products-grid" data-columns="${data.columns}" data-filter="${data.filter}" data-limit="${data.limit}">
          <!-- Products will be loaded dynamically -->
          <div class="loading-products">Loading products...</div>
        </div>
      </div>
    `,
    
    'collection-carousel': (data) => `
      <div class="collection-section collection-carousel">
        <div class="collection-header">
          <h2 class="collection-title editable" data-field="title">${data.title}</h2>
          <p class="collection-subtitle editable" data-field="subtitle">${data.subtitle}</p>
        </div>
        <div class="products-carousel" data-autoplay="${data.autoplay}" data-speed="${data.autoplaySpeed}" data-filter="${data.filter}" data-limit="${data.limit}">
          <!-- Products carousel will be loaded dynamically -->
          <div class="loading-products">Loading products...</div>
        </div>
      </div>
    `,
    
    'banner-image': (data) => `
      <div class="banner-section banner-image" style="height: ${data.height}; background-image: url('${data.image}');">
        <div class="banner-overlay" style="opacity: ${data.overlayOpacity};"></div>
        <div class="banner-content banner-${data.textPosition}">
          <h2 class="banner-title editable" data-field="title">${data.title}</h2>
          <p class="banner-subtitle editable" data-field="subtitle">${data.subtitle}</p>
          <button class="banner-button editable" data-field="buttonText" onclick="navigateTo('${data.buttonLink}')">${data.buttonText}</button>
        </div>
      </div>
    `,
    
    'banner-video': (data) => `
      <div class="banner-section banner-video" style="height: ${data.height};">
        <div class="banner-video-bg">
          <iframe src="${data.videoUrl}?autoplay=${data.autoplay ? 1 : 0}&mute=${data.muted ? 1 : 0}&loop=${data.loop ? 1 : 0}&controls=0" frameborder="0" allow="autoplay; encrypted-media"></iframe>
        </div>
        <div class="banner-content">
          <h2 class="banner-title editable" data-field="title">${data.title}</h2>
          <p class="banner-subtitle editable" data-field="subtitle">${data.subtitle}</p>
        </div>
      </div>
    `,
    
    'banner-text': (data) => `
      <div class="banner-section banner-text" style="background: ${data.backgroundColor}; color: ${data.textColor}; height: ${data.height};">
        <div class="banner-content">
          <h2 class="banner-title editable" data-field="title" style="font-size: ${data.fontSize};">${data.title}</h2>
          <p class="banner-subtitle editable" data-field="subtitle">${data.subtitle}</p>
        </div>
      </div>
    `
  };
  
  const renderer = templates[section.type];
  return renderer ? renderer(section.data) : '<div>Unknown section type</div>';
}

// Load products into collection sections
function loadProductsIntoSection(sectionEl, data) {
  const productsContainer = sectionEl.querySelector('.products-grid, .products-carousel');
  if (!productsContainer) return;
  
  // Get products from localStorage (from admin panel)
  const products = JSON.parse(localStorage.getItem('elevez_products') || '[]');
  
  // Filter products based on section settings
  let filtered = products;
  if (data.filter === 'bestseller') {
    filtered = products.filter(p => p.isBestSeller);
  } else if (data.filter === 'new') {
    filtered = products.filter(p => p.isNew);
  } else if (data.filter === 'featured') {
    filtered = products.filter(p => p.isFeatured);
  }
  
  // Limit products
  filtered = filtered.slice(0, data.limit || 8);
  
  // Render products
  if (filtered.length === 0) {
    productsContainer.innerHTML = '<div class="no-products">No products found. Add products in the admin panel.</div>';
    return;
  }
  
  const productsHTML = filtered.map(product => `
    <div class="product-card-builder">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        ${data.showPrice !== false ? `<p class="product-price">₹${product.price}</p>` : ''}
        ${data.showRating !== false ? `<p class="product-rating">⭐ ${product.rating || 4.5}</p>` : ''}
      </div>
    </div>
  `).join('');
  
  productsContainer.innerHTML = productsHTML;
}

// Navigation helper
window.navigateTo = function(url) {
  console.log('Navigate to:', url);
  // In preview mode, this would actually navigate
  alert(`Would navigate to: ${url}`);
};
