// Local Collection Service - localStorage-based for offline support
// Stores and retrieves collections from localStorage

export interface LocalCollection {
    id: string;
    shopifyId?: string;
    handle: string;
    name: string;
    description: string;
    image: string;
    productHandles: string[];
    productCount: number;
    sectionMapping: 'bestSellers' | 'newArrivals' | 'featured' | null;
    order: number;
    isSystem: boolean;
    source: 'shopify' | 'local';
    importedAt: string;
}

const COLLECTIONS_KEY = 'elevez_collections';
const PRODUCTS_KEY = 'elevez_products';

// Flag to track if we're currently fetching from server
let isFetching = false;

class LocalCollectionService {

    /**
     * Get all collections - first tries localStorage, then server JSON file
     */
    getAllCollections(): LocalCollection[] {
        try {
            const stored = localStorage.getItem(COLLECTIONS_KEY);
            if (stored) {
                const collections = JSON.parse(stored) as LocalCollection[];
                if (collections.length > 1) {
                    return collections.sort((a, b) => a.order - b.order);
                }
            }

            // If no collections in localStorage, try to load from server
            // This is a sync method, so we'll trigger async load in background
            if (!isFetching) {
                this.loadFromServer();
            }

            return this.getDefaultCollections();
        } catch (error) {
            console.error('Error getting collections from localStorage:', error);
            return this.getDefaultCollections();
        }
    }

    /**
     * Async method to load collections from admin server API
     * This bridges the cross-origin gap between admin panel (port 3001) and main site (port 5173)
     */
    async loadFromServer(): Promise<void> {
        if (isFetching) return;
        isFetching = true;

        try {
            console.log('📂 Loading collections from admin server...');

            // Fetch from admin server API (has CORS enabled)
            const response = await fetch('http://localhost:3001/api/get-shopify-data');
            if (response.ok) {
                const data = await response.json();

                if (data.collections && data.collections.length > 0) {
                    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(data.collections));
                    console.log('✅ Loaded', data.collections.length, 'collections from admin server');
                }

                if (data.products && data.products.length > 0) {
                    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products));
                    console.log('✅ Loaded', data.products.length, 'products from admin server');
                }

                // Trigger page reload to show new data
                if (data.collections?.length > 0 || data.products?.length > 0) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.warn('Could not load from admin server:', error);
        } finally {
            isFetching = false;
        }
    }

    /**
     * Get collection by handle
     */
    getCollectionByHandle(handle: string): LocalCollection | null {
        const collections = this.getAllCollections();
        return collections.find(c => c.handle === handle) || null;
    }

    /**
     * Get products for a collection
     */
    getCollectionProducts(handle: string): any[] {
        try {
            const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');

            if (handle === 'all') {
                return products;
            }

            const collection = this.getCollectionByHandle(handle);
            if (!collection) return [];

            // Filter products by handles in collection
            return products.filter((p: any) =>
                collection.productHandles.includes(p.shopifyHandle || p.handle)
            );
        } catch (error) {
            console.error('Error getting collection products:', error);
            return [];
        }
    }

    /**
     * Get products by section mapping (for homepage sections)
     */
    getProductsBySection(section: 'bestSellers' | 'newArrivals' | 'featured'): any[] {
        try {
            const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');

            switch (section) {
                case 'bestSellers':
                    return products.filter((p: any) => p.isBestSeller === true);
                case 'newArrivals':
                    return products.filter((p: any) => p.isNew === true);
                case 'featured':
                    return products.filter((p: any) => p.isFeatured === true);
                default:
                    return [];
            }
        } catch (error) {
            console.error('Error getting section products:', error);
            return [];
        }
    }

    /**
     * Get collection for a section
     */
    getCollectionForSection(section: 'bestSellers' | 'newArrivals' | 'featured'): LocalCollection | null {
        const collections = this.getAllCollections();
        return collections.find(c => c.sectionMapping === section) || null;
    }

    /**
     * Save collections to localStorage
     */
    saveCollections(collections: LocalCollection[]): void {
        try {
            localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
            localStorage.setItem('elevez_collections_last_save', new Date().toISOString());
        } catch (error) {
            console.error('Error saving collections:', error);
        }
    }

    /**
     * Get default "All Products" collection
     */
    private getDefaultCollections(): LocalCollection[] {
        const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');

        return [{
            id: 'all',
            handle: 'all',
            name: 'All Products',
            description: 'Browse all products',
            image: '',
            productHandles: products.map((p: any) => p.shopifyHandle || p.handle),
            productCount: products.length,
            sectionMapping: null,
            order: 0,
            isSystem: true,
            source: 'local',
            importedAt: new Date().toISOString()
        }];
    }

    /**
     * Get collection statistics
     */
    getStats(): { totalCollections: number; totalProducts: number } {
        const collections = this.getAllCollections();
        const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');

        return {
            totalCollections: collections.length,
            totalProducts: products.length
        };
    }

    /**
     * Check if collections are loaded (offline capability check)
     */
    hasCollections(): boolean {
        const collections = this.getAllCollections();
        return collections.length > 0;
    }
}

// Export singleton instance
export const localCollectionService = new LocalCollectionService();
