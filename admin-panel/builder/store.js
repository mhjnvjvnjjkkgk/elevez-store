// ELEVEZ Visual Builder - Zustand Store
// Global state management for the entire builder

// Simple Zustand implementation (since we can't use npm packages directly)
const createStore = (initializer) => {
  let state = {};
  const listeners = new Set();
  
  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach(listener => listener(state));
  };
  
  const getState = () => state;
  
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  state = initializer(setState, getState);
  
  return { getState, setState, subscribe };
};

// Create the builder store
const useBuilderStore = createStore((set, get) => ({
  // Pages
  pages: [{
    id: 'homepage',
    name: 'Homepage',
    path: '/',
    elements: [],
    settings: {
      title: 'ELEVEZ | Elevate Your Style',
      description: 'Premium streetwear fashion'
    }
  }],
  currentPageId: 'homepage',
  
  // Selection
  selectedElementId: null,
  hoveredElementId: null,
  
  // History (undo/redo)
  history: [],
  historyIndex: -1,
  
  // Products (from admin panel)
  products: [],
  
  // UI State
  isPreviewMode: false,
  isDragging: false,
  clipboard: null,
  
  // Actions
  setCurrentPage: (pageId) => set({ currentPageId: pageId }),
  
  selectElement: (elementId) => set({ selectedElementId: elementId }),
  
  hoverElement: (elementId) => set({ hoveredElementId: elementId }),
  
  addElement: (element, parentId = null) => {
    const state = get();
    const pages = [...state.pages];
    const currentPage = pages.find(p => p.id === state.currentPageId);
    
    if (parentId) {
      // Add to specific parent
      const addToParent = (elements) => {
        return elements.map(el => {
          if (el.id === parentId) {
            return {
              ...el,
              children: [...(el.children || []), element]
            };
          }
          if (el.children) {
            return { ...el, children: addToParent(el.children) };
          }
          return el;
        });
      };
      currentPage.elements = addToParent(currentPage.elements);
    } else {
      // Add to root
      currentPage.elements.push(element);
    }
    
    set({ pages, selectedElementId: element.id });
    get().addToHistory();
  },
  
  updateElement: (elementId, updates) => {
    const state = get();
    const pages = [...state.pages];
    const currentPage = pages.find(p => p.id === state.currentPageId);
    
    const updateInTree = (elements) => {
      return elements.map(el => {
        if (el.id === elementId) {
          return { ...el, ...updates };
        }
        if (el.children) {
          return { ...el, children: updateInTree(el.children) };
        }
        return el;
      });
    };
    
    currentPage.elements = updateInTree(currentPage.elements);
    set({ pages });
    get().addToHistory();
  },
  
  deleteElement: (elementId) => {
    const state = get();
    const pages = [...state.pages];
    const currentPage = pages.find(p => p.id === state.currentPageId);
    
    const removeFromTree = (elements) => {
      return elements.filter(el => {
        if (el.id === elementId) return false;
        if (el.children) {
          el.children = removeFromTree(el.children);
        }
        return true;
      });
    };
    
    currentPage.elements = removeFromTree(currentPage.elements);
    set({ pages, selectedElementId: null });
    get().addToHistory();
  },
  
  moveElement: (elementId, direction) => {
    const state = get();
    const pages = [...state.pages];
    const currentPage = pages.find(p => p.id === state.currentPageId);
    
    const elements = currentPage.elements;
    const index = elements.findIndex(el => el.id === elementId);
    
    if (direction === 'up' && index > 0) {
      [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
    } else if (direction === 'down' && index < elements.length - 1) {
      [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
    }
    
    set({ pages });
    get().addToHistory();
  },
  
  duplicateElement: (elementId) => {
    const state = get();
    const pages = [...state.pages];
    const currentPage = pages.find(p => p.id === state.currentPageId);
    
    const findAndDuplicate = (elements) => {
      const index = elements.findIndex(el => el.id === elementId);
      if (index !== -1) {
        const original = elements[index];
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.id = `element-${Date.now()}`;
        elements.splice(index + 1, 0, duplicate);
        return duplicate.id;
      }
      return null;
    };
    
    const newId = findAndDuplicate(currentPage.elements);
    set({ pages, selectedElementId: newId });
    get().addToHistory();
  },
  
  // History management
  addToHistory: () => {
    const state = get();
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push({
      pages: JSON.parse(JSON.stringify(state.pages)),
      timestamp: Date.now()
    });
    
    // Limit history to 50 steps
    if (history.length > 50) {
      history.shift();
    } else {
      set({ historyIndex: state.historyIndex + 1 });
    }
    
    set({ history });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const pages = JSON.parse(JSON.stringify(state.history[newIndex].pages));
      set({ pages, historyIndex: newIndex });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const pages = JSON.parse(JSON.stringify(state.history[newIndex].pages));
      set({ pages, historyIndex: newIndex });
    }
  },
  
  // Products
  loadProducts: () => {
    const products = JSON.parse(localStorage.getItem('elevez_products') || '[]');
    set({ products });
  },
  
  // Pages
  addPage: (page) => {
    const state = get();
    const pages = [...state.pages, page];
    set({ pages, currentPageId: page.id });
    get().addToHistory();
  },
  
  deletePage: (pageId) => {
    const state = get();
    if (state.pages.length <= 1) return; // Keep at least one page
    
    const pages = state.pages.filter(p => p.id !== pageId);
    const currentPageId = pages[0].id;
    set({ pages, currentPageId });
    get().addToHistory();
  },
  
  // Preview mode
  togglePreview: () => {
    const state = get();
    set({ isPreviewMode: !state.isPreviewMode, selectedElementId: null });
  },
  
  // Persistence
  save: () => {
    const state = get();
    localStorage.setItem('elevez_builder_state', JSON.stringify({
      pages: state.pages,
      currentPageId: state.currentPageId
    }));
    console.log('💾 Builder state saved');
  },
  
  load: () => {
    try {
      const saved = localStorage.getItem('elevez_builder_state');
      if (saved) {
        const data = JSON.parse(saved);
        set({ pages: data.pages, currentPageId: data.currentPageId });
        console.log('✅ Builder state loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load builder state:', error);
    }
  }
}));

// Export store
window.useBuilderStore = useBuilderStore;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  useBuilderStore.getState().load();
  useBuilderStore.getState().loadProducts();
  
  // Auto-save every 30 seconds
  setInterval(() => {
    useBuilderStore.getState().save();
  }, 30000);
});
