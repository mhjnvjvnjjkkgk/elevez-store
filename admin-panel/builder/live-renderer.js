// ELEVEZ Visual Builder - Live Website Renderer
// Uses postMessage API for cross-origin communication

class LiveWebsiteRenderer {
  constructor(iframeId) {
    this.iframe = document.getElementById(iframeId);
    this.isReady = false;
    this.selectedElement = null;
    this.setupMessageListener();
    this.setupIframe();
  }

  setupIframe() {
    this.iframe.addEventListener('load', () => {
      console.log('✅ Website loaded in iframe');
      this.injectEditorScript();
    });
  }

  // Setup message listener for iframe communication
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security: verify origin
      if (event.origin !== 'http://localhost:5173') return;
      
      const { type, data } = event.data;
      
      switch (type) {
        case 'EDITOR_READY':
          this.isReady = true;
          console.log('✅ Editor tools injected and ready');
          window.showNotification?.('✅ Editor ready! Click any element to edit', 'success');
          break;
          
        case 'ELEMENT_SELECTED':
          this.handleElementSelected(data);
          break;
          
        case 'ELEMENT_HOVERED':
          this.handleElementHovered(data);
          break;
      }
    });
  }

  // Inject editor script into iframe
  injectEditorScript() {
    const script = `
      (function() {
        console.log('🎨 Injecting visual editor tools...');
        
        // Add editor styles
        const style = document.createElement('style');
        style.textContent = \`
          .vb-selected {
            outline: 2px solid #00ff88 !important;
            outline-offset: 2px;
            cursor: pointer !important;
            position: relative;
          }
          
          .vb-hovered:not(.vb-selected) {
            outline: 1px dashed #00ff88 !important;
            outline-offset: 2px;
          }
          
          .vb-label {
            position: absolute;
            top: -24px;
            left: 0;
            background: #00ff88;
            color: black;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px 4px 0 0;
            white-space: nowrap;
            z-index: 999999;
            pointer-events: none;
          }
        \`;
        document.head.appendChild(style);
        
        // Track selected element
        let selectedElement = null;
        
        // Make elements selectable
        const selectableSelectors = 'section, div, h1, h2, h3, h4, h5, h6, p, button, a, img, span';
        const elements = document.querySelectorAll(selectableSelectors);
        
        elements.forEach((element, index) => {
          // Add unique ID
          if (!element.dataset.vbId) {
            element.dataset.vbId = 'vb-' + index;
          }
          
          // Click handler
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove previous selection
            if (selectedElement) {
              selectedElement.classList.remove('vb-selected');
              const oldLabel = selectedElement.querySelector('.vb-label');
              if (oldLabel) oldLabel.remove();
            }
            
            // Select new element
            selectedElement = element;
            element.classList.add('vb-selected');
            
            // Add label
            const label = document.createElement('div');
            label.className = 'vb-label';
            label.textContent = element.tagName.toLowerCase();
            element.style.position = 'relative';
            element.appendChild(label);
            
            // Extract element data
            const computedStyle = window.getComputedStyle(element);
            const elementData = {
              id: element.dataset.vbId,
              tagName: element.tagName.toLowerCase(),
              text: element.textContent?.trim().substring(0, 200),
              innerHTML: element.innerHTML,
              style: {
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                fontWeight: computedStyle.fontWeight,
                fontFamily: computedStyle.fontFamily,
                padding: computedStyle.padding,
                margin: computedStyle.margin,
                width: computedStyle.width,
                height: computedStyle.height,
                display: computedStyle.display
              },
              attributes: {
                class: element.className,
                id: element.id,
                href: element.href,
                src: element.src
              }
            };
            
            // Send to parent
            window.parent.postMessage({
              type: 'ELEMENT_SELECTED',
              data: elementData
            }, '*');
          });
          
          // Hover handlers
          element.addEventListener('mouseenter', () => {
            if (element !== selectedElement) {
              element.classList.add('vb-hovered');
            }
          });
          
          element.addEventListener('mouseleave', () => {
            element.classList.remove('vb-hovered');
          });
        });
        
        // Listen for updates from parent
        window.addEventListener('message', (event) => {
          const { type, data } = event.data;
          
          if (type === 'UPDATE_ELEMENT') {
            const element = document.querySelector(\`[data-vb-id="\${data.id}"]\`);
            if (!element) return;
            
            // Update text
            if (data.updates.text !== undefined) {
              element.textContent = data.updates.text;
            }
            
            // Update styles
            if (data.updates.style) {
              Object.assign(element.style, data.updates.style);
            }
            
            // Update attributes
            if (data.updates.attributes) {
              Object.entries(data.updates.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
              });
            }
          }
        });
        
        // Notify parent that editor is ready
        window.parent.postMessage({ type: 'EDITOR_READY' }, '*');
        console.log('✅ Visual editor tools ready!');
      })();
    `;
    
    try {
      // Send script to iframe
      this.iframe.contentWindow.postMessage({
        type: 'INJECT_SCRIPT',
        script: script
      }, '*');
      
      // Also try direct injection if same-origin
      try {
        const scriptEl = this.iframe.contentDocument.createElement('script');
        scriptEl.textContent = script;
        this.iframe.contentDocument.body.appendChild(scriptEl);
      } catch (e) {
        // Cross-origin, use postMessage only
        console.log('ℹ️ Using postMessage for cross-origin communication');
      }
    } catch (error) {
      console.error('❌ Failed to inject editor script:', error);
    }
  }

  // Load the website
  loadWebsite() {
    this.iframe.src = 'http://localhost:5173/';
    console.log('📥 Loading website...');
  }

  // Handle element selection
  handleElementSelected(elementData) {
    this.selectedElement = elementData;
    window.useBuilderStore?.getState().selectElement(elementData.id);
    window.renderPropertiesPanel?.(elementData);
    console.log('✅ Selected:', elementData.tagName, elementData.id);
  }

  // Handle element hover
  handleElementHovered(elementData) {
    // Could show tooltip or preview
  }

  // Update element in iframe
  updateElement(elementId, updates) {
    this.iframe.contentWindow.postMessage({
      type: 'UPDATE_ELEMENT',
      data: { id: elementId, updates }
    }, '*');
    console.log('✅ Updated element:', elementId);
  }

  // Refresh iframe
  refresh() {
    this.iframe.contentWindow.location.reload();
  }
}

// Initialize
window.liveRenderer = null;

window.initLiveRenderer = function() {
  window.liveRenderer = new LiveWebsiteRenderer('live-website-iframe');
  window.liveRenderer.loadWebsite();
};

window.LiveWebsiteRenderer = LiveWebsiteRenderer;
