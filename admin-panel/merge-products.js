// Merge trial products with existing user products
console.log('🔄 Merging products...');

const trialProducts = [
  {
    "id": 1001,
    "qid": "NGH-001",
    "name": "Neon Glitch Hoodie",
    "price": 85,
    "originalPrice": 170,
    "category": "Men",
    "type": "Hoodie",
    "rating": 4.5,
    "description": "Premium quality hoodie with neon glitch design.",
    "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    "images": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "White", "Neon Green"],
    "tags": ["TRENDING", "BESTSELLER"],
    "isBestSeller": true,
    "isNew": true
  },
  {
    "id": 1002,
    "qid": "VCT-002",
    "name": "Vintage Crop Top",
    "price": 45,
    "originalPrice": 90,
    "category": "Women",
    "type": "Crop Top",
    "rating": 4.7,
    "description": "Stylish vintage crop top with retro vibes.",
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    "images": ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"],
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["Pink", "White", "Black"],
    "tags": ["VINTAGE", "TRENDING"],
    "isNew": true
  },
  {
    "id": 1003,
    "qid": "OST-003",
    "name": "Oversized Street Tee",
    "price": 35,
    "originalPrice": 70,
    "category": "Unisex",
    "type": "Oversized T-Shirt",
    "rating": 4.6,
    "description": "Ultra-comfortable oversized t-shirt.",
    "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["Black", "White", "Gray"],
    "tags": ["ESSENTIAL", "BESTSELLER"],
    "isBestSeller": true
  }
];

// Get existing products
const existing = JSON.parse(localStorage.getItem('elevez_products') || '[]');
console.log(`📦 Found ${existing.length} existing products`);

// Check if trial products already exist
const hasTrialProducts = existing.some(p => p.id >= 1001 && p.id <= 1003);

if (!hasTrialProducts) {
  // Merge: keep user products, add trial products
  const merged = [...existing, ...trialProducts];
  localStorage.setItem('elevez_products', JSON.stringify(merged));
  console.log(`✅ Added ${trialProducts.length} trial products! Total: ${merged.length}`);
} else {
  console.log('ℹ️ Trial products already exist, skipping...');
}
