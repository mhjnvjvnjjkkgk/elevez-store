import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  Query,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { collectionService } from './collectionService';

export interface ProductWithCollections {
  id: string;
  name: string;
  collections: string[];
  [key: string]: any;
}

class ProductCollectionService {
  private productsRef = collection(db, 'products');

  /**
   * Assign product to one or more collections
   */
  async assignProductToCollections(
    productId: string,
    collectionIds: string[]
  ): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Get current collections
      const productDoc = await getDoc(productRef);
      const currentCollections = productDoc.data()?.collections || [];
      
      // Merge with new collections (avoid duplicates)
      const mergedCollections = Array.from(new Set([...currentCollections, ...collectionIds]));
      
      // Always include 'all' collection
      if (!mergedCollections.includes('all')) {
        mergedCollections.push('all');
      }

      await updateDoc(productRef, {
        collections: mergedCollections,
        updatedAt: new Date()
      });

      // Update product counts for affected collections
      await this.updateCollectionProductCounts(mergedCollections);
    } catch (error) {
      console.error('Error assigning product to collections:', error);
      throw error;
    }
  }

  /**
   * Remove product from collections
   */
  async removeProductFromCollections(
    productId: string,
    collectionIds: string[]
  ): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Get current collections
      const productDoc = await getDoc(productRef);
      const currentCollections = productDoc.data()?.collections || [];
      
      // Remove specified collections
      const updatedCollections = currentCollections.filter(
        (id: string) => !collectionIds.includes(id)
      );
      
      // Always keep 'all' collection
      if (!updatedCollections.includes('all')) {
        updatedCollections.push('all');
      }

      await updateDoc(productRef, {
        collections: updatedCollections,
        updatedAt: new Date()
      });

      // Update product counts
      await this.updateCollectionProductCounts(updatedCollections);
    } catch (error) {
      console.error('Error removing product from collections:', error);
      throw error;
    }
  }

  /**
   * Set product collections (replace all)
   */
  async setProductCollections(
    productId: string,
    collectionIds: string[]
  ): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Always include 'all' collection
      const finalCollections = Array.from(new Set([...collectionIds, 'all']));

      await updateDoc(productRef, {
        collections: finalCollections,
        updatedAt: new Date()
      });

      // Update product counts
      await this.updateCollectionProductCounts(finalCollections);
    } catch (error) {
      console.error('Error setting product collections:', error);
      throw error;
    }
  }

  /**
   * Get product's collections
   */
  async getProductCollections(productId: string): Promise<string[]> {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        return productDoc.data().collections || ['all'];
      }
      return ['all'];
    } catch (error) {
      console.error('Error getting product collections:', error);
      throw error;
    }
  }

  /**
   * Get all products in a collection
   */
  async getCollectionProducts(collectionId: string): Promise<ProductWithCollections[]> {
    try {
      const q = query(
        this.productsRef,
        where('collections', 'array-contains', collectionId)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProductWithCollections));
    } catch (error) {
      console.error('Error getting collection products:', error);
      throw error;
    }
  }

  /**
   * Subscribe to collection products in real-time
   */
  subscribeToCollectionProducts(
    collectionId: string,
    callback: (products: ProductWithCollections[]) => void
  ): () => void {
    try {
      const q = query(
        this.productsRef,
        where('collections', 'array-contains', collectionId)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ProductWithCollections));
        
        callback(products);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to collection products:', error);
      throw error;
    }
  }

  /**
   * Bulk assign products to collections
   */
  async bulkAssignProducts(
    productIds: string[],
    collectionIds: string[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Always include 'all' collection
      const finalCollections = Array.from(new Set([...collectionIds, 'all']));

      productIds.forEach(productId => {
        const productRef = doc(db, 'products', productId);
        batch.update(productRef, {
          collections: finalCollections,
          updatedAt: new Date()
        });
      });

      await batch.commit();

      // Update product counts
      await this.updateCollectionProductCounts(finalCollections);
    } catch (error) {
      console.error('Error bulk assigning products:', error);
      throw error;
    }
  }

  /**
   * Update product counts for collections
   */
  private async updateCollectionProductCounts(collectionIds: string[]): Promise<void> {
    try {
      for (const collectionId of collectionIds) {
        const products = await this.getCollectionProducts(collectionId);
        await collectionService.updateProductCount(collectionId, products.length);
      }
    } catch (error) {
      console.error('Error updating collection product counts:', error);
    }
  }

  /**
   * Get products not in a collection
   */
  async getProductsNotInCollection(collectionId: string): Promise<ProductWithCollections[]> {
    try {
      const allProducts = await getDocs(this.productsRef);
      
      return allProducts.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ProductWithCollections))
        .filter(product => !product.collections?.includes(collectionId));
    } catch (error) {
      console.error('Error getting products not in collection:', error);
      throw error;
    }
  }

  /**
   * Migrate existing categories to collections
   */
  async migrateCategoriesToCollections(): Promise<void> {
    try {
      const allProducts = await getDocs(this.productsRef);
      const batch = writeBatch(db);
      const collectionsToCreate = new Set<string>();

      // Collect all unique categories
      allProducts.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          collectionsToCreate.add(category);
        }
      });

      // Create collections for each category
      for (const categoryName of collectionsToCreate) {
        const collectionId = categoryName.toLowerCase().replace(/\s+/g, '-');
        const collectionRef = doc(db, 'collections', collectionId);
        
        batch.set(collectionRef, {
          id: collectionId,
          name: categoryName,
          description: `${categoryName} products`,
          image: '',
          order: Array.from(collectionsToCreate).indexOf(categoryName),
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isSystem: false
        });
      }

      await batch.commit();

      // Assign products to collections
      allProducts.docs.forEach(doc => {
        const category = doc.data().category;
        if (category) {
          const collectionId = category.toLowerCase().replace(/\s+/g, '-');
          this.assignProductToCollections(doc.id, [collectionId]);
        }
      });
    } catch (error) {
      console.error('Error migrating categories to collections:', error);
      throw error;
    }
  }

  /**
   * Get all products with their collections
   */
  async getAllProductsWithCollections(): Promise<ProductWithCollections[]> {
    try {
      const snapshot = await getDocs(this.productsRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collections: doc.data().collections || ['all']
      } as ProductWithCollections));
    } catch (error) {
      console.error('Error getting all products with collections:', error);
      throw error;
    }
  }

  /**
   * Get products by collection ID
   */
  async getProductsByCollection(collectionId: string): Promise<ProductWithCollections[]> {
    try {
      return await this.getCollectionProducts(collectionId);
    } catch (error) {
      console.error('Error getting products by collection:', error);
      throw error;
    }
  }

  /**
   * Assign products to a collection (replace existing)
   */
  async assignProductsToCollection(
    collectionId: string,
    productIds: string[]
  ): Promise<void> {
    try {
      // First, get all products currently in this collection
      const currentProducts = await this.getCollectionProducts(collectionId);
      const currentProductIds = new Set(currentProducts.map(p => p.id));
      
      const batch = writeBatch(db);

      // Remove products that are no longer in the collection
      for (const productId of currentProductIds) {
        if (!productIds.includes(productId)) {
          const productRef = doc(db, 'products', productId);
          const productDoc = await getDoc(productRef);
          const collections = productDoc.data()?.collections || [];
          const updatedCollections = collections.filter((id: string) => id !== collectionId);
          
          batch.update(productRef, {
            collections: updatedCollections,
            updatedAt: new Date()
          });
        }
      }

      // Add new products to the collection
      for (const productId of productIds) {
        const productRef = doc(db, 'products', productId);
        const productDoc = await getDoc(productRef);
        const collections = productDoc.data()?.collections || [];
        
        if (!collections.includes(collectionId)) {
          collections.push(collectionId);
        }
        
        // Always include 'all' collection
        if (!collections.includes('all')) {
          collections.push('all');
        }

        batch.update(productRef, {
          collections,
          updatedAt: new Date()
        });
      }

      await batch.commit();

      // Update product count
      await collectionService.updateProductCount(collectionId, productIds.length);
    } catch (error) {
      console.error('Error assigning products to collection:', error);
      throw error;
    }
  }
}

export const productCollectionService = new ProductCollectionService();
