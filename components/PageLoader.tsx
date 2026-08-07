import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PageLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);

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
        setIsVisible(false);
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  // Triggers when video playback starts
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
        videoRef.current.playbackRate = videoRef.current.duration / 4.0;
      } else {
        videoRef.current.playbackRate = 2.0;
      }
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    // Start video opacity fade 0.8s before 4.0s ends
    timerRef.current = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 800);
    }, 3200);
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 600);
  };

  const videoSrc = isMobile
    ? '/elevez-vertical.mp4'
    : '/elevez-horizontal.mp4';

  return (
    <AnimatePresence unmountOnExit>
      {isVisible && (
        <motion.div
          key="video-preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: isFading ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
        >
          <motion.video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            onPlay={handleVideoPlay}
            onPlaying={handleVideoPlay}
            onEnded={handleDismiss}
            onError={handleDismiss}
            animate={{ opacity: isFading ? 0 : 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
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
              handleDismiss();
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
