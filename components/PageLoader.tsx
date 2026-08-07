import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PageLoader: React.FC = () => {
  // Always show preloader on page refresh
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // If autoplay is blocked, dismiss preloader after fallback timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  // Triggers ONLY ONCE THE VIDEO ACTUALLY STARTS PLAYING
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
        videoRef.current.playbackRate = videoRef.current.duration / 4.0;
      } else {
        videoRef.current.playbackRate = 2.0;
      }
    }

    // Start 4-second timer AFTER active playback begins
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 4000);
  };

  const handleVideoEnded = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

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
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.4 } }}
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
            onPlay={handleVideoPlay}
            onPlaying={handleVideoPlay}
            onEnded={handleVideoEnded}
            onError={() => setIsVisible(false)}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration) {
                videoRef.current.playbackRate = videoRef.current.duration / 4.0;
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
