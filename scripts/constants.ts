import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Products - Auto-synced from Admin Panel
// Last update: 23/11/2025, 7:10:58 pm
export const PRODUCTS: Product[] = [
  {
    "id": 1763857751091,
    "qid": "TEST",
    "name": "hoodie",
    "price": 50,
    "originalPrice": 1500,
    "category": "Men",
    "type": "T-Shirt",
    "rating": 4.5,
    "image": "http://localhost:5173/images/products/Gemini_Generated_Image_gpaa7hgpaa7hgpaa-1763857736512.png",
    "images": [
      "http://localhost:5173/images/products/Gemini_Generated_Image_gpaa7hgpaa7hgpaa-1763857736512.png",
      "http://localhost:5173/images/products/use fo carousal-1763857736539.png",
      "http://localhost:5173/images/products/Gemini_Generated_Image_k4d9bck4d9bck4d9-1763857736573.png",
      "http://localhost:5173/images/products/Gemini_Generated_Image_8udrlp8udrlp8udr-1763857736604.png"
    ],
    "sizes": [
      "M",
      "S"
    ],
    "colors": [
      "Black"
    ],
    "tags": [
      "PREMIUM"
    ],
    "description": "Premium quality t-shirt. Perfect for any occasion."
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
    "name": "Neon Green",
    "code": "#00ff88"
  },
  {
    "name": "Pink",
    "code": "#FF69B4"
  },
  {
    "name": "Gray",
    "code": "#808080"
  },
  {
    "name": "Navy",
    "code": "#000080"
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
    "name": "Yellow",
    "code": "#FFFF00"
  },
  {
    "name": "Orange",
    "code": "#FFA500"
  },
  {
    "name": "Purple",
    "code": "#800080"
  },
  {
    "name": "Rainbow",
    "code": "#FF0000"
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
