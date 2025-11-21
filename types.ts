
export type Category = 'Men' | 'Women' | 'Unisex';
export type ProductType = 'Hoodie' | 'T-Shirt' | 'Crop Top' | 'Oversized T-Shirt';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: Category;
  type: ProductType;
  image: string;
  images?: string[];
  rating: number;
  tags?: string[]; // e.g., 'ESSENTIAL', 'TRENDING', 'PREMIUM'
  isNew?: boolean;
  isBestSeller?: boolean;
  description?: string;
  colors?: string[];
}

export interface CartItem extends Product {
  cartId: string; // Unique ID for cart entry (handling different sizes)
  quantity: number;
  size: string;
  color: string;
}

export type CursorVariant = 'default' | 'hover' | 'money' | 'shop';
