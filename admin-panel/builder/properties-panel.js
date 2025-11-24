// ELEVEZ Visual Builder - Intelligent Properties Panel
// Context-aware property inspector

window.renderPropertiesPanel = function(elementData) {
  const panel = document.getElementById('propertiesPanel');
  
  if (!elementData) {
    panel.innerHTML = `
      <div class="no-selection">
        <p>Click any element on the canvas to edit</p>
      </div>
    `;
    return;
  }
  
  const { tagName, text, style, attributes } = elementData;
  
  let html = `
    <div class="property-section">
      <div class="property-header">
        <h4>${tagName.toUpperCase()}</h4>
        <span class="element-id">#${elementData.id}</span>
      </div>
  `;
  
  // Text properties
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a'].includes(tagName)) {
    html += `
      <div class="property-group">
        <label>Text Content</label>
        <textarea id="prop-text" rows="3">${text || ''}</textarea>
      </div>
      
      <div class="property-group">
        <label>Font Size</label>
        <input type="text" id="prop-fontSize" value="${style.fontSize || '16px'}">
      </div>
      
      <div class="property-group">
        <label>Font Weight</label>
        <select id="prop-fontWeight">
          <option value="300" ${style.fontWeight === '300' ? 'selected' : ''}>Light</option>
          <option value="400" ${style.fontWeight === '400' ? 'selected' : ''}>Normal</option>
          <option value="600" ${style.fontWeight === '600' ? 'selected' : ''}>Semibold</option>
          <option value="700" ${style.fontWeight === '700' ? 'selected' : ''}>Bold</option>
          <option value="800" ${style.fontWeight === '800' ? 'selected' : ''}>Extra Bold</option>
        </select>
      </div>
      
      <div class="property-group">
        <label>Text Color</label>
        <input type="color" id="prop-color" value="${rgbToHex(style.color) || '#ffffff'}">
      </div>
    `;
  }
  
  // Image properties
  if (tagName === 'img') {
    html += `
      <div class="property-group">
        <label>Image URL</label>
        <input type="url" id="prop-src" value="${attributes.src || ''}">
      </div>
    `;
  }
  
  // Background properties
  html += `
    <div class="property-group">
      <label>Background Color</label>
      <input type="color" id="prop-backgroundColor" value="${rgbToHex(style.backgroundColor) || '#000000'}">
    </div>
  `;
  
  // Spacing
  html += `
    <div class="property-group">
      <label>Padding</label>
      <input type="text" id="prop-padding" value="${style.padding || '0'}">
    </div>
    
    <div class="property-group">
      <label>Margin</label>
      <input type="text" id="prop-margin" value="${style.margin || '0'}">
    </div>
  `;
  
  // Button for applying changes
  html += `
    </div>
    <button class="btn-apply" onclick="applyPropertyChanges('${elementData.id}')">Apply Changes</button>
  `;
  
  panel.innerHTML = html;
};

// Apply property changes to the live element
window.applyPropertyChanges = function(elementId) {
  const updates = {
    text: document.getElementById('prop-text')?.value,
    style: {},
    attributes: {}
  };
  
  // Collect style updates
  const styleInputs = ['fontSize', 'fontWeight', 'color', 'backgroundColor', 'padding', 'margin'];
  styleInputs.forEach(prop => {
    const input = document.getElementById(`prop-${prop}`);
    if (input) {
      updates.style[prop] = input.value;
    }
  });
  
  // Collect attribute updates
  const srcInput = document.getElementById('prop-src');
  if (srcInput) {
    updates.attributes.src = srcInput.value;
  }
  
  // Apply to live renderer
  if (window.liveRenderer) {
    window.liveRenderer.updateElement(elementId, updates);
  }
  
  console.log('✅ Applied changes:', updates);
};

// Helper: Convert RGB to Hex
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#000000';
  
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
