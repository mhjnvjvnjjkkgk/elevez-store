import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  writeBatch,
  Query,
  QueryConstraint,
  where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Collection {
  id: string;
  name: string;
  description: string;
  image?: string;
  order: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

export interface CollectionWithProducts extends Collection {
  products: string[]; // product IDs
}

class CollectionService {
  private collectionsRef = collection(db, 'collections');

  /**
   * Get all collections ordered by order field
   */
  async getAllCollections(): Promise<Collection[]> {
    try {
      const q = query(this.collectionsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Collection));
    } catch (error) {
      console.error('Error getting collections:', error);
      throw error;
    }
  }

  /**
   * Get single collection by ID
   */
  async getCollection(collectionId: string): Promise<Collection | null> {
    try {
      const docRef = doc(db, 'collections', collectionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as Collection;
      }
      return null;
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  }

  /**
   * Create new collection
   */
  async createCollection(
    name: string,
    description: string,
    image?: string
  ): Promise<string> {
    try {
      // Get the highest order number
      const collections = await this.getAllCollections();
      const maxOrder = collections.length > 0 
        ? Math.max(...collections.map(c => c.order)) 
        : 0;

      const newCollection: Omit<Collection, 'id'> = {
        name,
        description,
        image: image || '',
        order: maxOrder + 1,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSystem: false
      };

      const docRef = await addDoc(this.collectionsRef, newCollection);
      return docRef.id;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Update collection
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<Collection>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'collections', collectionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      // Don't allow deleting system collections
      const collection = await this.getCollection(collectionId);
      if (collection?.isSystem) {
        throw new Error('Cannot delete system collections');
      }

      const docRef = doc(db, 'collections', collectionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  /**
   * Reorder collections
   */
  async reorderCollections(collectionIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      collectionIds.forEach((id, index) => {
        const docRef = doc(db, 'collections', id);
        batch.update(docRef, { order: index });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering collections:', error);
      throw error;
    }
  }

  /**
   * Update product count for collection
   */
  async updateProductCount(collectionId: string, count: number): Promise<void> {
    try {
      const docRef = doc(db, 'collections', collectionId);
      await updateDoc(docRef, { productCount: count });
    } catch (error) {
      console.error('Error updating product count:', error);
      throw error;
    }
  }

  /**
   * Subscribe to all collections in real-time
   */
  subscribeToCollections(callback: (collections: Collection[]) => void): () => void {
    try {
      const q = query(this.collectionsRef, orderBy('order', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const collections = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as Collection));
        
        callback(collections);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to collections:', error);
      throw error;
    }
  }

  /**
   * Create default "All" collection
   */
  async createAllCollection(): Promise<void> {
    try {
      const allCollectionRef = doc(db, 'collections', 'all');
      const docSnap = await getDoc(allCollectionRef);

      if (!docSnap.exists()) {
        await setDoc(allCollectionRef, {
          id: 'all',
          name: 'All Products',
          description: 'All products in your store',
          image: '',
          order: 0,
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isSystem: true
        });
      }
    } catch (error) {
      console.error('Error creating All collection:', error);
      throw error;
    }
  }

  /**
   * Search collections by name
   */
  async searchCollections(searchTerm: string): Promise<Collection[]> {
    try {
      const collections = await this.getAllCollections();
      return collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching collections:', error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(): Promise<{
    totalCollections: number;
    totalProducts: number;
    averageProductsPerCollection: number;
  }> {
    try {
      const collections = await this.getAllCollections();
      const totalProducts = collections.reduce((sum, c) => sum + c.productCount, 0);

      return {
        totalCollections: collections.length,
        totalProducts,
        averageProductsPerCollection: collections.length > 0 
          ? totalProducts / collections.length 
          : 0
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      throw error;
    }
  }
}

export const collectionService = new CollectionService();
