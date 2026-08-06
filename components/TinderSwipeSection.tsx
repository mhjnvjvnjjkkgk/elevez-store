import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, RotateCcw, Sparkles, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { useQuickView } from '../App';

interface TinderSwipeSectionProps {
  products: any[];
  onProductClick: (handle: string) => void;
  setCursorVariant: (v: any) => void;
}

// Web Audio API Sound Synthesizer
const playAudioFx = (type: 'like' | 'pass' | 'undo' | 'victory') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'like') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'pass') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'undo') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'victory') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    }
  } catch (e) {
    // Silent fallback
  }
};

export const TinderSwipeSection: React.FC<TinderSwipeSectionProps> = ({
  products,
  onProductClick,
  setCursorVariant
}) => {
  const { openQuickView } = useQuickView();

  const [swipedHistory, setSwipedHistory] = useState<{ action: 'like' | 'pass'; product: any }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Dynamic next-card selection helper
  const getNextAdaptiveProduct = useCallback((history: { action: 'like' | 'pass'; product: any }[]) => {
    if (!products || products.length === 0) return null;

    const seenIds = new Set(history.map(h => h.product.id));
    const unswiped = products.filter(p => !seenIds.has(p.id));
    if (unswiped.length === 0) return null;

    if (history.length === 0) {
      // Card 1: Random selection from distinct catalog pool
      const anchorIndex = Math.floor(Math.random() * unswiped.length);
      return unswiped[anchorIndex] || unswiped[0];
    }

    const lastSwipe = history[history.length - 1];
    const categoryWeights: Record<string, number> = {};
    let targetPrice = 1500;
    let likedCount = 0;

    history.forEach(h => {
      const cat = h.product.category || 'Streetwear';
      if (h.action === 'like') {
        categoryWeights[cat] = (categoryWeights[cat] || 0) + 4;
        targetPrice += Number(h.product.price || 1500);
        likedCount++;
      } else {
        categoryWeights[cat] = (categoryWeights[cat] || 0) - 2;
      }
    });

    if (likedCount > 0) targetPrice = targetPrice / likedCount;

    // Score unswiped candidates in real time
    const candidates = unswiped.map(p => {
      let score = 50;
      const cat = p.category || 'Streetwear';

      // Category Weight Boost
      score += (categoryWeights[cat] || 0) * 10;

      // Price Proximity
      const pPrice = Number(p.price || 1500);
      const priceDiff = Math.abs(pPrice - targetPrice);
      score += Math.max(0, 15 - (priceDiff / 120));

      // Adaptive Next-Guess Direction:
      if (lastSwipe.action === 'like') {
        // If last swipe was LIKE -> favor same category / style family
        if (cat === (lastSwipe.product.category || 'Streetwear')) score += 25;
      } else {
        // If last swipe was PASS -> favor contrasting category / style
        if (cat !== (lastSwipe.product.category || 'Streetwear')) score += 25;
      }

      // Add entropy so deck is non-deterministic
      score += Math.random() * 20;

      return { product: p, score };
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.product || unswiped[0];
  }, [products]);

  // Current active product dynamically derived from history
  const currentProduct = useMemo(() => {
    return getNextAdaptiveProduct(swipedHistory);
  }, [swipedHistory, getNextAdaptiveProduct]);

  // Peek card for visual depth stack
  const peekProduct = useMemo(() => {
    if (!currentProduct) return null;
    const tempHistory = [...swipedHistory, { action: 'pass' as const, product: currentProduct }];
    return getNextAdaptiveProduct(tempHistory);
  }, [swipedHistory, currentProduct, getNextAdaptiveProduct]);

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);

  const handleSwipe = useCallback((direction: 'like' | 'pass') => {
    if (!currentProduct) return;

    playAudioFx(direction);

    const newHistory = [...swipedHistory, { action: direction, product: currentProduct }];
    setSwipedHistory(newHistory);

    const totalSwipes = newHistory.length;
    const likedCount = newHistory.filter(h => h.action === 'like').length;

    // Trigger results after 5 swipes or 3 likes
    if (totalSwipes >= 5 || likedCount >= 3) {
      setShowResults(true);
      playAudioFx('victory');
    }

    x.set(0);
  }, [currentProduct, swipedHistory, x]);

  const handleUndo = () => {
    if (swipedHistory.length === 0) return;

    playAudioFx('undo');
    setSwipedHistory(prev => prev.slice(0, -1));
    setShowResults(false);
    x.set(0);
  };

  const handleReset = () => {
    playAudioFx('undo');
    setSwipedHistory([]);
    setShowResults(false);
    x.set(0);
  };

  // High-Intelligent Adaptive Recommendation Scoring
  const recommendedProducts = useMemo(() => {
    if (!showResults) return [];

    const liked = swipedHistory.filter(h => h.action === 'like').map(h => h.product);
    const passed = swipedHistory.filter(h => h.action === 'pass').map(h => h.product);

    const categoryWeights: Record<string, number> = {};
    let totalLikedPrice = 0;

    liked.forEach(p => {
      const cat = p.category || 'Streetwear';
      categoryWeights[cat] = (categoryWeights[cat] || 0) + 4;
      totalLikedPrice += Number(p.price || 1500);
    });

    passed.forEach(p => {
      const cat = p.category || 'Streetwear';
      categoryWeights[cat] = (categoryWeights[cat] || 0) - 2;
    });

    const avgPrice = liked.length > 0 ? totalLikedPrice / liked.length : 1500;

    const scored = products.map(p => {
      let score = 55;
      const cat = p.category || 'Streetwear';

      score += (categoryWeights[cat] || 0) * 10;

      const pPrice = Number(p.price || 1500);
      const priceDiff = Math.abs(pPrice - avgPrice);
      score += Math.max(0, 20 - (priceDiff / 100));

      if (liked.some(lp => lp.id === p.id)) {
        score += 30;
      }

      // Add session entropy
      score += (Number(p.id) % 9) + (Math.random() * 5);

      const matchPercentage = Math.min(99, Math.max(81, Math.round(score)));

      return {
        ...p,
        matchPercentage
      };
    });

    const passedIds = new Set(passed.map(p => p.id));
    return scored
      .filter(p => !passedIds.has(p.id))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);
  }, [showResults, swipedHistory, products]);

  return (
    <section className="py-4 sm:py-16 bg-[#09090b] text-white relative z-30 overflow-hidden border-t-4 border-b-4 border-black min-h-[90vh] sm:min-h-0 flex flex-col justify-center snap-start scroll-mt-6">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00ff88_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00ff88]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ff007f]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl relative z-10 flex flex-col justify-center my-auto">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#00ff88] text-black font-mono text-[9px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#fff] mb-2 sm:mb-3">
            <Sparkles size={13} className="animate-spin" />
            AI ADAPTIVE TASTE MATCHER
          </div>

          <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter font-syne text-white mb-1">
            FIND YOUR NEXT FAVORITE
          </h2>

          <p className="text-gray-400 font-medium text-[10px] sm:text-xs max-w-xs sm:max-w-md mx-auto uppercase tracking-wider font-mono">
            SWIPE RIGHT FOR LIKE // SWIPE LEFT TO PASS // ADAPTIVE REAL-TIME GUESSING
          </p>
        </div>

        {/* Swipe Experience OR Results View */}
        {!showResults && currentProduct ? (
          <div className="flex flex-col items-center">
            {/* Progress Bar */}
            <div className="w-full max-w-[260px] sm:max-w-sm bg-neutral-800 border-2 border-black shadow-[2px_2px_0px_0px_#fff] h-2 rounded-full mb-3 sm:mb-6 overflow-hidden p-0.5">
              <div
                className="bg-[#00ff88] h-full rounded-full transition-all duration-300"
                style={{ width: `${(swipedHistory.length / 5) * 100}%` }}
              />
            </div>

            {/* Card Deck Area */}
            <div className="relative w-full max-w-[270px] sm:max-w-sm aspect-[3/4] max-h-[340px] sm:max-h-[440px] mb-4 sm:mb-8">
              {/* Peek Background Card for Depth */}
              {peekProduct && (
                <div className="absolute inset-0 bg-neutral-900 border-[3px] border-white/20 rounded-2xl scale-[0.93] translate-y-3 opacity-50 shadow-lg pointer-events-none overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={peekProduct.image || (peekProduct.images && peekProduct.images[0])}
                    alt="next card peek"
                    className="max-h-full max-w-full object-contain filter grayscale opacity-30"
                  />
                </div>
              )}

              {/* Active Draggable Card */}
              <motion.div
                key={currentProduct.id}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80) {
                    handleSwipe('like');
                  } else if (info.offset.x < -80) {
                    handleSwipe('pass');
                  }
                }}
                className="absolute inset-0 bg-neutral-900 border-[4px] border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000] sm:shadow-[12px_12px_0px_0px_#000] cursor-grab active:cursor-grabbing select-none group"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                {/* LIKE Stamp Overlay */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-4 left-4 z-30 border-[4px] border-[#00ff88] text-[#00ff88] px-3 py-1 rounded-lg text-xl sm:text-3xl font-black uppercase tracking-widest -rotate-12 bg-black/90 backdrop-blur-md pointer-events-none shadow-[4px_4px_0px_0px_#000]"
                >
                  LIKE ❤️
                </motion.div>

                {/* NOPE Stamp Overlay */}
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-4 right-4 z-30 border-[4px] border-[#ff007f] text-[#ff007f] px-3 py-1 rounded-lg text-xl sm:text-3xl font-black uppercase tracking-widest rotate-12 bg-black/90 backdrop-blur-md pointer-events-none shadow-[4px_4px_0px_0px_#000]"
                >
                  NOPE ❌
                </motion.div>

                {/* Product Image - Contain Scaling */}
                <div className="relative w-full h-[58%] bg-neutral-950 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={currentProduct.image || (currentProduct.images && currentProduct.images[0])}
                    alt={currentProduct.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black text-[#00ff88] border-2 border-black font-mono text-[11px] sm:text-xs font-black px-2 py-0.5 uppercase tracking-wider shadow-[2px_2px_0px_0px_#fff]">
                    ₹{currentProduct.price}
                  </div>
                </div>

                {/* Product Card Details */}
                <div className="p-3 sm:p-4 flex flex-col justify-between h-[42%] bg-neutral-900 border-t-2 border-white/10">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[#00ff88] font-bold tracking-widest block mb-0.5">
                      {currentProduct.category || 'STREETWEAR'}
                    </span>
                    <h3 className="text-base sm:text-2xl font-black uppercase text-white font-syne line-clamp-1 mb-0.5">
                      {currentProduct.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium line-clamp-2 leading-tight sm:leading-relaxed">
                      {currentProduct.description}
                    </p>
                  </div>

                  <div className="text-[8px] sm:text-[9px] font-mono uppercase text-gray-500 flex items-center justify-between border-t border-white/10 pt-1.5">
                    <span>REAL-TIME ADAPTIVE GUESS</span>
                    <span className="text-[#00ff88]">PURE COTTON</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('pass')}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black text-[#ff007f] border-[3px] border-[#ff007f] flex items-center justify-center shadow-[4px_4px_0px_0px_#ff007f] hover:bg-[#ff007f] hover:text-white transition-all cursor-pointer"
                title="Pass"
              >
                <X size={24} strokeWidth={3} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleUndo}
                disabled={swipedHistory.length === 0}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[2.5px] flex items-center justify-center transition-all ${
                  swipedHistory.length === 0
                    ? 'border-gray-700 text-gray-700 bg-neutral-900 cursor-not-allowed'
                    : 'border-yellow-400 text-yellow-400 bg-black shadow-[3px_3px_0px_0px_#facc15] hover:bg-yellow-400 hover:text-black cursor-pointer'
                }`}
                title="Undo last swipe"
              >
                <RotateCcw size={18} strokeWidth={2.5} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('like')}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#00ff88] text-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#fff] hover:bg-white transition-all cursor-pointer"
                title="Like"
              >
                <Heart size={24} fill="currentColor" strokeWidth={0} />
              </motion.button>
            </div>
          </div>
        ) : (
          /* Results View: Remade 2-COLUMNS ON MOBILE */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-neutral-900 border-[3.5px] sm:border-[4px] border-black p-3.5 sm:p-8 relative rounded-2xl shadow-[8px_8px_0px_0px_#000] sm:shadow-[16px_16px_0px_0px_#000]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 border-b-2 border-white/10 pb-4 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#00ff88] font-mono text-[10px] sm:text-xs font-black uppercase mb-0.5">
                  <CheckCircle2 size={14} />
                  ADAPTIVE ANALYSIS COMPLETE
                </div>
                <h3 className="text-xl sm:text-3xl font-black uppercase text-white font-syne">
                  TOP MATCHES FOR YOU
                </h3>
              </div>

              <button
                onClick={handleReset}
                className="bg-[#00ff88] text-black font-black text-[10px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#fff] hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw size={14} /> RETAKE QUIZ
              </button>
            </div>

            {/* Recommended Products Grid - 2 COLUMNS ON MOBILE */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-5 mb-5">
              {recommendedProducts.map((product, idx) => {
                const handle = product.handle || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const mainImage = product.image || (product.images && product.images[0]);

                return (
                  <motion.div
                    key={product.id || idx}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="bg-black border-[2.5px] sm:border-[3px] border-white/20 hover:border-[#00ff88] p-2 sm:p-3 relative flex flex-col justify-between shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#00ff88] transition-all group cursor-pointer"
                    onClick={() => onProductClick(handle)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 gap-1">
                        <span className="bg-[#00ff88] text-black text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider border border-black shadow-[1.5px_1.5px_0px_0px_#000] truncate">
                          🔥 {product.matchPercentage}% MATCH
                        </span>
                        <span className="text-[9px] sm:text-xs font-mono text-[#00ff88] font-bold shrink-0">
                          ₹{product.price}
                        </span>
                      </div>

                      <div className="relative aspect-[3/4] bg-neutral-950 border border-white/10 overflow-hidden mb-2 group-hover:border-[#00ff88] transition-colors flex items-center justify-center p-1.5">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                        />
                      </div>

                      <h4 className="text-xs sm:text-base font-black uppercase text-white font-syne line-clamp-1 mb-0.5 group-hover:text-[#00ff88] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 mb-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickView(product);
                        }}
                        className="flex-1 bg-white text-black font-black text-[9px] sm:text-xs py-1 uppercase tracking-wider border border-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-[#00ff88] transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={12} /> VIEW
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductClick(handle);
                        }}
                        className="flex-1 bg-[#00ff88] text-black font-black text-[9px] sm:text-xs py-1 uppercase tracking-wider border border-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-white transition-colors flex items-center justify-center gap-1"
                      >
                        SHOP <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center pt-2 border-t border-white/10">
              <button
                onClick={handleReset}
                className="bg-black text-white font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-2.5 border-2 border-white/30 hover:border-[#00ff88] hover:text-[#00ff88] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} /> RETAKE MATCHING QUIZ
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
