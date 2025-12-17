
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class DiscountService {
  constructor() {
    this.collectionRef = collection(db, 'discounts');
    this.usageHistory = JSON.parse(localStorage.getItem('discountUsageHistory') || '[]');
  }

  // Get all discounts
  async getAllDiscounts() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      const discounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return discounts;
    } catch (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
  }

  // Get active discounts
  async getActiveDiscounts() {
    // Note: Better to filter server-side, but strict "active" involves date checks too
    const discounts = await this.getAllDiscounts();
    return discounts.filter(d => d.active && new Date(d.endDate) > new Date());
  }

  // Create new discount
  async createDiscount(discountData) {
    try {
      const newDiscount = {
        ...discountData,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(this.collectionRef, newDiscount);
      return { id: docRef.id, ...newDiscount };
    } catch (error) {
      console.error("Error creating discount:", error);
      throw error;
    }
  }

  // Update discount
  async updateDiscount(id, updates) {
    try {
      const docRef = doc(db, 'discounts', id);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
      return { id, ...updates };
    } catch (error) {
      console.error("Error updating discount:", error);
      throw error;
    }
  }

  // Delete discount
  async deleteDiscount(id) {
    try {
      await deleteDoc(doc(db, 'discounts', id));
      return true;
    } catch (error) {
      console.error("Error deleting discount:", error);
      return false;
    }
  }

  // Toggle discount active status
  async toggleDiscount(id) {
    // Ideally fetch first to toggle, but for now we might need to rely on UI state or re-fetch
    // We'll assume the caller passes the new state or we implement a fetch
    // Implementation simplified for now
    console.warn("toggleDiscount requires knowing current state");
  }

  // Generate discount code (helper)
  generateCode(prefix = 'DISC') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get usage statistics (simplified for now, ideally aggregated on server)
  async getUsageStats() {
    const discounts = await this.getAllDiscounts();
    const stats = {
      totalDiscounts: discounts.length,
      activeDiscounts: discounts.filter(d => d.active).length,
      totalUsages: discounts.reduce((acc, d) => acc + (d.usageCount || 0), 0),
      discountsByType: {},
      topDiscounts: []
    };

    discounts.forEach(d => {
      stats.discountsByType[d.type] = (stats.discountsByType[d.type] || 0) + 1;
    });

    stats.topDiscounts = [...discounts]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5);

    return stats;
  }

  // Export discounts
  async exportDiscounts() {
    const discounts = await this.getAllDiscounts();
    return JSON.stringify(discounts, null, 2);
  }

  // Import discounts
  async importDiscounts(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        let count = 0;
        for (const discount of imported) {
          // Remove ID to create new doc
          const { id, ...data } = discount;
          await this.createDiscount(data);
          count++;
        }
        return { success: true, count };
      }
      return { success: false, error: 'Invalid format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for use
window.DiscountService = new DiscountService();
