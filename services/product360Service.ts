import { Product } from '../types';

export interface Product360Data {
  images: string[];
  totalFrames: number;
  currentFrame: number;
  isLoaded: boolean;
}

export interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

class Product360Service {
  private readonly FRAME_COUNT = 36; // 36 frames for smooth 360° rotation
  private imageCache: Map<string, HTMLImageElement[]> = new Map();

  /**
   * Generate 360° view data for a product
   * In a real app, this would load actual 360° images
   */
  generate360Data(product: Product): Product360Data {
    // For demo, we'll simulate multiple angles using the same image
    // In production, you'd have actual 360° photography
    const images = this.generate360Images(product.image);

    return {
      images,
      totalFrames: images.length,
      currentFrame: 0,
      isLoaded: false
    };
  }

  /**
   * Preload 360° images for smooth rotation
   */
  async preload360Images(productId: string, images: string[]): Promise<void> {
    const loadedImages: HTMLImageElement[] = [];

    for (const src of images) {
      const img = new Image();
      img.src = src;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      loadedImages.push(img);
    }

    this.imageCache.set(productId, loadedImages);
  }

  /**
   * Get frame for specific angle
   */
  getFrameForAngle(angle: number, totalFrames: number): number {
    // Normalize angle to 0-360
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Calculate frame index
    const frameIndex = Math.floor((normalizedAngle / 360) * totalFrames);
    
    return Math.min(frameIndex, totalFrames - 1);
  }

  /**
   * Calculate rotation angle from drag distance
   */
  calculateRotationFromDrag(dragDistance: number, sensitivity: number = 1): number {
    // Each pixel of drag = degrees of rotation
    return dragDistance * sensitivity;
  }

  /**
   * Get optimal zoom level for viewport
   */
  getOptimalZoom(containerWidth: number, containerHeight: number, imageWidth: number, imageHeight: number): number {
    const widthRatio = containerWidth / imageWidth;
    const heightRatio = containerHeight / imageHeight;
    
    return Math.min(widthRatio, heightRatio);
  }

  /**
   * Calculate zoom bounds
   */
  getZoomBounds(currentZoom: number): { min: number; max: number } {
    return {
      min: 1,
      max: 4
    };
  }

  /**
   * Apply zoom with constraints
   */
  applyZoom(currentZoom: number, delta: number): number {
    const newZoom = currentZoom + delta;
    const bounds = this.getZoomBounds(currentZoom);
    
    return Math.max(bounds.min, Math.min(bounds.max, newZoom));
  }

  /**
   * Calculate pan bounds based on zoom
   */
  getPanBounds(zoom: number, containerWidth: number, containerHeight: number): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (zoom <= 1) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const maxOffset = ((zoom - 1) / zoom) * 50; // Percentage

    return {
      minX: -maxOffset,
      maxX: maxOffset,
      minY: -maxOffset,
      maxY: maxOffset
    };
  }

  /**
   * Apply pan with constraints
   */
  applyPan(
    currentX: number,
    currentY: number,
    deltaX: number,
    deltaY: number,
    zoom: number,
    containerWidth: number,
    containerHeight: number
  ): { x: number; y: number } {
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    const bounds = this.getPanBounds(zoom, containerWidth, containerHeight);

    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, newX)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, newY))
    };
  }

  /**
   * Generate 360° images (simulation)
   * In production, these would be actual 360° product photos
   */
  private generate360Images(baseImage: string): string[] {
    const images: string[] = [];
    
    // For demo, we'll use the same image for all frames
    // In production, you'd have actual 360° photography
    for (let i = 0; i < this.FRAME_COUNT; i++) {
      images.push(baseImage);
    }

    return images;
  }

  /**
   * Check if 360° view is available for product
   */
  is360Available(product: Product): boolean {
    // Check if product has 360° images
    // In production, this would check for actual 360° data
    return !!(product as any).has360View || true; // Default to true for demo
  }

  /**
   * Get 360° viewer settings
   */
  getViewerSettings(): {
    autoRotate: boolean;
    autoRotateSpeed: number;
    dragSensitivity: number;
    zoomSensitivity: number;
    inertia: boolean;
  } {
    return {
      autoRotate: false,
      autoRotateSpeed: 2, // degrees per frame
      dragSensitivity: 0.5,
      zoomSensitivity: 0.1,
      inertia: true
    };
  }

  /**
   * Calculate inertia for smooth rotation
   */
  calculateInertia(velocity: number, friction: number = 0.95): number {
    return velocity * friction;
  }

  /**
   * Get touch/mouse position relative to element
   */
  getRelativePosition(
    event: MouseEvent | TouchEvent,
    element: HTMLElement
  ): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    
    let clientX: number;
    let clientY: number;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  /**
   * Format angle for display
   */
  formatAngle(angle: number): string {
    const normalized = ((angle % 360) + 360) % 360;
    return `${Math.round(normalized)}°`;
  }

  /**
   * Get view label for angle
   */
  getViewLabel(angle: number): string {
    const normalized = ((angle % 360) + 360) % 360;

    if (normalized < 45 || normalized >= 315) return 'Front';
    if (normalized >= 45 && normalized < 135) return 'Right Side';
    if (normalized >= 135 && normalized < 225) return 'Back';
    return 'Left Side';
  }
}

export const product360Service = new Product360Service();
export default product360Service;
