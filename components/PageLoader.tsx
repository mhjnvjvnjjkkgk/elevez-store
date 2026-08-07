import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRELOADER_KEY = 'elevez_preloader_last_shown';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const PageLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      const lastShown = localStorage.getItem(PRELOADER_KEY);
      if (lastShown) {
        const timeDiff = Date.now() - Number(lastShown);
        if (timeDiff < ONE_DAY_MS) {
          // Shown within the last 24 hours -> skip immediately
          return false;
        }
      }
    } catch (e) {
      // Ignore storage errors
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

    // Record preloader display timestamp
    try {
      localStorage.setItem(PRELOADER_KEY, Date.now().toString());
    } catch (e) {
      // Ignore storage errors
    }

    // Set 2x speed playback so 8s video plays in 4s
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
      videoRef.current.play().catch(() => {
        // Autoplay fallback
      });
    }

    // Safety timer: auto-close after 4 seconds (fast-forward duration)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleVideoEnded = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Video sources: Vertical for Mobile, Horizontal for PC
  // Supports various file extensions (mp4, webm, mov) with fallback to promo-vid.mp4
  const videoSources = isMobile
    ? [
        '/elevezverticle.mp4',
        '/elevezverticle',
        '/elevez-verticle.mp4',
        '/elevez-vertical.mp4',
        '/promo-vid.mp4'
      ]
    : [
        '/elevez.horizontal.mp4',
        '/elevez.horizontal',
        '/elevez-horizontal.mp4',
        '/elevez_horizontal.mp4',
        '/promo-vid.mp4'
      ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="video-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: [0.77, 0, 0.175, 1] } }}
          className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
        >
          {/* Fullscreen Video Element */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.playbackRate = 2.0;
              }
            }}
            className="w-full h-full object-cover"
          >
            {videoSources.map((src, idx) => (
              <source key={idx} src={src} type="video/mp4" />
            ))}
            Your browser does not support video.
          </video>

          {/* Neobrutalist Watermark & Skip Control */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/80 border-2 border-black px-3 py-1.5 shadow-[3px_3px_0px_0px_#00ff88]">
            <span className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-ping" />
            <span className="text-[#00ff88] font-mono text-[10px] font-black uppercase tracking-widest">
              ELEVEZ 2.0 // SYSTEM INTRO
            </span>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute bottom-6 right-6 z-20 bg-[#00ff88] text-black font-black text-[10px] sm:text-xs px-4 py-2 uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#fff] hover:bg-white transition-all cursor-pointer"
          >
            SKIP INTRO →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
