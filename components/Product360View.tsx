import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { Product } from '../types';
import { product360Service, Product360Data, ZoomState } from '../services/product360Service';

interface Product360ViewProps {
  product: Product;
  isFullscreen?: boolean;
  onClose?: () => void;
}

export const Product360View: React.FC<Product360ViewProps> = ({
  product,
  isFullscreen = false,
  onClose
}) => {
  const [data, setData] = useState<Product360Data | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();

  // Initialize 360° data
  useEffect(() => {
    const view360 = product360Service.generate360Data(product);
    setData(view360);
  }, [product]);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return;

    const settings = product360Service.getViewerSettings();
    const interval = setInterval(() => {
      setCurrentAngle(prev => (prev + settings.autoRotateSpeed) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Inertia effect
  useEffect(() => {
    if (Math.abs(velocity) < 0.1) return;

    const animate = () => {
      setCurrentAngle(prev => prev + velocity);
      setVelocity(prev => product360Service.calculateInertia(prev));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [velocity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZooming) {
      // Pan mode when zoomed
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoom.x, y: e.clientY - zoom.y });
    } else {
      // Rotate mode
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setVelocity(0);
      setAutoRotate(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    if (isZooming) {
      // Pan
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      if (containerRef.current) {
        const bounds = product360Service.getPanBounds(
          zoom.scale,
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        
        setZoom(prev => ({
          ...prev,
          x: Math.max(bounds.minX, Math.min(bounds.maxX, newX)),
          y: Math.max(bounds.minY, Math.min(bounds.maxY, newY))
        }));
      }
    } else {
      // Rotate
      const deltaX = e.clientX - dragStart.x;
      const rotation = product360Service.calculateRotationFromDrag(deltaX, 0.5);
      
      setCurrentAngle(prev => prev + rotation);
      setDragStart({ x: e.clientX, y: e.clientY });
      setVelocity(rotation);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    const newScale = product360Service.applyZoom(zoom.scale, 0.5);
    setZoom(prev => ({ ...prev, scale: newScale }));
    setIsZooming(newScale > 1);
  };

  const handleZoomOut = () => {
    const newScale = product360Service.applyZoom(zoom.scale, -0.5);
    setZoom(prev => ({ ...prev, scale: newScale }));
    setIsZooming(newScale > 1);
    
    if (newScale <= 1) {
      setZoom({ scale: 1, x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setCurrentAngle(0);
    setZoom({ scale: 1, x: 0, y: 0 });
    setIsZooming(false);
    setAutoRotate(false);
    setVelocity(0);
  };

  const toggleAutoRotate = () => {
    setAutoRotate(prev => !prev);
    setVelocity(0);
  };

  if (!data) return null;

  const currentFrame = product360Service.getFrameForAngle(currentAngle, data.totalFrames);
  const viewLabel = product360Service.getViewLabel(currentAngle);
  const angleDisplay = product360Service.formatAngle(currentAngle);

  return (
    <div
      className={`relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black'
          : 'w-full aspect-square bg-black/20 rounded-xl overflow-hidden'
      }`}
    >
      {/* 360° Viewer */}
      <div
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.img
          ref={imageRef}
          src={data.images[currentFrame]}
          alt={`${product.name} - ${viewLabel}`}
          className="w-full h-full object-contain"
          style={{
            transform: `scale(${zoom.scale}) translate(${zoom.x}px, ${zoom.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          draggable={false}
        />

        {/* Loading Overlay */}
        {!data.isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <RotateCw size={48} className="animate-spin text-[#00ff88] mx-auto mb-4" />
              <p>Loading 360° View...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full">
        {/* Auto Rotate */}
        <button
          onClick={toggleAutoRotate}
          className={`p-2 rounded-full transition-colors ${
            autoRotate ? 'bg-[#00ff88] text-black' : 'hover:bg-white/10'
          }`}
          title="Auto Rotate"
        >
          <RotateCw size={20} className={autoRotate ? 'animate-spin' : ''} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={zoom.scale <= 1}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>

        {/* Zoom Level */}
        <div className="px-3 py-1 bg-white/10 rounded-full text-sm font-mono">
          {Math.round(zoom.scale * 100)}%
        </div>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={zoom.scale >= 4}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Reset View"
        >
          <Maximize2 size={20} />
        </button>

        {isFullscreen && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
            title="Close"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-gray-400">View</p>
            <p className="font-bold">{viewLabel}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div>
            <p className="text-xs text-gray-400">Angle</p>
            <p className="font-bold font-mono">{angleDisplay}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isDragging && !autoRotate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-sm text-gray-300">
              {isZooming ? '← Drag to pan →' : '← Drag to rotate →'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Rotation Indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#00ff88]"
            style={{
              width: '20%',
              marginLeft: `${(currentAngle / 360) * 80}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};
