import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRELOADER_KEY = 'elevez_preloader_shown_session';

export const PageLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const shown = sessionStorage.getItem(PRELOADER_KEY);
        if (shown) return false;
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
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(PRELOADER_KEY, 'true');
      }
    } catch (e) {
      // Storage fallback
    }

    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
      videoRef.current.play().catch(() => {
        // If autoplay is blocked by browser policies, dismiss preloader immediately
        setIsVisible(false);
      });
    }

    // Fail-safe max timeout: auto-dismiss preloader after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const videoSrc = isMobile
    ? '/elevez-vertical.mp4'
    : '/elevez-horizontal.mp4';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="video-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.3 } }}
          onClick={() => setIsVisible(false)}
          className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setIsVisible(false)}
            onError={() => setIsVisible(false)}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.playbackRate = 2.0;
              }
            }}
            className="w-full h-full object-cover"
          />

          {/* Minimal Floating Skip Pill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute bottom-5 right-5 z-30 bg-black/70 hover:bg-black text-white font-mono text-[10px] font-bold px-3 py-1.5 border border-white/30 rounded-full backdrop-blur-md transition-all cursor-pointer opacity-70 hover:opacity-100"
          >
            SKIP →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
