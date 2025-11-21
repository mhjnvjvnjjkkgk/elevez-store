
import { Product } from './types';

export const BRAND_NAME = "ELEVEZ";
export const ACCENT_COLOR = "#00ff88";

// Generate 21 mock products with specific tags matching screenshots
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Void Walker Oversized",
    price: 45.00,
    originalPrice: 90.00,
    category: "Men",
    type: "Oversized T-Shirt",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    isBestSeller: true,
    tags: ['ESSENTIAL', 'BESTSELLER'],
    colors: ['Black', 'Void Gray']
  },
  {
    id: 2,
    name: "Neon Glitch Hoodie",
    price: 85.00,
    originalPrice: 170.00,
    category: "Unisex",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    isNew: true,
    tags: ['TRENDING', 'NEW'],
    colors: ['Neon Green', 'Black']
  },
  {
    id: 3,
    name: "Cyber Crop V1",
    price: 35.00,
    originalPrice: 70.00,
    category: "Women",
    type: "Crop Top",
    image: "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    tags: ['PREMIUM'],
    colors: ['White', 'Cyber Pink', 'Black']
  },
  {
    id: 4,
    name: "Matrix Heavy Tee",
    price: 40.00,
    originalPrice: 80.00,
    category: "Men",
    type: "T-Shirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    tags: ['ESSENTIAL'],
    colors: ['Black', 'Code Green']
  },
  {
    id: 5,
    name: "Stealth Bomber Hoodie",
    price: 95.00,
    originalPrice: 190.00,
    category: "Men",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 5.0,
    isBestSeller: true,
    tags: ['PREMIUM', 'WARM'],
    colors: ['Matte Black']
  },
  {
    id: 6,
    name: "Lunar Dust Crop",
    price: 38.00,
    originalPrice: 76.00,
    category: "Women",
    type: "Crop Top",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.5,
    tags: ['TRENDING'],
    colors: ['Dust White', 'Grey']
  },
  {
    id: 7,
    name: "Acid Wash Oversized",
    price: 48.00,
    originalPrice: 96.00,
    category: "Unisex",
    type: "Oversized T-Shirt",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508213824186-abc924a36f93?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    tags: ['VINTAGE'],
    colors: ['Acid Black', 'Rust']
  },
  {
    id: 8,
    name: "Obsidian Essential",
    price: 32.00,
    originalPrice: 64.00,
    category: "Men",
    type: "T-Shirt",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.4,
    tags: ['ESSENTIAL'],
    colors: ['Obsidian', 'Navy']
  },
  {
    id: 9,
    name: "Vaporwave Hoodie",
    price: 88.00,
    originalPrice: 176.00,
    category: "Women",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    isNew: true,
    tags: ['NEW', 'COLORFUL'],
    colors: ['Vapor Blue', 'Pink']
  },
  {
    id: 10,
    name: "Tech Fleece Crop",
    price: 42.00,
    originalPrice: 84.00,
    category: "Women",
    type: "Crop Top",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    tags: ['SPORT'],
    colors: ['Heather Grey', 'Black']
  },
  {
    id: 11,
    name: "Urban Decay Tee",
    price: 36.00,
    originalPrice: 72.00,
    category: "Men",
    type: "T-Shirt",
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.3,
    tags: ['STREET'],
    colors: ['Concrete', 'Black']
  },
  {
    id: 12,
    name: "Night Rider Oversized",
    price: 50.00,
    originalPrice: 100.00,
    category: "Unisex",
    type: "Oversized T-Shirt",
    image: "https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508213824186-abc924a36f93?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    tags: ['PREMIUM'],
    colors: ['Midnight Blue', 'Black']
  },
  {
    id: 13,
    name: "Chrome Heart Hoodie",
    price: 92.00,
    originalPrice: 184.00,
    category: "Men",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    tags: ['HEAVYWEIGHT'],
    colors: ['Chrome Grey', 'White']
  },
  {
    id: 14,
    name: "Digital Noise Tee",
    price: 34.00,
    originalPrice: 68.00,
    category: "Women",
    type: "T-Shirt",
    image: "https://images.unsplash.com/photo-1503342217505-b0815a046baf?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0815a046baf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.5,
    tags: ['GRAPHIC'],
    colors: ['White', 'Black']
  },
  {
    id: 15,
    name: "Shadow Boxer Crop",
    price: 39.00,
    originalPrice: 78.00,
    category: "Women",
    type: "Crop Top",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    tags: ['ESSENTIAL'],
    colors: ['Shadow Black']
  },
  {
    id: 16,
    name: "Concrete Jungle Oversized",
    price: 46.00,
    originalPrice: 92.00,
    category: "Men",
    type: "Oversized T-Shirt",
    image: "https://images.unsplash.com/photo-1508213824186-abc924a36f93?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1508213824186-abc924a36f93?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    tags: ['URBAN'],
    colors: ['Cement', 'Asphalt']
  },
  {
    id: 17,
    name: "Pulse Rate Hoodie",
    price: 89.00,
    originalPrice: 178.00,
    category: "Unisex",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1556906781-9a412961d289?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    tags: ['COMFORT'],
    colors: ['Pulse Red', 'Black']
  },
  {
    id: 18,
    name: "Static Interference Tee",
    price: 38.00,
    originalPrice: 76.00,
    category: "Men",
    type: "T-Shirt",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.4,
    tags: ['GRAPHIC'],
    colors: ['Static White', 'Black']
  },
  {
    id: 19,
    name: "Glitch Queen Crop",
    price: 41.00,
    originalPrice: 82.00,
    category: "Women",
    type: "Crop Top",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    tags: ['TRENDING'],
    colors: ['Glitch Purple', 'Black']
  },
  {
    id: 20,
    name: "Heavy Metal Oversized",
    price: 55.00,
    originalPrice: 110.00,
    category: "Unisex",
    type: "Oversized T-Shirt",
    image: "https://images.unsplash.com/photo-1534030347209-71d5d1303199?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1534030347209-71d5d1303199?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508213824186-abc924a36f93?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    isBestSeller: true,
    tags: ['BESTSELLER', 'PREMIUM'],
    colors: ['Metal Grey', 'Black']
  },
  {
    id: 21,
    name: "Zero Gravity Hoodie",
    price: 98.00,
    originalPrice: 196.00,
    category: "Men",
    type: "Hoodie",
    image: "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 5.0,
    isNew: true,
    tags: ['PREMIUM', 'TECH'],
    colors: ['Space Black', 'White']
  }
];
