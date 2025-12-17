
// Discount Panel App - Async Version
// Handles UI logic for Discount Management using Firestore Service

class DiscountPanelApp {
  constructor() {
    this.currentTab = 'all';
    this.selectedDiscounts = [];
    this.service = null; // Will be set in init
    window.app = this; // Expose for HTML onclick handlers immediately

    // We can't use async in constructor, so we rely on init called externally or self-init
    this.waitForService();
  }

  async waitForService() {
    let retries = 0;
    while (!window.DiscountService && retries < 50) {
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }

    if (!window.DiscountService) {
      console.error('DiscountService failed to load');
      alert('Error: Failed to load discount service. Please refresh the page.');
      return;
    }

    this.service = window.DiscountService;
    this.init();
  }

  async init() {
    await this.render();
  }

  async render() {
    await this.renderStats();
    await this.renderContent();
  }

  async renderStats() {
    const stats = await this.service.getUsageStats();
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Discounts</div>
        <div class="stat-value">${stats.totalDiscounts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Discounts</div>
        <div class="stat-value">${stats.activeDiscounts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Uses</div>
        <div class="stat-value">${stats.totalUsages}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Discount Types</div>
        <div class="stat-value">${Object.keys(stats.discountsByType).length}</div>
      </div>
    `;
  }

  async renderContent() {
    const content = document.getElementById('content');
    let html = '';

    switch (this.currentTab) {
      case 'all':
        html = await this.renderAllDiscounts();
        break;
      case 'active':
        html = await this.renderActiveDiscounts();
        break;
      case 'expired':
        html = await this.renderExpiredDiscounts();
        break;
      case 'analytics':
        html = await this.renderAnalytics();
        break;
    }

    content.innerHTML = html;
  }

  async renderAllDiscounts() {
    const discounts = await this.service.getAllDiscounts();
    return `
      <div class="card">
        <div class="card-title">📋 All Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState() : this.renderTable(discounts)}
      </div>
    `;
  }

  async renderActiveDiscounts() {
    const discounts = await this.service.getActiveDiscounts();
    return `
      <div class="card">
        <div class="card-title">✅ Active Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState('No active discounts') : this.renderTable(discounts)}
      </div>
    `;
  }

  async renderExpiredDiscounts() {
    const allDiscounts = await this.service.getAllDiscounts();
    const discounts = allDiscounts.filter(d => new Date(d.endDate) < new Date());
    return `
      <div class="card">
        <div class="card-title">⏰ Expired Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState('No expired discounts') : this.renderTable(discounts)}
      </div>
    `;
  }

  renderTable(discounts) {
    return `
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Usage</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${discounts.map(d => this.renderRow(d)).join('')}
        </tbody>
      </table>
    `;
  }

  renderRow(discount) {
    const isExpired = new Date(discount.endDate) < new Date();
    // usageCount might be undefined on some records, handle gracefully
    const usageCount = discount.usageCount || 0;
    const usagePercent = discount.usageLimit ? (usageCount / discount.usageLimit * 100).toFixed(0) : 0;

    return `
      <tr>
        <td><span class="discount-code">${discount.code}</span></td>
        <td>${discount.name}</td>
        <td><span class="badge badge-info">${discount.type}</span></td>
        <td>${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value}</td>
        <td>
          <div style="font-size: 12px; margin-bottom: 5px;">${usageCount}/${discount.usageLimit}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${usagePercent}%"></div>
          </div>
        </td>
        <td>${discount.endDate}</td>
        <td>
          <span class="badge ${isExpired ? 'badge-danger' : discount.active ? 'badge-success' : 'badge-warning'}">
            ${isExpired ? 'Expired' : discount.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="app.openEditModal('${discount.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="app.deleteDiscount('${discount.id}')">Delete</button>
        </td>
      </tr>
    `;
  }

  async renderAnalytics() {
    const stats = await this.service.getUsageStats();
    const topDiscounts = stats.topDiscounts;

    return `
      <div class="card">
        <div class="card-title">📊 Analytics & Statistics</div>
        
        <h3 style="margin-top: 20px; margin-bottom: 15px; font-size: 16px; font-weight: 600;">Discount Types Distribution</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
          ${Object.entries(stats.discountsByType).map(([type, count]) => `
            <div style="background: var(--bg-light); padding: 15px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
              <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${count}</div>
              <div style="font-size: 12px; color: var(--text-muted); text-transform: capitalize;">${type}</div>
            </div>
          `).join('')}
        </div>

        <h3 style="margin-top: 20px; margin-bottom: 15px; font-size: 16px; font-weight: 600;">Top Discounts by Usage</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Uses</th>
              <th>Limit</th>
              <th>Usage %</th>
            </tr>
          </thead>
          <tbody>
            ${topDiscounts.map(d => {
      const usageCount = d.usageCount || 0;
      const percent = d.usageLimit ? (usageCount / d.usageLimit * 100).toFixed(0) : 0;
      return `
                <tr>
                  <td><span class="discount-code">${d.code}</span></td>
                  <td>${d.name}</td>
                  <td>${usageCount}</td>
                  <td>${d.usageLimit}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    ${percent}%
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderEmptyState(message = 'No discounts found') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎟️</div>
        <div class="empty-state-title">${message}</div>
        <p>Create your first discount to get started</p>
      </div>
    `;
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    // event might not be available if called programmatically, handle carefully
    if (window.event && window.event.target) {
      window.event.target.classList.add('active');
    }
    this.renderContent();
  }

  openCreateModal() {
    if (!this.service) {
      console.warn('Service not ready');
      alert('Service is not ready, please wait or refresh page');
      return;
    }
    document.getElementById('modalTitle').textContent = 'Create New Discount';
    document.getElementById('discountId').value = '';
    document.getElementById('discountForm').reset();
    document.getElementById('code').value = this.service.generateCode();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('endDate').value = nextMonth;
    document.getElementById('discountModal').classList.add('active');
  }

  async openEditModal(id) {
    const discounts = await this.service.getAllDiscounts();
    const discount = discounts.find(d => d.id === id);
    if (!discount) return;

    document.getElementById('modalTitle').textContent = 'Edit Discount';
    document.getElementById('discountId').value = id;
    document.getElementById('code').value = discount.code;
    document.getElementById('name').value = discount.name;
    document.getElementById('description').value = discount.description || '';
    document.getElementById('type').value = discount.type;
    document.getElementById('value').value = discount.value;
    document.getElementById('startDate').value = discount.startDate.split('T')[0];
    document.getElementById('endDate').value = discount.endDate.split('T')[0];
    document.getElementById('usageLimit').value = discount.usageLimit;
    document.getElementById('minPurchase').value = discount.minPurchase;
    document.getElementById('active').checked = discount.active;
    document.getElementById('discountModal').classList.add('active');
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  async saveDiscount(event) {
    event.preventDefault();

    if (!this.service) {
      alert('Service is not ready yet. Please wait and try again.');
      return;
    }

    const id = document.getElementById('discountId').value;
    const data = {
      code: document.getElementById('code').value,
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      type: document.getElementById('type').value,
      value: parseFloat(document.getElementById('value').value),
      startDate: new Date(document.getElementById('startDate').value).toISOString(),
      endDate: new Date(document.getElementById('endDate').value).toISOString(),
      usageLimit: parseInt(document.getElementById('usageLimit').value),
      minPurchase: parseFloat(document.getElementById('minPurchase').value),
      active: document.getElementById('active').checked,
      applicableTo: 'all' // Default
    };

    try {
      if (id) {
        await this.service.updateDiscount(id, data);
        alert('Discount updated successfully!');
      } else {
        await this.service.createDiscount(data);
        alert('Discount created successfully!');
      }
      this.closeModal('discountModal');
      this.render();
    } catch (error) {
      console.error(error);
      alert('Error saving discount: ' + error.message);
    }
  }

  async deleteDiscount(id) {
    if (confirm('Are you sure you want to delete this discount?')) {
      await this.service.deleteDiscount(id);
      alert('Discount deleted successfully!');
      this.render();
    }
  }

  generateCode() {
    document.getElementById('code').value = this.service.generateCode();
  }

  updateTypeFields() {
    const type = document.getElementById('type').value;
    const valueInput = document.getElementById('value');

    if (type === 'free_shipping') {
      valueInput.value = '0';
      valueInput.disabled = true;
    } else {
      valueInput.disabled = false;
    }
  }

  async exportDiscounts() {
    const data = await this.service.exportDiscounts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'discounts.json';
    a.click();
    alert('Discounts exported successfully!');
  }

  importDiscounts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = await this.service.importDiscounts(event.target.result);
        if (result.success) {
          alert(`Imported ${result.count} discounts successfully!`);
          this.render();
        } else {
          alert('Import failed: ' + result.error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

// Start app
new DiscountPanelApp();
