// Website Sections Manager
// Manage which products appear in which website sections

// Default sections
const DEFAULT_SECTIONS = [
  {
    id: 'home',
    name: 'Home Page',
    description: 'Featured products shown on homepage',
    icon: '🏠',
    maxProducts: 8,
    enabled: true,
    isDefault: true
  },
  {
    id: 'shop',
    name: 'Shop Page',
    description: 'All products in shop',
    icon: '🛍️',
    maxProducts: null, // unlimited
    enabled: true,
    isDefault: true
  },
  {
    id: 'bestSellers',
    name: 'Best Sellers',
    description: 'Top selling products',
    icon: '⭐',
    maxProducts: 6,
    enabled: true,
    isDefault: true
  },
  {
    id: 'newArrivals',
    name: 'New Arrivals',
    description: 'Latest products',
    icon: '🆕',
    maxProducts: 6,
    enabled: true,
    isDefault: true
  },
  {
    id: 'trending',
    name: 'Trending',
    description: 'Trending products',
    icon: '🔥',
    maxProducts: 6,
    enabled: true,
    isDefault: true
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Featured/hero products',
    icon: '✨',
    maxProducts: 4,
    enabled: true,
    isDefault: true
  }
];

// Initialize sections
function initializeSections() {
  const saved = localStorage.getItem('elevez_sections');
  if (!saved) {
    // First time - save defaults
    localStorage.setItem('elevez_sections', JSON.stringify(DEFAULT_SECTIONS));
    return DEFAULT_SECTIONS;
  }
  return JSON.parse(saved);
}

// Get all sections
function getSections() {
  return initializeSections();
}

// Save sections
function saveSections(sections) {
  localStorage.setItem('elevez_sections', JSON.stringify(sections));
}

// Get products in a section
function getProductsInSection(sectionId) {
  return state.products.filter(product => {
    // Check if product has section visibility
    if (product.sections && product.sections[sectionId]) {
      return true;
    }
    // Check array format
    if (product.visibleInSections && product.visibleInSections.includes(sectionId)) {
      return true;
    }
    // Legacy support - check old flags
    if (sectionId === 'home' && product.showInHome !== false) return true;
    if (sectionId === 'shop' && product.showInShop !== false) return true;
    if (sectionId === 'bestSellers' && product.isBestSeller) return true;
    if (sectionId === 'newArrivals' && product.isNew) return true;
    if (sectionId === 'trending' && product.tags?.includes('TRENDING')) return true;
    if (sectionId === 'featured' && product.isFeatured) return true;
    
    return false;
  });
}

// Render sections view
function renderSections() {
  const grid = document.getElementById('sectionsGrid');
  const sections = getSections();
  
  grid.innerHTML = sections.map(section => {
    const productsInSection = getProductsInSection(section.id);
    const productCount = productsInSection.length;
    const isOverLimit = section.maxProducts && productCount > section.maxProducts;
    
    return `
      <div class="section-card" style="background: var(--card-bg); border: 1px solid rgba(0,255,136,0.2); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 5px 0; color: var(--primary); font-size: 18px;">
              ${section.icon} ${section.name}
              ${section.isDefault ? '<span style="font-size: 11px; background: rgba(0,255,136,0.1); color: var(--primary); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">DEFAULT</span>' : ''}
            </h3>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">${section.description}</p>
          </div>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" ${section.enabled ? 'checked' : ''} onchange="toggleSection('${section.id}', this.checked)" style="width: 18px; height: 18px;">
            <span style="font-size: 12px; color: var(--text-muted);">Enabled</span>
          </label>
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${isOverLimit ? '#ff3b30' : 'var(--primary)'};">${productCount}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: var(--text-muted);">
                ${section.maxProducts ? `of ${section.maxProducts} max` : 'products'}
                ${isOverLimit ? ' ⚠️ Over limit!' : ''}
              </p>
            </div>
            <button class="btn btn-primary" onclick="manageSectionProducts('${section.id}')" style="padding: 8px 16px; font-size: 13px;">
              Manage Products
            </button>
          </div>
        </div>
        
        ${productCount > 0 ? `
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
            ${productsInSection.slice(0, 6).map(p => `
              <div style="position: relative; width: 60px; height: 75px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(0,255,136,0.2);">
                <img src="${p.image || p.images?.[0] || 'https://via.placeholder.com/60x75'}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            `).join('')}
            ${productCount > 6 ? `<div style="width: 60px; height: 75px; border-radius: 6px; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0,255,136,0.2);"><span style="font-size: 12px; color: var(--text-muted);">+${productCount - 6}</span></div>` : ''}
          </div>
        ` : '<p style="margin: 0; font-size: 12px; color: var(--text-muted);">No products assigned</p>'}
        
        ${!section.isDefault ? `
          <button class="btn btn-secondary" onclick="deleteSection('${section.id}')" style="width: 100%; margin-top: 10px; background: rgba(255,59,48,0.1); color: #ff3b30;">
            🗑️ Delete Section
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Toggle section enabled/disabled
window.toggleSection = (sectionId, enabled) => {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (section) {
    section.enabled = enabled;
    saveSections(sections);
    showSyncStatus(`${enabled ? '✅ Enabled' : '⚠️ Disabled'} section: ${section.name}`, 'success');
  }
};

// Manage products in a section
window.manageSectionProducts = (sectionId) => {
  const sections = getSections();
  const section = sections.find(s => s.id === sectionId);
  if (!section) return;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  
  const productsInSection = getProductsInSection(sectionId);
  const productsNotInSection = state.products.filter(p => !productsInSection.includes(p));
  
  modal.innerHTML = `
    <div style="background: var(--bg); border-radius: 16px; max-width: 900px; width: 90%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
      <div style="padding: 24px; border-bottom: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: var(--primary);">${section.icon} ${section.name}</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 24px; padding: 0; line-height: 1;">×</button>
        </div>
        <p style="margin: 10px 0 0 0; color: var(--text-muted); font-size: 14px;">${section.description}</p>
        ${section.maxProducts ? `<p style="margin: 5px 0 0 0; color: var(--text-muted); font-size: 12px;">Max products: ${section.maxProducts}</p>` : ''}
      </div>
      
      <div style="flex: 1; overflow-y: auto; padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- Products in section -->
          <div>
            <h3 style="margin: 0 0 15px 0; color: var(--primary); font-size: 16px;">In Section (${productsInSection.length})</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${productsInSection.length > 0 ? productsInSection.map(p => `
                <div style="background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.2); border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: center;">
                  <img src="${p.image || p.images?.[0]}" alt="${p.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 6px;">
                  <div style="flex: 1; min-width: 0;">
                    <p style="margin: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</p>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: var(--text-muted);">${p.qid}</p>
                  </div>
                  <button onclick="removeProductFromSection('${sectionId}', ${p.id}); this.closest('.modal').remove(); manageSectionProducts('${sectionId}');" style="background: rgba(255,59,48,0.1); color: #ff3b30; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">Remove</button>
                </div>
              `).join('') : '<p style="color: var(--text-muted); font-size: 13px;">No products in this section</p>'}
            </div>
          </div>
          
          <!-- Available products -->
          <div>
            <h3 style="margin: 0 0 15px 0; color: var(--text-muted); font-size: 16px;">Available (${productsNotInSection.length})</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${productsNotInSection.length > 0 ? productsNotInSection.map(p => `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: center;">
                  <img src="${p.image || p.images?.[0]}" alt="${p.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 6px;">
                  <div style="flex: 1; min-width: 0;">
                    <p style="margin: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</p>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: var(--text-muted);">${p.qid}</p>
                  </div>
                  <button onclick="addProductToSection('${sectionId}', ${p.id}); this.closest('.modal').remove(); manageSectionProducts('${sectionId}');" style="background: var(--primary); color: var(--bg); border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Add</button>
                </div>
              `).join('') : '<p style="color: var(--text-muted); font-size: 13px;">All products are in this section</p>'}
            </div>
          </div>
        </div>
      </div>
      
      <div style="padding: 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">
        <button onclick="this.closest('.modal').remove(); renderSections();" class="btn btn-primary">Done</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Add product to section
window.addProductToSection = (sectionId, productId) => {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  // Initialize sections object if not exists
  if (!product.sections) {
    product.sections = {};
  }
  
  // Add to section
  product.sections[sectionId] = true;
  
  // Also update array format for compatibility
  if (!product.visibleInSections) {
    product.visibleInSections = [];
  }
  if (!product.visibleInSections.includes(sectionId)) {
    product.visibleInSections.push(sectionId);
  }
  
  // Save
  saveData();
  showSyncStatus(`✅ Added "${product.name}" to section`, 'success');
};

// Remove product from section
window.removeProductFromSection = (sectionId, productId) => {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  
  // Remove from sections object
  if (product.sections) {
    product.sections[sectionId] = false;
  }
  
  // Remove from array
  if (product.visibleInSections) {
    product.visibleInSections = product.visibleInSections.filter(s => s !== sectionId);
  }
  
  // Save
  saveData();
  showSyncStatus(`🗑️ Removed "${product.name}" from section`, 'success');
};

// Add custom section
window.openAddSectionModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
  
  modal.innerHTML = `
    <div style="background: var(--bg); border-radius: 16px; max-width: 500px; width: 90%; padding: 24px;">
      <h2 style="margin: 0 0 20px 0; color: var(--primary);">Add Custom Section</h2>
      <form onsubmit="event.preventDefault(); addCustomSection(this); this.closest('.modal').remove();">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Section Name *</label>
          <input type="text" name="name" required placeholder="e.g., Summer Collection" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: var(--text);">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Description</label>
          <textarea name="description" placeholder="Brief description of this section" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: var(--text); min-height: 60px;"></textarea>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Icon (emoji)</label>
          <input type="text" name="icon" placeholder="🎨" maxlength="2" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: var(--text);">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-size: 14px;">Max Products (optional)</label>
          <input type="number" name="maxProducts" min="1" placeholder="Leave empty for unlimited" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 8px; color: var(--text);">
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="flex: 1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">Add Section</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Add custom section
window.addCustomSection = (form) => {
  const formData = new FormData(form);
  const sections = getSections();
  
  const newSection = {
    id: 'custom_' + Date.now(),
    name: formData.get('name'),
    description: formData.get('description') || '',
    icon: formData.get('icon') || '📑',
    maxProducts: formData.get('maxProducts') ? parseInt(formData.get('maxProducts')) : null,
    enabled: true,
    isDefault: false
  };
  
  sections.push(newSection);
  saveSections(sections);
  renderSections();
  showSyncStatus(`✅ Added custom section: ${newSection.name}`, 'success');
};

// Delete section
window.deleteSection = (sectionId) => {
  if (!confirm('Delete this section? Products will not be deleted, only the section assignment.')) return;
  
  const sections = getSections();
  const filtered = sections.filter(s => s.id !== sectionId);
  saveSections(filtered);
  renderSections();
  showSyncStatus('🗑️ Section deleted', 'success');
};

// Export for use in admin.js
window.renderSections = renderSections;
window.getSections = getSections;
window.getProductsInSection = getProductsInSection;
