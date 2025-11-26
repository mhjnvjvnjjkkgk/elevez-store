import { Product } from '../types';

export interface BundleItem {
  product: Product;
  quantity: number;
  discountPercentage?: number;
}

export interface ProductBundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  type: 'complete-look' | 'frequently-bought' | 'recommended' | 'seasonal';
  image?: string;
}

class ProductBundleService {
  /**
   * Create "Complete the Look" bundles
   */
  createCompleteLookBundles(mainProduct: Product, allProducts: Product[]): ProductBundle[] {
    const bundles: ProductBundle[] = [];
    
    const complementaryProducts = this.findComplementaryProducts(mainProduct, allProducts);
    
    if (complementaryProducts.length >= 2) {
      const bundleItems: BundleItem[] = [
        { product: mainProduct, quantity: 1 },
        ...complementaryProducts.slice(0, 2).map(product => ({
          product,
          quantity: 1
        }))
      ];
      
      const bundle = this.createBundle(
        `complete-look-${mainProduct.id}`,
        'Complete the Look',
        `Get the full outfit with ${mainProduct.name} and matching pieces`,
        bundleItems,
        'complete-look'
      );
      
      bundles.push(bundle);
    }
    
    return bundles;
  }
  
  /**
   * Create "Frequently Bought Together" bundles
   */
  createFrequentlyBoughtBundles(mainProduct: Product, allProducts: Product[]): ProductBundle[] {
    const bundles: ProductBundle[] = [];
    
    const frequentlyBought = this.getFrequentlyBoughtWith(mainProduct, allProducts);
    
    if (frequentlyBought.length >= 1) {
      const bundleItems: BundleItem[] = [
        { product: mainProduct, quantity: 1 },
        ...frequentlyBought.slice(0, 2).map(product => ({
          product,
          quantity: 1
        }))
      ];
      
      const bundle = this.createBundle(
        `frequently-bought-${mainProduct.id}`,
        'Frequently Bought Together',
        'Customers who bought this item also bought these',
        bundleItems,
        'frequently-bought'
      );
      
      bundles.push(bundle);
    }
    
    return bundles;
  }
  
  /**
   * Get recommended bundles for a product
   */
  getRecommendedBundles(product: Product, allProducts: Product[]): ProductBundle[] {
    const bundles: ProductBundle[] = [];
    
    bundles.push(...this.createCompleteLookBundles(product, allProducts));
    bundles.push(...this.createFrequentlyBoughtBundles(product, allProducts));
    
    return bundles.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
  }
  
  /**
   * Create a bundle from items
   */
  private createBundle(
    id: string,
    name: string,
    description: string,
    items: BundleItem[],
    type: ProductBundle['type']
  ): ProductBundle {
    const originalPrice = items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
    
    const discountPercentage = Math.min(20, 5 + (items.length * 3));
    const bundlePrice = originalPrice * (1 - discountPercentage / 100);
    const savings = originalPrice - bundlePrice;
    
    return {
      id,
      name,
      description,
      items,
      originalPrice,
      bundlePrice,
      savings,
      savingsPercentage: discountPercentage,
      type,
      image: items[0]?.product.image
    };
  }
  
  /**
   * Find complementary products
   */
  private findComplementaryProducts(mainProduct: Product, allProducts: Product[]): Product[] {
    const complementary: Product[] = [];
    
    allProducts.forEach(product => {
      if (product.id === mainProduct.id) return;
      
      if (product.category === mainProduct.category && 
          product.type !== mainProduct.type) {
        complementary.push(product);
      }
      
      const complementaryPairs: Record<string, string[]> = {
        'tops': ['bottoms', 'outerwear'],
        'bottoms': ['tops', 'outerwear'],
        'outerwear': ['tops', 'bottoms'],
        'accessories': ['tops', 'bottoms', 'outerwear']
      };
      
      const mainCategory = mainProduct.category?.toLowerCase() || '';
      const productCategory = product.category?.toLowerCase() || '';
      
      if (complementaryPairs[mainCategory]?.includes(productCategory)) {
        complementary.push(product);
      }
    });
    
    return complementary;
  }
  
  /**
   * Get frequently bought with products
   */
  private getFrequentlyBoughtWith(mainProduct: Product, allProducts: Product[]): Product[] {
    return this.findComplementaryProducts(mainProduct, allProducts)
      .filter(p => p.price <= mainProduct.price * 1.5);
  }
}

export const productBundleService = new ProductBundleService();
export default productBundleService;
