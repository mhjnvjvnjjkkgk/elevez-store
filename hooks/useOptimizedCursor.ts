import { useEffect, useRef, useCallback } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

/**
 * Optimized cursor hook using requestAnimationFrame for smooth performance
 * Prevents jitter and lag by batching updates
 */
export const useOptimizedCursor = () => {
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const listenersRef = useRef<Set<(pos: CursorPosition) => void>>(new Set());

  const updatePosition = useCallback((x: number, y: number) => {
    positionRef.current = { x, y };
    
    // Batch updates using requestAnimationFrame
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        listenersRef.current.forEach(listener => {
          listener(positionRef.current);
        });
        rafRef.current = null;
      });
    }
  }, []);

  const subscribe = useCallback((listener: (pos: CursorPosition) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    // Use passive listener for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updatePosition]);

  return {
    position: positionRef.current,
    subscribe
  };
};
