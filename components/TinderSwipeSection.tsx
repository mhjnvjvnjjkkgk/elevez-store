import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, RotateCcw, Sparkles, ShoppingBag, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { useQuickView } from '../App';

interface TinderSwipeSectionProps {
  products: any[];
  onProductClick: (handle: string) => void;
  setCursorVariant: (v: any) => void;
}

interface SwipeCard {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  colors?: string[];
  tags?: string[];
}

export const TinderSwipeSection: React.FC<TinderSwipeSectionProps> = ({
  products,
  onProductClick,
  setCursorVariant
}) => {
  const { openQuickView } = useQuickView();

  // Filter pool for swipe deck
  const swipePool = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Select 6 diverse products across categories
    const categoriesMap = new Map<string, any[]>();
    products.forEach(p => {
      const cat = p.category || 'Streetwear';
      if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
      categoriesMap.get(cat)?.push(p);
    });

    const pool: any[] = [];
    categoriesMap.forEach(items => {
      pool.push(...items.slice(0, 2));
    });

    return pool.length >= 5 ? pool.slice(0, 7) : products.slice(0, 7);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProducts, setLikedProducts] = useState<any[]>([]);
  const [passedProducts, setPassedProducts] = useState<any[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<{ action: 'like' | 'pass'; product: any }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | null>(null);

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);

  const currentProduct = swipePool[currentIndex];

  const handleSwipe = (direction: 'like' | 'pass') => {
    if (!currentProduct) return;

    setLastAction(direction);

    if (direction === 'like') {
      setLikedProducts(prev => [...prev, currentProduct]);
      setSwipeHistory(prev => [...prev, { action: 'like', product: currentProduct }]);
    } else {
      setPassedProducts(prev => [...prev, currentProduct]);
      setSwipeHistory(prev => [...prev, { action: 'pass', product: currentProduct }]);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= swipePool.length || likedProducts.length + (direction === 'like' ? 1 : 0) >= 4) {
      setShowResults(true);
    } else {
      setCurrentIndex(nextIdx);
    }

    x.set(0);
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0 || currentIndex === 0) return;

    const lastEntry = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));

    if (lastEntry.action === 'like') {
      setLikedProducts(prev => prev.filter(p => p.id !== lastEntry.product.id));
    } else {
      setPassedProducts(prev => prev.filter(p => p.id !== lastEntry.product.id));
    }

    setCurrentIndex(prev => Math.max(0, prev - 1));
    setShowResults(false);
    x.set(0);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedProducts([]);
    setPassedProducts([]);
    setSwipeHistory([]);
    setShowResults(false);
    setLastAction(null);
    x.set(0);
  };

  // Smart Recommendation Scoring Algorithm
  const recommendedProducts = useMemo(() => {
    if (!showResults) return [];

    const categoryWeights: Record<string, number> = {};
    let totalLikedPrice = 0;

    likedProducts.forEach(p => {
      const cat = p.category || 'Streetwear';
      categoryWeights[cat] = (categoryWeights[cat] || 0) + 3;
      totalLikedPrice += Number(p.price || 1500);
    });

    passedProducts.forEach(p => {
      const cat = p.category || 'Streetwear';
      categoryWeights[cat] = (categoryWeights[cat] || 0) - 1;
    });

    const avgPrice = likedProducts.length > 0 ? totalLikedPrice / likedProducts.length : 1500;

    // Score catalog products
    const scored = products.map(p => {
      let score = 50; // base score
      const cat = p.category || 'Streetwear';

      // Category Weighting
      score += (categoryWeights[cat] || 0) * 12;

      // Price Similarity (closer to preferred price = higher score)
      const pPrice = Number(p.price || 1500);
      const priceDiff = Math.abs(pPrice - avgPrice);
      score += Math.max(0, 20 - (priceDiff / 100));

      // Liked Exact Boost
      if (likedProducts.some(lp => lp.id === p.id)) {
        score += 35;
      }

      // Add slight randomness for variety
      score += (Number(p.id) % 7);

      const matchPercentage = Math.min(99, Math.max(78, Math.round(score)));

      return {
        ...p,
        matchPercentage
      };
    });

    // Filter out passed products and sort by highest match
    const passedIds = new Set(passedProducts.map(p => p.id));
    return scored
      .filter(p => !passedIds.has(p.id))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);
  }, [showResults, likedProducts, passedProducts, products]);

  return (
    <section className="py-16 sm:py-28 bg-[#09090b] text-white relative z-30 overflow-hidden border-t-4 border-b-4 border-black">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#00ff88_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ff007f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#00ff88] text-black font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#fff] mb-4">
            <Sparkles size={14} className="animate-spin" />
            FIND YOUR NEXT FAVORITE
          </div>

          <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter font-syne text-white mb-3">
            TASTE MATCHER
          </h2>

          <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-md mx-auto uppercase tracking-wider font-mono">
            SWIPE RIGHT FOR LIKE // SWIPE LEFT TO PASS // AI PICKS YOUR TOP MATCHES
          </p>
        </div>

        {/* Swipe Experience OR Results View */}
        {!showResults && currentProduct ? (
          <div className="flex flex-col items-center">
            {/* Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-sm bg-neutral-800 border border-white/20 h-2.5 rounded-full mb-6 overflow-hidden p-0.5">
              <div
                className="bg-[#00ff88] h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / swipePool.length) * 100}%` }}
              />
            </div>

            {/* Card Deck Area */}
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] mb-8">
              {/* Background Stack Illusion Cards */}
              {currentIndex + 1 < swipePool.length && (
                <div className="absolute inset-0 bg-neutral-900 border-[3px] border-white/10 rounded-2xl scale-[0.93] translate-y-4 opacity-50 shadow-lg pointer-events-none" />
              )}
              {currentIndex + 2 < swipePool.length && (
                <div className="absolute inset-0 bg-neutral-900 border-[3px] border-white/10 rounded-2xl scale-[0.87] translate-y-8 opacity-25 shadow-lg pointer-events-none" />
              )}

              {/* Active Draggable Card */}
              <motion.div
                key={currentProduct.id}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) {
                    handleSwipe('like');
                  } else if (info.offset.x < -100) {
                    handleSwipe('pass');
                  }
                }}
                className="absolute inset-0 bg-neutral-900 border-[4px] border-white/20 rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_#000] cursor-grab active:cursor-grabbing select-none group"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                {/* LIKE Stamp Overlay */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-6 left-6 z-30 border-[4px] border-[#00ff88] text-[#00ff88] px-4 py-1 rounded-lg text-2xl sm:text-3xl font-black uppercase tracking-widest -rotate-12 bg-black/80 backdrop-blur-md pointer-events-none shadow-[4px_4px_0px_0px_#000]"
                >
                  LIKE ❤️
                </motion.div>

                {/* NOPE Stamp Overlay */}
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-6 right-6 z-30 border-[4px] border-[#ff007f] text-[#ff007f] px-4 py-1 rounded-lg text-2xl sm:text-3xl font-black uppercase tracking-widest rotate-12 bg-black/80 backdrop-blur-md pointer-events-none shadow-[4px_4px_0px_0px_#000]"
                >
                  NOPE ❌
                </motion.div>

                {/* Product Image */}
                <div className="relative w-full h-3/5 bg-black overflow-hidden">
                  <img
                    src={currentProduct.image || (currentProduct.images && currentProduct.images[0])}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#00ff88] text-[#00ff88] font-mono text-xs font-black px-2.5 py-1 uppercase tracking-wider">
                    ₹{currentProduct.price}
                  </div>
                </div>

                {/* Product Card Details */}
                <div className="p-4 sm:p-5 flex flex-col justify-between h-2/5 bg-neutral-900 border-t-2 border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#00ff88] font-bold tracking-widest block mb-1">
                      {currentProduct.category || 'STREETWEAR'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-syne line-clamp-1 mb-1">
                      {currentProduct.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                      {currentProduct.description}
                    </p>
                  </div>

                  <div className="text-[9px] font-mono uppercase text-gray-500 flex items-center justify-between border-t border-white/10 pt-2">
                    <span>SWIPE CARDS OR TAP BUTTONS</span>
                    <span className="text-[#00ff88]">100% PURE COTTON</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* NOPE Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('pass')}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-[#ff007f] border-[3px] border-[#ff007f] flex items-center justify-center shadow-[4px_4px_0px_0px_#ff007f] hover:bg-[#ff007f] hover:text-white transition-all cursor-pointer"
                title="Pass"
              >
                <X size={28} strokeWidth={3} />
              </motion.button>

              {/* UNDO Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleUndo}
                disabled={currentIndex === 0}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-[2.5px] flex items-center justify-center transition-all ${
                  currentIndex === 0
                    ? 'border-gray-700 text-gray-700 bg-neutral-900 cursor-not-allowed'
                    : 'border-yellow-400 text-yellow-400 bg-black shadow-[3px_3px_0px_0px_#facc15] hover:bg-yellow-400 hover:text-black cursor-pointer'
                }`}
                title="Undo last swipe"
              >
                <RotateCcw size={20} strokeWidth={2.5} />
              </motion.button>

              {/* LIKE Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('like')}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00ff88] text-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#fff] hover:bg-white transition-all cursor-pointer"
                title="Like"
              >
                <Heart size={28} fill="currentColor" strokeWidth={0} />
              </motion.button>
            </div>
          </div>
        ) : (
          /* Results View: Top 5 Personalized Matches */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-neutral-900 border-[4px] border-white/20 p-6 sm:p-10 relative rounded-2xl shadow-[16px_16px_0px_0px_#000]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b-2 border-white/10 pb-6 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[#00ff88] font-mono text-xs font-black uppercase mb-1">
                  <CheckCircle2 size={16} />
                  TASTE ANALYSIS COMPLETE
                </div>
                <h3 className="text-2xl sm:text-4xl font-black uppercase text-white font-syne">
                  TOP 5 MATCHES FOR YOU
                </h3>
              </div>

              <button
                onClick={handleReset}
                className="bg-[#00ff88] text-black font-black text-xs sm:text-sm px-4 py-2.5 uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#fff] hover:bg-white transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RotateCcw size={16} /> RETAKE TEST
              </button>
            </div>

            {/* Recommended Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {recommendedProducts.map((product, idx) => {
                const handle = product.handle || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const mainImage = product.image || (product.images && product.images[0]);

                return (
                  <motion.div
                    key={product.id || idx}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="bg-black border-[3px] border-white/20 hover:border-[#00ff88] p-3.5 relative flex flex-col justify-between shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#00ff88] transition-all group cursor-pointer"
                    onClick={() => onProductClick(handle)}
                  >
                    <div>
                      {/* Match Score Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-[#00ff88] text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000]">
                          🔥 {product.matchPercentage}% MATCH
                        </span>
                        <span className="text-xs font-mono text-[#00ff88] font-bold">
                          ₹{product.price}
                        </span>
                      </div>

                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-neutral-900 border border-white/10 overflow-hidden mb-3 group-hover:border-[#00ff88] transition-colors">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>

                      <h4 className="text-base font-black uppercase text-white font-syne line-clamp-1 mb-1 group-hover:text-[#00ff88] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openQuickView(product);
                        }}
                        className="flex-1 bg-white text-black font-black text-xs py-1.5 uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#00ff88] transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={14} /> VIEW
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProductClick(handle);
                        }}
                        className="flex-1 bg-[#00ff88] text-black font-black text-xs py-1.5 uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_#000] hover:bg-white transition-colors flex items-center justify-center gap-1"
                      >
                        SHOP <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Action Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <button
                onClick={handleReset}
                className="bg-black text-white font-mono text-xs font-black uppercase tracking-widest px-6 py-3 border-2 border-white/30 hover:border-[#00ff88] hover:text-[#00ff88] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} /> RETAKE MATCHING QUIZ
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
