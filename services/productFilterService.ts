import { Product } from '../types';

export interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  categories: string[];
  types: string[];
  inStock: boolean;
  onSale: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'popular' | 'rating';
}

export interface FilterState {
  priceRange: { min: number; max: number };
  selectedColors: string[];
  selectedSizes: string[];
  selectedCategories: string[];
  selectedTypes: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: FilterOptions['sortBy'];
}

class ProductFilterService {
  private readonly STORAGE_KEY = 'product_filters';

  /**
   * Get initial filter state
   */
  getInitialState(): FilterState {
    const saved = this.loadFilters();
    return saved || {
      priceRange: { min: 0, max: 10000 },
      selectedColors: [],
      selectedSizes: [],
      selectedCategories: [],
      selectedTypes: [],
      inStockOnly: false,
      onSaleOnly: false,
      sortBy: 'popular'
    };
  }

  /**
   * Extract available filter options from products
   */
  extractFilterOptions(products: Product[]): FilterOptions {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    const categories = new Set<string>();
    const types = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach(product => {
      // Price range
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;

      // Colors
      if (product.colors) {
        product.colors.forEach(color => colors.add(color));
      }

      // Sizes
      if (product.sizes) {
        product.sizes.forEach(size => sizes.add(size));
      }

      // Category and type
      if (product.category) categories.add(product.category);
      if (product.type) types.add(product.type);
    });

    return {
      priceRange: {
        min: Math.floor(minPrice),
        max: Math.ceil(maxPrice)
      },
      colors: Array.from(colors).sort(),
      sizes: this.sortSizes(Array.from(sizes)),
      categories: Array.from(categories).sort(),
      types: Array.from(types).sort(),
      inStock: true,
      onSale: true,
      sortBy: 'popular'
    };
  }

  /**
   * Sort sizes in logical order
   */
  private sortSizes(sizes: string[]): string[] {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return sizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  /**
   * Apply filters to products
   */
  filterProducts(products: Product[], filters: FilterState): Product[] {
    let filtered = [...products];

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange.min && 
      p.price <= filters.priceRange.max
    );

    // Color filter
    if (filters.selectedColors.length > 0) {
      filtered = filtered.filter(p => 
        p.colors && p.colors.some(c => filters.selectedColors.includes(c))
      );
    }

    // Size filter
    if (filters.selectedSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes && p.sizes.some(s => filters.selectedSizes.includes(s))
      );
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(p => 
        p.category && filters.selectedCategories.includes(p.category)
      );
    }

    // Type filter
    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(p => 
        p.type && filters.selectedTypes.includes(p.type)
      );
    }

    // In stock filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.inStock !== false);
    }

    // On sale filter
    if (filters.onSaleOnly) {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    // Sort
    filtered = this.sortProducts(filtered, filters.sortBy);

    return filtered;
  }

  /**
   * Sort products
   */
  private sortProducts(products: Product[], sortBy: FilterState['sortBy']): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      
      case 'newest':
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      case 'popular':
      default:
        // Could be based on sales, views, etc.
        return sorted;
    }
  }

  /**
   * Get active filter count
   */
  getActiveFilterCount(filters: FilterState, defaultState: FilterState): number {
    let count = 0;

    if (filters.priceRange.min !== defaultState.priceRange.min || 
        filters.priceRange.max !== defaultState.priceRange.max) {
      count++;
    }

    count += filters.selectedColors.length;
    count += filters.selectedSizes.length;
    count += filters.selectedCategories.length;
    count += filters.selectedTypes.length;

    if (filters.inStockOnly) count++;
    if (filters.onSaleOnly) count++;

    return count;
  }

  /**
   * Reset filters to default
   */
  resetFilters(defaultState: FilterState): FilterState {
    this.clearFilters();
    return { ...defaultState };
  }

  /**
   * Save filters to localStorage
   */
  saveFilters(filters: FilterState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  /**
   * Load filters from localStorage
   */
  loadFilters(): FilterState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading filters:', error);
      return null;
    }
  }

  /**
   * Clear saved filters
   */
  clearFilters(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }

  /**
   * Toggle color filter
   */
  toggleColor(filters: FilterState, color: string): FilterState {
    const selectedColors = filters.selectedColors.includes(color)
      ? filters.selectedColors.filter(c => c !== color)
      : [...filters.selectedColors, color];

    return { ...filters, selectedColors };
  }

  /**
   * Toggle size filter
   */
  toggleSize(filters: FilterState, size: string): FilterState {
    const selectedSizes = filters.selectedSizes.includes(size)
      ? filters.selectedSizes.filter(s => s !== size)
      : [...filters.selectedSizes, size];

    return { ...filters, selectedSizes };
  }

  /**
   * Toggle category filter
   */
  toggleCategory(filters: FilterState, category: string): FilterState {
    const selectedCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter(c => c !== category)
      : [...filters.selectedCategories, category];

    return { ...filters, selectedCategories };
  }

  /**
   * Toggle type filter
   */
  toggleType(filters: FilterState, type: string): FilterState {
    const selectedTypes = filters.selectedTypes.includes(type)
      ? filters.selectedTypes.filter(t => t !== type)
      : [...filters.selectedTypes, type];

    return { ...filters, selectedTypes };
  }

  /**
   * Update price range
   */
  updatePriceRange(filters: FilterState, min: number, max: number): FilterState {
    return {
      ...filters,
      priceRange: { min, max }
    };
  }

  /**
   * Update sort
   */
  updateSort(filters: FilterState, sortBy: FilterState['sortBy']): FilterState {
    return { ...filters, sortBy };
  }

  /**
   * Toggle in stock filter
   */
  toggleInStock(filters: FilterState): FilterState {
    return { ...filters, inStockOnly: !filters.inStockOnly };
  }

  /**
   * Toggle on sale filter
   */
  toggleOnSale(filters: FilterState): FilterState {
    return { ...filters, onSaleOnly: !filters.onSaleOnly };
  }

  /**
   * Get color hex code
   */
  getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#00FF00',
      'Yellow': '#FFFF00',
      'Purple': '#800080',
      'Pink': '#FFC0CB',
      'Orange': '#FFA500',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Grey': '#808080',
      'Navy': '#000080',
      'Beige': '#F5F5DC',
      'Maroon': '#800000',
      'Olive': '#808000',
      'Cyan': '#00FFFF',
      'Magenta': '#FF00FF',
      'Lime': '#00FF00',
      'Teal': '#008080',
      'Lavender': '#E6E6FA',
      'Coral': '#FF7F50',
      'Mint': '#98FF98',
      'Peach': '#FFDAB9',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0'
    };

    return colorMap[colorName] || '#CCCCCC';
  }
}

export const productFilterService = new ProductFilterService();
export default productFilterService;
