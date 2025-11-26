import { Product } from '../types';

export interface SearchFilters {
  query: string;
  categories: string[];
  priceRange: { min: number; max: number };
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popular';
}

export interface SearchResult {
  products: Product[];
  totalResults: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    sizes: { name: string; count: number }[];
    colors: { name: string; count: number }[];
  };
  suggestions: string[];
}

class SmartSearchService {
  private readonly SEARCH_HISTORY_KEY = 'search_history';
  private readonly MAX_HISTORY = 10;

  /**
   * Perform smart search with filters
   */
  search(products: Product[], filters: SearchFilters): SearchResult {
    let results = [...products];

    // Apply text search
    if (filters.query) {
      results = this.applyTextSearch(results, filters.query);
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      results = results.filter(p => 
        filters.categories.includes(p.category || '')
      );
    }

    // Apply price range filter
    results = results.filter(p => 
      p.price >= filters.priceRange.min && 
      p.price <= filters.priceRange.max
    );

    // Apply size filter
    if (filters.sizes.length > 0) {
      results = results.filter(p => 
        (p as any).sizes?.some((size: string) => filters.sizes.includes(size))
      );
    }

    // Apply color filter
    if (filters.colors.length > 0) {
      results = results.filter(p => 
        (p as any).colors?.some((color: string) => filters.colors.includes(color))
      );
    }

    // Apply stock filter
    if (filters.inStock) {
      results = results.filter(p => (p as any).inStock !== false);
    }

    // Apply sorting
    results = this.applySorting(results, filters.sortBy, filters.query);

    // Generate facets
    const facets = this.generateFacets(products, results);

    // Generate suggestions
    const suggestions = this.generateSuggestions(filters.query, products);

    return {
      products: results,
      totalResults: results.length,
      facets,
      suggestions
    };
  }

  /**
   * Apply text search with fuzzy matching
   */
  private applyTextSearch(products: Product[], query: string): Product[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) return products;

    return products
      .map(product => ({
        product,
        score: this.calculateRelevanceScore(product, normalizedQuery)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  }

  /**
   * Calculate relevance score for search
   */
  private calculateRelevanceScore(product: Product, query: string): number {
    let score = 0;
    const queryTerms = query.split(' ').filter(t => t.length > 0);

    queryTerms.forEach(term => {
      // Exact match in name (highest weight)
      if (product.name.toLowerCase().includes(term)) {
        score += 10;
      }

      // Match in description
      if (product.description?.toLowerCase().includes(term)) {
        score += 5;
      }

      // Match in category
      if (product.category?.toLowerCase().includes(term)) {
        score += 3;
      }

      // Match in type
      if (product.type?.toLowerCase().includes(term)) {
        score += 3;
      }

      // Fuzzy match (partial)
      if (this.fuzzyMatch(product.name.toLowerCase(), term)) {
        score += 2;
      }
    });

    return score;
  }

  /**
   * Fuzzy string matching
   */
  private fuzzyMatch(str: string, pattern: string): boolean {
    let patternIdx = 0;
    let strIdx = 0;

    while (strIdx < str.length && patternIdx < pattern.length) {
      if (str[strIdx] === pattern[patternIdx]) {
        patternIdx++;
      }
      strIdx++;
    }

    return patternIdx === pattern.length;
  }

  /**
   * Apply sorting
   */
  private applySorting(
    products: Product[],
    sortBy: SearchFilters['sortBy'],
    query: string
  ): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'newest':
        return sorted.sort((a, b) => 
          ((b as any).createdAt || 0) - ((a as any).createdAt || 0)
        );
      
      case 'popular':
        return sorted.sort((a, b) => 
          ((b as any).popularity || 0) - ((a as any).popularity || 0)
        );
      
      case 'relevance':
      default:
        // Already sorted by relevance in text search
        return sorted;
    }
  }

  /**
   * Generate facets for filtering
   */
  private generateFacets(allProducts: Product[], filteredProducts: Product[]): SearchResult['facets'] {
    const categories = this.countFacet(filteredProducts, p => p.category || 'Other');
    const sizes = this.countFacet(filteredProducts, p => (p as any).sizes || []);
    const colors = this.countFacet(filteredProducts, p => (p as any).colors || []);
    
    const priceRanges = [
      { range: 'Under $25', count: filteredProducts.filter(p => p.price < 25).length },
      { range: '$25 - $50', count: filteredProducts.filter(p => p.price >= 25 && p.price < 50).length },
      { range: '$50 - $100', count: filteredProducts.filter(p => p.price >= 50 && p.price < 100).length },
      { range: '$100+', count: filteredProducts.filter(p => p.price >= 100).length }
    ];

    return {
      categories: categories.map(([name, count]) => ({ name, count })),
      priceRanges,
      sizes: sizes.map(([name, count]) => ({ name, count })),
      colors: colors.map(([name, count]) => ({ name, count }))
    };
  }

  /**
   * Count facet occurrences
   */
  private countFacet(
    products: Product[],
    getter: (p: Product) => string | string[]
  ): [string, number][] {
    const counts = new Map<string, number>();

    products.forEach(product => {
      const value = getter(product);
      const values = Array.isArray(value) ? value : [value];

      values.forEach(v => {
        if (v) {
          counts.set(v, (counts.get(v) || 0) + 1);
        }
      });
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1]);
  }

  /**
   * Generate search suggestions
   */
  private generateSuggestions(query: string, products: Product[]): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const normalizedQuery = query.toLowerCase();

    // Add product names that match
    products.forEach(product => {
      if (product.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(product.name);
      }
    });

    // Add categories that match
    products.forEach(product => {
      if (product.category?.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(product.category);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Save search to history
   */
  saveSearchHistory(query: string): void {
    if (!query.trim()) return;

    try {
      const history = this.getSearchHistory();
      const updated = [query, ...history.filter(q => q !== query)].slice(0, this.MAX_HISTORY);
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    try {
      const saved = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Get popular searches
   */
  getPopularSearches(): string[] {
    // In a real app, this would come from analytics
    return [
      'hoodies',
      't-shirts',
      'jeans',
      'sneakers',
      'jackets',
      'accessories'
    ];
  }

  /**
   * Get trending searches
   */
  getTrendingSearches(): string[] {
    // In a real app, this would come from real-time data
    return [
      'winter collection',
      'new arrivals',
      'sale items',
      'limited edition'
    ];
  }
}

export const smartSearchService = new SmartSearchService();
export default smartSearchService;
