// ELEVEZ Visual Builder - TypeScript Definitions
// Production-grade type system for the no-code builder

export interface Element {
  id: string;
  type: ElementType;
  props: ElementProps;
  style: ElementStyle;
  children?: Element[];
  animations?: AnimationConfig;
  actions?: ActionConfig[];
}

export type ElementType = 
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'container'
  | 'divider'
  | 'hero'
  | 'collection-grid'
  | 'product-card'
  | 'marquee'
  | 'features'
  | 'footer';

export interface ElementProps {
  [key: string]: any;
  text?: string;
  src?: string;
  href?: string;
  productId?: string;
}

export interface ElementStyle {
  // Layout
  position?: 'relative' | 'absolute' | 'fixed';
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  
  // Dimensions
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Spacing
  padding?: string;
  margin?: string;
  
  // Background
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  
  // Border
  border?: string;
  borderRadius?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Transform
  transform?: string;
  
  // Other
  opacity?: number;
  zIndex?: number;
  overflow?: string;
  cursor?: string;
}

export interface AnimationConfig {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  transition?: Record<string, any>;
}

export interface ActionConfig {
  type: 'navigate' | 'scroll' | 'addToCart' | 'openModal' | 'custom';
  target?: string;
  payload?: any;
}

export interface Product {
  id: number | string;
  qid: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  type: string;
  rating: number;
  description?: string;
  image: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  elements: Element[];
  settings: PageSettings;
}

export interface PageSettings {
  title: string;
  description: string;
  favicon?: string;
  ogImage?: string;
}

export interface BuilderState {
  pages: Page[];
  currentPageId: string;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  history: HistoryState[];
  historyIndex: number;
  products: Product[];
  isPreviewMode: boolean;
  isDragging: boolean;
  clipboard: Element | null;
}

export interface HistoryState {
  pages: Page[];
  timestamp: number;
}

export interface ComponentLibraryItem {
  id: string;
  name: string;
  category: 'primitive' | 'section' | 'smart';
  icon: string;
  template: Element;
  preview?: string;
}
