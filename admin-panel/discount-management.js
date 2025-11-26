// Discount Management System - Main Application
// Complete UI and functionality for managing discounts

class DiscountManagementApp {
  constructor() {
    this.service = window.DiscountService;
    this.currentTab = 'all';
    this.selectedDiscounts = [];
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container">
        ${this.renderHeader()}
        ${this.renderStats()}
        ${this.renderTabs()}
        ${this.renderContent()}
        ${this.renderModals()}
      </div>
    `;
  }

  renderHeader() {
    return `
      <div class="header">
        <div class="header-title">💰 Discount Management System</div>
        <div class="header-actions">
          <button class="btn btn-secondary" onclick="app.exportDiscounts()">📥 Export</button>
          <button class="btn btn-secondary" onclick="app.importDiscounts()">📤 Import</button>
          <button class="btn btn-primary" onclick="app.openCreateModal()">➕ New Discount</button>
        </div>
      </div>
    `;
  }

  renderStats() {
    const stats = this.service.getUsageStats();
    return `
      <div class="stats-grid">
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
      </div>
    `;
  }

  renderTabs() {
    return `
      <div class="tabs">
        <button class="tab ${this.currentTab === 'all' ? 'active' : ''}" onclick="app.switchTab('all')">All Discounts</button>
        <button class="tab ${this.currentTab === 'active' ? 'active' : ''}" onclick="app.switchTab('active')">Active</button>
        <button class="tab ${this.currentTab === 'expired' ? 'active' : ''}" onclick="app.switchTab('expired')">Expired</button>
        <button class="tab ${this.currentTab === 'analytics' ? 'active' : ''}" onclick="app.switchTab('analytics')">Analytics</button>
      </div>
    `;
  }

  renderContent() {
    switch(this.currentTab) {
      case 'all': return this.renderAllDiscounts();
      case 'active': return this.renderActiveDiscounts();
      case 'expired': return this.renderExpiredDiscounts();
      case 'analytics': return this.renderAnalytics();
      default: return this.renderAllDiscounts();
    }
  }

  renderAllDiscounts() {
    const discounts = this.service.getAllDiscounts();
    return `
      <div class="card">
        <div class="card-title">📋 All Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState() : this.renderDiscountTable(discounts)}
      </div>
    `;
  }

  renderActiveDiscounts() {
    const discounts = this.service.getActiveDiscounts();
    return `
      <div class="card">
        <div class="card-title">✅ Active Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState('No active discounts') : this.renderDiscountTable(discounts)}
      </div>
    `;
  }

  renderExpiredDiscounts() {
    const discounts = this.service.getAllDiscounts().filter(d => new Date(d.endDate) < new Date());
    return `
      <div class="card">
        <div class="card-title">⏰ Expired Discounts</div>
        ${discounts.length === 0 ? this.renderEmptyState('No expired discounts') : this.renderDiscountTable(discounts)}
      </div>
    `;
  }

  renderDiscountTable(discounts) {
    return `
      <table class="table">
        <thead>
          <tr>
            <th><input type="checkbox" class="checkbox" onchange="app.toggleSelectAll(this)"></th>
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
          ${discounts.map(d => this.renderDiscountRow(d)).join('')}
        </tbody>
      </table>
    `;
  }

  renderDiscountRow(discount) {
    const isExpired = new Date(discount.endDate) < new Date();
    const usagePercent = (discount.usageCount / discount.usageLimit * 100).toFixed(0);
    
    return `
      <tr>
        <td><input type="checkbox" class="checkbox" data-id="${discount.id}" onchange="app.toggleSelect(this)"></td>
        <td><span class="discount-code">${discount.code}</span></td>
        <td>${discount.name}</td>
        <td><span class="badge badge-info">${discount.type}</span></td>
        <td>${discount.type === 'percentage' ? discount.value + '%' : '$' + discount.value}</td>
        <td>
          <div style="font-size: 12px; margin-bottom: 5px;">${discount.usageCount}/${discount.usageLimit}</div>
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
          <button class="btn btn-secondary btn-sm" onclick="app.openEditModal(${discount.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="app.deleteDiscount(${discount.id})">Delete</button>
        </td>
      </tr>
    `;
  }

  renderAnalytics() {
    const stats = this.service.getUsageStats();
    const topDiscounts = stats.topDiscounts;

    return `
      <div class="card">
        <div class="card-title">📊 Analytics & Statistics</div>
        
        <h3 style="margin-top: 20px; margin-bottom: 15px;">Discount Types Distribution</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          ${Object.entries(stats.discountsByType).map(([type, count]) => `
            <div style="background: var(--bg-lighter); padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${count}</div>
              <div style="font-size: 12px; color: var(--text-muted); text-transform: capitalize;">${type}</div>
            </div>
          `).join('')}
        </div>

        <h3 style="margin-top: 20px; margin-bottom: 15px;">Top Discounts by Usage</h3>
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
              const percent = (d.usageCount / d.usageLimit * 100).toFixed(0);
              return `
                <tr>
                  <td><span class="discount-code">${d.code}</span></td>
                  <td>${d.name}</td>
                  <td>${d.usageCount}</td>
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

  renderModals() {
    return `
      <div id="createModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span>Create New Discount</span>
            <button class="modal-close" onclick="app.closeModal('createModal')">×</button>
          </div>
          ${this.renderDiscountForm()}
        </div>
      </div>

      <div id="editModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span>Edit Discount</span>
            <button class="modal-close" onclick="app.closeModal('editModal')">×</button>
          </div>
          ${this.renderDiscountForm(true)}
        </div>
      </div>
    `;
  }

  renderDiscountForm(isEdit = false) {
    return `
      <form onsubmit="app.saveDiscount(event, ${isEdit})">
        <div class="form-group">
          <label class="form-label">Discount Code</label>
          <div style="display: flex; gap: 10px;">
            <input type="text" class="form-input" id="code" placeholder="e.g., SAVE10" required>
            <button type="button" class="btn btn-secondary" onclick="app.generateCode()">Generate</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Discount Name</label>
          <input type="text" class="form-input" id="name" placeholder="e.g., 10% Off Everything" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" id="description" placeholder="Describe this discount"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Discount Type</label>
            <select class="form-select" id="type" onchange="app.updateTypeFields()" required>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="bundle">Bundle Discount</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Discount Value</label>
            <input type="number" class="form-input" id="value" placeholder="10" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input type="date" class="form-input" id="startDate" required>
          </div>

          <div class="form-group">
            <label class="form-label">End Date</label>
            <input type="date" class="form-input" id="endDate" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Usage Limit</label>
            <input type="number" class="form-input" id="usageLimit" placeholder="100" required>
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Purchase</label>
            <input type="number" class="form-input" id="minPurchase" placeholder="0" value="0">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" id="active" checked> Active
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal('${isEdit ? 'editModal' : 'createModal'}')">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Discount</button>
        </div>
      </form>
    `;
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
    this.attachEventListeners();
  }

  openCreateModal() {
    document.getElementById('createModal').classList.add('active');
    document.getElementById('code').value = this.service.generateCode();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('endDate').value = nextMonth;
  }

  openEditModal(id) {
    const discount = this.service.discounts.find(d => d.id === id);
    if (!discount) return;

    document.getElementById('editModal').classList.add('active');
    document.getElementById('code').value = discount.code;
    document.getElementById('name').value = discount.name;
    document.getElementById('description').value = discount.description;
    document.getElementById('type').value = discount.type;
    document.getElementById('value').value = discount.value;
    document.getElementById('startDate').value = discount.startDate;
    document.getElementById('endDate').value = discount.endDate;
    document.getElementById('usageLimit').value = discount.usageLimit;
    document.getElementById('minPurchase').value = discount.minPurchase;
    document.getElementById('active').checked = discount.active;
    document.getElementById('editModal').dataset.id = id;
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  saveDiscount(event, isEdit) {
    event.preventDefault();

    const data = {
      code: document.getElementById('code').value,
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      type: document.getElementById('type').value,
      value: parseFloat(document.getElementById('value').value),
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      usageLimit: parseInt(document.getElementById('usageLimit').value),
      minPurchase: parseFloat(document.getElementById('minPurchase').value),
      active: document.getElementById('active').checked,
      applicableTo: 'all'
    };

    if (isEdit) {
      const id = parseInt(document.getElementById('editModal').dataset.id);
      this.service.updateDiscount(id, data);
      this.closeModal('editModal');
      alert('Discount updated successfully!');
    } else {
      this.service.createDiscount(data);
      this.closeModal('createModal');
      alert('Discount created successfully!');
    }

    this.render();
    this.attachEventListeners();
  }

  deleteDiscount(id) {
    if (confirm('Are you sure you want to delete this discount?')) {
      this.service.deleteDiscount(id);
      alert('Discount deleted successfully!');
      this.render();
      this.attachEventListeners();
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

  toggleSelect(checkbox) {
    const id = parseInt(checkbox.dataset.id);
    if (checkbox.checked) {
      this.selectedDiscounts.push(id);
    } else {
      this.selectedDiscounts = this.selectedDiscounts.filter(sid => sid !== id);
    }
  }

  toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.checkbox[data-id]');
    this.selectedDiscounts = [];
    checkboxes.forEach(cb => {
      cb.checked = checkbox.checked;
      if (checkbox.checked) {
        this.selectedDiscounts.push(parseInt(cb.dataset.id));
      }
    });
  }

  exportDiscounts() {
    const data = this.service.exportDiscounts();
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
      reader.onload = (event) => {
        const result = this.service.importDiscounts(event.target.result);
        if (result.success) {
          alert(`Imported ${result.count} discounts successfully!`);
          this.render();
          this.attachEventListeners();
        } else {
          alert('Import failed: ' + result.error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  attachEventListeners() {
    // Modal close on background click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new DiscountManagementApp();
});
