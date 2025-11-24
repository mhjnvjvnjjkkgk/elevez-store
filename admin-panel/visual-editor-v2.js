// ELEVEZ Visual Editor Pro - Full Website Editor
// Direct DOM manipulation, no iframe restrictions

class VisualEditor {
  constructor() {
    this.selectedElement = null;
    this.elements = [];
    this.history = [];
    this.historyIndex = -1;
    this.canvas = document.getElementById('canvas');
    this.init();
  }

  async init() {
    console.log('🎨 Initializing Visual Editor Pro...');
    
    // Load website content
    await this.loadWebsite();
    
    // Make elements editable
    this.makeEditable();
    
    // Build element tree
    this.buildElementTree();
    
    console.log('✅ Editor ready!');
  }

  async loadWebsite() {
    try {
      // Fetch the actual website HTML
      const response = await fetch('http://localhost:5173/');
      const html = await response.text();
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract body content
      const body = doc.body;
      
      // Clone and inject into canvas
      this.canvas.innerHTML = body.innerHTML;
      
      // Copy styles
      const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        document.head.appendChild(style.cloneNode(true));
      });
      
      console.log('✅ Website loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load website:', error);
      this.canvas.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #666;">
          <h2 style="color: #00ff88; margin-bottom: 20px;">⚠️ Website Not Running</h2>
          <p>Make sure your dev server is running:</p>
          <code style="background: #1a1a1a; padding: 10px 20px; border-radius: 6px; display: inline-block; margin-top: 20px; color: #00ff88;">npm run dev</code>
        </div>
      `;
    }
  }

  makeEditable() {
    // Find all editable elements
    const selectors = 'h1, h2, h3, h4, h5, h6, p, button, a, img, section, div[class]';
    const elements = this.canvas.querySelectorAll(selectors);
    
    elements.forEach((element, index) => {
      // Skip if already processed
      if (element.dataset.editorId) return;
      
      // Add unique ID
      element.dataset.editorId = `el-${index}`;
      
      // Add editable class
      element.classList.add('editable');
      
      // Click handler
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectElement(element);
      });
      
      // Store element data
      this.elements.push({
        id: element.dataset.editorId,
        element: element,
        tagName: element.tagName.toLowerCase(),
        originalHTML: element.innerHTML,
        originalStyles: this.getComputedStyles(element)
      });
    });
    
    console.log(`✅ Made ${elements.length} elements editable`);
  }

  selectElement(element) {
    // Remove previous selection
    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
      const oldLabel = this.selectedElement.querySelector('.element-label');
      if (oldLabel) oldLabel.remove();
    }
    
    // Select new element
    this.selectedElement = element;
    element.classList.add('selected');
    
    // Add label
    const label = document.createElement('div');
    label.className = 'element-label';
    label.textContent = element.tagName.toLowerCase();
    element.style.position = 'relative';
    element.insertBefore(label, element.firstChild);
    
    // Update properties panel
    this.renderPropertiesPanel(element);
    
    // Highlight in element tree
    this.highlightInTree(element.dataset.editorId);
    
    console.log('✅ Selected:', element.tagName, element.dataset.editorId);
  }

  renderPropertiesPanel(element) {
    const panel = document.getElementById('propertiesPanel');
    const tagName = element.tagName.toLowerCase();
    const computedStyle = window.getComputedStyle(element);
    
    let html = `
      <div class="property-group">
        <label class="property-label">Element Type</label>
        <input type="text" class="property-input" value="${tagName}" disabled>
      </div>
    `;
    
    // Text content
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'span'].includes(tagName)) {
      const textContent = element.textContent.replace(/\n\s+/g, ' ').trim();
      html += `
        <div class="property-group">
          <label class="property-label">Text Content</label>
          <textarea class="property-input" id="prop-text">${textContent}</textarea>
        </div>
      `;
    }
    
    // Image source
    if (tagName === 'img') {
      html += `
        <div class="property-group">
          <label class="property-label">Image URL</label>
          <input type="url" class="property-input" id="prop-src" value="${element.src || ''}">
        </div>
      `;
    }
    
    // Link href
    if (tagName === 'a') {
      html += `
        <div class="property-group">
          <label class="property-label">Link URL</label>
          <input type="url" class="property-input" id="prop-href" value="${element.href || ''}">
        </div>
      `;
    }
    
    // Styles
    html += `
      <div class="property-group">
        <label class="property-label">Text Color</label>
        <input type="color" class="property-input color-input" id="prop-color" value="${this.rgbToHex(computedStyle.color)}">
      </div>
      
      <div class="property-group">
        <label class="property-label">Background Color</label>
        <input type="color" class="property-input color-input" id="prop-backgroundColor" value="${this.rgbToHex(computedStyle.backgroundColor)}">
      </div>
      
      <div class="property-group">
        <label class="property-label">Font Size</label>
        <input type="text" class="property-input" id="prop-fontSize" value="${computedStyle.fontSize}">
      </div>
      
      <div class="property-group">
        <label class="property-label">Font Weight</label>
        <select class="property-input" id="prop-fontWeight">
          <option value="300" ${computedStyle.fontWeight === '300' ? 'selected' : ''}>Light</option>
          <option value="400" ${computedStyle.fontWeight === '400' ? 'selected' : ''}>Normal</option>
          <option value="600" ${computedStyle.fontWeight === '600' ? 'selected' : ''}>Semibold</option>
          <option value="700" ${computedStyle.fontWeight === '700' ? 'selected' : ''}>Bold</option>
        </select>
      </div>
      
      <div class="property-group">
        <label class="property-label">Padding</label>
        <input type="text" class="property-input" id="prop-padding" value="${computedStyle.padding}">
      </div>
      
      <div class="property-group">
        <label class="property-label">Margin</label>
        <input type="text" class="property-input" id="prop-margin" value="${computedStyle.margin}">
      </div>
    `;
    
    // Apply button
    html += `
      <button class="btn btn-primary" style="width: 100%; margin-top: 20px;" onclick="editor.applyChanges()">
        ✓ Apply Changes
      </button>
      <button class="btn btn-secondary" style="width: 100%; margin-top: 10px;" onclick="editor.deleteElement()">
        🗑️ Delete Element
      </button>
    `;
    
    panel.innerHTML = html;
    
    // Add live update listeners
    this.attachPropertyListeners();
  }

  attachPropertyListeners() {
    const inputs = document.querySelectorAll('#propertiesPanel input, #propertiesPanel textarea, #propertiesPanel select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.applyChanges();
      });
    });
  }

  applyChanges() {
    if (!this.selectedElement) return;
    
    const element = this.selectedElement;
    
    // Text content
    const textInput = document.getElementById('prop-text');
    if (textInput) {
      element.textContent = textInput.value;
    }
    
    // Image src
    const srcInput = document.getElementById('prop-src');
    if (srcInput) {
      element.src = srcInput.value;
    }
    
    // Link href
    const hrefInput = document.getElementById('prop-href');
    if (hrefInput) {
      element.href = hrefInput.value;
    }
    
    // Styles
    const styleProps = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'padding', 'margin'];
    styleProps.forEach(prop => {
      const input = document.getElementById(`prop-${prop}`);
      if (input) {
        element.style[prop] = input.value;
      }
    });
    
    // Save to history
    this.saveToHistory();
    
    console.log('✅ Changes applied');
  }

  deleteElement() {
    if (!this.selectedElement) return;
    
    if (confirm('Delete this element?')) {
      this.selectedElement.remove();
      this.selectedElement = null;
      document.getElementById('propertiesPanel').innerHTML = '<div class="no-selection"><p>Element deleted</p></div>';
      this.buildElementTree();
      this.saveToHistory();
    }
  }

  addElement(type) {
    const templates = {
      text: '<p style="padding: 20px; color: black;">New text element</p>',
      button: '<button style="padding: 12px 24px; background: #00ff88; color: black; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">New Button</button>',
      image: '<img src="https://via.placeholder.com/400x300" style="max-width: 100%; height: auto;" alt="New image">',
      section: '<section style="padding: 60px 20px; background: #f5f5f5;"><h2 style="color: black; text-align: center;">New Section</h2></section>'
    };
    
    const html = templates[type] || templates.text;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const newElement = temp.firstElementChild;
    
    // Add to canvas
    if (this.selectedElement) {
      this.selectedElement.parentNode.insertBefore(newElement, this.selectedElement.nextSibling);
    } else {
      this.canvas.appendChild(newElement);
    }
    
    // Make editable
    newElement.dataset.editorId = `el-${Date.now()}`;
    newElement.classList.add('editable');
    newElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.selectElement(newElement);
    });
    
    // Select it
    this.selectElement(newElement);
    
    // Update tree
    this.buildElementTree();
    this.saveToHistory();
    
    console.log('✅ Added new', type);
  }

  buildElementTree() {
    const list = document.getElementById('elementList');
    const elements = this.canvas.querySelectorAll('.editable');
    
    if (elements.length === 0) {
      list.innerHTML = '<div class="no-selection">No elements</div>';
      return;
    }
    
    let html = '';
    elements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      const text = el.textContent.substring(0, 30).trim();
      const icon = this.getElementIcon(tagName);
      
      html += `
        <div class="element-item" onclick="editor.selectElementById('${el.dataset.editorId}')">
          <span class="element-icon">${icon}</span>
          <span>${tagName}: ${text}...</span>
        </div>
      `;
    });
    
    list.innerHTML = html;
  }

  selectElementById(id) {
    const element = this.canvas.querySelector(`[data-editor-id="${id}"]`);
    if (element) {
      this.selectElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  highlightInTree(id) {
    document.querySelectorAll('#elementList .element-item').forEach(item => {
      item.classList.remove('selected');
    });
    // Would need to match by ID - simplified for now
  }

  getElementIcon(tagName) {
    const icons = {
      h1: '📰', h2: '📰', h3: '📰', h4: '📰', h5: '📰', h6: '📰',
      p: 'T', span: 'T',
      button: '🔘',
      a: '🔗',
      img: '🖼️',
      section: '📦',
      div: '📦'
    };
    return icons[tagName] || '📄';
  }

  getComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      padding: computed.padding,
      margin: computed.margin
    };
  }

  rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  saveToHistory() {
    const state = this.canvas.innerHTML;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex++;
    console.log('💾 Saved to history');
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.makeEditable();
      this.buildElementTree();
      console.log('↶ Undo');
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.makeEditable();
      this.buildElementTree();
      console.log('↷ Redo');
    }
  }

  preview() {
    window.open('http://localhost:5173/', '_blank');
  }

  async publish() {
    if (!confirm('🚀 Publish changes to your live website?\n\nThis will:\n1. Generate updated code\n2. Commit to GitHub\n3. Deploy to Vercel\n\nContinue?')) {
      return;
    }
    
    alert('🚀 Publishing...\n\nThis feature will:\n1. Extract your changes\n2. Update App.tsx\n3. Push to GitHub\n4. Trigger Vercel deployment\n\nImplementation coming in next phase!');
    
    // TODO: Implement code generation and deployment
    console.log('🚀 Publishing changes...');
  }
}

// Initialize editor
let editor;
document.addEventListener('DOMContentLoaded', () => {
  editor = new VisualEditor();
});
