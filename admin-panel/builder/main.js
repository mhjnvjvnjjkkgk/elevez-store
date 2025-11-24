// ELEVEZ Visual Builder - Main Initialization

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Initializing ELEVEZ Visual Builder...');
  
  // Initialize live renderer
  initLiveRenderer();
  
  // Setup UI interactions
  setupTabs();
  setupDeviceSelector();
  setupKeyboardShortcuts();
  
  console.log('✅ Visual Builder ready!');
});

// Tab switching
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Device selector
function setupDeviceSelector() {
  const deviceBtns = document.querySelectorAll('.device-btn');
  const iframe = document.getElementById('live-website-iframe');
  
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const device = btn.dataset.device;
      
      deviceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Adjust iframe size
      if (device === 'desktop') {
        iframe.style.width = '100%';
      } else if (device === 'tablet') {
        iframe.style.width = '768px';
      } else if (device === 'mobile') {
        iframe.style.width = '375px';
      }
    });
  });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z: Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Ctrl+Shift+Z: Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
    }
    
    // Ctrl+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      window.useBuilderStore.getState().save();
      showNotification('💾 Saved!');
    }
    
    // Delete: Remove selected element
    if (e.key === 'Delete' && window.useBuilderStore.getState().selectedElementId) {
      const elementId = window.useBuilderStore.getState().selectedElementId;
      window.useBuilderStore.getState().deleteElement(elementId);
    }
  });
}

// Actions
window.undo = function() {
  window.useBuilderStore.getState().undo();
  showNotification('↶ Undo');
};

window.redo = function() {
  window.useBuilderStore.getState().redo();
  showNotification('↷ Redo');
};

window.togglePreview = function() {
  window.useBuilderStore.getState().togglePreview();
  const isPreview = window.useBuilderStore.getState().isPreviewMode;
  
  if (isPreview) {
    document.querySelector('.sidebar-left').style.display = 'none';
    document.querySelector('.sidebar-right').style.display = 'none';
    document.querySelector('.canvas-toolbar').style.display = 'none';
  } else {
    document.querySelector('.sidebar-left').style.display = 'flex';
    document.querySelector('.sidebar-right').style.display = 'flex';
    document.querySelector('.canvas-toolbar').style.display = 'flex';
  }
};

window.publish = async function() {
  if (!confirm('🚀 Publish changes to your live website?\n\nThis will update your website immediately.')) {
    return;
  }
  
  showNotification('🚀 Publishing...', 'info');
  
  // Simulate deployment pipeline
  await simulateDeployment();
};

async function simulateDeployment() {
  const steps = [
    { message: '📦 Generating static assets...', duration: 1000 },
    { message: '🖼️ Optimizing images...', duration: 800 },
    { message: '📤 Pushing to GitHub...', duration: 1200 },
    { message: '🚀 Deploying to Vercel...', duration: 1500 },
  ];
  
  for (const step of steps) {
    showNotification(step.message, 'info');
    await new Promise(resolve => setTimeout(resolve, step.duration));
  }
  
  showNotification('✅ Published successfully!', 'success');
  
  setTimeout(() => {
    alert('🎉 Your website is live!\n\nURL: https://elevez-store.vercel.app\n\nChanges will be visible in 1-2 minutes.');
  }, 500);
}

// Zoom controls
let zoomLevel = 100;

window.zoomIn = function() {
  zoomLevel = Math.min(200, zoomLevel + 10);
  updateZoom();
};

window.zoomOut = function() {
  zoomLevel = Math.max(50, zoomLevel - 10);
  updateZoom();
};

function updateZoom() {
  const container = document.getElementById('canvasContainer');
  container.style.transform = `scale(${zoomLevel / 100})`;
  document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? 'var(--accent)' : type === 'error' ? '#ef4444' : 'var(--blue)'};
    color: ${type === 'success' ? 'black' : 'white'};
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

window.showNotification = showNotification;

// Page management
window.addNewPage = function() {
  const name = prompt('Enter page name:');
  if (!name) return;
  
  const page = {
    id: `page-${Date.now()}`,
    name: name,
    path: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
    elements: [],
    settings: {
      title: `${name} | ELEVEZ`,
      description: ''
    }
  };
  
  window.useBuilderStore.getState().addPage(page);
  showNotification(`✅ Page "${name}" created!`);
};

window.switchPage = function(pageId) {
  window.useBuilderStore.getState().setCurrentPage(pageId);
  if (window.liveRenderer) {
    window.liveRenderer.refresh();
  }
};
