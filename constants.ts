import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Auto-synced from Admin Panel
// Last update: 27/11/2025, 5:48:18 am
export const PRODUCTS: Product[] = [
  {
    "id": 1,
    "qid": "NGH-001",
    "name": "Neon Glitch Hoodie",
    "price": 85,
    "originalPrice": 170,
    "category": "Men",
    "type": "Hoodie",
    "rating": 4.5,
    "description": "Premium quality hoodie with neon glitch design. Perfect for streetwear enthusiasts.",
    "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      "Black",
      "White",
      "Neon Green"
    ],
    "tags": [
      "TRENDING",
      "BESTSELLER"
    ],
    "isBestSeller": true,
    "isNew": true
  },
  {
    "id": 2,
    "qid": "VCT-002",
    "name": "Vintage Crop Top",
    "price": 45,
    "originalPrice": 90,
    "category": "Women",
    "type": "Crop Top",
    "rating": 4.7,
    "description": "Stylish vintage crop top with retro vibes. Comfortable and trendy.",
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    "images": [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L"
    ],
    "colors": [
      "Pink",
      "White",
      "Black"
    ],
    "tags": [
      "VINTAGE",
      "TRENDING"
    ],
    "isNew": true
  },
  {
    "id": 3,
    "qid": "OST-003",
    "name": "Oversized Street Tee",
    "price": 35,
    "originalPrice": 70,
    "category": "Unisex",
    "type": "Oversized T-Shirt",
    "rating": 4.6,
    "description": "Ultra-comfortable oversized t-shirt. Perfect for casual streetwear.",
    "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "images": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"
    ],
    "sizes": [
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "colors": [
      "Black",
      "White",
      "Gray"
    ],
    "tags": [
      "ESSENTIAL",
      "BESTSELLER"
    ],
    "isBestSeller": true
  },
  {
    "id": 4,
    "qid": "PTH-004",
    "name": "Premium Tech Hoodie",
    "price": 95,
    "originalPrice": 190,
    "category": "Men",
    "type": "Hoodie",
    "rating": 4.8,
    "description": "High-tech fabric hoodie with moisture-wicking properties. Perfect for active lifestyle.",
    "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      "Black",
      "Navy",
      "Gray"
    ],
    "tags": [
      "PREMIUM",
      "NEW"
    ],
    "isNew": true
  },
  {
    "id": 5,
    "qid": "CFT-005",
    "name": "Colorful Festival Tee",
    "price": 40,
    "originalPrice": 80,
    "category": "Unisex",
    "type": "T-Shirt",
    "rating": 4.4,
    "description": "Vibrant and colorful t-shirt perfect for festivals and summer events.",
    "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500",
    "images": [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "colors": [
      "Rainbow",
      "Yellow",
      "Orange"
    ],
    "tags": [
      "COLORFUL",
      "TRENDING"
    ]
  },
  {
    "id": 1764200901367,
    "qid": "1222",
    "name": "Dont Look back hoodie",
    "price": 850,
    "originalPrice": 1500,
    "cost": 800,
    "profit": 50,
    "profitMargin": 5.9,
    "category": "Men",
    "type": "Hoodie",
    "rating": 4.5,
    "image": "https://i.ibb.co/350ZYs3N/Gemini-Generated-Image-8udrlp8udrlp8udr.png",
    "images": [
      "https://i.ibb.co/350ZYs3N/Gemini-Generated-Image-8udrlp8udrlp8udr.png",
      "https://i.ibb.co/svktk85k/Gemini-Generated-Image-gpaa7hgpaa7hgpaa.png",
      "https://i.ibb.co/FbLmZBJg/use-fo-carousal.png",
      "https://i.ibb.co/gFM8kzCT/Gemini-Generated-Image-k4d9bck4d9bck4d9.png"
    ],
    "sizes": [
      "M",
      "S",
      "XS"
    ],
    "colors": [],
    "stock": 100,
    "status": "active",
    "showInHome": true,
    "showInShop": true,
    "showInCollections": true,
    "isBestSeller": true
  }
];

// Collections - Auto-filtered by tags and criteria
export const COLLECTIONS = [];

// Available Tags
export const AVAILABLE_TAGS = [
  "ESSENTIAL",
  "TRENDING",
  "PREMIUM",
  "NEW",
  "BESTSELLER",
  "VINTAGE",
  "COLORFUL"
];

// Available Categories (Custom)
export const AVAILABLE_CATEGORIES = [
  "Men",
  "Women",
  "Unisex"
];

// Available Types (Custom)
export const AVAILABLE_TYPES = [
  "Hoodie",
  "T-Shirt",
  "Crop Top",
  "Oversized T-Shirt"
];

// Available Colors (Custom)
export const AVAILABLE_COLORS = [
  {
    "name": "Black",
    "code": "#000000"
  },
  {
    "name": "White",
    "code": "#FFFFFF"
  },
  {
    "name": "Red",
    "code": "#FF0000"
  },
  {
    "name": "Blue",
    "code": "#0000FF"
  },
  {
    "name": "Green",
    "code": "#00FF00"
  },
  {
    "name": "Yellow",
    "code": "#FFFF00"
  },
  {
    "name": "Pink",
    "code": "#FF69B4"
  },
  {
    "name": "Purple",
    "code": "#800080"
  },
  {
    "name": "Orange",
    "code": "#FFA500"
  },
  {
    "name": "Gray",
    "code": "#808080"
  }
];

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
