// Discount Management Service
// Complete discount system with CRUD operations

class DiscountService {
  constructor() {
    this.discounts = this.loadDiscounts();
    this.usageHistory = this.loadUsageHistory();
  }

  loadDiscounts() {
    const saved = localStorage.getItem('discounts');
    return saved ? JSON.parse(saved) : this.getDefaultDiscounts();
  }

  loadUsageHistory() {
    const saved = localStorage.getItem('discountUsageHistory');
    return saved ? JSON.parse(saved) : [];
  }

  saveDiscounts() {
    localStorage.setItem('discounts', JSON.stringify(this.discounts));
  }

  saveUsageHistory() {
    localStorage.setItem('discountUsageHistory', JSON.stringify(this.usageHistory));
  }

  getDefaultDiscounts() {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      {
        id: 1,
        code: 'WELCOME15',
        name: 'Welcome Discount - 15% Off',
        type: 'percentage',
        value: 15,
        description: 'Get 15% off your first purchase with ELEVEZ',
        applicableTo: 'all',
        startDate: today,
        endDate: endDate,
        usageLimit: 1000,
        usageCount: 0,
        minPurchase: 0,
        maxDiscount: null,
        active: true,
        createdAt: today,
        updatedAt: today
      },
      {
        id: 2,
        code: 'SUMMER200',
        name: 'Summer Sale - ₹200 Off',
        type: 'fixed',
        value: 200,
        description: 'Flat ₹200 discount on orders over ₹1000',
        applicableTo: 'all',
        startDate: today,
        endDate: endDate,
        usageLimit: 500,
        usageCount: 0,
        minPurchase: 1000,
        maxDiscount: null,
        active: true,
        createdAt: today,
        updatedAt: today
      }
    ];
  }

  // Get all discounts
  getAllDiscounts() {
    return this.discounts;
  }

  // Get active discounts
  getActiveDiscounts() {
    return this.discounts.filter(d => d.active && new Date(d.endDate) > new Date());
  }

  // Get discount by code
  getDiscountByCode(code) {
    return this.discounts.find(d => d.code === code);
  }

  // Create new discount
  createDiscount(discountData) {
    const newDiscount = {
      id: Math.max(...this.discounts.map(d => d.id), 0) + 1,
      ...discountData,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.discounts.push(newDiscount);
    this.saveDiscounts();
    return newDiscount;
  }

  // Update discount
  updateDiscount(id, updates) {
    const index = this.discounts.findIndex(d => d.id === id);
    if (index !== -1) {
      this.discounts[index] = {
        ...this.discounts[index],
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      this.saveDiscounts();
      return this.discounts[index];
    }
    return null;
  }

  // Delete discount
  deleteDiscount(id) {
    this.discounts = this.discounts.filter(d => d.id !== id);
    this.saveDiscounts();
    return true;
  }

  // Toggle discount active status
  toggleDiscount(id) {
    const discount = this.discounts.find(d => d.id === id);
    if (discount) {
      discount.active = !discount.active;
      discount.updatedAt = new Date().toISOString().split('T')[0];
      this.saveDiscounts();
      return discount;
    }
    return null;
  }

  // Record discount usage
  recordUsage(code) {
    const discount = this.getDiscountByCode(code);
    if (discount) {
      discount.usageCount++;
      this.usageHistory.push({
        code,
        timestamp: new Date().toISOString(),
        discountId: discount.id
      });
      this.saveDiscounts();
      this.saveUsageHistory();
      return true;
    }
    return false;
  }

  // Get usage statistics
  getUsageStats() {
    const stats = {
      totalDiscounts: this.discounts.length,
      activeDiscounts: this.getActiveDiscounts().length,
      totalUsages: this.usageHistory.length,
      discountsByType: {},
      topDiscounts: []
    };

    // Count by type
    this.discounts.forEach(d => {
      stats.discountsByType[d.type] = (stats.discountsByType[d.type] || 0) + 1;
    });

    // Top discounts by usage
    stats.topDiscounts = [...this.discounts]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return stats;
  }

  // Validate discount code
  validateDiscount(code) {
    const discount = this.getDiscountByCode(code);
    if (!discount) return { valid: false, message: 'Discount code not found' };
    if (!discount.active) return { valid: false, message: 'Discount is inactive' };
    if (new Date(discount.endDate) < new Date()) return { valid: false, message: 'Discount has expired' };
    if (discount.usageCount >= discount.usageLimit) return { valid: false, message: 'Usage limit reached' };
    return { valid: true, discount };
  }

  // Calculate discount amount
  calculateDiscount(code, subtotal) {
    const validation = this.validateDiscount(code);
    if (!validation.valid) return { discountAmount: 0, error: validation.message };

    const discount = validation.discount;
    let discountAmount = 0;

    switch(discount.type) {
      case 'percentage':
        discountAmount = (subtotal * discount.value) / 100;
        break;
      case 'fixed':
        discountAmount = discount.value;
        break;
      case 'free_shipping':
        discountAmount = 10; // Assume $10 shipping
        break;
      case 'bundle':
        discountAmount = (subtotal * discount.value) / 100;
        break;
    }

    // Apply max discount limit if set
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }

    // Check minimum purchase
    if (subtotal < discount.minPurchase) {
      return { discountAmount: 0, error: `Minimum purchase of $${discount.minPurchase} required` };
    }

    return { discountAmount, discount };
  }

  // Generate discount code
  generateCode(prefix = 'DISC') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Bulk operations
  bulkToggle(ids) {
    ids.forEach(id => this.toggleDiscount(id));
    return true;
  }

  bulkDelete(ids) {
    ids.forEach(id => this.deleteDiscount(id));
    return true;
  }

  // Export discounts
  exportDiscounts() {
    return JSON.stringify(this.discounts, null, 2);
  }

  // Import discounts
  importDiscounts(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        this.discounts = imported;
        this.saveDiscounts();
        return { success: true, count: imported.length };
      }
      return { success: false, error: 'Invalid format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for use
window.DiscountService = new DiscountService();
