import { Product } from '../types';

export interface TryOnSession {
  id: string;
  productId: string;
  userImage?: string;
  overlayImage?: string;
  timestamp: number;
}

export interface TryOnResult {
  success: boolean;
  resultImage?: string;
  error?: string;
}

class VirtualTryOnService {
  private readonly STORAGE_KEY = 'tryon_sessions';
  private sessions: Map<string, TryOnSession> = new Map();

  /**
   * Initialize a try-on session
   */
  initSession(product: Product): TryOnSession {
    const session: TryOnSession = {
      id: `tryon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      timestamp: Date.now()
    };

    this.sessions.set(session.id, session);
    this.saveSessions();

    return session;
  }

  /**
   * Upload user photo for try-on
   */
  async uploadUserPhoto(sessionId: string, file: File): Promise<TryOnResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Please upload a valid image file'
        };
      }

      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Image size must be less than 5MB'
        };
      }

      // Convert to base64
      const base64 = await this.fileToBase64(file);

      // Update session
      const session = this.sessions.get(sessionId);
      if (session) {
        session.userImage = base64;
        this.sessions.set(sessionId, session);
        this.saveSessions();
      }

      return {
        success: true,
        resultImage: base64
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return {
        success: false,
        error: 'Failed to upload photo'
      };
    }
  }

  /**
   * Process virtual try-on
   * In a real implementation, this would call an AI service
   */
  async processTryOn(sessionId: string, product: Product): Promise<TryOnResult> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session || !session.userImage) {
        return {
          success: false,
          error: 'No user image found'
        };
      }

      // Simulate AI processing
      await this.simulateProcessing(2000);

      // In a real app, this would:
      // 1. Send user image + product image to AI service
      // 2. Receive processed result
      // 3. Return the result image

      // For now, return the user image as placeholder
      return {
        success: true,
        resultImage: session.userImage
      };
    } catch (error) {
      console.error('Error processing try-on:', error);
      return {
        success: false,
        error: 'Failed to process try-on'
      };
    }
  }

  /**
   * Get AR overlay data for product
   */
  getAROverlay(product: Product): {
    modelUrl?: string;
    scale: number;
    position: { x: number; y: number; z: number };
  } {
    // In a real app, this would return 3D model data
    return {
      modelUrl: product.image,
      scale: 1.0,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  /**
   * Check if device supports AR
   */
  isARSupported(): boolean {
    // Check for WebXR support
    if ('xr' in navigator) {
      return true;
    }

    // Check for ARCore/ARKit
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    return isIOS || isAndroid;
  }

  /**
   * Get camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Capture photo from camera
   */
  async capturePhoto(): Promise<string | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  }

  /**
   * Get session history
   */
  getSessionHistory(): TryOnSession[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear session
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }

  /**
   * Helper: Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Helper: Simulate processing delay
   */
  private simulateProcessing(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Save sessions to localStorage
   */
  private saveSessions(): void {
    try {
      const sessionsArray = Array.from(this.sessions.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionsArray));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  /**
   * Load sessions from localStorage
   */
  loadSessions(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const sessionsArray = JSON.parse(saved);
        this.sessions = new Map(sessionsArray);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }
}

export const virtualTryOnService = new VirtualTryOnService();
export default virtualTryOnService;
