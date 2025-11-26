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
  addDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sales' | 'seasonal' | 'category' | 'custom';
  config: {
    filterCriteria?: Record<string, any>;
    autoPopulate?: boolean;
    updateFrequency?: 'daily' | 'weekly' | 'monthly' | 'manual';
    sortBy?: 'name' | 'price' | 'popularity' | 'newest';
  };
  previewImage?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

class CollectionTemplateService {
  private templatesRef = collection(db, 'collectionTemplates');

  /**
   * Get all collection templates
   */
  async getAllTemplates(): Promise<CollectionTemplate[]> {
    try {
      const q = query(this.templatesRef, orderBy('usageCount', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as CollectionTemplate));
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<CollectionTemplate[]> {
    try {
      const q = query(
        this.templatesRef,
        orderBy('usageCount', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as CollectionTemplate))
        .filter(t => t.category === category);
    } catch (error) {
      console.error('Error getting templates by category:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(
    name: string,
    description: string,
    icon: string,
    category: string,
    config: any,
    previewImage?: string
  ): Promise<string> {
    try {
      const newTemplate: Omit<CollectionTemplate, 'id'> = {
        name,
        description,
        icon,
        category: category as any,
        config,
        previewImage: previewImage || '',
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(this.templatesRef, newTemplate);
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<CollectionTemplate>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'collectionTemplates', templateId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const docRef = doc(db, 'collectionTemplates', templateId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    try {
      const docRef = doc(db, 'collectionTemplates', templateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentCount = docSnap.data().usageCount || 0;
        await updateDoc(docRef, {
          usageCount: currentCount + 1,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      throw error;
    }
  }

  /**
   * Initialize default templates
   */
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = [
        {
          id: 'best-sellers',
          name: 'Best Sellers',
          description: 'Your most popular products',
          icon: '⭐',
          category: 'sales',
          config: {
            autoPopulate: true,
            updateFrequency: 'daily',
            sortBy: 'popularity'
          },
          previewImage: '',
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'new-arrivals',
          name: 'New Arrivals',
          description: 'Recently added products',
          icon: '🆕',
          category: 'seasonal',
          config: {
            autoPopulate: true,
            updateFrequency: 'daily',
            sortBy: 'newest'
          },
          previewImage: '',
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'on-sale',
          name: 'On Sale',
          description: 'Discounted products',
          icon: '🏷️',
          category: 'sales',
          config: {
            autoPopulate: true,
            updateFrequency: 'daily',
            filterCriteria: { hasDiscount: true }
          },
          previewImage: '',
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'trending',
          name: 'Trending Now',
          description: 'Currently trending products',
          icon: '🔥',
          category: 'sales',
          config: {
            autoPopulate: true,
            updateFrequency: 'daily',
            sortBy: 'popularity'
          },
          previewImage: '',
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const batch = writeBatch(db);

      for (const template of defaultTemplates) {
        const docRef = doc(db, 'collectionTemplates', template.id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          batch.set(docRef, template);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    }
  }

  /**
   * Apply template to create collection
   */
  async applyTemplate(
    templateId: string,
    collectionName: string,
    collectionService: any
  ): Promise<string> {
    try {
      const docRef = doc(db, 'collectionTemplates', templateId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Template not found');
      }

      const template = docSnap.data() as CollectionTemplate;

      // Create collection from template
      const collectionId = await collectionService.createCollection(
        collectionName,
        template.description,
        template.previewImage
      );

      // Increment usage count
      await this.incrementUsageCount(templateId);

      return collectionId;
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }
}

export const collectionTemplateService = new CollectionTemplateService();
