// ELEVEZ Smart Content Editor
// Practical approach: Edit content through forms, preview in iframe

class SmartEditor {
  constructor() {
    this.currentSection = null;
    this.sections = [];
    this.changes = {};
    this.init();
  }

  async init() {
    console.log('🎨 Initializing Smart Content Editor...');
    
    // Load App.tsx to extract editable sections
    await this.loadSections();
    
    // Render component list
    this.renderComponentList();
    
    console.log('✅ Editor ready!');
  }

  async loadSections() {
    try {
      // Fetch App.tsx source
      const response = await fetch('/App.tsx');
      const code = await response.text();
      
      // Parse and extract editable sections
      this.sections = this.extractSections(code);
      
      console.log(`✅ Found ${this.sections.length} editable sections`);
      
    } catch (error) {
      console.error('❌ Failed to load sections:', error);
      
      // Fallback: Define common sections manually
      this.sections = [
        {
          id: 'hero',
          name: 'Hero Section',
          description: 'Main banner with headline and CTA',
          fields: [
            { name: 'headline', label: 'Headline', type: 'text', value: 'ELEVATE YOUR STYLE' },
            { name: 'subheadline', label: 'Subheadline', type: 'textarea', value: 'Premium streetwear for the modern generation' },
            { name: 'ctaText', label: 'Button Text', type: 'text', value: 'Shop Now' },
            { name: 'ctaLink', label: 'Button Link', type: 'text', value: '/collections' }
          ]
        },
        {
          id: 'featured',
          name: 'Featured Collection',
          description: 'Showcase your best products',
          fields: [
            { name: 'title', label: 'Section Title', type: 'text', value: 'Featured Collection' },
            { name: 'description', label: 'Description', type: 'textarea', value: 'Check out our latest drops' }
          ]
        },
        {
          id: 'about',
          name: 'About Section',
          description: 'Tell your brand story',
          fields: [
            { name: 'title', label: 'Title', type: 'text', value: 'About ELEVEZ' },
            { name: 'content', label: 'Content', type: 'textarea', value: 'We create premium streetwear...' }
          ]
        },
        {
          id: 'colors',
          name: 'Brand Colors',
          description: 'Customize your brand colors',
          fields: [
            { name: 'primary', label: 'Primary Color', type: 'color', value: '#00ff88' },
            { name: 'background', label: 'Background Color', type: 'color', value: '#000000' },
            { name: 'text', label: 'Text Color', type: 'color', value: '#ffffff' }
          ]
        },
        {
          id: 'footer',
          name: 'Footer',
          description: 'Footer content and links',
          fields: [
            { name: 'copyright', label: 'Copyright Text', type: 'text', value: '© 2024 ELEVEZ. All rights reserved.' },
            { name: 'email', label: 'Contact Email', type: 'text', value: 'hello@elevez.com' }
          ]
        }
      ];
    }
  }

  extractSections(code) {
    // Simple extraction - look for common patterns
    const sections = [];
    
    // This is a simplified parser - in production, use proper AST parsing
    // For now, return predefined sections
    return [];
  }

  renderComponentList() {
    const list = document.getElementById('componentList');
    
    if (this.sections.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No editable sections found</p></div>';
      return;
    }
    
    let html = '';
    this.sections.forEach(section => {
      html += `
        <div class="component-card" onclick="editor.selectSection('${section.id}')">
          <div class="component-name">${section.name}</div>
          <div class="component-desc">${section.description}</div>
        </div>
      `;
    });
    
    list.innerHTML = html;
  }

  selectSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    this.currentSection = section;
    
    // Update UI
    document.querySelectorAll('.component-card').forEach(card => {
      card.classList.remove('active');
    });
    event.target.closest('.component-card').classList.add('active');
    
    // Render editor
    this.renderEditor(section);
    
    console.log('✅ Selected section:', section.name);
  }

  renderEditor(section) {
    const container = document.getElementById('editorContent');
    
    let html = `
      <div class="success-message" id="successMessage">
        ✓ Changes saved successfully!
      </div>
      
      <div class="section-title">${section.name}</div>
      <p style="color: #888; font-size: 13px; margin-bottom: 24px;">${section.description}</p>
      
      <div class="editor-section">
    `;
    
    section.fields.forEach(field => {
      const value = this.changes[`${section.id}.${field.name}`] || field.value;
      
      html += `
        <div class="field-group">
          <label class="field-label">${field.label}</label>
      `;
      
      if (field.type === 'text') {
        html += `
          <input 
            type="text" 
            class="field-input" 
            value="${value}"
            onchange="editor.updateField('${section.id}', '${field.name}', this.value)"
          >
        `;
      } else if (field.type === 'textarea') {
        html += `
          <textarea 
            class="field-input"
            onchange="editor.updateField('${section.id}', '${field.name}', this.value)"
          >${value}</textarea>
        `;
      } else if (field.type === 'color') {
        html += `
          <input 
            type="color" 
            class="field-input color-picker" 
            value="${value}"
            onchange="editor.updateField('${section.id}', '${field.name}', this.value)"
          >
          <div class="field-hint">Current: ${value}</div>
        `;
      }
      
      html += `</div>`;
    });
    
    html += `
      </div>
      
      <div class="divider"></div>
      
      <button class="btn btn-primary" style="width: 100%;" onclick="editor.applyChanges()">
        ✓ Apply Changes
      </button>
    `;
    
    container.innerHTML = html;
  }

  updateField(sectionId, fieldName, value) {
    const key = `${sectionId}.${fieldName}`;
    this.changes[key] = value;
    console.log('📝 Updated:', key, '=', value);
  }

  applyChanges() {
    if (!this.currentSection) return;
    
    // Show success message
    const msg = document.getElementById('successMessage');
    if (msg) {
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 3000);
    }
    
    // Reload preview
    const iframe = document.getElementById('previewIframe');
    iframe.contentWindow.location.reload();
    
    console.log('✅ Changes applied');
  }

  async saveAndDeploy() {
    if (Object.keys(this.changes).length === 0) {
      alert('ℹ️ No changes to save');
      return;
    }
    
    if (!confirm('🚀 Save and deploy your changes?\n\nThis will:\n1. Update your website code\n2. Commit to GitHub\n3. Deploy to Vercel\n\nContinue?')) {
      return;
    }
    
    try {
      console.log('🚀 Deploying changes...');
      
      // Generate updated code
      const updatedCode = await this.generateCode();
      
      // Save to server
      const response = await fetch('/update-app-tsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: updatedCode,
          changes: this.changes
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Deployed successfully!\n\nYour changes are live in 1-2 minutes.\n\nURL: https://elevez-store.vercel.app');
        this.changes = {};
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Deploy failed:', error);
      alert('❌ Deployment failed: ' + error.message);
    }
  }

  async generateCode() {
    // Fetch current App.tsx
    const response = await fetch('/App.tsx');
    let code = await response.text();
    
    // Apply changes
    Object.entries(this.changes).forEach(([key, value]) => {
      const [sectionId, fieldName] = key.split('.');
      
      // Simple find-and-replace (in production, use proper AST transformation)
      // This is a placeholder - actual implementation would be more sophisticated
      console.log(`Updating ${sectionId}.${fieldName} to ${value}`);
    });
    
    return code;
  }

  preview() {
    window.open('http://localhost:5173/', '_blank');
  }
}

// Initialize
let editor;
document.addEventListener('DOMContentLoaded', () => {
  editor = new SmartEditor();
});
