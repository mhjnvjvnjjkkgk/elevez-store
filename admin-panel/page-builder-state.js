// ELEVEZ Page Builder - State Management
// Phase 1: Core Foundation

const builderState = {
  currentPage: 'homepage',
  pages: {
    homepage: {
      id: 'homepage',
      name: 'Homepage',
      sections: [],
      settings: {
        title: 'ELEVEZ | Elevate Your Style',
        description: 'Premium streetwear fashion'
      }
    }
  },
  selectedSection: null,
  selectedElement: null,
  history: [],
  historyIndex: -1,
  deviceMode: 'desktop',
  isDirty: false
};

// Save state to localStorage
function saveBuilderState() {
  try {
    localStorage.setItem('elevez_builder_state', JSON.stringify(builderState));
    builderState.isDirty = false;
    console.log('✅ Builder state saved');
  } catch (error) {
    console.error('❌ Failed to save builder state:', error);
  }
}

// Load state from localStorage
function loadBuilderState() {
  try {
    const saved = localStorage.getItem('elevez_builder_state');
    if (saved) {
      const loaded = JSON.parse(saved);
      Object.assign(builderState, loaded);
      console.log('✅ Builder state loaded');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to load builder state:', error);
  }
  return false;
}

// Add to history for undo/redo
function addToHistory() {
  // Remove any history after current index
  builderState.history = builderState.history.slice(0, builderState.historyIndex + 1);
  
  // Add current state
  const snapshot = JSON.parse(JSON.stringify(builderState.pages));
  builderState.history.push(snapshot);
  
  // Limit history to 50 steps
  if (builderState.history.length > 50) {
    builderState.history.shift();
  } else {
    builderState.historyIndex++;
  }
  
  builderState.isDirty = true;
}

// Undo action
window.undoAction = function() {
  if (builderState.historyIndex > 0) {
    builderState.historyIndex--;
    builderState.pages = JSON.parse(JSON.stringify(builderState.history[builderState.historyIndex]));
    renderCanvas();
    console.log('↶ Undo');
  }
};

// Redo action
window.redoAction = function() {
  if (builderState.historyIndex < builderState.history.length - 1) {
    builderState.historyIndex++;
    builderState.pages = JSON.parse(JSON.stringify(builderState.history[builderState.historyIndex]));
    renderCanvas();
    console.log('↷ Redo');
  }
};

// Get current page
function getCurrentPage() {
  return builderState.pages[builderState.currentPage];
}

// Add section to current page
function addSection(sectionData) {
  const page = getCurrentPage();
  page.sections.push(sectionData);
  addToHistory();
  saveBuilderState();
  renderCanvas();
}

// Remove section
function removeSection(sectionId) {
  const page = getCurrentPage();
  page.sections = page.sections.filter(s => s.id !== sectionId);
  addToHistory();
  saveBuilderState();
  renderCanvas();
}

// Move section
function moveSection(sectionId, direction) {
  const page = getCurrentPage();
  const index = page.sections.findIndex(s => s.id === sectionId);
  
  if (direction === 'up' && index > 0) {
    [page.sections[index], page.sections[index - 1]] = [page.sections[index - 1], page.sections[index]];
  } else if (direction === 'down' && index < page.sections.length - 1) {
    [page.sections[index], page.sections[index + 1]] = [page.sections[index + 1], page.sections[index]];
  }
  
  addToHistory();
  saveBuilderState();
  renderCanvas();
}

// Update section data
function updateSection(sectionId, updates) {
  const page = getCurrentPage();
  const section = page.sections.find(s => s.id === sectionId);
  if (section) {
    Object.assign(section, updates);
    addToHistory();
    saveBuilderState();
    renderCanvas();
  }
}

// Select section
function selectSection(sectionId) {
  builderState.selectedSection = sectionId;
  builderState.selectedElement = null;
  
  // Update UI
  document.querySelectorAll('.builder-section').forEach(el => {
    el.classList.remove('selected');
  });
  
  const sectionEl = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (sectionEl) {
    sectionEl.classList.add('selected');
  }
  
  renderProperties();
}

// Initialize
function initBuilderState() {
  loadBuilderState();
  
  // Initialize history if empty
  if (builderState.history.length === 0) {
    addToHistory();
  }
  
  console.log('🎨 Builder state initialized');
}
