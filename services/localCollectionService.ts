// Local Collection Service - localStorage-based for offline support
// Stores and retrieves collections from localStorage

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
            // Background revalidation: always fetch from Firestore/cloud in background
            if (!isFetching) {
                this.loadFromServer();
            }

            const stored = localStorage.getItem(COLLECTIONS_KEY);
            if (stored) {
                const collections = JSON.parse(stored) as LocalCollection[];
                if (collections.length > 0) {
                    return collections;
                }
            }

            return this.getDefaultCollections();
        } catch (error) {
            console.error('Error getting collections from localStorage:', error);
            return this.getDefaultCollections();
        }
    }

    /**
     * Async method to load collections from Cloud Firestore (Primary) or Admin Server (Fallback)
     */
    async loadFromServer(): Promise<void> {
        if (isFetching) return;
        isFetching = true;

        let cloudSyncSuccess = false;
        try {
            console.log('☁️ [SWR Sync] Sourcing products and collections directly from Firestore cloud...');
            
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const collectionsSnapshot = await getDocs(collection(db, 'collections'));

            const productsList: any[] = [];
            productsSnapshot.forEach(docSnap => {
                productsList.push({ id: docSnap.id, ...docSnap.data() });
            });

            const collectionsList: any[] = [];
            collectionsSnapshot.forEach(docSnap => {
                collectionsList.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (productsList.length > 0 || collectionsList.length > 0) {
                // Normalize document IDs back to numeric format if they are numeric
                const formattedProducts = productsList.map(p => ({
                    ...p,
                    id: isNaN(Number(p.id)) ? p.id : Number(p.id)
                }));

                const formattedCollections = collectionsList.map(c => ({
                    ...c,
                    id: isNaN(Number(c.id)) ? c.id : Number(c.id)
                }));

                let shouldReload = false;

                if (formattedProducts.length > 0) {
                    const currentProductsStr = localStorage.getItem(PRODUCTS_KEY) || '[]';
                    const newProductsStr = JSON.stringify(formattedProducts);
                    if (currentProductsStr !== newProductsStr) {
                        localStorage.setItem(PRODUCTS_KEY, newProductsStr);
                        console.log(`✅ [SWR Sync] Storefront updated with ${formattedProducts.length} fresh products.`);
                        shouldReload = true;
                    }
                }

                // IMPORTANT: ONLY update local collections if Firestore returned a non-empty list of collections!
                // This prevents resetting/deleting your rich local storefront collections with empty Firestore lists.
                if (formattedCollections.length > 0) {
                    const currentCollectionsStr = localStorage.getItem(COLLECTIONS_KEY) || '[]';
                    const newCollectionsStr = JSON.stringify(formattedCollections);
                    if (currentCollectionsStr !== newCollectionsStr) {
                        localStorage.setItem(COLLECTIONS_KEY, newCollectionsStr);
                        console.log(`✅ [SWR Sync] Storefront updated with ${formattedCollections.length} fresh collections.`);
                        shouldReload = true;
                    }
                }

                if (shouldReload) {
                    console.log('🔄 [SWR Sync] Storefront state updated. Reloading page...');
                    window.location.reload();
                } else {
                    console.log('✨ [SWR Sync] Storefront is already in perfect sync with Cloud Firestore.');
                }
                cloudSyncSuccess = true;
            }
        } catch (firestoreError) {
            console.warn('⚠️ Firestore direct sync failed, trying local admin server fallback...', firestoreError);
        }

        // Local Server Fallback (Secondary Source)
        if (!cloudSyncSuccess) {
            try {
                console.log('📂 Loading collections from admin server fallback...');
                const response = await fetch('http://localhost:3001/api/get-shopify-data');
                if (response.ok) {
                    const data = await response.json();

                    const formattedProducts = data.products || [];
                    const formattedCollections = data.collections || [];

                    const currentProductsStr = localStorage.getItem(PRODUCTS_KEY) || '[]';
                    const currentCollectionsStr = localStorage.getItem(COLLECTIONS_KEY) || '[]';

                    const newProductsStr = JSON.stringify(formattedProducts);
                    const newCollectionsStr = JSON.stringify(formattedCollections);

                    if (currentProductsStr !== newProductsStr || currentCollectionsStr !== newCollectionsStr) {
                        localStorage.setItem(PRODUCTS_KEY, newProductsStr);
                        localStorage.setItem(COLLECTIONS_KEY, newCollectionsStr);
                        console.log('✅ Loaded data from admin server fallback. Reloading...');
                        window.location.reload();
                    }
                }
            } catch (error) {
                console.warn('Could not load from admin server fallback:', error);
            }
        }

        isFetching = false;
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
                collection.productHandles.includes(p.shopifyHandle) ||
                collection.productHandles.includes(p.handle) ||
                collection.productHandles.includes(String(p.id))
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
