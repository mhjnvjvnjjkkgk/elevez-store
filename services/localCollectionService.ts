// Local Collection Service - localStorage-based for offline support
// Stores and retrieves collections from localStorage

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLLECTIONS, PRODUCTS } from '../constants';

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

// Flag to track if we've already fetched to prevent infinite loops
// NOTE: Force-fetches (from SSE events) bypass this flag
let hasFetchedServer = false;

class LocalCollectionService {

    /**
     * Get active products list, choosing between localStorage and compile-time constants
     */
    getActiveProducts(): any[] {
        try {
            const stored = localStorage.getItem(PRODUCTS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error getting active products:', error);
        }

        return PRODUCTS;
    }

    /**
     * Get all collections - first tries localStorage, then server JSON file
     */
    getAllCollections(): LocalCollection[] {
        try {
            // Background revalidation: always fetch from Firestore/cloud in background
            // Ensure this only happens ONCE automatically to prevent infinite event loops
            // Skip in dev to avoid using cached collections
            if (!isFetching && !hasFetchedServer) {
                hasFetchedServer = true;
                this.loadFromServer();
            }

            const collectionMap = new Map<string, LocalCollection>();

            // 1. Load from compile-time constants first (Guaranteed Baseline)
            if (COLLECTIONS && Array.isArray(COLLECTIONS)) {
                COLLECTIONS.forEach((c: any) => {
                    if (c && (c.id || c.name)) {
                        const id = c.id || c.name;
                        const handle = c.handle || id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        collectionMap.set(id, { ...c, id, handle } as LocalCollection);
                    }
                });
            }

            // 2. Override/merge with localStorage (User customizations)
            const stored = localStorage.getItem(COLLECTIONS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const localCols = Array.isArray(parsed) ? parsed : (parsed.collections || []);
                localCols.forEach((c: any) => {
                    if (c && c.id && c.id !== 'all') {
                        const handle = c.handle || c.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        collectionMap.set(c.id, { ...collectionMap.get(c.id), ...c, handle } as LocalCollection);
                    }
                });
            }

            const allCols = Array.from(collectionMap.values());
            if (allCols.length > 0) {
                return allCols;
            }

            return this.getDefaultCollections();
        } catch (error) {
            console.error('Error getting collections from localStorage:', error);
            if (COLLECTIONS && COLLECTIONS.length > 0) {
                return COLLECTIONS as any as LocalCollection[];
            }
            return this.getDefaultCollections();
        }
    }

    /**
     * Async method to load collections from Cloud Firestore (Primary) or Admin Server (Fallback)
     * @param force - When true, bypasses isFetching and hasFetchedServer flags (used by SSE events)
     */
    async loadFromServer(force = false): Promise<void> {
        if (isFetching && !force) return;
        if (hasFetchedServer && !force) return;
        isFetching = true;

        let syncSuccess = false;
        const isDev = (import.meta as any).env.DEV;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // 1. If running locally on localhost, always try the local admin server API first
        if (isLocalhost) {
            try {
                console.log('📂 [Centralized Sync] Sourcing data from local admin server first...');
                const response = await fetch('http://localhost:3001/api/get-shopify-data');
                if (response.ok) {
                    const data = await response.json();

                    const formattedProducts = data.products || [];
                    const rawCollections = data.collections || [];
                    const formattedCollections = Array.isArray(rawCollections) ? rawCollections : (rawCollections.collections || []);

                    if (formattedProducts.length > 0) {
                        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(formattedProducts));
                    }
                    if (formattedCollections.length > 0) {
                        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(formattedCollections));
                    }
                    if (data.colors && data.colors.length > 0) {
                        localStorage.setItem('elevez_colors', JSON.stringify(data.colors));
                    }
                    if (data.sizes && data.sizes.length > 0) {
                        localStorage.setItem('elevez_sizes', JSON.stringify(data.sizes));
                    }
                    if (data.tags && data.tags.length > 0) {
                        localStorage.setItem('elevez_tags', JSON.stringify(data.tags));
                    }
                    if (data.categories && data.categories.length > 0) {
                        localStorage.setItem('elevez_categories', JSON.stringify(data.categories));
                    }
                    if (data.types && data.types.length > 0) {
                        localStorage.setItem('elevez_types', JSON.stringify(data.types));
                    }
                    console.log('✅ [Centralized Sync] Loaded all products and configuration lists from local admin server.');
                    syncSuccess = true;
                }
            } catch (error) {
                console.warn('⚠️ [Centralized Sync] Local admin server fetch failed, trying fallback...', error);
            }
        }

        // 2. Fallback: load from Firestore cloud (runs in prod, or when local server is offline/unavailable)
        if (!syncSuccess) {
            try {
                console.log('☁️ [Centralized Sync] Sourcing products and collections directly from Firestore cloud...');
                
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

                    if (formattedProducts.length > 0) {
                        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(formattedProducts));
                        console.log(`✅ [Centralized Sync] Storefront updated with ${formattedProducts.length} fresh products from cloud.`);
                    }

                    // IMPORTANT: ONLY update local collections if Firestore returned a non-empty list of collections!
                    if (formattedCollections.length > 0) {
                        localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(formattedCollections));
                        console.log(`✅ [Centralized Sync] Storefront updated with ${formattedCollections.length} fresh collections from cloud.`);
                    }

                    // Load metadata/catalog document from Firestore containing colors, sizes, etc.
                    try {
                        const metadataSnap = await getDoc(doc(db, 'metadata', 'catalog'));
                        if (metadataSnap.exists()) {
                            const metaData = metadataSnap.data();
                            if (metaData.colors && Array.isArray(metaData.colors)) {
                                localStorage.setItem('elevez_colors', JSON.stringify(metaData.colors));
                            }
                            if (metaData.sizes && Array.isArray(metaData.sizes)) {
                                localStorage.setItem('elevez_sizes', JSON.stringify(metaData.sizes));
                            }
                            if (metaData.tags && Array.isArray(metaData.tags)) {
                                localStorage.setItem('elevez_tags', JSON.stringify(metaData.tags));
                            }
                            if (metaData.categories && Array.isArray(metaData.categories)) {
                                localStorage.setItem('elevez_categories', JSON.stringify(metaData.categories));
                            }
                            if (metaData.types && Array.isArray(metaData.types)) {
                                localStorage.setItem('elevez_types', JSON.stringify(metaData.types));
                            }
                            console.log('✅ [Centralized Sync] Loaded metadata lists from Firestore cloud.');
                        }
                    } catch (metaErr: any) {
                        console.warn('⚠️ [Centralized Sync] Could not fetch catalog metadata from Firestore:', metaErr.message);
                    }

                    syncSuccess = true;
                }
            } catch (firestoreError) {
                console.warn('⚠️ [Centralized Sync] Firestore direct sync failed.', firestoreError);
            }
        }

        // Only set hasFetchedServer = true if we successfully loaded data from SOME server/source!
        if (syncSuccess) {
            hasFetchedServer = true;
        }

        isFetching = false;
        window.dispatchEvent(new Event('elevez_store_updated'));
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
            const products = this.getActiveProducts();

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
            const products = this.getActiveProducts();

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
        const products = this.getActiveProducts();

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
        const products = this.getActiveProducts();

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

// ─── SSE Real-Time Sync: Listen for admin panel changes ─────────────────────────────────
/**
 * In development, connects to the admin server's SSE stream.
 * Whenever the admin saves any product/collection/color, the server
 * broadcasts a data_updated event and we immediately force-refresh
 * localStorage + fire elevez_store_updated so every React page re-renders.
 */
function setupAdminSync(): void {
    const isDev = (import.meta as any).env.DEV;
    if (!isDev) {
        // Production: fall back to polling every 30 seconds
        setInterval(async () => {
            console.log('🔄 [Polling] Checking for admin updates...');
            await localCollectionService.loadFromServer(true);
        }, 30000);
        return;
    }

    const ADMIN_SSE_URL = 'http://localhost:3001/api/events';
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
        console.log('📡 [SSE] Connecting to admin server for real-time sync...');
        const es = new EventSource(ADMIN_SSE_URL);

        es.addEventListener('data_updated', async (e: MessageEvent) => {
            const payload = JSON.parse(e.data || '{}');
            console.log('⚡ [SSE] Admin saved data! Force re-fetching storefront...', payload);
            // Force bypass hasFetchedServer so we always re-load fresh data
            hasFetchedServer = false;
            isFetching = false;
            await localCollectionService.loadFromServer(true);
        });

        es.onerror = () => {
            es.close();
            if (!retryTimeout) {
                retryTimeout = setTimeout(() => {
                    retryTimeout = null;
                    connect();
                }, 5000); // retry after 5s
            }
        };

        es.onopen = () => {
            console.log('✅ [SSE] Connected to admin server. Storefront will update instantly on admin saves.');
        };
    }

    connect();
}

// Auto-start SSE sync when the service module is loaded
setupAdminSync();
