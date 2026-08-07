import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRELOADER_KEY = 'elevez_preloader_last_shown';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const PageLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      const lastShown = localStorage.getItem(PRELOADER_KEY);
      if (lastShown) {
        const timeDiff = Date.now() - Number(lastShown);
        if (timeDiff < ONE_DAY_MS) {
          return false;
        }
      }
    } catch (e) {
      // Storage fallback
    }
    return true;
  });

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    try {
      localStorage.setItem(PRELOADER_KEY, Date.now().toString());
    } catch (e) {
      // Storage fallback
    }

    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
      videoRef.current.play().catch(() => {});
    }

    // Safety timeout: auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleVideoEnded = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Exact user video files: Vertical for Mobile, Horizontal for PC
  const videoSrc = isMobile
    ? '/elevez-vertical.mp4'
    : '/elevez-horizontal.mp4';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="video-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.4, ease: [0.77, 0, 0.175, 1] } }}
          className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden select-none"
        >
          {/* Full-Screen Pure Video - No Text Overlays */}
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.playbackRate = 2.0;
              }
            }}
            className="w-full h-full object-cover"
          />

          {/* Minimal Floating Skip Pill */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute bottom-5 right-5 z-30 bg-black/70 hover:bg-black text-white font-mono text-[10px] font-bold px-3 py-1.5 border border-white/30 rounded-full backdrop-blur-md transition-all cursor-pointer opacity-70 hover:opacity-100"
          >
            SKIP →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
