
import React, { useState, useEffect, useRef, createContext, useContext, useLayoutEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from 'framer-motion';
import { Terminal, Package, Shield, Truck, Zap, Star, X, ShoppingBag, Menu, Camera, Sparkles, Filter, ChevronDown, ChevronUp, Share2, Heart, Maximize2, Gift, User, Mail, MapPin, Instagram, Twitter, ArrowRight, ArrowLeft, Award, ShieldCheck, Timer, Play, SlidersHorizontal, Search, Check, Minus, Plus, RefreshCw, CreditCard, Banknote, LogOut, Eye, Trash2, ChevronRight, Lock } from 'lucide-react';
import ScrollReveal from './components/ScrollReveal';
import ClickSpark from './components/ClickSpark';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { PRODUCTS, BRAND_NAME } from './constants';
import { localCollectionService } from './services/localCollectionService';
import { Product, ProductType, CartItem, CursorVariant } from './types';
import { auth } from './firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { BuilderComponent, useBuilderContent } from './BuilderComponent';
import { RewardsPage } from './components/RewardsPage';
import { OrderDetail } from './components/OrderDetail';
import { FloatingRewardsButton, RewardsModal } from './components/RewardsModal';
import { NewsletterSignup } from './components/NewsletterSignup';
import { ProductRecommendations } from './components/ProductRecommendations';
import { NewsletterSection } from './components/NewsletterSection';
import { SocialProofBadges } from './components/SocialProofBadges';
import { ProductQuickPreview } from './components/ProductQuickPreview';
import { WishlistButton } from './components/WishlistButton';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { OrderDetailModal } from './components/OrderDetailModal';
import { LoyaltyRulesNotificationBanner } from './components/LoyaltyRulesNotificationBanner';
import { VelocityHeader } from './components/VelocityHeader';
import { InfiniteMarquee } from './components/InfiniteMarquee';
import { ScrollVelocityGrid } from './components/ScrollVelocityGrid';
import { ShowcaseSection } from './components/ShowcaseSection';
import { HoverRevealGallery } from './components/HoverRevealGallery';
import { Magnetic } from './components/Magnetic';
import { ParallaxReveal } from './components/ParallaxReveal';
import { ImageReveal } from './components/ImageReveal';
import { GlitchText } from './components/GlitchText';
import { NewsletterSyndicate } from './components/NewsletterSyndicate';
import { AnimatedGrid } from './components/AnimatedGrid';
import { PageLoader } from './components/PageLoader';
import { DynamicAccordion } from './components/DynamicAccordion';
import { PageTransition } from './components/PageTransition';
import { FloatingElements } from './components/FloatingElements';
import { CoreProtocol } from './components/CoreProtocol';
import { SectionHeader } from './components/SectionHeader';

// --- Cart Context ---
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'elevez_cart';

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const cartId = `${product.id}-${size}-${color}`;
    setItems(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, size, color, cartId }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId: string) => {
    setItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, isCartOpen, setIsCartOpen, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

// --- Quick View Context ---
interface QuickViewContextType {
  activeProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

const QuickViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const openQuickView = (product: Product) => setActiveProduct(product);
  const closeQuickView = () => setActiveProduct(null);

  return (
    <QuickViewContext.Provider value={{ activeProduct, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
};

const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) throw new Error('useQuickView must be used within a QuickViewProvider');
  return context;
};

// --- Utility Hooks ---
const useCursor = () => {
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'money' | 'shop'>('default');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { cursorVariant, setCursorVariant, isMobile };
};

// --- Interaction Components ---

// Interactive Text Component for Hero
import { InteractiveText } from './components/InteractiveText';

// 3D Tilt Card Wrapper
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Cache bounds to avoid layout thrashing
  const boundsRef = useRef<{ left: number, top: number, width: number, height: number } | null>(null);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.2, 0.8]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    boundsRef.current = {
      left: left + window.scrollX,
      top: top + window.scrollY,
      width,
      height
    };
  };

  function handleMouseMove({ clientX, clientY }: React.MouseEvent) {
    if (!boundsRef.current) return;
    const { left, top, width, height } = boundsRef.current;
    const xPct = (clientX + window.scrollX - left) / width - 0.5;
    const yPct = (clientY + window.scrollY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    boundsRef.current = null;
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        filter: useMotionTemplate`brightness(${brightness})`
      }}
      className={`relative transition-shadow duration-500 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Magnetic Button with Liquid Effect
const MagneticButton = ({ children, onClick, onMouseEnter, onMouseLeave, className }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const boundsRef = useRef<{ left: number, top: number, width: number, height: number } | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseEnterWrapper = (e: React.MouseEvent) => {
    if (ref.current) {
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      boundsRef.current = {
        left: left + window.scrollX,
        top: top + window.scrollY,
        width,
        height
      };
    }
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const bounds = boundsRef.current || { left: 0, top: 0, width: 0, height: 0 };
    const center = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };
    x.set(clientX + window.scrollX - center.x);
    y.set(clientY + window.scrollY - center.y);
  };

  const handleMouseLeaveWrapper = () => {
    x.set(0);
    y.set(0);
    // don't clear bounds immediately if we want a smooth exit, but usually fine
    // boundsRef.current = null; 
    if (onMouseLeave) onMouseLeave();
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnterWrapper}
      onMouseLeave={handleMouseLeaveWrapper}
      style={{ x: mouseX, y: mouseY }}
      className={`relative overflow-hidden group ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-[#00ff88] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </motion.button>
  );
};


// Animated Pixel Grid Background
const PixelBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixels: { x: number, y: number, size: number, alpha: number, speed: number }[] = [];
    let mouse = { x: 0, y: 0 };
    const gridSize = 60;
    let rafId: number;

    const init = () => {
      canvas.width = width;
      canvas.height = height;
      pixels = [];

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          if (Math.random() > 0.7) {
            pixels.push({
              x, y,
              size: 1.5,
              alpha: Math.random() * 0.2,
              speed: Math.random() * 0.5
            });
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;

      // Draw Grid Lines with "Scanning" wave effect
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        const alpha = 0.03 + Math.sin(x * 0.01 + time) * 0.02;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.01, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        const alpha = 0.03 + Math.sin(y * 0.01 - time) * 0.02;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.01, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Pixels - Batched for performance
      ctx.fillStyle = "rgba(255, 255, 255, 0)"; // Reset

      pixels.forEach(p => {
        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distSq = dx * dx + dy * dy;

        let activeAlpha = p.alpha;

        // Interaction radius 200px -> 40000sq px
        if (distSq < 40000) {
          const dist = Math.sqrt(distSq);
          activeAlpha = p.alpha + (1 - dist / 200) * 0.6;
          ctx.fillStyle = `rgba(0, 255, 136, ${activeAlpha})`; // Green tint near mouse

          // Slight movement away from mouse
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * 0.5;
          p.y -= Math.sin(angle) * 0.5;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${activeAlpha})`;

          // Simple easing back to grid
          const targetX = Math.round(p.x / gridSize) * gridSize;
          const targetY = Math.round(p.y / gridSize) * gridSize;
          if (Math.abs(p.x - targetX) > 0.1) p.x += (targetX - p.x) * 0.05;
          if (Math.abs(p.y - targetY) > 0.1) p.y += (targetY - p.y) * 0.05;
        }

        // Skip drawing invisible pixels
        if (activeAlpha > 0.01) {
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });

      rafId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
};

// Product Card
const ProductCard: React.FC<{ product: Product; onHoverStart: () => void; onHoverEnd: () => void }> = ({ product, onHoverStart, onHoverEnd }) => {
  const { openQuickView } = useQuickView();
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    onHoverEnd();
  };

  // Check if user is logged in and if product is in wishlist
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const { getUserProfile } = await import('./services/userService');
        const result = await getUserProfile(currentUser.uid);
        if (result.success) {
          setIsInWishlist(result.data.wishlist?.includes(product.id) || false);
        }
      } else {
        setIsInWishlist(false);
      }
    });
    return () => unsubscribe();
  }, [product.id]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to add items to your wishlist');
      return;
    }

    try {
      const { addToWishlist, removeFromWishlist } = await import('./services/userService');

      if (isInWishlist) {
        await removeFromWishlist(user.uid, product.id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(user.uid, product.id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <motion.div 
      className="group h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      style={{ perspective: 1000 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] group-hover:shadow-[16px_16px_0px_0px_#00ff88] transition-all duration-300 aspect-[4/5]"
        onMouseEnter={onHoverStart}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_0px_#000]">
            <GlitchText text="50% OFF" triggerOnHover={false} />
          </div>
          {product.tags?.map(tag => (
            <div key={tag} className="bg-black text-white text-[10px] font-black px-2 py-1 uppercase tracking-wider border-[2px] border-white">
              {tag}
            </div>
          ))}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-white border-[3px] border-black flex items-center justify-center hover:bg-[#00ff88] transition-all shadow-[3px_3px_0px_0px_#000]"
        >
          <Heart
            size={20}
            className={`transition-all ${isInWishlist
              ? 'text-red-500 fill-red-500'
              : 'text-black'
              }`}
          />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
          style={{
            filter: rotateX !== 0 || rotateY !== 0 ? 'url(#liquid-filter) grayscale(0)' : 'grayscale(100%)',
          }}
          loading="lazy"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 bg-white border-t-[3px] border-black flex justify-center items-center pb-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              openQuickView(product);
            }}
            className="bg-[#00ff88] text-black font-black py-2 px-4 border-[3px] border-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000]"
          >
            Quick View
          </button>
        </div>
      </Link>

      <div className="mt-6 p-2 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
        <h3 className="text-lg font-black text-black uppercase font-syne line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88] font-black text-xl stroke-black" style={{ WebkitTextStroke: '1px black' }}>₹{product.price.toFixed(2)}</span>
            <span className="text-gray-400 line-through text-sm">₹{product.originalPrice.toFixed(2)}</span>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={`${i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// Quick View Modal
const QuickViewModal = () => {
  const { activeProduct, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (activeProduct && activeProduct.colors && activeProduct.colors.length > 0) {
      setSelectedColor(activeProduct.colors[0]);
    }
    setSelectedSize('M');
  }, [activeProduct]);

  if (!activeProduct) return null;

  const handleAddToCart = () => {
    addToCart(activeProduct, selectedSize, selectedColor || 'Standard', 1);
    closeQuickView();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-white/20"
        onClick={closeQuickView}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-4xl border-[8px] border-black shadow-[24px_24px_0px_0px_#000] flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-50 bg-black text-white p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#00ff88] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <X size={24} />
          </button>

          {/* Image Side */}
          <div className="md:w-1/2 relative h-64 md:h-full border-r-[4px] border-black">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              loading="eager"
            />
          </div>

          {/* Details Side */}
          <div className="md:w-1/2 p-10 flex flex-col h-full overflow-y-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#00ff88] text-black text-[10px] font-black px-3 py-1 border-[2px] border-black uppercase tracking-widest">In Stock</span>
                {activeProduct.tags?.includes('BESTSELLER') && <span className="bg-black text-white text-[10px] font-black px-3 py-1 border-[2px] border-black uppercase tracking-widest">Best Seller</span>}
              </div>
              <h2 className="text-4xl font-black font-syne uppercase leading-none mb-4 text-black">{activeProduct.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-[#00ff88]" style={{ WebkitTextStroke: '1.5px black' }}>₹{activeProduct.price}</span>
                <span className="text-gray-400 line-through text-xl font-bold">₹{activeProduct.originalPrice}</span>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase text-black opacity-40 mb-4 tracking-widest">Select Color: <span className="text-black opacity-100">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-4">
                {activeProduct.colors?.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-[3px] border-black text-xs font-black uppercase tracking-widest transition-all ${selectedColor === color ? 'bg-black text-[#00ff88] shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
              <h3 className="text-xs font-black uppercase text-black opacity-40 mb-4 tracking-widest">Select Size: <span className="text-black opacity-100">{selectedSize}</span></h3>
              <div className="flex gap-4">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border-[3px] border-black font-black text-sm transition-all ${selectedSize === size ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#00ff88] text-black font-black py-6 border-[4px] border-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-xl"
              >
                Add to Cart - ₹{(activeProduct.price).toFixed(0)}
              </button>
              <Link
                to={`/product/${activeProduct.id}`}
                onClick={closeQuickView}
                className="block w-full text-center py-4 text-xs font-black uppercase tracking-widest text-black hover:underline underline-offset-8"
              >
                View Full Dossier
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Cart Sidebar
const CartSidebar = () => {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-white/40 z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white border-l-[6px] border-black z-[70] flex flex-col shadow-[-16px_0px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="p-8 border-b-[6px] border-black flex items-center justify-between flex-shrink-0 bg-white relative">
              <VelocityHeader text="Your Cart" className="!text-4xl" />
              <div className="flex items-center gap-4">
                <span className="bg-black text-[#00ff88] px-3 py-1 font-black text-xs border-[2px] border-black">{items.length}</span>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="p-2 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex-shrink-0"
                >
                  <X size={24} className="text-black" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-black gap-8">
                  <div className="w-24 h-24 bg-gray-100 border-[4px] border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#000]">
                    <ShoppingBag size={48} className="opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black uppercase mb-4 italic">The Vault is Empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="bg-black text-[#00ff88] px-8 py-3 border-[3px] border-black font-black uppercase text-sm shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">Begin Selection</button>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.cartId}
                    className="flex gap-6 bg-white p-4 border-[4px] border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    <div className="w-24 h-32 border-[3px] border-black overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" loading="lazy" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-black text-lg uppercase text-black line-clamp-1 leading-none mb-2">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase border-[1px] border-black">{item.size}</span>
                          {item.color && <span className="bg-[#00ff88] text-black px-2 py-1 text-[10px] font-black uppercase border-[1px] border-black">{item.color}</span>}
                          <span className="bg-white text-black px-2 py-1 text-[10px] font-black uppercase border-[1px] border-black">QTY: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-black text-black">
                          ₹<GlitchText text={(item.price * item.quantity).toFixed(0)} triggerOnHover={false} />
                        </div>
                        <button onClick={() => removeFromCart(item.cartId)} className="w-10 h-10 bg-white border-[3px] border-black flex items-center justify-center hover:bg-red-500 hover:text-white shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t-[6px] border-black bg-white flex-shrink-0">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black uppercase opacity-40 tracking-[0.2em]">Subtotal</span>
                    <div className="text-4xl font-black text-black font-syne uppercase tracking-tighter">
                      ₹<GlitchText text={cartTotal.toFixed(0)} triggerOnHover={false} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-black opacity-30 italic leading-none">Logistics and taxes calculated during mission briefing.</p>
                </div>
                <Magnetic>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-[#00ff88] text-black font-black py-6 border-[4px] border-black uppercase tracking-[0.2em] shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all text-2xl"
                  >
                    Checkout Now
                  </button>
                </Magnetic>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// New Collapsible Filter Section Component
const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider hover:text-[#00ff88] transition-colors mb-2"
      >
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Scroll-Linked Animation Wrapper ---
const ScrollAnimatedSection: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const ref = useRef(null);

  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"] // Start when section enters bottom, end when it exits top
  });

  // Map scroll progress to animation values
  // Progress: 0 (below viewport) → 0.5 (center) → 1 (above viewport)

  // Opacity: fade in from 0-0.3, stay visible 0.3-0.7, fade out 0.7-1
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  // TranslateY: slide up on enter, slide up on exit
  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [100, 0, 0, -100]
  );

  // Scale: subtle scale effect
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.95, 1, 1, 0.95]
  );

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y,
        scale
      }}
    >
      {children}
    </motion.div>
  );
};

// --- Best Sellers Section ---
const BestSellers = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    // Try to get best sellers from localStorage first
    const localProducts = localCollectionService.getProductsBySection('bestSellers');

    if (localProducts.length > 0) {
      setBestSellers(localProducts.slice(0, 4));
    } else {
      // Fallback to constants
      const fromConstants = PRODUCTS
        .filter(p => p.isBestSeller || p.isFeatured)
        .slice(0, 4);
      setBestSellers(fromConstants);
    }
  }, []);

  return (
    <ScrollAnimatedSection>
      <section className="min-h-screen relative flex items-center justify-center py-24 px-6 bg-white border-t-[6px] border-black">
        <div className="max-w-7xl w-full relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="text-center mb-16"
          >
          <SectionHeader 
            title="Best Sellers" 
            subtitle="The pieces everyone's talking about. Limited stock available."
          />

            {/* Neo Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              {[
                { value: "1000+", label: "Happy Customers", icon: "👥" },
                { value: "50+", label: "Sold Today", icon: "🔥" },
                { value: "4.9", label: "Average Rating", icon: "⭐" }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white border-[4px] border-black px-8 py-4 shadow-[6px_6px_0px_0px_#000]"
                >
                  <span className="text-3xl">{stat.icon}</span>
                  <div className="text-left">
                    <div className="text-black font-black text-2xl leading-none">{stat.value}</div>
                    <div className="text-black font-bold text-xs uppercase tracking-tighter">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {bestSellers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onHoverStart={() => {}}
                onHoverEnd={() => {}}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/shop/all')}
              className="px-16 py-6 bg-black text-[#00ff88] border-[4px] border-black font-black text-2xl uppercase tracking-widest shadow-[10px_10px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>
    </ScrollAnimatedSection>
  );
};

// --- Customer Reviews Carousel with Scroll Hijacking ---
const CustomerReviews = () => {
  const ref = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      text: "Absolutely love the quality! The fabric is premium and the fit is perfect. Best streetwear purchase I've made this year.",
      date: "2 days ago",
      product: "Premium Hoodie",
      avatar: "👩"
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 5,
      text: "The attention to detail is incredible. Fast shipping and the packaging was top-notch. Will definitely order again!",
      date: "1 week ago",
      product: "Oversized Tee",
      avatar: "👨"
    },
    {
      id: 3,
      name: "Emma Davis",
      rating: 5,
      text: "Finally found a brand that gets it right. The designs are unique and the quality speaks for itself. Highly recommend!",
      date: "2 weeks ago",
      product: "Vintage Jacket",
      avatar: "👩‍🦰"
    }
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "center center",
        end: "+=400%",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const count = reviews.length;
          const index = Math.min(Math.floor(progress * count), count - 1);
          setCurrentIndex(index);
        }
      });
    }, ref);

    return () => ctx.revert();
  }, [reviews.length]);

  const currentReview = reviews[currentIndex];

  return (
    <ScrollAnimatedSection>
      <section ref={ref} className="min-h-screen relative flex items-center justify-center py-24 px-6 bg-[#00ff88] border-t-[6px] border-black">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <SectionHeader 
            title="Field Reports" 
            subtitle="The Syndicate has spoken about the protocol"
          />

          {/* Review Card */}
          <div className="relative bg-white border-[6px] border-black p-12 md:p-20 shadow-[16px_16px_0px_0px_#000]">
            {/* Decorative Quote Marks */}
            <div className="absolute top-8 left-8 text-black opacity-10 text-[10rem] font-black leading-none">"</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="text-center relative z-10"
              >
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto mb-8 bg-black border-[4px] border-black flex items-center justify-center text-5xl shadow-[6px_6px_0px_0px_#00ff88]">
                  {currentReview.avatar}
                </div>

                {/* Rating Stars */}
                <div className="flex justify-center gap-2 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={32}
                      className={`fill-black text-black`}
                    />
                  ))}
                </div>

                <p className="text-2xl md:text-4xl text-black font-black leading-tight mb-12 uppercase italic">
                  "{currentReview.text}"
                </p>

                <div className="space-y-2 border-t-[4px] border-black pt-8 inline-block">
                  <h4 className="text-3xl font-black text-black uppercase">{currentReview.name}</h4>
                  <p className="text-black font-bold uppercase tracking-widest bg-[#00ff88] inline-block px-4 py-1 border-[2px] border-black">
                    Verified Buyer
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-16 flex justify-center gap-6">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] disabled:opacity-30"
            >
              <ArrowLeft size={32} />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(reviews.length - 1, currentIndex + 1))}
              disabled={currentIndex === reviews.length - 1}
              className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_#000] disabled:opacity-30"
            >
              <ArrowRight size={32} />
            </button>
          </div>
        </div>
      </section>
    </ScrollAnimatedSection>
  );
};

// --- Why Choose Us Section ---
const WhyChooseUs = () => {
  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "Handpicked materials and meticulous craftsmanship in every piece",
      color: "#00ff88"
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Express delivery worldwide, your style arrives in days",
      color: "#ffffff"
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "Bank-level encryption, shop with complete confidence",
      color: "#00ff88"
    },
    {
      icon: Timer,
      title: "24/7 Support",
      description: "Always here to help, whenever you need us",
      color: "#ffffff"
    }
  ];

  return (
    <ScrollAnimatedSection>
      <section className="min-h-[75vh] relative flex items-center justify-center py-24 px-6 bg-white border-t-[6px] border-black">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <SectionHeader 
            title="Why Elevez" 
            subtitle="Premium quality, unmatched style"
          />

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-white border-[4px] border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#00ff88] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
                  <feature.icon size={28} className="text-black" />
                </div>

                <h3 className="text-2xl font-black mb-3 uppercase text-black font-syne leading-none">
                  {feature.title}
                </h3>
                <p className="text-black font-black text-sm leading-snug uppercase tracking-tight">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              to="/shop/all"
              className="inline-block bg-[#00ff88] text-black px-16 py-6 border-[4px] border-black font-black text-2xl uppercase tracking-widest shadow-[10px_10px_0px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </ScrollAnimatedSection>
  );
};

// --- Scroll Progress Indicator ---
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, #00ff88, #00ddff, #00ff88)',
      }}
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[100]"
    />
  );
};

// --- Scroll to Top Button ---
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[#00ff88] text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.5)] hover:scale-110 transition-transform"
          whileHover={{ y: -5 }}
        >
          <ArrowRight className="w-6 h-6 -rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// --- Toast Notification System ---
const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info' }> = ({ message, type = 'success' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl max-w-md w-auto ${type === 'success' ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88]' :
        type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          'bg-blue-500/20 border-blue-500/50 text-blue-400'
        }`}
    >
      <Check className="w-5 h-5 flex-shrink-0" />
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
};

// --- Interactive Gradient Background ---
const InteractiveGradientBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .interactive-gradient-bg {
          background: 
            radial-gradient(
              circle 800px at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(0, 255, 136, 0.15),
              transparent 50%
            ),
            linear-gradient(
              135deg,
              rgba(0, 255, 136, 0.08) 0%,
              rgba(0, 0, 0, 0.95) 20%,
              rgba(0, 0, 0, 1) 40%,
              rgba(100, 50, 255, 0.08) 60%,
              rgba(0, 0, 0, 0.95) 80%,
              rgba(0, 255, 136, 0.08) 100%
            );
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
          transition: background 0.3s ease;
        }
        
        .cursor-glow {
          background: radial-gradient(
            circle 600px at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(0, 255, 136, 0.2),
            rgba(0, 255, 136, 0.05) 40%,
            transparent 70%
          );
        }
      `}</style>

      {/* Base gradient layer */}
      <div className="interactive-gradient-bg fixed inset-0 z-0" />

      {/* Cursor glow layer - hidden on mobile */}
      <motion.div
        className="cursor-glow fixed inset-0 z-0 pointer-events-none hidden md:block"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
};

// --- Pages ---

const Home = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [collectionFilter, setCollectionFilter] = useState<string>('All');

  // Parallax Transforms (Applied to the Main Hero Box for contained card scroll depth)
  const heroTextY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroImageY = useTransform(scrollY, [0, 500], [0, 100]);
  const videoSectionY = useTransform(scrollY, [0, 1000], [0, -100]);

  // Mouse Parallax for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleHeroMouseMove({ clientX, clientY }: React.MouseEvent) {
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  }

  function handleHeroMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const heroMoveX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const heroMoveY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);

  // Mouse Parallax for Hero Models
  const leftModelX = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const leftModelY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);
  const leftModelRotate = useTransform(mouseX, [-0.5, 0.5], [10, 15]);

  const rightModelX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const rightModelY = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rightModelRotate = useTransform(mouseX, [-0.5, 0.5], [-15, -10]);

  const leftModelSpringX = useSpring(leftModelX, { stiffness: 100, damping: 25 });
  const leftModelSpringY = useSpring(leftModelY, { stiffness: 100, damping: 25 });
  const leftModelSpringRotate = useSpring(leftModelRotate, { stiffness: 100, damping: 25 });

  const rightModelSpringX = useSpring(rightModelX, { stiffness: 100, damping: 25 });
  const rightModelSpringY = useSpring(rightModelY, { stiffness: 100, damping: 25 });
  const rightModelSpringRotate = useSpring(rightModelRotate, { stiffness: 100, damping: 25 });

  // Filter products based on collection filter
  const filteredProducts = PRODUCTS.filter(p => {
    // Only show products that are enabled for homepage
    if (p.showInHome === false) return false;

    if (collectionFilter === 'All') return p.isBestSeller;
    if (collectionFilter === 'Old Money') return p.tags?.includes('VINTAGE') && p.isBestSeller;
    if (collectionFilter === 'Bold and Vibrant') return p.tags?.includes('COLORFUL') && p.isBestSeller;
    if (collectionFilter === 'Premium Streetwear') return p.tags?.includes('PREMIUM') && p.isBestSeller;
    if (collectionFilter === 'Hoodies') return p.type.includes('Hoodie') && p.isBestSeller;
    if (collectionFilter === 'Oversized') return p.type.includes('Oversized') && p.isBestSeller;
    if (collectionFilter === 'Under ₹50') return p.price < 50 && p.isBestSeller;
    if (collectionFilter === '₹100+') return p.price >= 100 && p.isBestSeller;
    return p.isBestSeller;
  });

  return (
    <div className="w-full overflow-hidden relative">
      {/* Optimized Interactive Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 136, 0.08), transparent 70%)`
          }}
        />
      </div>

      {/* Hero Section */}
      <section 
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-36 pb-16 px-4 z-20 bg-white"
      >
        
        {/* Large Decorative Text (Neo-Brutalist Style) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-5 select-none">
          <div className="text-[12rem] font-black leading-none rotate-[-5deg] translate-x-[-5%] translate-y-[5%]">
            ELEVEZ ELEVEZ ELEVEZ
          </div>
        </div>

        {/* Main Hero Box with Scroll Parallax */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ y: heroTextY }}
          className="relative z-10 text-center w-[95%] max-w-[1400px] mx-auto p-10 md:p-12 lg:p-20 bg-white border-[8px] border-black shadow-[24px_24px_0px_0px_#000] hover:shadow-[32px_32px_0px_0px_#00ff88] transition-all duration-500 flex flex-col justify-center min-h-[60vh] overflow-visible"
        >
          {/* Left High-Fashion Model */}
          <motion.div
            style={{ x: leftModelSpringX, y: leftModelSpringY, rotate: leftModelSpringRotate }}
            className="hidden xl:block absolute left-[-80px] top-[5%] bottom-[5%] w-[260px] xl:w-[320px] z-20 pointer-events-auto"
            whileHover={{ 
              scale: 1.18,
              y: -12,
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
          >
            <img 
              src="/models/model_left.png" 
              alt="Elevez Left Model" 
              className="w-full h-full object-contain filter drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[0_0_20px_#00ff88] transition-all duration-300"
            />
          </motion.div>

          {/* Right High-Fashion Model */}
          <motion.div
            style={{ x: rightModelSpringX, y: rightModelSpringY, rotate: rightModelSpringRotate }}
            className="hidden xl:block absolute right-[-80px] top-[5%] bottom-[5%] w-[260px] xl:w-[320px] z-20 pointer-events-auto"
            whileHover={{ 
              scale: 1.18,
              y: -12,
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
          >
            <img 
              src="/models/model_right.png" 
              alt="Elevez Right Model" 
              className="w-full h-full object-contain filter drop-shadow-[-6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[0_0_20px_#00ff88] transition-all duration-300"
            />
          </motion.div>

          <motion.div
            style={{ x: heroMoveX, y: heroMoveY }}
            className="flex-1 flex flex-col justify-center"
          >
            {/* Symmetrical System Active Header */}
            <div className="flex items-center justify-center gap-4 mb-8 text-black font-black uppercase text-xs md:text-sm tracking-widest border-b-[3px] border-black pb-3 w-fit mx-auto select-none">
              <span>SYSTEM ACTIVE // PROTOCOL 01</span>
              <span className="w-2.5 h-2.5 bg-[#00ff88] border-[2px] border-black rounded-full animate-pulse" />
              <span>SS26 DROP</span>
            </div>

            <div className="relative flex items-center justify-center w-full my-6 select-none">
              {/* Left bracket */}
              <div className="hidden xl:flex flex-col items-end text-black font-black text-xs uppercase tracking-widest opacity-60 pr-8 border-r-[3px] border-black leading-tight">
                <span>[ CORE-GRID ]</span>
                <span>REG. PROTOCOL</span>
              </div>

              {/* Centered Symmetrical Header */}
              <h1
                className="text-6xl md:text-[5.5vw] font-black leading-none tracking-tighter font-syne cursor-default uppercase text-black relative mx-12 flex flex-col items-center justify-center text-center"
              >
                {/* Brand Star Sticker */}
                <motion.img
                  src="/stickers/neon_star.png"
                  alt="Elevez Badge"
                  className="absolute -top-16 -right-12 md:-top-20 md:-right-20 w-20 h-20 md:w-28 md:h-28 pointer-events-auto select-none z-20"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 15 }}
                  whileHover={{ 
                    scale: 1.25, 
                    rotate: 45,
                    transition: { type: "spring", stiffness: 400, damping: 15 } 
                  }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                />

                <InteractiveText text="Elevate Your" className="block mb-2 text-center justify-center" />
                <InteractiveText text="Style Game" className="block text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }} />
              </h1>

              {/* Right bracket */}
              <div className="hidden xl:flex flex-col items-start text-black font-black text-xs uppercase tracking-widest opacity-60 pl-8 border-l-[3px] border-black leading-tight">
                <span>[ SS26 // 01 ]</span>
                <span>MODEL VERIFIED</span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-black text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-bold border-t-[3px] border-black pt-12"
            >
              Experience fashion reimagined with cutting-edge design and unparalleled comfort.
              Welcome to the new era of <span className="bg-black text-white px-2 uppercase">{BRAND_NAME}</span>.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Magnetic>
                <button
                  onClick={() => navigate('/shop/all')}
                  className="px-12 py-6 bg-[#00ff88] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-black font-black text-xl tracking-widest uppercase"
                >
                  Shop Collection
                </button>
              </Magnetic>

              <Magnetic>
                <button
                  onClick={() => navigate('/about')}
                  className="px-12 py-6 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-black font-black text-xl tracking-widest uppercase"
                >
                  Explore More
                </button>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Symmetrical X-Shaped Crossing Marquees */}
      <div className="relative w-full h-80 overflow-hidden z-10 flex items-center justify-center -my-16 pointer-events-none select-none bg-white">
        <div className="absolute w-[150%] transform -rotate-[4deg] z-10">
          <InfiniteMarquee text="NEW DROPS // LIMITED EDITION // PREMIUM STREETWEAR // FREE SHIPPING ON ORDERS OVER ₹999 // JOIN THE REWARDS PROGRAM" className="py-4 shadow-[0_8px_0_0_#000]" />
        </div>
        <div className="absolute w-[150%] transform rotate-[4deg] z-20">
          <InfiniteMarquee text="EXCELLENCE IN EVERY DETAIL // CUSTOM STITCHED // SS26 RUNWAY // ELEVEZ LABS" className="py-4 shadow-[0_8px_0_0_#000]" direction="right" />
        </div>
      </div>

      {/* Why Choose Elevez - Neobrutalist */}
      <section className="py-24 relative z-30 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader 
            title="Why Elevez" 
            subtitle="Excellence in every detail, innovation in every stitch"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
            {[
              { icon: Truck, title: "3-Day Express", desc: "Lightning-fast shipping straight to your doorstep.", tag: "3 Days" },
              { icon: Shield, title: "180gsm Premium", desc: "Superior quality cotton that breathes and lasts.", tag: "180gsm" },
              { icon: Award, title: "Excellent Designs", desc: "Award-winning patterns that stand out.", tag: "Winner" },
              { icon: Star, title: "Personality-Driven", desc: "Each piece tells your unique story.", tag: "Style" }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border-[4px] border-black p-5 md:p-6 relative group hover:shadow-[10px_10px_0px_0px_#00ff88] transition-all duration-300 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <div className="absolute -top-4 -right-2 bg-black text-[#00ff88] text-[10px] font-black px-3 py-0.5 uppercase tracking-widest border-[2px] border-black shadow-[2px_2px_0px_0px_#000]">
                  {item.tag}
                </div>
                <div className="w-12 h-12 bg-[#00ff88] border-[3px] border-black flex items-center justify-center mb-5 shadow-[3px_3px_0px_0px_#000]">
                  <item.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-3 font-syne uppercase text-black leading-none">{item.title}</h3>
                <p className="text-black font-black text-xs md:text-sm leading-snug uppercase tracking-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Badges */}
      <SocialProofBadges />

      {/* Best Sellers Section */}
      <BestSellers />


      {/* Product Recommendations */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader 
            title="Recommended" 
            subtitle="Selected specifically for your protocol"
          />
          <ProductRecommendations limit={4} />
        </div>
      </section>

      {/* Featured Collections */}
      <ScrollAnimatedSection>
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-bold text-center mb-4 font-syne">Our Collections</h2>
              <p className="text-center text-gray-500 mb-16">Curated styles for every personality</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6 mb-20">
              {['All', 'Old Money', 'Bold and Vibrant', 'Premium Streetwear', 'Hoodies', 'Oversized', 'Under ₹50', '₹100+'].map((filter, i) => (
                <button
                  key={filter}
                  onClick={() => setCollectionFilter(filter)}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  className={`px-8 py-4 border-[3px] border-black text-sm font-black uppercase tracking-widest transition-all ${collectionFilter === filter ? 'bg-[#00ff88] text-black shadow-[6px_6px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <ProductCard
                    product={product}
                    onHoverStart={() => setCursorVariant('hover')}
                    onHoverEnd={() => setCursorVariant('default')}
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-24">
              <button
                onClick={() => setCollectionFilter('All')}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                className="inline-block px-12 py-5 bg-black text-[#00ff88] border-[4px] border-black font-black uppercase tracking-widest shadow-[10px_10px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all text-xl"
              >
                ACCESS ENTIRE VAULT
              </button>
            </div>
          </div>
        </section>
      </ScrollAnimatedSection>

      {/* Video Experience Section - Parallax Effect */}
      <ScrollAnimatedSection>
        <section className="py-20 bg-black relative">
          <motion.div
            style={{ y: videoSectionY }}
            className="container mx-auto px-6 text-center relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 relative z-20">The Elevez Experience</h2>
            <p className="text-gray-400 mb-12">See the passion behind every piece</p>

            <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl group"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
              </div>
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-urban-model-posing-in-neon-light-39857-large.mp4"
                autoPlay muted loop playsInline
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute bottom-10 left-10 z-20 text-left mix-blend-difference">
                <h3 className="text-5xl md:text-8xl font-black text-white font-syne leading-none">
                  FOR<br />BIGGER<br />BLAZES
                </h3>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Redefining Modern Fashion */}
        <section className="py-24 bg-zinc-950/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-8 font-syne">
                Redefining<br />
                <span className="text-white">Modern Fashion</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                At Elevez, we believe clothing is more than fabricΓÇöit's an expression of identity.
                Each piece is meticulously crafted with sustainable materials and innovative design.
              </p>
              <MagneticButton
                onClick={() => navigate('/about')}
                className="px-8 py-4 rounded-full border border-[#00ff88]"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <span className="text-[#00ff88] group-hover:text-black font-bold uppercase tracking-widest">Our Story</span>
              </MagneticButton>
            </motion.div>

            <TiltCard className="h-[600px] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                alt="Studio"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
              />
            </TiltCard>
          </div>
        </section>
      </ScrollAnimatedSection>

      {/* Core Protocol Manifesto */}
      <CoreProtocol />

      {/* Newsletter Signup - End of Page */}
      <NewsletterSyndicate />
    </div>
  );
};

const Shop = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFilter = searchParams.get('tag');
  const typeFilter = searchParams.get('type');
  const collectionParam = searchParams.get('collection');

  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('elevez_products');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        setProducts(parsed.length > 0 ? parsed : PRODUCTS);
      } catch (e) {
        setProducts(PRODUCTS);
      }
    } else {
      setProducts(PRODUCTS);
    }

    const storedCollections = localCollectionService.getAllCollections();
    setCollections(storedCollections);

    if (collectionParam) {
      setSelectedCollection(collectionParam);
    }
  }, [collectionParam]);

  useEffect(() => {
    if (typeFilter) setFilter(typeFilter);
    else if (tagFilter) setFilter(tagFilter);
    else setFilter('All');
  }, [tagFilter, typeFilter]);

  const filteredProducts = products.filter(p => {
    if (p.showInShop === false) return false;

    if (selectedCollection !== 'all') {
      const collection = collections.find(c => c.handle === selectedCollection);
      if (collection) {
        const productHandle = p.shopifyHandle || p.handle;
        const productId = String(p.id);

        const inCollection =
          collection.productHandles?.includes(productHandle) ||
          collection.productHandles?.includes(p.handle) ||
          collection.productHandles?.includes(productId) ||
          p.collections?.includes(collection.name);

        if (!inCollection) return false;
      }
    }

    const matchesCategory = category === 'all' || !category ? true : p.category?.toLowerCase() === category || p.category === 'Unisex';
    let matchesFilter = true;
    if (filter === 'All') matchesFilter = true;
    else if (['Hoodie', 'T-Shirt', 'Crop Top', 'Oversized'].includes(filter)) matchesFilter = p.type?.includes(filter);
    else if (['Men', 'Women', 'Unisex'].includes(filter)) matchesFilter = p.category === filter;
    else if (filter === 'OLD') matchesFilter = p.tags?.includes('VINTAGE');
    else if (filter === 'BOLD') matchesFilter = p.tags?.includes('COLORFUL');
    else if (filter === 'PREMIUM') matchesFilter = p.tags?.includes('PREMIUM');
    else if (filter === 'ESSENTIAL') matchesFilter = p.tags?.includes('ESSENTIAL');
    else if (filter === 'Under') matchesFilter = p.price < 50;
    else if (filter === '₹100+') matchesFilter = p.price >= 100;

    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-48 pb-20 px-6 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[4px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
            Complete Collection
          </div>
          <h1 className="text-6xl md:text-[8rem] font-black uppercase mb-4 font-syne tracking-tighter text-black leading-[0.9]">
            {category === 'men' ? "Men's Gear" : category === 'women' ? "Women's Style" : "The Archives"}
          </h1>
          <p className="text-black font-black uppercase text-xl mt-4">Discover all {filteredProducts.length} pieces of pure identity.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16 relative">
          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-1/4 shrink-0">
            <div className="sticky top-40 bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000]">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-[4px] border-black">
                <SlidersHorizontal size={24} className="text-black" />
                <span className="font-black font-syne text-2xl uppercase text-black">Filters</span>
              </div>

              {/* Search */}
              <div className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
                  <input
                    type="text"
                    placeholder="SEARCH ARCHIVES..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-[4px] border-black px-12 py-4 text-black font-black placeholder-gray-400 focus:shadow-[6px_6px_0px_0px_#00ff88] outline-none transition-all uppercase"
                  />
                </div>
              </div>

              {/* Filter Groups */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-black uppercase text-black mb-4 bg-black text-white px-3 py-1 inline-block">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Men', 'Women', 'Unisex'].map(c => (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`px-4 py-2 border-[3px] border-black font-black text-xs uppercase tracking-widest transition-all ${filter === c ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black uppercase text-black mb-4 bg-black text-white px-3 py-1 inline-block">Product Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Hoodie', 'T-Shirt', 'Crop Top', 'Oversized'].map(c => (
                      <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`px-4 py-2 border-[3px] border-black font-black text-xs uppercase tracking-widest transition-all ${filter === c ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000]'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black uppercase text-black mb-4 bg-black text-white px-3 py-1 inline-block">Collections</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCollection('all')}
                      className={`block w-full text-left px-4 py-2 border-[3px] border-black font-black text-xs uppercase transition-all ${selectedCollection === 'all' ? 'bg-black text-[#00ff88]' : 'bg-white text-black'}`}
                    >
                      All Products
                    </button>
                    {collections.filter(c => c.handle !== 'all').map(collection => (
                      <button
                        key={collection.handle}
                        onClick={() => setSelectedCollection(collection.handle)}
                        className={`block w-full text-left px-4 py-2 border-[3px] border-black font-black text-xs uppercase transition-all ${selectedCollection === collection.handle ? 'bg-black text-[#00ff88]' : 'bg-white text-black'}`}
                      >
                        {collection.name} ({collection.productCount || 0})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard
                      product={product}
                      onHoverStart={() => setCursorVariant('hover')}
                      onHoverEnd={() => setCursorVariant('default')}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 border-[6px] border-black border-dashed bg-gray-50">
                <p className="text-4xl font-black text-black uppercase mb-8">Nothing Found In The Archives</p>
                <button 
                  onClick={() => { setFilter('All'); setSearchQuery('') }} 
                  className="bg-black text-[#00ff88] px-12 py-4 border-[4px] border-black font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const storedProducts = localStorage.getItem('elevez_products');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        const found = parsed.find((p: any) =>
          p.id === Number(id) || p.shopifyId === id || p.handle === id
        );
        if (found) {
          setProduct(found);
          setActiveImage(found.image);
          if (found.colors?.[0]) setSelectedColor(found.colors[0]);
          return;
        }
      } catch (e) {
        console.error('Error parsing localStorage products:', e);
      }
    }

    const constantsProduct = PRODUCTS.find(p => p.id === Number(id));
    if (constantsProduct) {
      setProduct(constantsProduct);
      setActiveImage(constantsProduct.image);
      if (constantsProduct.colors?.[0]) setSelectedColor(constantsProduct.colors[0]);
    }
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-4xl">Product Not Found</div>;

  const productImages = product.images && product.images.length > 0 ? product.images.slice(0, 5) : [product.image];

  const getColorCode = (name: string) => {
    const colors: { [key: string]: string } = {
      'Black': '#000000', 'White': '#FFFFFF', 'Void Gray': '#333333',
      'Neon Green': '#39FF14', 'Cyber Pink': '#FF007F', 'Code Green': '#00FF00',
      'Matte Black': '#1A1A1A', 'Dust White': '#EBEBEB', 'Grey': '#808080',
      'Acid Black': '#2B2B2B', 'Rust': '#B7410E', 'Obsidian': '#0B0B0B',
      'Navy': '#000080', 'Vapor Blue': '#00FFFF', 'Pink': '#FFC0CB',
      'Heather Grey': '#9DA3A6', 'Concrete': '#808080', 'Midnight Blue': '#191970',
      'Chrome Grey': '#A0A0A0', 'Shadow Black': '#121212', 'Cement': '#D3D3D3',
      'Asphalt': '#505050', 'Pulse Red': '#FF0000', 'Static White': '#F8F8FF',
      'Glitch Purple': '#8A2BE2', 'Metal Grey': '#696969', 'Space Black': '#0A0A0A'
    };
    return colors[name] || '#000000';
  };

  return (
    <div className="min-h-screen pt-48 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <Link to="/shop/all" className="inline-flex items-center gap-3 bg-black text-[#00ff88] px-6 py-2 border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] mb-12 transition-all">
          <ArrowLeft size={16} /> Back to Archives
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column - Images */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[4/5] border-[6px] border-black bg-white shadow-[16px_16px_0px_0px_#000] mb-8 group overflow-hidden">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 bg-black text-[#00ff88] px-4 py-1 border-[3px] border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000]">
                {product.type}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square border-[3px] border-black transition-all ${activeImage === img ? 'bg-[#00ff88] shadow-[4px_4px_0px_0px_#000]' : 'bg-white hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-3 mb-4 font-black uppercase text-sm">
              <span className="bg-black text-white px-3 py-1">Premium Collection</span>
              <GlitchText text={product.category} className="text-black" />
            </div>

            <VelocityHeader text={product.name} className="mb-6 !text-left" />

            <div className="flex items-center gap-6 mb-8">
              <div className="text-5xl font-black text-black">
                ₹<GlitchText text={product.price.toString()} triggerOnHover={false} />
              </div>
              <span className="text-2xl text-gray-400 line-through font-bold">₹{product.originalPrice}</span>
              <div className="bg-[#00ff88] border-[3px] border-black px-3 py-1 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000]">
                Save ₹{(product.originalPrice - product.price).toFixed(0)}
              </div>
            </div>

            <p className="text-black font-bold uppercase text-lg leading-tight mb-10 border-l-[6px] border-black pl-6 italic">
              {product.description || 'Premium quality streetwear with personality-driven design. Engineered for durability and style in the urban environment.'}
            </p>

            {/* Selection Options */}
            <div className="space-y-8 mb-10">
              {product.colors && (
                <div>
                  <h4 className="text-sm font-black uppercase mb-4 text-black">Color: {selectedColor}</h4>
                  <div className="flex gap-4">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 border-[4px] border-black transition-all ${selectedColor === color ? 'shadow-[4px_4px_0px_0px_#00ff88] scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: getColorCode(color) }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-black uppercase mb-4 text-black">Size: {selectedSize}</h4>
                <div className="flex flex-wrap gap-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 border-[4px] border-black font-black text-lg transition-all ${selectedSize === size ? 'bg-[#00ff88] text-black shadow-[4px_4px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase mb-4 text-black">Quantity</h4>
                <div className="flex items-center border-[4px] border-black w-fit bg-white shadow-[4px_4px_0px_0px_#000]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center font-black text-2xl hover:bg-black hover:text-white transition-all border-r-[4px] border-black">
                    -
                  </button>
                  <span className="w-16 text-center font-black text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center font-black text-2xl hover:bg-black hover:text-white transition-all border-l-[4px] border-black">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <DynamicAccordion items={[
                { title: "Product Architecture", content: product.description || "Designed for maximum utility and urban aesthetics. Built with high-grade GSM fabric for durability and comfort." },
                { title: "Material Protocol", content: "100% Premium Cotton // 240 GSM // Pre-shrunk // Bio-washed // Sustainably sourced." },
                { title: "Shipping Signals", content: "Dispatched within 24-48 hours. Express shipping available. Real-time tracking enabled." }
              ]} />
            </div>

            <div className="flex flex-col gap-6 mb-12">
              <Magnetic>
                <button
                  onClick={() => {
                    addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
                  }}
                  className="w-full py-8 bg-black text-[#00ff88] border-[4px] border-black font-black text-3xl uppercase tracking-widest shadow-[10px_10px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center justify-center gap-6"
                >
                  <ShoppingBag size={32} /> Initiate Purchase
                </button>
              </Magnetic>

              <button
                onClick={() => {
                  addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
                  setTimeout(() => {
                    navigate('/checkout');
                    window.scrollTo(0, 0);
                  }, 300);
                }}
                className="w-full bg-[#00ff88] text-black font-black text-2xl py-6 border-[4px] border-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                Buy It Now
              </button>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t-[4px] border-black">
              {[
                { icon: Truck, label: "3-Day Delivery" },
                { icon: RefreshCw, label: "Easy Returns" },
                { icon: ShieldCheck, label: "Safe Payment" }
              ].map((service, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-black text-[#00ff88] flex items-center justify-center border-[2px] border-black shadow-[4px_4px_0px_0px_#ccc]">
                    <service.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-black tracking-widest">{service.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* More Like This */}
        <div className="mt-40">
          <h2 className="text-4xl font-bold mb-12 border-l-4 border-[#00ff88] pl-6">More Like This</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onHoverStart={() => setCursorVariant('hover')}
                onHoverEnd={() => setCursorVariant('default')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const [activeTeamMember, setActiveTeamMember] = useState<number | null>(null);
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Founder & Creative Director",
      bio: "Visionary designer blending digital aesthetics with streetwear culture",
      icon: "👨‍💼"
    },
    {
      name: "Maya Patel",
      role: "Head of Design",
      bio: "Crafting innovative designs that push boundaries",
      icon: "👩‍🎨"
    },
    {
      name: "Jordan Lee",
      role: "Operations Lead",
      bio: "Ensuring quality and speed in every delivery",
      icon: "👨‍💼"
    },
    {
      name: "Sofia Rodriguez",
      role: "Community Manager",
      bio: "Building and nurturing our global community",
      icon: "👩‍💼"
    }
  ];

  const processSteps = [
    { number: "01", title: "Concept", description: "Design & ideation with cutting-edge aesthetics" },
    { number: "02", title: "Craft", description: "Premium materials and meticulous production" },
    { number: "03", title: "Quality", description: "Rigorous testing and quality assurance" },
    { number: "04", title: "Deliver", description: "Direct to you with care and precision" }
  ];

  const stats = [
    { number: "10K+", label: "Community Members" },
    { number: "50+", label: "Countries Shipped" },
    { number: "100%", label: "Satisfaction Rate" },
    { number: "5000+", label: "Happy Customers" }
  ];

  const values = [
    { title: "Quality", description: "Premium materials and craftsmanship in every piece", icon: "✨" },
    { title: "Innovation", description: "Pushing boundaries with cutting-edge design", icon: "🚀" },
    { title: "Community", description: "Building a movement, not just a brand", icon: "🤝" },
    { title: "Sustainability", description: "Responsible practices for a better future", icon: "🌍" }
  ];

  return (
    <div className="min-h-screen bg-white pt-48 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 mb-32">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-8 py-3 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mb-12">
            The Movement
          </div>
          <h1 className="text-7xl md:text-[12rem] font-black font-syne mb-12 text-black uppercase leading-[0.85] tracking-tighter">
            OUR <span className="text-[#00ff88]" style={{ WebkitTextStroke: '4px black' }}>STORY</span>
          </h1>
          <p className="text-2xl md:text-4xl text-black font-black uppercase leading-tight max-w-4xl mx-auto italic border-l-[12px] border-black pl-12 text-left">
            Elevez was born in the digital void. We are not just a clothing brand; we are a movement against the static.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-24 mb-32 transform rotate-[-1deg] w-[110%] -ml-[5%]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 transform rotate-[1deg]">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-6xl md:text-8xl font-black text-[#00ff88] mb-2 font-syne">{stat.number}</div>
              <div className="text-sm font-black text-white uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Grid */}
      <section className="container mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {values.map((value, i) => (
            <div key={i} className="bg-white border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#00ff88] hover:shadow-[16px_16px_0px_0px_#000] transition-all group">
              <div className="text-6xl mb-8 group-hover:scale-125 transition-transform inline-block">{value.icon}</div>
              <h3 className="text-4xl font-black uppercase mb-6 text-black font-syne">{value.title}</h3>
              <p className="text-xl font-bold text-black uppercase opacity-70">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Origin Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 aspect-[16/9] border-[8px] border-black shadow-[20px_20px_0px_0px_#00ff88] overflow-hidden">
            <ImageReveal
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&q=80&w=1200"
              alt="Studio"
              className="w-full h-full"
            />
          </div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-black p-12 border-[6px] border-black flex flex-col justify-center shadow-[16px_16px_0px_0px_#00ff88]"
          >
            <h3 className="text-7xl font-black font-syne mb-6 text-[#00ff88] leading-none">2024</h3>
            <p className="text-xl text-white font-bold uppercase leading-relaxed opacity-70">The year we broke the code. Established in Neo-Tokyo, expanding globally with a vision to redefine streetwear.</p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="inline-block bg-[#00ff88] text-black text-xs font-black uppercase tracking-[0.3em] px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-6">Objective</div>
          <VelocityHeader text="Our Mission" className="mb-8" />
          <p className="text-3xl text-black font-black uppercase leading-tight max-w-2xl">Redefining Streetwear for the Digital Age</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-10 border-[6px] border-black shadow-[12px_12px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
            >
              <div className="text-6xl mb-6 grayscale group-hover:grayscale-0 transition-all">{value.icon}</div>
              <h3 className="text-2xl font-black text-black uppercase mb-4 group-hover:text-[#00ff88] transition-colors">{value.title}</h3>
              <p className="text-black font-bold uppercase text-sm opacity-50 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lookbook Hover Gallery */}
      <HoverRevealGallery />

      {/* Marquee Divider */}
      <InfiniteMarquee text="THE PROTOCOL // THE PROTOCOL // THE PROTOCOL" direction="right" speed={15} className="my-20" />

      {/* Process Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20 text-right"
        >
          <VelocityHeader text="The Protocol" className="mb-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white p-10 border-[6px] border-black shadow-[12px_12px_0px_0px_#00ff88] h-full flex flex-col">
                <div className="text-8xl font-black font-syne text-black mb-6 leading-none opacity-10">{step.number}</div>
                <h3 className="text-2xl font-black text-black uppercase mb-4">{step.title}</h3>
                <p className="text-black font-bold uppercase text-sm opacity-50">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <VelocityHeader text="Core Operators" className="mb-4" />
          <p className="text-xl text-black font-black uppercase opacity-40">The creative minds behind Elevez</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setActiveTeamMember(index)}
              onHoverEnd={() => setActiveTeamMember(null)}
              className="bg-white p-10 border-[6px] border-black shadow-[12px_12px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all cursor-pointer group"
            >
              <div className="text-7xl mb-6 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">{member.icon}</div>
              <h3 className="text-2xl font-black text-black uppercase mb-1">{member.name}</h3>
              <p className="text-[#00ff88] font-black text-xs uppercase mb-6 tracking-widest" style={{ WebkitTextStroke: '0.5px black' }}>{member.role}</p>
              <AnimatePresence>
                {activeTeamMember === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-black font-bold uppercase text-xs opacity-50 leading-relaxed"
                  >
                    {member.bio}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <div className="bg-black p-16 border-[8px] border-black shadow-[24px_24px_0px_0px_#00ff88]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-7xl font-black font-syne text-[#00ff88] mb-2 leading-none uppercase tracking-tighter" style={{ WebkitTextStroke: '2px white' }}>
                  {stat.number}
                </div>
                <p className="text-white font-black uppercase text-xs tracking-widest opacity-40">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 mb-40">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#00ff88] p-20 border-[8px] border-black shadow-[24px_24px_0px_0px_#000] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 translate-y-1/2 -translate-x-1/2 -rotate-12 pointer-events-none" />
          
          <VelocityHeader text="Join the Movement" className="mb-8 text-center" />
          <p className="text-2xl text-black font-black uppercase mb-12 max-w-2xl mx-auto leading-tight opacity-70">Be part of a community redefining streetwear. Explore our collection and experience the future of fashion.</p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to="/shop/all"
              className="w-full sm:w-auto px-12 py-6 bg-black text-[#00ff88] font-black border-[4px] border-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-xl"
            >
              Shop Now
            </Link>
            <Link
              to="/rewards"
              className="w-full sm:w-auto px-12 py-6 bg-white text-black font-black border-[4px] border-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-xl"
            >
              Join Rewards
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal } = useCart();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'upi'
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');

  // Check user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Pre-fill form with user data if available
        setFormData(prev => ({
          ...prev,
          fullName: user.displayName || '',
          email: user.email || ''
        }));
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google Sign-In...');
      const provider = new GoogleAuthProvider();
      console.log('Google Provider created:', provider);

      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful!', result.user);
      setUser(result.user);

      // Create or update user profile
      const { createUserProfile } = await import('./services/userService');
      const profileResult = await createUserProfile(result.user);
      console.log('User profile created:', profileResult);

      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: result.user.displayName || '',
        email: result.user.email || ''
      }));
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorMessage = 'Failed to sign in. ';
      if (error.code === 'auth/popup-blocked') {
        errorMessage += 'Please allow popups for this site.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'Sign-in was cancelled.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'This domain is not authorized. Please add it to Firebase Console.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      alert(errorMessage);
    }
  };

  // State for address autocomplete suggestions
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  const shippingCost = formData.paymentMethod === 'cod' ? 30 : 0;
  const discountAmount = discountApplied ? (cartTotal * discountPercentage) / 100 : 0;
  const totalAmount = cartTotal + shippingCost - discountAmount;

  // Handle discount code validation
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage('Please enter a discount code');
      return;
    }

    try {
      const { checkoutDiscountService } = await import('./services/checkoutDiscountService');
      const result = await checkoutDiscountService.calculateDiscount(discountCode, cartTotal, user?.uid);

      if (result.valid && result.discount) {
        setDiscountApplied(true);
        // Calculate percentage from discount amount for display
        const percentage = result.discount.type === 'percentage'
          ? result.discount.value
          : Math.round((result.discountAmount! / cartTotal) * 100);
        setDiscountPercentage(percentage);
        setDiscountMessage(`✓ ${result.discount.name || 'Discount'} applied! (${percentage}% off)`);
      } else {
        setDiscountApplied(false);
        setDiscountPercentage(0);
        setDiscountMessage(result.message || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Discount validation error:', error);
      setDiscountMessage('Error validating code');
    }
  };

  // Generate a static map preview from the entered address
  const generateMapPreview = async () => {
    // For now, we'll just show a placeholder
    // In a real implementation, you would call a geocoding service here
    const placeholderMap = 'data:image/svg+xml,<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="%23fff" text-anchor="middle" dominant-baseline="middle">Map functionality removed</text></svg>';
    setMapPreview(placeholderMap);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For phone and pincode fields, only allow numeric input
    if (name === 'phone' || name === 'pincode') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Import the saveOrder function dynamically to avoid issues
      const { saveOrder } = await import('./services/orderService');

      // Prepare order data
      const orderData = {
        userId: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        subtotal: cartTotal,
        shippingCost: shippingCost,
        totalAmount: totalAmount
      };

      // Save order to Firebase
      const result = await saveOrder(orderData);

      if (result.success) {
        setOrderId(result.orderId);

        // Award loyalty points for the purchase
        try {
          const { userPointsService } = await import('./services/userPointsService');
          const pointsAwarded = await userPointsService.addPointsFromPurchase(
            user.uid,
            totalAmount,
            result.orderId
          );
          if (pointsAwarded) {
            console.log(`✅ Awarded loyalty points for order ${result.orderId}`);
          }
        } catch (pointsError) {
          console.error('Error awarding points (order still successful):', pointsError);
        }

        // Record discount usage if discount was applied
        if (discountApplied && discountCode) {
          try {
            const { checkoutDiscountService } = await import('./services/checkoutDiscountService');
            await checkoutDiscountService.recordUsage(discountCode, user?.uid);
            console.log(`✅ Discount usage recorded for code: ${discountCode}`);
          } catch (discountError) {
            console.error('Error recording discount usage:', discountError);
          }
        }

        setOrderPlaced(true);
      } else {
        console.error('Error saving order:', result.error);
        // Still show success page even if save fails for demo purposes
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error during order submission:', error);
      // Still show success page even if save fails for demo purposes
      setOrderPlaced(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-black flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some items to proceed to checkout</p>
          <Link to="/shop/all" className="bg-[#00ff88] text-black px-8 py-3 rounded-full font-bold uppercase hover:bg-white transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center px-6"
        >
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-12">
            <div className="w-20 h-20 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-syne">Order Placed Successfully!</h1>
            <p className="text-gray-400 mb-8 text-lg">
              Thank you for your order, {formData.fullName}. We've sent a confirmation email to {formData.email}
            </p>
            <div className="bg-black/50 rounded-2xl p-6 mb-8 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Order Total</span>
                <span className="text-2xl font-bold text-[#00ff88]">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-white">{formData.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</span>
              </div>
              {orderId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Order ID</span>
                  <span className="text-white font-mono">{orderId}</span>
                </div>
              )}
            </div>
            <Link
              to="/"
              className="inline-block bg-[#00ff88] text-black px-8 py-4 rounded-full font-bold uppercase hover:bg-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6 mb-12">
            <button onClick={() => navigate(-1)} className="w-12 h-12 bg-black text-[#00ff88] flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-6xl md:text-8xl font-black font-syne uppercase text-black leading-none">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-12">
              {!user ? (
                <div className="bg-white border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#000]">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                      <Lock size={32} />
                    </div>
                    <h2 className="text-4xl font-black uppercase font-syne text-black">Identity Required</h2>
                  </div>
                  <p className="text-xl font-bold text-black uppercase mb-10">Please sign in with your Google account to continue with your order.</p>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-black text-[#00ff88] py-6 px-4 border-[4px] border-black font-black flex items-center justify-center gap-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-xl uppercase tracking-widest"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-12">
                  {/* User Info */}
                  <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                        <User size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase font-syne text-black">Logged as {user.displayName}</h2>
                        <p className="text-black font-bold uppercase opacity-50">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut(auth)}
                      className="bg-red-500 text-white border-[3px] border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000]">
                    <div className="flex items-center gap-6 mb-10 border-b-[4px] border-black pb-4">
                      <div className="w-14 h-14 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                        <MapPin size={28} />
                      </div>
                      <h2 className="text-4xl font-black uppercase font-syne text-black">Shipping</h2>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <label className="block text-sm font-black uppercase text-black mb-3">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                          placeholder="YOUR NAME"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-black uppercase text-black mb-3">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="EMAIL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase text-black mb-3">Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            inputMode="numeric"
                            className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="PHONE"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-black mb-3">Address *</label>
                        <div className="flex gap-4">
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="flex-1 bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="FULL ADDRESS"
                          />
                          <button
                            type="button"
                            onClick={generateMapPreview}
                            className="bg-black text-[#00ff88] px-8 border-[3px] border-black font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            Map
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <label className="block text-sm font-black uppercase text-black mb-3">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="CITY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase text-black mb-3">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="STATE"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-black uppercase text-black mb-3">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            required
                            inputMode="numeric"
                            className="w-full bg-white border-[4px] border-black p-5 text-black font-black uppercase focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all placeholder-gray-400"
                            placeholder="PINCODE"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000]">
                    <div className="flex items-center gap-6 mb-10 border-b-[4px] border-black pb-4">
                      <div className="w-14 h-14 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                        <CreditCard size={28} />
                      </div>
                      <h2 className="text-4xl font-black uppercase font-syne text-black">Payment</h2>
                    </div>
                    <div className="space-y-6">
                      <label className={`flex items-center gap-6 p-6 border-[4px] border-black cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'bg-[#00ff88] shadow-[8px_8px_0px_0px_#000]' : 'bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="w-8 h-8 accent-black"
                        />
                        <div className="flex-1 flex items-center gap-6">
                          <div className="bg-black p-3 text-[#00ff88] border-[2px] border-black shadow-[2px_2px_0px_0px_#fff]">
                            <CreditCard size={32} />
                          </div>
                          <div>
                            <p className="font-black text-xl uppercase text-black">UPI Payment</p>
                            <p className="text-sm font-bold uppercase text-black opacity-60">Instant & Free Shipping</p>
                          </div>
                        </div>
                        <span className="bg-black text-[#00ff88] text-xs font-black px-4 py-1 border-[2px] border-black uppercase">BEST CHOICE</span>
                      </label>
                      <label className={`flex items-center gap-6 p-6 border-[4px] border-black cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'bg-[#00ff88] shadow-[8px_8px_0px_0px_#000]' : 'bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="w-8 h-8 accent-black"
                        />
                        <div className="flex-1 flex items-center gap-6">
                          <div className="bg-black p-3 text-[#00ff88] border-[2px] border-black shadow-[2px_2px_0px_0px_#fff]">
                            <Banknote size={32} />
                          </div>
                          <div>
                            <p className="font-black text-xl uppercase text-black">Cash on Delivery</p>
                            <p className="text-sm font-bold uppercase text-black opacity-60">Pay when you receive</p>
                          </div>
                        </div>
                        <span className="text-black font-black uppercase text-sm">+₹30 Shipping</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-black text-3xl py-8 border-[6px] border-black transition-all uppercase tracking-[0.2em] ${isSubmitting ? 'bg-gray-400 text-black cursor-not-allowed' : 'bg-[#00ff88] text-black shadow-[12px_12px_0px_0px_#000] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]'}`}
                  >
                    {isSubmitting ? 'PROCESSING...' : `PLACE ORDER • ₹${totalAmount.toFixed(0)}`}
                  </button>
                </form>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000] sticky top-40">
                <div className="flex items-center gap-4 mb-8 border-b-[4px] border-black pb-4">
                  <div className="w-12 h-12 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                    <Package size={24} />
                  </div>
                  <h2 className="text-2xl font-black uppercase font-syne text-black">Summary</h2>
                </div>

                <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex gap-4 pb-6 border-b-[2px] border-black last:border-0">
                      <div className="w-20 h-24 border-[3px] border-black shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm uppercase text-black leading-tight mb-1">{item.name}</h4>
                        <p className="text-[10px] font-bold uppercase text-black opacity-60">{item.size} • {item.color} • QTY: {item.quantity}</p>
                        <p className="text-black font-black mt-2 text-lg uppercase">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code */}
                <div className="mb-8 p-6 bg-gray-100 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                  <label className="text-xs font-black uppercase text-black mb-3 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountMessage('');
                      }}
                      placeholder="CODE"
                      className="flex-1 bg-white border-[3px] border-black px-4 py-2 font-black uppercase focus:bg-[#00ff88] transition-colors outline-none"
                      disabled={discountApplied}
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={discountApplied}
                      className="px-6 py-2 bg-black text-[#00ff88] border-[3px] border-black font-black uppercase text-xs hover:bg-[#00ff88] hover:text-black transition-all"
                    >
                      {discountApplied ? '✓' : 'GO'}
                    </button>
                  </div>
                  {discountMessage && (
                    <p className={`text-[10px] font-black uppercase mt-3 ${discountApplied ? 'text-green-600' : 'text-red-500'}`}>
                      {discountMessage}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-6 border-t-[4px] border-black">
                  <div className="flex justify-between font-bold uppercase text-sm text-black">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold uppercase text-sm text-black">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-black' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(0)}`}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-green-600 font-black uppercase text-sm">
                      <span>Discount ({discountPercentage}%)</span>
                      <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl font-black pt-6 border-t-[4px] border-black text-black font-syne uppercase">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Rewards Card */}
                {user && (
                  <div className="mt-8 p-6 bg-[#00ff88] border-[4px] border-black shadow-[8px_8px_0px_0px_#000]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-black text-[#00ff88] border-[2px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#fff]">
                        <Gift size={24} />
                      </div>
                      <h4 className="font-black uppercase text-black text-sm">Earnings</h4>
                    </div>
                    <div className="bg-white border-[3px] border-black p-4 text-center">
                      <p className="text-[10px] font-black uppercase text-black opacity-60 mb-1">Points For Order</p>
                      <p className="text-4xl font-black text-black font-syne leading-none">+{Math.floor(totalAmount / 10)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Page Component
const Account: React.FC<{ setCursorVariant: (variant: CursorVariant) => void }> = ({ setCursorVariant }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { addToCart } = useCart();

  // Check authentication
  useEffect(() => {
    // Safety timeout - force loading to false after 3 seconds
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      console.warn('⚠️ Loading timeout reached - forcing loading to false');
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
      clearTimeout(loadingTimeout); // Clear timeout once auth state is resolved
    });
    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Load user data - COMPREHENSIVE AUTO-LOADER
  const loadUserData = async (userId: string) => {
    try {
      console.log('🔄 Auto-loading all user data for:', userId);

      const { userDataLoaderService } = await import('./services/userDataLoaderService');

      // Load ALL user data at once
      const userData = await userDataLoaderService.loadAllUserData(userId);

      // Set profile
      if (userData.profile) {
        setUserProfile(userData.profile);
      }

      // Set wishlist
      if (userData.wishlist && userData.wishlist.length > 0) {
        const wishlistProds = PRODUCTS.filter(p => userData.wishlist.includes(p.id));
        setWishlistProducts(wishlistProds);
      }

      // Set orders
      if (userData.orders) {
        setOrders(userData.orders);
      }

      console.log('✅ All user data loaded:', {
        orders: userData.orderCount,
        points: userData.points?.points || 0,
        tier: userData.tier,
        wishlist: userData.wishlist.length
      });

      // Set up real-time listeners for live updates
      const cleanup = userDataLoaderService.setupRealtimeListeners(userId, {
        onPointsUpdate: (points) => {
          console.log('🔄 Real-time points update:', points.points);
          // Points will auto-update in loyalty components via their own listeners
        },
        onOrdersUpdate: (orders) => {
          console.log('🔄 Real-time orders update:', orders.length);
          setOrders(orders);
        },
        onProfileUpdate: (profile) => {
          console.log('🔄 Real-time profile update');
          setUserProfile(profile);
          const wishlistIds = profile.wishlist || [];
          const wishlistProds = PRODUCTS.filter(p => wishlistIds.includes(p.id));
          setWishlistProducts(wishlistProds);
        }
      });

      // Cleanup on unmount
      return cleanup;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google Sign-In from Account page...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful!', result.user);
      setUser(result.user);

      const { createUserProfile } = await import('./services/userService');
      const profileResult = await createUserProfile(result.user);
      console.log('User profile created:', profileResult);
      await loadUserData(result.user.uid);
    } catch (error: any) {
      console.error('Error signing in:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorMessage = 'Failed to sign in. ';
      if (error.code === 'auth/popup-blocked') {
        errorMessage += 'Please allow popups for this site.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'Sign-in was cancelled.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'This domain is not authorized. Please add it to Firebase Console.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      alert(errorMessage);
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = async (productId: number) => {
    if (!user) return;

    try {
      const { addToWishlist, removeFromWishlist } = await import('./services/userService');
      const isInWishlist = wishlistProducts.some(p => p.id === productId);

      if (isInWishlist) {
        await removeFromWishlist(user.uid, productId);
        setWishlistProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        await addToWishlist(user.uid, productId);
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
          setWishlistProducts(prev => [...prev, product]);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // If not logged in
  if (!user && !loading) {
    return (
      <div className="min-h-screen pt-48 pb-20 bg-white flex items-center justify-center px-6">
        <div className="max-w-xl w-full">
          <div className="bg-white border-[8px] border-black p-16 shadow-[24px_24px_0px_0px_#00ff88] text-center">
            <div className="w-24 h-24 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_0px_#000]">
              <User size={48} />
            </div>
            <h1 className="text-6xl font-black mb-6 font-syne uppercase text-black leading-none">Access Restricted</h1>
            <p className="text-xl font-bold text-black uppercase mb-12 opacity-70">Please sign in to view your account, orders, and wishlist.</p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-black text-[#00ff88] py-8 px-6 border-[4px] border-black font-black flex items-center justify-center gap-6 shadow-[12px_12px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all text-2xl uppercase tracking-[0.2em]"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-48 pb-20 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-[8px] border-black border-t-[#00ff88] animate-spin mx-auto mb-8 shadow-[8px_8px_0px_0px_#000]"></div>
          <p className="text-2xl font-black text-black uppercase tracking-widest animate-pulse">Syncing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-48 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 border-b-[8px] border-black pb-12">
            <div>
              <div className="inline-block bg-[#00ff88] text-black text-xs font-black uppercase tracking-[0.3em] px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-6">
                Identity Profile
              </div>
              <h1 className="text-7xl md:text-9xl font-black font-syne uppercase text-black leading-none tracking-tighter">My <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>Account</span></h1>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => loadUserData(user.uid)}
                className="w-14 h-14 bg-white text-black border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                title="Sync Data"
              >
                <RefreshCw size={28} />
              </button>
              <button
                onClick={() => signOut(auth)}
                className="bg-black text-[#00ff88] px-10 py-4 border-[4px] border-black font-black uppercase text-lg shadow-[8px_8px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center gap-4"
              >
                <LogOut size={24} />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left Column: User Info */}
            <div className="lg:col-span-1 space-y-12">
              <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000]">
                <div className="relative inline-block mb-10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-32 h-32 border-[6px] border-black shadow-[8px_8px_0px_0px_#00ff88]" />
                  ) : (
                    <div className="w-32 h-32 bg-black text-[#00ff88] border-[6px] border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#00ff88]">
                      <User size={64} />
                    </div>
                  )}
                  <div className="absolute -bottom-4 -right-4 bg-black text-white px-4 py-2 text-xs font-black uppercase border-[3px] border-black">Verified</div>
                </div>
                <h2 className="text-3xl font-black uppercase text-black mb-2">{user.displayName}</h2>
                <p className="text-lg font-bold text-black opacity-50 uppercase tracking-tighter mb-8">{user.email}</p>
                <div className="space-y-4 pt-8 border-t-[4px] border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase opacity-40">Orders</span>
                    <span className="text-xl font-black uppercase">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase opacity-40">Wishlist</span>
                    <span className="text-xl font-black uppercase">{wishlistProducts.length}</span>
                  </div>
                </div>
              </div>

              {/* Loyalty Teaser in Side */}
              <div className="bg-[#00ff88] border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000]">
                <h3 className="text-3xl font-black uppercase text-black mb-6 leading-none">Loyalty Status</h3>
                <div className="bg-white border-[4px] border-black p-6 mb-8 text-center">
                  <p className="text-4xl font-black text-black font-syne">1,240</p>
                  <p className="text-xs font-black uppercase text-black opacity-50">Available Points</p>
                </div>
                <Link to="/rewards" className="block w-full bg-black text-[#00ff88] py-4 text-center border-[3px] border-black font-black uppercase shadow-[6px_6px_0px_0px_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                  Portal Access
                </Link>
              </div>
            </div>

            {/* Right Column: History & Wishlist */}
            <div className="lg:col-span-2 space-y-16">
              {/* Past Orders */}
              <section>
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                    <Package size={32} />
                  </div>
                  <h2 className="text-5xl font-black uppercase font-syne text-black">Log History</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-16 text-center shadow-[12px_12px_0px_0px_#000]">
                    <Package size={64} className="mx-auto mb-8 text-black opacity-10" />
                    <p className="text-2xl font-black text-black uppercase mb-10 opacity-50 italic">No operations recorded yet.</p>
                    <Link to="/shop/all" className="inline-block bg-[#00ff88] text-black px-12 py-5 border-[4px] border-black font-black uppercase text-xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                      Browse Store
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {orders.map((order) => {
                      if (!order || !order.id) return null;
                      
                      let orderDateStr = 'N/A';
                      try {
                        if (order.orderDate || order.createdAt) {
                          const dateValue = order.orderDate || order.createdAt;
                          const date = typeof dateValue === 'string' ? new Date(dateValue) : (dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue));
                          orderDateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
                        }
                      } catch (e) {}

                      const getStatusStyle = (status: string) => {
                        const s = (status || 'pending').toLowerCase();
                        if (s === 'delivered') return { bg: 'bg-[#00ff88]', text: 'text-black', icon: 'DONE' };
                        if (s === 'shipped') return { bg: 'bg-blue-400', text: 'text-black', icon: 'MOVE' };
                        return { bg: 'bg-yellow-400', text: 'text-black', icon: 'SYNC' };
                      };

                      const status = getStatusStyle(order.status);
                      const total = order.totalAmount ?? order.total ?? 0;

                      return (
                        <div key={order.id} className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b-[3px] border-black pb-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <span className="text-xs font-black uppercase opacity-40">Operation ID:</span>
                                <span className="text-sm font-black uppercase">{order.id.slice(0, 8)}</span>
                              </div>
                              <div className="text-2xl font-black uppercase font-syne text-black">
                                {orderDateStr}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xs font-black uppercase opacity-40">Value</p>
                                <p className="text-3xl font-black text-black">₹{total.toFixed(0)}</p>
                              </div>
                              <div className={`${status.bg} ${status.text} px-4 py-2 border-[2px] border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000]`}>
                                {order.status || 'pending'}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {(order.items || []).slice(0, 4).map((item: any, i: number) => (
                              <div key={i} className="w-20 h-24 border-[2px] border-black shrink-0 relative group">
                                <img src={item.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-black uppercase text-center p-1">
                                  {item.quantity}x {item.size}
                                </div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => {
                              // Modal logic...
                              const modalOrder = {
                                id: order.id,
                                orderNumber: order.id.slice(-8).toUpperCase(),
                                date: order.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                                status: (order.status || 'processing') as any,
                                items: (order.items || []).map((item: any) => ({
                                  id: item.id || item.name,
                                  name: item.name,
                                  image: item.image || '',
                                  price: item.price,
                                  quantity: item.quantity,
                                  size: item.size,
                                  color: item.color
                                })),
                                subtotal: total,
                                shipping: order.shippingCost || 0,
                                tax: 0,
                                discount: order.discount || 0,
                                total: total,
                                customer: {
                                  name: user.displayName,
                                  email: user.email,
                                  phone: order.phone || 'N/A'
                                },
                                shippingAddress: {
                                  street: order.address || 'N/A',
                                  city: order.city || 'N/A',
                                  state: order.state || 'N/A',
                                  zip: order.pincode || 'N/A',
                                  country: 'India'
                                },
                                payment: {
                                  method: order.paymentMethod || 'UPI',
                                  status: 'paid'
                                },
                                timeline: []
                              };
                              setSelectedOrder(modalOrder);
                              setShowOrderModal(true);
                            }}
                            className="w-full mt-6 bg-black text-[#00ff88] py-4 border-[3px] border-black font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-3"
                          >
                            <Eye size={20} />
                            Full Report
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Wishlist */}
              <section>
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                    <Heart size={32} />
                  </div>
                  <h2 className="text-5xl font-black uppercase font-syne text-black">Saved Items</h2>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-16 text-center shadow-[12px_12px_0px_0px_#000]">
                    <Heart size={64} className="mx-auto mb-8 text-black opacity-10" />
                    <p className="text-2xl font-black text-black uppercase mb-10 opacity-50 italic">No assets saved.</p>
                    <Link to="/shop/all" className="inline-block bg-[#00ff88] text-black px-12 py-5 border-[4px] border-black font-black uppercase text-xl shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                      Browse All
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-black">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                          />
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-4 right-4 w-12 h-12 bg-[#00ff88] text-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                          >
                            <X size={24} />
                          </button>
                        </div>
                        <div className="p-6">
                          <h3 className="font-black uppercase text-black mb-1 line-clamp-1 text-sm">{product.name}</h3>
                          <p className="text-xl font-black text-[#00ff88] mb-6" style={{ WebkitTextStroke: '1px black' }}>₹{product.price}</p>
                          <Link
                            to={`/product/${product.id}`}
                            className="block w-full bg-black text-[#00ff88] py-3 text-center border-[2px] border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

const Contact = () => (
  <div className="min-h-screen pt-48 pb-24 bg-white">
    <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div>
        <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[4px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
          Contact Us
        </div>
        <h1 className="text-7xl md:text-[8rem] font-black mb-8 font-syne text-black uppercase leading-[0.9]">
          SIGNAL <span className="text-[#00ff88]" style={{ WebkitTextStroke: '3px black' }}>US</span>
        </h1>
        <p className="text-2xl text-black font-bold uppercase mb-12 max-w-lg">
          Questions about your order? Want to collaborate? The line is open.
        </p>
        <div className="space-y-8">
          <div className="flex items-center gap-8 p-8 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all group">
            <div className="w-16 h-16 bg-black flex items-center justify-center text-[#00ff88] border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
              <Mail size={32} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-black opacity-50 mb-1">Email</h3>
              <p className="text-2xl font-black text-black">support@elevez.com</p>
            </div>
          </div>
          <div className="flex items-center gap-8 p-8 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] transition-all group">
            <div className="w-16 h-16 bg-black flex items-center justify-center text-[#00ff88] border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
              <MapPin size={32} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-black opacity-50 mb-1">HQ</h3>
              <p className="text-2xl font-black text-black">Neo-Tokyo, Sector 7</p>
            </div>
          </div>
        </div>
      </div>
      <form className="bg-white p-12 border-[6px] border-black shadow-[16px_16px_0px_0px_#000] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-black">First Name</label>
            <input type="text" className="w-full bg-white border-[4px] border-black p-4 text-black font-bold focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all uppercase" placeholder="JOHN" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-black">Last Name</label>
            <input type="text" className="w-full bg-white border-[4px] border-black p-4 text-black font-bold focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all uppercase" placeholder="DOE" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-black uppercase text-black">Email</label>
          <input type="email" className="w-full bg-white border-[4px] border-black p-4 text-black font-bold focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all uppercase" placeholder="YOUR@EMAIL.COM" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-black uppercase text-black">Message</label>
          <textarea rows={4} className="w-full bg-white border-[4px] border-black p-4 text-black font-bold focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all uppercase" placeholder="TELL US EVERYTHING..." />
        </div>
        <button className="w-full bg-black text-[#00ff88] py-6 border-[4px] border-black font-black uppercase text-2xl tracking-[0.2em] shadow-[8px_8px_0px_0px_#000] hover:bg-[#00ff88] hover:text-black transition-all">
          Transmit Message
        </button>
      </form>
    </div>
  </div>
);

// --- Navbar & Footer ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, setIsCartOpen } = useCart();
  const { setCursorVariant } = useCursor();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsScrolled(scrolled > 50);
      setScrollProgress(Math.min(scrolled / 300, 1));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle quick add to cart from ProductRecommendations
  const { addToCart } = useCart();
  useEffect(() => {
    const handleQuickAdd = (event: any) => {
      const { product, size, color, quantity } = event.detail;
      addToCart(product, size, color, quantity);
    };

    window.addEventListener('quickAddToCart', handleQuickAdd);
    return () => window.removeEventListener('quickAddToCart', handleQuickAdd);
  }, [addToCart]);

  return (
    <>
      <motion.nav
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
      >
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] px-8 py-4 flex items-center justify-between">
          <Link to="/" className="text-4xl font-black tracking-tighter font-syne uppercase text-black">
            <GlitchText text={BRAND_NAME} triggerOnHover={false} />
            <span className="text-[#00ff88]">.</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Men', 'Women', 'Collections', 'About', 'Rewards', 'Contact'].map((item) => (
              <Magnetic key={item}>
                <Link 
                  to={item === 'Home' ? '/' : item === 'Collections' ? '/shop/all' : item === 'Men' ? '/shop/men' : item === 'Women' ? '/shop/women' : `/${item.toLowerCase()}`}
                  className="text-sm font-black uppercase tracking-widest text-black hover:text-[#00ff88] transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-[#00ff88] group-hover:w-full transition-all duration-300" />
                </Link>
              </Magnetic>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link to="/account" className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center text-black hover:bg-black hover:text-[#00ff88] shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <User size={24} />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center text-black hover:bg-black hover:text-[#00ff88] shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all relative"
            >
              <ShoppingBag size={24} />
              {items.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-[#00ff88] border-[3px] border-black text-black text-[10px] font-black w-7 h-7 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  {items.length}
                </span>
              )}
            </button>
            <Link to="/shop/all" className="hidden sm:block bg-[#00ff88] text-black px-8 py-3 border-[3px] border-black font-black uppercase text-sm shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
              Shop Now
            </Link>
            <button className="lg:hidden w-12 h-12 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#00ff88] z-[100] flex flex-col p-10 md:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-4xl font-black font-syne uppercase text-black tracking-tighter">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-14 h-14 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000]"
              >
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {['Home', 'Men', 'Women', 'Collections', 'About', 'Rewards', 'Contact'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item === 'Home' ? '/' : item === 'Collections' ? '/shop/all' : item === 'Men' ? '/shop/men' : item === 'Women' ? '/shop/women' : `/${item.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-6xl font-black uppercase font-syne text-black hover:italic transition-all inline-block"
                    style={{ WebkitTextStroke: '2px black' }}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-20 flex gap-6">
              <Magnetic>
                <a href="#" className="w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000]">
                  <Instagram size={32} />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#" className="w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000]">
                  <Twitter size={32} />
                </a>
              </Magnetic>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="bg-white border-t-[8px] border-black pt-24 pb-12 relative z-10">
    <div className="container mx-auto px-6">
      {/* Loyalty Program Teaser */}
      <div className="mb-24 bg-[#00ff88] border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#000] text-center">
        <div className="flex items-center justify-center gap-6 mb-6">
          <Gift className="w-16 h-16 text-black" />
          <VelocityHeader text="Join Our Rewards" className="!text-5xl md:!text-6xl" />
        </div>
        <p className="text-black font-black uppercase text-xl mb-10 max-w-3xl mx-auto tracking-tight">
          Earn points with every purchase, unlock exclusive tiers, and get amazing discounts. Start earning today!
        </p>
        <Link
          to="/rewards"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-block px-12 py-5 bg-black text-[#00ff88] border-[4px] border-black font-black uppercase text-xl tracking-widest shadow-[8px_8px_0px_0px_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
        >
          Access Rewards Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="space-y-8">
          <h3 className="text-5xl font-black font-syne text-black tracking-tighter uppercase">
            <GlitchText text={BRAND_NAME} triggerOnHover={false} />
            <span className="text-[#00ff88]">.</span>
          </h3>
          <p className="text-black font-bold text-sm leading-relaxed uppercase tracking-widest opacity-60">
            Redefining streetwear for the digital age. Quality meets virtual aesthetics. Designed in the Metaverse, worn in reality.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-black uppercase mb-8 text-black border-b-[4px] border-black inline-block">Inventory</h4>
          <ul className="space-y-4 text-black font-black uppercase tracking-widest text-sm">
            <li><Link to="/shop/men" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Men</Link></li>
            <li><Link to="/shop/women" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Women</Link></li>
            <li><Link to="/shop/all" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />All Products</Link></li>
            <li><Link to="/shop/all?type=Hoodie" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Hoodies</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-black uppercase mb-8 text-black border-b-[4px] border-black inline-block">Channels</h4>
          <ul className="space-y-4 text-black font-black uppercase tracking-widest text-sm">
            <li><Link to="/contact" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Contact Us</Link></li>
            <li><Link to="#" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Shipping</Link></li>
            <li><Link to="#" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />Returns</Link></li>
            <li><Link to="#" className="hover:text-[#00ff88] transition-colors flex items-center gap-2 group"><div className="w-0 group-hover:w-4 h-0.5 bg-[#00ff88] transition-all" />FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-black uppercase mb-8 text-black border-b-[4px] border-black inline-block">Signals</h4>
          <div className="flex gap-4">
            <Magnetic>
              <a href="#" className="w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                <Instagram size={32} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#" className="w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                <Twitter size={32} />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="border-t-[4px] border-black pt-12 flex flex-col md:flex-row justify-between items-center text-black font-black uppercase text-xs tracking-widest">
        <p>&copy; 2024 {BRAND_NAME}. All rights reserved.</p>
        <div className="flex gap-12 mt-6 md:mt-0">
          <a href="#" className="hover:text-[#00ff88] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#00ff88] transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

// Simple Custom Cursor - Always Visible, Perfectly Synced, ALWAYS ON TOP
// Simple Custom Cursor - Always Visible, Perfectly Synced, ALWAYS ON TOP
const OptimizedCursor = ({ variant }: { variant: CursorVariant }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isHover = variant !== 'default';

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    // Use capture to ensure we get the event first/consistently
    window.addEventListener("mousemove", onMouseMove, { passive: true, capture: true });
    return () => window.removeEventListener("mousemove", onMouseMove, { capture: true });
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none"
      style={{
        left: 0,
        top: 0,
        zIndex: 2147483647, // Maximum z-index value
        // Initial position off-screen
        transform: `translate3d(-100px, -100px, 0)`,
        willChange: 'transform',
        position: 'fixed',
      }}
    >
      {/* Enhanced Glowing Cursor with Smooth Hover Animation */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: isHover ? 'scale(1.5)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: isHover
            ? 'drop-shadow(0 0 8px #00ff88) drop-shadow(0 0 16px #00ff88) drop-shadow(0 0 24px rgba(0, 255, 136, 0.8)) drop-shadow(0 0 32px rgba(0, 255, 136, 0.6))'
            : 'drop-shadow(0 0 6px #00ff88) drop-shadow(0 0 12px rgba(0, 255, 136, 0.7)) drop-shadow(0 0 18px rgba(0, 255, 136, 0.4))',
          transformOrigin: '4px 4px', // Anchor point at cursor tip
          display: 'block',
        }}
      >
        <path
          d="M6.0001 2L18.0001 14L12.0001 15L15.5001 22L13.5001 23L9.5001 15.5L6.0001 18V2Z"
          fill="#00ff88"
          stroke="#000"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

const AnimatedRoutes = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home setCursorVariant={setCursorVariant} /></PageTransition>} />
        <Route path="/shop/:category" element={<PageTransition><Shop setCursorVariant={setCursorVariant} /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetail setCursorVariant={setCursorVariant} /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/account" element={<PageTransition><Account setCursorVariant={setCursorVariant} /></PageTransition>} />
        <Route path="/rewards" element={<PageTransition><RewardsPage /></PageTransition>} />
        <Route path="/order/:orderId" element={<PageTransition><OrderDetail /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { cursorVariant, setCursorVariant } = useCursor();
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  // Initialize Firebase sync on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile on login
        const { firebaseSyncService } = await import('./services/firebaseSyncService');
        await firebaseSyncService.syncUserProfile(user.uid, {
          email: user.email || '',
          displayName: user.displayName || 'User',
        });
        console.log('Firebase sync initialized for user:', user.uid);
      }
    });

    return () => unsubscribe();
  }, []);


  // Hide default cursor globally - IMMEDIATE injection
  useEffect(() => {
    // Check if mobile
    const isMobile = window.innerWidth < 768;

    // Inject CSS immediately and aggressively
    const style = document.createElement('style');
    style.id = 'hide-cursor-global';
    style.textContent = `
      *, *::before, *::after,
      html, body, div, span, a, button, input, textarea, select,
      h1, h2, h3, h4, h5, h6, p, img, svg, canvas {
        cursor: ${isMobile ? 'auto' : 'none'} !important;
      }
      *:hover {
        cursor: ${isMobile ? 'auto' : 'none'} !important;
      }
      @media (max-width: 768px) {
        *, *::before, *::after,
        html, body, div, span, a, button, input, textarea, select,
        h1, h2, h3, h4, h5, h6, p, img, svg, canvas {
          cursor: auto !important;
        }
        *:hover {
          cursor: auto !important;
        }
      }
    `;

    // Insert at the very beginning of head for highest priority
    if (document.head.firstChild) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      document.head.appendChild(style);
    }

    // Also set directly on elements
    document.documentElement.style.cursor = isMobile ? 'auto' : 'none';
    document.body.style.cursor = isMobile ? 'auto' : 'none';

    return () => {
      const existingStyle = document.getElementById('hide-cursor-global');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <CartProvider>
      <PageLoader />
      <QuickViewProvider>
        <HashRouter>
          <ClickSpark sparkColor="#00ff88" sparkRadius={25} sparkCount={10} duration={500}>
            <div className="bg-black min-h-screen text-white selection:bg-[#00ff88] selection:text-black font-space"
              style={{
                willChange: 'auto',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}>
              <AnimatedGrid />
              <FloatingElements />
              <div className="noise-overlay" />
              <ScrollProgressBar />
              <Navbar />
              <CartSidebar />
              <QuickViewModal />
              <ScrollToTop />
              <main className="relative z-10">
                <AnimatedRoutes 
                  setCursorVariant={setCursorVariant} 
                  isRewardsModalOpen={isRewardsModalOpen} 
                  setIsRewardsModalOpen={setIsRewardsModalOpen} 
                />
              </main>
              <Footer />

              {/* Floating Rewards Button & Modal */}
              <FloatingRewardsButton onClick={() => setIsRewardsModalOpen(true)} />
              <RewardsModal isOpen={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} />

              {/* Loyalty Rules Notification Banner */}
              <LoyaltyRulesNotificationBanner />

              {/* Exit Intent Popup */}
              <ExitIntentPopup />
            </div>
          </ClickSpark>

          {/* Optimized Custom Cursor - Rendered OUTSIDE main container for maximum z-index */}
          <OptimizedCursor variant={cursorVariant} />
        </HashRouter>
      </QuickViewProvider>
    </CartProvider>
  );
}

export default App;
