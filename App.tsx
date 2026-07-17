
import React, { useState, useEffect, useRef, createContext, useContext, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSEO } from './hooks/useSEO';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from 'framer-motion';
import { Terminal, Package, Shield, Truck, Zap, Star, X, ShoppingBag, ShoppingCart, Menu, Camera, Sparkles, Filter, ChevronDown, ChevronUp, Share2, Heart, Maximize2, Gift, User, Mail, MapPin, Instagram, Twitter, ArrowRight, ArrowLeft, Award, ShieldCheck, Timer, Play, SlidersHorizontal, Search, Check, Minus, Plus, RefreshCw, CreditCard, Banknote, LogOut, Eye, Trash2, ChevronRight, Lock, Home as HomeIcon, Compass, Volume2, VolumeX } from 'lucide-react';
import ScrollReveal from './components/ScrollReveal';
import ClickSpark from './components/ClickSpark';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { PRODUCTS, BRAND_NAME, AVAILABLE_COLORS, AVAILABLE_SIZES } from './constants';
import { localCollectionService } from './services/localCollectionService';
import { Product, ProductType, CartItem, CursorVariant } from './types';
import { auth } from './firebaseConfig';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { BuilderComponent, useBuilderContent } from './BuilderComponent';
import { RewardsPage } from './components/RewardsPage';
import { HomeLuckySpinWheel } from './components/rewards/HomeLuckySpinWheel';
import { HowItWorksSection } from './components/rewards/HowItWorksSection';
import { TiersBenefitsSection } from './components/rewards/TiersBenefitsSection';
import { RedeemRewardsSection } from './components/rewards/RedeemRewardsSection';
import { ClaimPointsSection } from './components/rewards/ClaimPointsSection';
import { PointsHistorySection } from './components/rewards/PointsHistorySection';
import { LuckySpinWheel } from './components/rewards/LuckySpinWheel';
import { ScratchCard } from './components/rewards/ScratchCard';
import { loyaltyRulesService } from './services/loyaltyRulesService';
import { ErrorBoundary } from './components/ErrorBoundary';
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
import { CheckoutExitPopup } from './components/CheckoutExitPopup';
import { InstagramFeed } from './components/InstagramFeed';
import { useLoyalty } from './hooks/useLoyalty';
import { LoyaltyRulesNotificationBanner } from './components/LoyaltyRulesNotificationBanner';
import { VelocityHeader } from './components/VelocityHeader';
import { InfiniteMarquee } from './components/InfiniteMarquee';
import { ScrollVelocityGrid } from './components/ScrollVelocityGrid';
import { ShowcaseSection } from './components/ShowcaseSection';
import { HoverRevealGallery } from './components/HoverRevealGallery';
import { Magnetic } from './components/Magnetic';
import { ParallaxReveal } from './components/ParallaxReveal';
import { VibeAnimationEngine } from './components/VibeAnimationEngine';
import { ImageReveal } from './components/ImageReveal';
import { GlitchText } from './components/GlitchText';
import { GlitchImage } from './components/GlitchImage';
import { ScrollVelocityContainer } from './components/ScrollVelocityContainer';
import { NewsletterSyndicate } from './components/NewsletterSyndicate';
import { PageLoader } from './components/PageLoader';
import { DynamicAccordion } from './components/DynamicAccordion';
import { PageTransition } from './components/PageTransition';
import { FloatingElements } from './components/FloatingElements';
import { LiveActivityTicker } from './components/LiveActivityTicker';
import { audioService } from './services/audioService';
import { userDataLoaderService } from './services/userDataLoaderService';
import { userPointsService } from './services/userPointsService';
import { checkoutDiscountService } from './services/checkoutDiscountService';
import { ensureUserExists, getUserProfile, addToWishlist, removeFromWishlist } from './services/userService';
import { saveOrder } from './services/orderService';
import { firebaseSyncService } from './services/firebaseSyncService';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

const AutoScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
import { CoreProtocol } from './components/CoreProtocol';
import { SectionHeader } from './components/SectionHeader';

// Global utility for resolving hex color codes dynamically
const getColorCode = (name: string): string => {
  try {
    const storedColors = localStorage.getItem('elevez_colors');
    if (storedColors) {
      const parsed = JSON.parse(storedColors);
      if (Array.isArray(parsed)) {
        const found = parsed.find(
          c => c && c.name && c.name.toLowerCase() === name.toLowerCase()
        );
        if (found && found.code) return found.code;
      }
    }
  } catch (e) {
    console.warn('Error reading colors from localStorage:', e);
  }

  const found = (AVAILABLE_COLORS as any[])?.find(
    c => c && c.name && c.name.toLowerCase() === name.toLowerCase()
  );
  if (found && found.code) return found.code;

  const colors: { [key: string]: string } = {
    'Black': '#000000', 'White': '#FFFFFF', 'Void Gray': '#333333',
    'Neon Green': '#39FF14', 'Cyber Pink': '#FF007F', 'Code Green': '#00FF00',
    'Matte Black': '#1A1A1A', 'Dust White': '#EBEBEB', 'Grey': '#808080',
    'Acid Black': '#2B2B2B', 'Rust': '#B7410E', 'Obsidian': '#0B0B0B',
    'Navy': '#000080', 'Vapor Blue': '#00FFFF', 'Pink': '#FFC0CB',
    'Heather Grey': '#9DA3A6', 'Concrete': '#808080', 'Midnight Blue': '#191970',
    'Chrome Grey': '#A0A0A0', 'Shadow Black': '#121212', 'Cement': '#D3D3D3',
    'Asphalt': '#505050', 'Pulse Red': '#FF0000', 'Static White': '#F8F8FF',
    'Glitch Purple': '#8A2BE2', 'Metal Grey': '#696969', 'Space Black': '#0A0A0A',
    'Coffee Brown': '#3E2723'
  };

  const matchedKey = Object.keys(colors).find(key => key.toLowerCase() === name.toLowerCase());
  return matchedKey ? colors[matchedKey] : name;
};

// Global utility for resolving available sizes dynamically
const getAvailableSizes = (): string[] => {
  const sizeSet = new Set<string>();
  
  if (AVAILABLE_SIZES && Array.isArray(AVAILABLE_SIZES)) {
    AVAILABLE_SIZES.forEach(s => sizeSet.add(s));
  }

  try {
    const storedSizes = localStorage.getItem('elevez_sizes');
    if (storedSizes) {
      const parsed = JSON.parse(storedSizes);
      if (Array.isArray(parsed)) {
        parsed.forEach(s => {
          if (typeof s === 'string') sizeSet.add(s);
        });
      }
    }
  } catch (e) {
    console.warn('Error reading sizes from localStorage:', e);
  }

  const allSizes = Array.from(sizeSet);
  if (allSizes.length > 0) return allSizes;
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
};

// --- Cart Context ---
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number, openSidebar?: boolean) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  secondsLeft: number;
  expired: boolean;
  isTimerVisible: boolean;
  isExitDiscountApplied: boolean;
  setIsExitDiscountApplied: (applied: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'elevez_cart';

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExitDiscountApplied, setIsExitDiscountApplied] = useState(() => {
    return localStorage.getItem('elevez_exit_discount_claimed') === 'true';
  });
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

  // Cart Expiry Timer states
  const DURATION = 600; // 10 minutes in seconds
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [expired, setExpired] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const hasItems = items.reduce((sum, i) => sum + i.quantity, 0) > 0;

  // Use a ref to track if the timer has been started (avoids dep array issues with state)
  const timerStartedRef = useRef(false);

  useEffect(() => {
    if (!hasItems) {
      // Reset everything when cart is emptied
      timerStartedRef.current = false;
      setIsTimerVisible(false);
      setExpired(false);
      setSecondsLeft(DURATION);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only start a fresh timer once — when items first appear
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      setIsTimerVisible(true);
      setExpired(false);
      setSecondsLeft(DURATION);
      startTimeRef.current = Date.now();

      // Clear any stale interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
        const remaining = Math.max(0, DURATION - elapsed);
        setSecondsLeft(remaining);
        if (remaining === 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setExpired(true);
        }
      }, 1000);
    }

    // No cleanup here — we intentionally keep the interval alive across re-renders
    // It will be cleared when hasItems becomes false (cart emptied)
  }, [hasItems]); // Only re-run when cart goes empty/non-empty

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1, openSidebar: boolean = true) => {
    audioService.playCoin(); // Play synthesized coin sound
    const cartId = `${product.id}-${size}-${color}`;
    setItems(prev => {
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, size, color, cartId }];
    });
    if (openSidebar) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartId: string) => {
    audioService.playSwipe(); // Play synthesized swipe sound
    setItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, cartTotal, secondsLeft, expired, isTimerVisible, isExitDiscountApplied, setIsExitDiscountApplied }}>
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
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'money' | 'shop' | 'hidden'>('default');
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

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);
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
  const { addToCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    const color = product.colors && product.colors.length > 0 ? product.colors[0] : 'Black';
    addToCart(product, size, color, 1, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) return;
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

  const vibeTag = product.tags?.find((t: string) => 
    ['CUTE', 'FUNKY', 'BEAUTIFUL', 'ANIME', 'COLORFUL', 'OLD MONEY'].includes(t.toUpperCase().replace('_', ' '))
  );

  const vibeBadgeStyles: Record<string, string> = {
    'CUTE': 'bg-[#ff69b4] text-white',
    'FUNKY': 'bg-[#00ff88] text-black',
    'BEAUTIFUL': 'bg-[#ffd700] text-black',
    'ANIME': 'bg-black text-[#ffff00]',
    'COLORFUL': 'bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 text-white',
    'OLD MONEY': 'bg-[#1b263b] text-[#e0e1dd]'
  };

  return (
    <motion.div 
      className="group h-full relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      style={{ perspective: 1000 }}
    >
      <div className="relative block overflow-hidden bg-white border-2 sm:border-[4px] border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] group-hover:shadow-[8px_8px_0px_0px_#00ff88] sm:group-hover:shadow-[16px_16px_0px_0px_#00ff88] transition-all duration-300 aspect-[4/5] group-hover:scale-105">
        {/* Clickable Image Link Layer */}
        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 w-full h-full z-10"
          onMouseEnter={() => {
            audioService.playTick(); // satisfying micro-feedback
            onHoverStart();
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transition-all duration-500"
            style={{
              filter: rotateX !== 0 || rotateY !== 0 ? 'url(#liquid-filter)' : 'none',
            }}
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-20 flex flex-col gap-1 pointer-events-none select-none">
          <div className="bg-red-500 text-white text-[6px] sm:text-[8px] font-black px-[2px] sm:px-1 py-[1px] sm:py-[2px] uppercase tracking-wider border-[1px] sm:border-[2px] border-black shadow-[1px_1px_0px_0px_#000]">
            <GlitchText text="50% OFF" triggerOnHover={false} />
          </div>
          {vibeTag && (
            <div className={`${vibeBadgeStyles[vibeTag.toUpperCase().replace('_', ' ')] || 'bg-black text-white'} text-[5px] sm:text-[7px] font-black px-1.5 py-0.5 uppercase tracking-wider border-[1px] sm:border-[1.5px] border-black shadow-[1px_1px_0px_0px_#000]`}>
              {vibeTag.toUpperCase().replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-1 sm:top-2 right-1 sm:right-2 z-30 w-5 h-5 sm:w-8 sm:h-8 bg-white border-[1px] sm:border-[2px] border-black flex items-center justify-center hover:bg-[#00ff88] transition-all shadow-[1px_1px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000]"
        >
          <Heart
            className={`w-3 h-3 sm:w-5 sm:h-5 transition-all ${isInWishlist
              ? 'text-red-500 fill-red-500'
              : 'text-black'
              }`}
          />
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const shareUrl = `${window.location.origin}/#/product/${product.id}`;
            const shareText = `Check out ${product.name} on Elevez!`;
            if (navigator.share) {
              navigator.share({
                title: product.name,
                text: shareText,
                url: shareUrl,
              }).catch(err => console.error(err));
            } else {
              navigator.clipboard.writeText(shareUrl)
                .then(() => alert('Link copied to clipboard!'))
                .catch(err => console.error(err));
            }
          }}
          className="absolute top-7 sm:top-12 right-1 sm:right-2 z-30 w-5 h-5 sm:w-8 sm:h-8 bg-white border-[1px] sm:border-[2px] border-black flex items-center justify-center hover:bg-[#00ff88] transition-all shadow-[1px_1px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000]"
          title="Share Product"
        >
          <Share2 className="w-3 h-3 sm:w-5 sm:h-5 text-black" />
        </button>

        {/* Slanted sticker tag clipped inside bottom-left corner */}
        <div className="absolute -bottom-1 sm:-bottom-1 -left-4 sm:-left-8 w-14 sm:w-24 bg-[#00ff88] text-black text-[5px] sm:text-[7px] font-black text-center py-[1px] sm:py-[2px] border-[1px] sm:border-[2px] border-black rotate-[25deg] z-20 select-none pointer-events-none shadow-[1px_1px_0px_0px_#000] tracking-widest uppercase">
          {product.price > 500 ? "PREMIUM" : "LIMITED"}
        </div>

        {/* Quick View Overlay Button */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 z-30 hidden md:block">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="bg-[#00ff88] text-black font-black py-1 sm:py-1.5 px-2 sm:px-4 border-[1px] sm:border-[2px] border-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[1px_1px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000] whitespace-nowrap text-[8px] sm:text-xs cursor-pointer"
          >
            Quick View
          </button>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-white border-2 sm:border-[2px] border-black shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000]">
        <h3 className="text-xs sm:text-sm font-black text-black uppercase font-syne line-clamp-1 leading-tight">{product.name}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-0.5 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-price text-[#00ff88] font-black text-sm sm:text-base stroke-black" style={{ WebkitTextStroke: '0.3px black' }}>₹{product.price.toFixed(0)}</span>
            <span className="font-price text-red-400 line-through text-[10px] sm:text-xs">₹{product.originalPrice.toFixed(0)}</span>
          </div>
        </div>
        
        {/* ADD TO CART Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleQuickAddToCart}
          className={`w-full mt-2 py-1.5 px-3 font-black text-[10px] sm:text-xs border-[2px] border-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            isAdded 
              ? 'bg-black text-[#00ff88] border-[#00ff88]' 
              : 'bg-[#00ff88] text-black hover:bg-black hover:text-[#00ff88]'
          }`}
        >
          <ShoppingBag size={12} className={isAdded ? "animate-bounce" : ""} />
          {isAdded ? "ADDED (+1)!" : "ADD TO CART"}
        </motion.button>
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
    const sizesToUse = activeProduct?.sizes && activeProduct.sizes.length > 0 ? activeProduct.sizes : getAvailableSizes();
    setSelectedSize(sizesToUse[0] || 'M');
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
          className="bg-white w-full max-w-4xl border-[4px] md:border-[8px] border-black shadow-[12px_12px_0px_0px_#000] md:shadow-[24px_24px_0px_0px_#000] flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-50 bg-black text-white p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#00ff88] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <X size={24} />
          </button>

          {/* Image Side */}
          <div className="w-full md:w-1/2 relative h-[300px] md:h-auto min-h-[300px] border-b-[4px] md:border-b-0 md:border-r-[4px] border-black bg-black">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Details Side */}
          <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col h-full min-h-0 overflow-y-auto">
            <div className="mb-10 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#00ff88] text-black text-[10px] font-black px-3 py-1 border-[2px] border-black uppercase tracking-widest">In Stock</span>
                {activeProduct.tags?.includes('BESTSELLER') && <span className="bg-black text-white text-[10px] font-black px-3 py-1 border-[2px] border-black uppercase tracking-widest">Best Seller</span>}
              </div>
              <h2 className="text-4xl font-black font-syne uppercase leading-none mb-4 text-black">{activeProduct.name}</h2>
              <div className="flex items-center gap-4">
                <span className="font-price text-4xl font-black text-[#00ff88]" style={{ WebkitTextStroke: '1.5px black' }}>₹{activeProduct.price}</span>
                <span className="font-price text-red-400 line-through text-xl font-bold">₹{activeProduct.originalPrice}</span>
              </div>
            </div>

            {/* Color Selection — Shopify-style dot swatches */}
            {activeProduct.colors && activeProduct.colors.length > 0 && (
              <div className="mb-8 flex-shrink-0">
                <h3 className="text-xs font-black uppercase mb-4 tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
                  <span className="text-black opacity-40">Color:</span> <span className="transition-all duration-200 text-black">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeProduct.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div
                        style={{
                          background: getColorCode(color),
                          border: color.toLowerCase() === 'white' ? '2px solid #333' : '2px solid transparent'
                        }}
                        className={`w-9 h-9 rounded-full transition-all duration-200 ${
                          selectedColor === color
                            ? 'ring-2 ring-[#00ff88] ring-offset-2 scale-110 shadow-[0_0_0_2px_#000]'
                            : 'group-hover:scale-105 ring-2 ring-transparent ring-offset-1'
                        }`}
                      />
                      <span className={`text-[9px] font-black uppercase tracking-wide ${
                        selectedColor === color ? 'text-black' : 'text-black opacity-50'
                      }`}>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-10 flex-shrink-0">
              <h3 className="text-xs font-black uppercase text-black opacity-40 mb-4 tracking-widest">Select Size: <span className="text-black opacity-100">{selectedSize}</span></h3>
              <div className="flex gap-4">
                {(activeProduct.sizes && activeProduct.sizes.length > 0 ? activeProduct.sizes : getAvailableSizes()).map(size => (
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
                className="w-full bg-[#00ff88] text-black font-black py-4 lg:py-3 border-[3px] lg:border-[2.5px] border-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] lg:shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm lg:text-xs"
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

// Free Shipping Tracker - Compact redesign
const FreeShippingTracker: React.FC<{ cartTotal: number }> = ({ cartTotal }) => {
  const threshold = 650;
  const progress = Math.min(100, (cartTotal / threshold) * 100);
  const isUnlocked = cartTotal >= threshold;
  const remaining = Math.max(0, threshold - cartTotal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        padding: '8px 12px',
        background: isUnlocked ? '#00ff88' : '#f4f4f4',
        border: '2px solid #000',
        boxShadow: '3px 3px 0px 0px #000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer on unlock */}
      {isUnlocked && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', repeatDelay: 1.2 }}
          style={{
            position: 'absolute', top: 0, left: 0, width: '35%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top row: label + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <motion.span
            animate={isUnlocked ? { rotate: [0, -12, 12, 0] } : { y: [0, -1.5, 0] }}
            transition={isUnlocked
              ? { duration: 0.5, repeat: Infinity, repeatDelay: 2.5 }
              : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '13px', lineHeight: 1, display: 'inline-block' }}
          >
            {isUnlocked ? '🎉' : '🚚'}
          </motion.span>
          <span style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#000',
          }}>
            {isUnlocked ? 'Free Shipping — Unlocked!' : 'Free Shipping'}
          </span>
        </div>
        <motion.span
          key={remaining}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, type: 'spring' }}
          style={{
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
            fontSize: '9px',
            color: isUnlocked ? '#000' : '#fff',
            background: isUnlocked ? 'rgba(0,0,0,0.14)' : '#000',
            padding: '1px 6px',
            letterSpacing: '0.04em',
          }}
        >
          {isUnlocked ? '✓ FREE' : `₹${remaining.toFixed(0)} to go`}
        </motion.span>
      </div>

      {/* Thin progress bar */}
      <div style={{
        height: '6px',
        background: isUnlocked ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)',
        border: '1.5px solid rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'visible',
      }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            background: isUnlocked
              ? 'rgba(0,0,0,0.3)'
              : 'linear-gradient(90deg, #00cc55, #00ff88)',
            boxShadow: isUnlocked ? 'none' : '0 0 6px rgba(0,255,136,0.6)',
          }}
        />
        {/* Pulse dot at tip */}
        {!isUnlocked && progress > 3 && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              border: '1.5px solid #000',
              zIndex: 2,
            }}
          />
        )}
      </div>

      {/* Micro sub-label */}
      <div style={{ marginTop: '4px' }}>
        {!isUnlocked ? (
          <span style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            fontSize: '8.5px',
            fontWeight: 500,
            color: 'rgba(0,0,0,0.4)',
            letterSpacing: '0.02em',
          }}>
            Add <strong style={{ color: '#000', fontWeight: 800 }}>₹{remaining.toFixed(0)}</strong> more for free delivery
          </span>
        ) : (
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
              fontSize: '8.5px', fontWeight: 600,
              color: 'rgba(0,0,0,0.55)', letterSpacing: '0.02em',
            }}
          >
            🎁 Your order qualifies for free delivery
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

// Animated Checkout Button
const CheckoutButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      onClick={() => { setIsPressed(true); setTimeout(() => { setIsPressed(false); onClick(); }, 200); }}
      animate={isPressed ? { scale: 0.95, y: 3, boxShadow: '2px 2px 0px 0px #000' } : {
        scale: [1, 1.01, 1, 1.01, 1],
        boxShadow: [
          '6px 6px 0px 0px #000, 0 0 0px 0px rgba(0,255,136,0)',
          '6px 6px 0px 0px #000, 0 0 20px 4px rgba(0,255,136,0.5)',
          '6px 6px 0px 0px #000, 0 0 0px 0px rgba(0,255,136,0)',
          '6px 6px 0px 0px #000, 0 0 0px 0px rgba(0,255,136,0)',
          '6px 6px 0px 0px #000, 0 0 0px 0px rgba(0,255,136,0)',
        ],
      }}
      transition={isPressed ? { duration: 0.1 } : {
        duration: 3,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'easeInOut',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '8px 8px 0px 0px #000, 0 0 24px 6px rgba(0,255,136,0.7)',
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.96, y: 4, boxShadow: '2px 2px 0px 0px #000' }}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #00ff88 0%, #00e676 50%, #69ff47 100%)',
        color: '#000',
        fontWeight: 900,
        paddingTop: '14px',
        paddingBottom: '14px',
        border: '3px solid #000',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        fontSize: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '35%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        >
          →
        </motion.span>
        Checkout Now
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1, delay: 0.1 }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
};

// Cart Sidebar
const CartSidebar = () => {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, cartTotal, secondsLeft, expired, isTimerVisible } = useCart();
  const navigate = useNavigate();

  // Prevent mobile scroll deformation when sidebar is open
  useEffect(() => {
    if (isCartOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalOverscroll = window.getComputedStyle(document.body).overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.overscrollBehavior = originalOverscroll;
      };
    }
  }, [isCartOpen]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  const urgency = secondsLeft < 60; // last minute

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-[2px]"
            style={{ touchAction: 'none' }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100dvh',
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderLeft: '4px solid #000',
              zIndex: 70,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* HEADER - fixed, never scrolls */}
            <div style={{ padding: '12px 18px', borderBottom: '3px solid #000', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Your Cart</span>
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: '#000', color: '#00ff88', padding: '1px 8px', fontWeight: 900, fontSize: '11px', border: '2px solid #000' }}
                  >
                    {items.length}
                  </motion.span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ width: '38px', height: '38px', background: '#fff', border: '2.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '3px 3px 0px 0px #000', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px,2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0px 0px #000'; }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Expiry Timer just below Your Cart text */}
              {isTimerVisible && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                  }}
                >
                  <Timer size={12} style={{ color: expired ? '#00cc66' : urgency ? '#ff0000' : '#ff7e40' }} />
                  <span>
                    {expired ? (
                      <span style={{ color: '#00cc66' }}>Cart saved securely</span>
                    ) : (
                      <>
                        Expires in:{' '}
                        <motion.span
                          animate={urgency ? { scale: [1, 1.05, 1], color: ['#ff0000', '#ff8888', '#ff0000'] } : {}}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{
                            color: urgency ? '#ff0000' : '#ff7e40',
                            padding: '1px 4px',
                            background: '#fafafa',
                            border: '1px solid #000',
                          }}
                        >
                          {timeStr}
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.div>
              )}
            </div>

            {/* ITEMS AREA - scrollable, takes remaining space */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: items.length === 0 ? '0' : '12px 16px', 
              minHeight: 0,
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}>
              {items.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '80px', height: '80px', background: '#f5f5f5', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '5px 5px 0px 0px #000' }}
                  >
                    <ShoppingBag size={36} style={{ opacity: 0.2 }} />
                  </motion.div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '12px' }}>The Vault is Empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      style={{ background: '#000', color: '#00ff88', padding: '10px 24px', border: '2px solid #000', fontWeight: 900, textTransform: 'uppercase', fontSize: '12px', cursor: 'pointer', boxShadow: '4px 4px 0px 0px #000', transition: 'all 0.15s' }}
                    >
                      Begin Selection
                    </button>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.88, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.82, x: -40 }}
                      whileHover={{ scale: 1.015, boxShadow: '5px 5px 0px 0px #000' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 220, delay: index * 0.04 }}
                      key={item.cartId}
                      style={{ display: 'flex', gap: '12px', background: '#fff', padding: '10px', border: '2.5px solid #000', boxShadow: '3px 3px 0px 0px #000', marginBottom: '10px', cursor: 'pointer' }}
                    >
                      {/* Image */}
                      <div style={{ width: '64px', height: '80px', border: '2px solid #000', overflow: 'hidden', flexShrink: 0, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                        <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} loading="lazy" />
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <h3 style={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '5px' }}>{item.name}</h3>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={{ background: '#000', color: '#fff', padding: '1px 5px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}>{item.size}</span>
                            {item.color && <span style={{ background: '#00ff88', color: '#000', padding: '1px 5px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', border: '1px solid #000' }}>{item.color}</span>}
                            <span style={{ background: '#fff', color: '#000', padding: '1px 5px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', border: '1px solid #000' }}>×{item.quantity}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 900, fontSize: '15px', color: '#000' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.cartId)}
                            style={{ width: '32px', height: '32px', background: '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #000', transition: 'background 0.15s, color 0.15s' }}
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* FOOTER - fixed at bottom, always visible - redesigned to be smaller */}
            {items.length > 0 && (
              <div style={{ flexShrink: 0, borderTop: '3px solid #000', background: '#fff', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Subtotal row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', opacity: 0.45, letterSpacing: '0.15em' }}>Subtotal</span>
                  <motion.span
                    key={cartTotal}
                    initial={{ scale: 1.2, color: '#00aa44' }}
                    animate={{ scale: 1, color: '#000' }}
                    transition={{ duration: 0.3 }}
                    style={{ fontWeight: 900, fontSize: '20px', color: '#000', letterSpacing: '-0.03em' }}
                  >
                    ₹{cartTotal.toFixed(0)}
                  </motion.span>
                </div>
                <p style={{ fontWeight: 900, fontSize: '7.5px', textTransform: 'uppercase', color: '#000', opacity: 0.3, fontStyle: 'italic', margin: 0, lineHeight: 1.15 }}>Logistics and taxes calculated during mission briefing.</p>

                {/* Points preview — disabled */}

                {/* Free Shipping Tracker — right above checkout */}
                <FreeShippingTracker cartTotal={cartTotal} />

                {/* Checkout button */}
                <CheckoutButton onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} />
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
  const { setCursorVariant } = useCursor();
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
      <section className="min-h-screen relative flex items-center justify-center py-24 px-6 bg-white">
        <div className="max-w-7xl w-full relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="text-center mb-16 relative"
          >
            {/* Spinning Star Badge */}
            <div className="absolute -top-16 right-12 md:right-[15%] hidden md:block z-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 bg-[#00ff88] border-[3px] border-black flex items-center justify-center cursor-pointer shadow-[6px_6px_0_0_#000]"
                style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                whileHover={{ scale: 1.15 }}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <motion.span 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="text-[10px] font-black text-black select-none uppercase mt-1 leading-none text-center px-1"
                >
                  HOT<br />DROP
                </motion.span>
              </motion.div>
            </div>

            <SectionHeader 
              title="Best Sellers" 
              subtitle="The pieces everyone's talking about. Limited stock available."
            />
          </motion.div>

          {/* Background Caution Tape Marquees (Crossed behind the grid) */}
          <div className="absolute inset-x-0 top-[35%] h-[250px] pointer-events-none z-0 overflow-hidden hidden lg:block opacity-[0.06]">
            <div className="absolute top-10 inset-x-0 rotate-[-3deg] border-y-[4px] border-black bg-[#00ff88] ">
              <InfiniteMarquee text="HIGH DEMAND // SOLD OUT SOON // BEST SELLERS // SHOP NOW //" className="py-2 text-black text-sm font-black" />
            </div>
            <div className="absolute top-28 inset-x-0 rotate-[3deg] border-y-[4px] border-black bg-white">
              <InfiniteMarquee text="ELEVEZ TOP ARCHIVE // ORIGINAL DESIGN // NO REPRINTS //" className="py-2 text-black text-sm font-black" />
            </div>
          </div>

          {/* Products Grid - Displayed immediately after header text */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mb-16 relative z-10">
            {bestSellers.map((product, index) => (
              <ScrollVelocityContainer key={product.id} skewMax={4} blurMax={1.5}>
                <ProductCard
                  product={product}
                  onHoverStart={() => {}}
                  onHoverEnd={() => {}}
                />
              </ScrollVelocityContainer>
            ))}
          </div>


          {/* View All Button */}
          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/shop/all')}
              className="px-8 py-3.5 sm:px-12 sm:py-5 bg-black text-[#00ff88] border-2 sm:border-[4px] border-black font-black text-xs sm:text-lg uppercase tracking-widest shadow-[4px_4px_0px_0px_#00ff88] sm:shadow-[8px_8px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[4px] sm:hover:translate-x-[6px] hover:translate-y-[4px] sm:hover:translate-y-[6px] transition-all"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-8 mb-16">
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

// --- Scroll to Top Button (Removed) ---

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

const DualPriceSlider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  setCursorVariant 
}: { 
  min: number; 
  max: number; 
  value: [number, number]; 
  onChange: (val: [number, number]) => void;
  setCursorVariant: (v: any) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percentage * (max - min));
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (activeThumb === null) return;
      const newVal = calculateValue(e.clientX);
      
      // Step size of 50 for quick responsiveness
      const roundedVal = Math.round(newVal / 50) * 50;
      const clampedVal = Math.max(min, Math.min(max, roundedVal));

      if (activeThumb === 'min') {
        const nextMin = Math.min(clampedVal, value[1] - 50);
        onChange([nextMin, value[1]]);
      } else {
        const nextMax = Math.max(clampedVal, value[0] + 50);
        onChange([value[0], nextMax]);
      }
    };

    const handlePointerUp = () => {
      setActiveThumb(null);
      setCursorVariant('default');
    };

    if (activeThumb !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeThumb, value, min, max, onChange]);

  useEffect(() => {
    if (activeThumb !== null) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [activeThumb]);

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 bg-white border-2 sm:border-[4px] border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] mb-8 sm:mb-16 relative z-10 hover:shadow-[6px_6px_0px_0px_#000] sm:hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
          <span className="text-sm sm:text-xl font-black uppercase tracking-widest text-black">
            SELECT PRICE RANGE
          </span>
        </div>
        <div className="flex items-center gap-2 font-price text-xs sm:text-lg font-black text-black">
          <span className="bg-[#00ff88] text-black px-2 py-1 sm:px-4 sm:py-1.5 border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider">
            ₹{value[0]}
          </span>
          <span className="font-black text-lg sm:text-2xl px-1 text-black">-</span>
          <span className="bg-[#00ff88] text-black px-2 py-1 sm:px-4 sm:py-1.5 border-2 sm:border-[3px] border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider">
            ₹{value[1]}
          </span>
        </div>
      </div>

      <div className="relative py-3 sm:py-4 select-none">
        <div 
          ref={trackRef} 
          className="relative h-3 sm:h-5 bg-gray-100 border-2 sm:border-[4px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] cursor-pointer touch-none"
          onPointerDown={(e) => {
            const newVal = calculateValue(e.clientX);
            const roundedVal = Math.round(newVal / 50) * 50;
            const clampedVal = Math.max(min, Math.min(max, roundedVal));
            
            if (Math.abs(clampedVal - value[0]) < Math.abs(clampedVal - value[1])) {
              onChange([Math.min(clampedVal, value[1] - 50), value[1]]);
              setActiveThumb('min');
            } else {
              onChange([value[0], Math.max(clampedVal, value[0] + 50)]);
              setActiveThumb('max');
            }
          }}
        >
          <div 
            className="absolute h-full bg-[#00ff88] border-r-2 sm:border-r-[4px] border-l-2 sm:border-l-[4px] border-black transition-all duration-75" 
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          
          <div 
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 sm:-ml-4 w-5 h-7 sm:w-8 sm:h-10 bg-white border-2 sm:border-[4px] border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] cursor-grab active:cursor-grabbing hover:bg-[#00ff88] hover:scale-105 active:scale-95 transition-all duration-75 select-none"
            style={{ left: `${minPercent}%` }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveThumb('min');
              setCursorVariant('hover');
            }}
          >
            <div className="flex justify-center items-center gap-[1px] sm:gap-[2px] h-full">
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
            </div>
          </div>

          <div 
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 sm:-ml-4 w-5 h-7 sm:w-8 sm:h-10 bg-white border-2 sm:border-[4px] border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] cursor-grab active:cursor-grabbing hover:bg-[#00ff88] hover:scale-105 active:scale-95 transition-all duration-75 select-none"
            style={{ left: `${maxPercent}%` }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveThumb('max');
              setCursorVariant('hover');
            }}
          >
            <div className="flex justify-center items-center gap-[1px] sm:gap-[2px] h-full">
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
              <div className="w-[1.5px] sm:w-[3px] h-3 sm:h-4 bg-black" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-wider">
        <span>MIN: ₹{min}</span>
        <span className="text-[8px] sm:text-[10px] tracking-widest text-[#00ff88] animate-pulse">● ADJUST RANGE DRAG POINTS</span>
        <span>MAX: ₹{max}</span>
      </div>
    </div>
  );
};

const PromoVideoSection = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Play failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-white relative z-30 border-t-4 sm:border-t-[6px] border-black">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6 text-black font-black uppercase text-[10px] sm:text-xs tracking-widest border-b-[3px] border-black pb-3 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
            <span>LIVE BROADCAST // SS26</span>
          </div>
          <span className="text-gray-400">PROMO FILM: FINALE</span>
        </div>

        <div 
          className="relative border-[4px] sm:border-[8px] border-black bg-black shadow-[8px_8px_0px_0px_#000] sm:shadow-[16px_16px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] sm:hover:shadow-[24px_24px_0px_0px_#00ff88] transition-all duration-500 overflow-hidden group cursor-pointer"
          onClick={togglePlay}
          onMouseEnter={() => setCursorVariant('hover')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#00ff88] z-20 pointer-events-none opacity-80" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#00ff88] z-20 pointer-events-none opacity-80" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#00ff88] z-20 pointer-events-none opacity-80" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#00ff88] z-20 pointer-events-none opacity-80" />

          <video
            ref={videoRef}
            src="/promo-vid.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {isPlaying ? (
                <div className="flex gap-1.5 justify-center items-center">
                  <div className="w-2.5 h-6 bg-black rounded-sm" />
                  <div className="w-2.5 h-6 bg-black rounded-sm" />
                </div>
              ) : (
                <Play size={24} fill="currentColor" className="ml-1 text-black" />
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
            <button
              onClick={toggleMute}
              className="pointer-events-auto bg-black text-[#00ff88] border-[2px] border-black px-3 py-1.5 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:bg-[#00ff88] hover:text-black transition-all flex items-center gap-1.5"
            >
              {isMuted ? (
                <>
                  <VolumeX size={12} />
                  <span>UNMUTE AUDIO</span>
                </>
              ) : (
                <>
                  <Volume2 size={12} />
                  <span className="text-white">MUTE AUDIO</span>
                </>
              )}
            </button>
            
            <div className="hidden sm:block bg-black text-white px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest border border-white/20">
              VERIFIED // SS26_CAMPAIGN_01
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  useSEO({
    title: 'Elevez | Elevate Your Style',
    description: 'Redefining streetwear for the digital age. Quality meets virtual aesthetics. Designed in the Metaverse, worn in reality.',
  });
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [collectionFilter, setCollectionFilter] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [vaultDisplayCount, setVaultDisplayCount] = useState<number>(8); // Load more: start with 8

  // Dynamic products state — updates instantly when admin saves changes
  const [allProducts, setAllProducts] = useState<any[]>(() => {
    const fresh = localCollectionService.getActiveProducts();
    return fresh.length > 0 ? fresh : PRODUCTS;
  });

  // Listen for admin panel updates (SSE-driven) and re-render immediately
  useEffect(() => {
    const handleStoreUpdate = () => {
      const fresh = localCollectionService.getActiveProducts();
      setAllProducts(fresh.length > 0 ? fresh : PRODUCTS);
    };
    window.addEventListener('elevez_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('elevez_store_updated', handleStoreUpdate);
  }, []);

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

  // Filter products based on collection filter and price range slider (cumulative)
  const filteredProducts = allProducts.filter(p => {
    // Only show products that are enabled for homepage
    if (p.showInHome === false) return false;

    // Apply dual-thumb price filter (Flipkart / Amazon style)
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

    const lowerType = (p.type || '').toLowerCase();
    
    // 'All' shows every eligible product — NOT just best sellers
    if (collectionFilter === 'All') return true;
    if (collectionFilter === 'HOODIES') return lowerType.includes('hoodie');
    if (collectionFilter === 'T-SHIRTS') return lowerType.includes('t-shirt') || lowerType.includes('tee');
    if (collectionFilter === 'CROP TOPS') return lowerType.includes('crop top');
    if (collectionFilter === 'OVERSIZED TSHIRTS') return lowerType.includes('oversized');
    
    return true;
  });

  // Products visible in the vault grid (paginated, reset when filter changes)
  const vaultProducts = filteredProducts.slice(0, vaultDisplayCount);
  const hasMoreVaultProducts = vaultDisplayCount < filteredProducts.length;

  return (
    <div className="w-full overflow-hidden relative bg-white">
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
          <div className="text-[6rem] md:text-[12rem] font-black leading-none rotate-[-5deg] translate-x-[-5%] translate-y-[5%]">
            ELEVEZ ELEVEZ ELEVEZ
          </div>
        </div>

        {/* Main Hero Box with Scroll Parallax */}
        <ScrollVelocityContainer skewMax={3} blurMax={1.5}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ y: heroTextY }}
            className="relative z-10 text-center w-[95%] max-w-[1400px] mx-auto p-4 sm:p-12 lg:p-20 bg-white border-[3px] sm:border-[8px] border-black shadow-[8px_8px_0px_0px_#000] sm:shadow-[24px_24px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#00ff88] sm:hover:shadow-[32px_32px_0px_0px_#00ff88] transition-all duration-500 flex flex-col justify-center min-h-[60vh] overflow-visible"
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
              loading="eager"
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
              loading="eager"
              className="w-full h-full object-contain filter drop-shadow-[-6px_6px_0px_rgba(0,0,0,1)] hover:drop-shadow-[0_0_20px_#00ff88] transition-all duration-300"
            />
            
            {/* Cute glitched barcode sticker floating next to model */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [4, -4, 4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[20%] -left-16 bg-white border-[3px] border-black p-3 shadow-[6px_6px_0px_0px_#000] rotate-[6deg] z-30 pointer-events-auto select-none hover:scale-110 hover:-rotate-[8deg] transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black tracking-widest text-black mb-1">SS26 LABS</span>
                {/* Simulated Barcode */}
                <div className="flex gap-[2px] h-8 items-end">
                  {[2,3,1,2,1,4,1,2,3,1,2,1,3,1].map((w, idx) => (
                    <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[8px] font-black tracking-widest text-black mt-1">CODE: ELVZ-SS26</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ x: heroMoveX, y: heroMoveY }}
            className="flex-1 flex flex-col justify-center"
          >
            {/* Symmetrical System Active Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-8 text-black font-black uppercase text-[10px] sm:text-xs md:text-sm tracking-widest border-b-2 sm:border-b-[3px] border-black pb-2 sm:pb-3 w-fit mx-auto select-none">
              <span>SYSTEM ACTIVE // PROTOCOL 01</span>
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#00ff88] border-[1.5px] sm:border-[2px] border-black rounded-full animate-pulse" />
              <span>SS26 DROP</span>
            </div>

            <div className="relative flex items-center justify-center w-full my-4 sm:my-6 select-none">
              {/* Left bracket */}
              <div className="hidden xl:flex flex-col items-end text-black font-black text-xs uppercase tracking-widest opacity-60 pr-8 border-r-[3px] border-black leading-tight">
                <span>[ CORE-GRID ]</span>
                <span>REG. PROTOCOL</span>
              </div>

              {/* Centered Symmetrical Header */}
              <h1
                className="text-3xl sm:text-6xl md:text-[5.5vw] font-black leading-none tracking-tighter font-syne cursor-default uppercase text-black relative mx-0 md:mx-12 flex flex-col items-center justify-center text-center"
              >
                {/* Rotating Target Crosshair background */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 m-auto w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] pointer-events-none opacity-[0.05] z-0 flex items-center justify-center"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full text-black stroke-current stroke-[2] fill-none">
                    <circle cx="50" cy="50" r="40" />
                    <circle cx="50" cy="50" r="25" />
                    <circle cx="50" cy="50" r="10" />
                    <line x1="50" y1="5" x2="50" y2="95" />
                    <line x1="5" y1="50" x2="95" y2="50" />
                  </svg>
                </motion.div>

                {/* Brand Star Sticker */}
                <motion.img
                  src="/stickers/neon_star.png"
                  alt="Elevez Badge"
                  className="absolute -top-10 -right-6 md:-top-20 md:-right-20 w-12 h-12 md:w-28 md:h-28 pointer-events-auto select-none z-20"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 15 }}
                  whileHover={{ 
                    scale: 1.25, 
                    rotate: 45,
                    transition: { type: "spring", stiffness: 400, damping: 15 } 
                  }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                />

                <InteractiveText text="Elevate Your" className="block mb-1 sm:mb-2 text-center justify-center" />
                <InteractiveText text="Style Game" className="block text-[#00ff88]" style={{ WebkitTextStroke: '2.5px black' }} />
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
              className="text-black text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-16 leading-relaxed font-bold border-t-2 sm:border-t-[3px] border-black pt-6 sm:pt-12"
            >
              Experience fashion reimagined with cutting-edge design and unparalleled comfort.
              Welcome to the new era of <span className="bg-black text-white px-2 uppercase">{BRAND_NAME}</span>.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Magnetic>
                <button
                  onClick={() => navigate('/shop/all')}
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-[#00ff88] border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[5px_5px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-black font-black text-sm sm:text-base tracking-widest uppercase"
                >
                  Shop Collection
                </button>
              </Magnetic>

              <Magnetic>
                <button
                  onClick={() => navigate('/account?tab=earn-redeem')}
                  className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-white border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[5px_5px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-black font-black text-sm sm:text-base tracking-widest uppercase"
                >
                  Join Rewards
                </button>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>
        </ScrollVelocityContainer>
      </section>

      {/* Promo Video Film */}
      <PromoVideoSection setCursorVariant={setCursorVariant} />

      {/* Symmetrical X-Shaped Crossing Marquees */}
      <div className="relative w-full h-40 sm:h-80 z-40 flex items-center justify-center -my-8 sm:-my-16 pointer-events-none select-none">
        <div className="absolute w-[150%] transform -rotate-[4deg] z-10">
          <InfiniteMarquee text="NEW DROPS // LIMITED EDITION // PREMIUM STREETWEAR // FREE SHIPPING ON ORDERS OVER ₹650 // JOIN THE REWARDS PROGRAM" className="py-2 sm:py-4 shadow-[0_4px_0_0_#000] sm:shadow-[0_8px_0_0_#000]" />
        </div>
        <div className="absolute w-[150%] transform rotate-[4deg] z-20">
          <InfiniteMarquee text="EXCELLENCE IN EVERY DETAIL // CUSTOM STITCHED // SS26 RUNWAY // ELEVEZ LABS" className="py-2 sm:py-4 shadow-[0_4px_0_0_#000] sm:shadow-[0_8px_0_0_#000]" direction="right" />
        </div>
      </div>

      {/* Why Choose Elevez - Neobrutalist */}
      <ScrollAnimatedSection>
        <section className="pt-12 sm:pt-24 pb-6 sm:pb-12 relative z-30 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <SectionHeader 
              title="Why Elevez" 
              subtitle="Excellence in every detail, innovation in every stitch"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
              {[
                { icon: Truck, title: "3-Day Express", desc: "Lightning-fast shipping straight to your doorstep.", tag: "3 Days" },
                { icon: Shield, title: "180gsm Premium", desc: "Superior quality cotton that breathes and lasts.", tag: "180gsm" },
                { icon: Award, title: "Excellent Designs", desc: "Award-winning patterns that stand out.", tag: "Winner" },
                { icon: Star, title: "Personality-Driven", desc: "Each piece tells your unique story.", tag: "Style" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-white border-2 sm:border-[4px] border-black p-3 sm:p-5 md:p-6 relative group hover:shadow-[8px_8px_0px_0px_#00ff88] sm:hover:shadow-[10px_10px_0px_0px_#00ff88] transition-all duration-300 shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                >
                  <div className="absolute -top-3 sm:-top-4 -right-1 sm:-right-2 bg-black text-[#00ff88] text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 uppercase tracking-widest border-[1.5px] sm:border-[2px] border-black shadow-[1.5px_1.5px_0px_0px_#000] sm:shadow-[2px_2px_0px_0px_#000]">
                    {item.tag}
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#00ff88] border-2 sm:border-[3px] border-black flex items-center justify-center mb-3 sm:mb-5 shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
                    <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
                  </div>
                  <h3 className="text-sm sm:text-xl md:text-2xl font-black mb-1.5 sm:mb-3 font-syne uppercase text-black leading-none">{item.title}</h3>
                  <p className="text-black font-black text-[10px] sm:text-xs md:text-sm leading-snug uppercase tracking-tight">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimatedSection>

      {/* Social Proof Badges */}
      <SocialProofBadges />

      {/* Best Sellers Section */}
      <BestSellers />

      {/* Lucky Spin Wheel Phone Number Capture */}
      <HomeLuckySpinWheel />


      {/* The Vault - Dynamic Category Divider & Grid */}
      <section className="relative border-y-4 sm:border-y-[8px] border-black bg-white overflow-hidden">
        {/* Massive Marquee Header */}
        <div className="border-b-4 sm:border-b-[8px] border-black bg-[#00ff88]">
          <InfiniteMarquee 
            text="ENTER THE VAULT // CHOOSE YOUR ARSENAL // SELECT CATEGORY // NO COMPROMISE //" 
            className="py-2 sm:py-4 text-black text-sm sm:text-2xl font-black" 
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 sm:mb-16 relative py-6 sm:py-10"
          >
            {/* Brutalist accents */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-4 md:left-1/4 top-0 w-16 h-16 bg-[#00ff88] border-[4px] border-black hidden md:block z-0"
              style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
            />
            
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-4 md:right-1/4 bottom-0 w-auto px-4 h-10 bg-black border-[3px] border-black hidden md:flex items-center justify-center shadow-[6px_6px_0_0_#00ff88] z-20 hover:scale-110 transition-transform"
            >
              <span className="text-[#00ff88] text-xs font-black tracking-widest uppercase">RESTRICTED ACCESS</span>
            </motion.div>

            <h2 
              className="text-3xl sm:text-7xl md:text-9xl font-black text-center font-syne uppercase tracking-tighter hover:scale-105 transition-transform duration-300 relative z-10" 
              style={{ 
                WebkitTextStroke: window.innerWidth < 768 ? '1px black' : '2px black', 
                color: 'white', 
                textShadow: window.innerWidth < 768 ? '3px 3px 0px #00ff88, 6px 6px 0px black' : '6px 6px 0px #00ff88, 12px 12px 0px black' 
              }}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              The Vault
            </h2>
            
            <div className="text-center mt-6 sm:mt-12 relative z-10">
              <span className="inline-block bg-black text-white px-4 py-2 sm:px-8 sm:py-3 border-2 sm:border-[4px] border-black font-black uppercase tracking-widest text-xs sm:text-sm md:text-lg shadow-[4px_4px_0_0_#00ff88] sm:shadow-[6px_6px_0_0_#00ff88] hover:bg-[#00ff88] hover:text-black transition-colors cursor-pointer"
                    onMouseEnter={() => setCursorVariant('hover')}
                    onMouseLeave={() => setCursorVariant('default')}>
                /// INVENTORY UNLOCKED ///
              </span>
            </div>
          </motion.div>

          {/* Category Vise Divider (Massive Buttons) */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-12">
            {['All', 'HOODIES', 'T-SHIRTS', 'CROP TOPS', 'OVERSIZED TSHIRTS'].map((filter, i) => (
              <button
                key={filter}
                onClick={() => { setCollectionFilter(filter); setVaultDisplayCount(8); }}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                className={`px-3 py-2 sm:px-6 sm:py-4 md:px-5 md:py-2.5 border-2 sm:border-[4px] md:border-[2.5px] border-black text-[11px] sm:text-lg md:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${collectionFilter === filter ? 'bg-black text-[#00ff88] shadow-[4px_4px_0px_0px_#00ff88] sm:shadow-[8px_8px_0px_0px_#00ff88] md:shadow-[3px_3px_0px_0px_#00ff88] translate-x-[2px] translate-y-[2px] sm:translate-x-1 sm:translate-y-1 md:translate-x-[1.5px] md:translate-y-[1.5px]' : 'bg-white text-black hover:bg-[#00ff88] hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] md:hover:translate-x-[1.5px] md:hover:translate-y-[1.5px] hover:shadow-[4px_4px_0px_0px_#000] sm:hover:shadow-[6px_6px_0px_0px_#000] md:hover:shadow-[3px_3px_0px_0px_#000]'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Premium Dual-Thumb Price Slider */}
          <DualPriceSlider
            min={0}
            max={5000}
            value={priceRange}
            onChange={(val) => setPriceRange(val)}
            setCursorVariant={setCursorVariant}
          />

          {/* Dynamic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {vaultProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (index % 8) * 0.06 }}
              >
                <ScrollVelocityContainer skewMax={4} blurMax={1.5}>
                  <ProductCard
                    product={product}
                    onHoverStart={() => setCursorVariant('hover')}
                    onHoverEnd={() => setCursorVariant('default')}
                  />
                </ScrollVelocityContainer>
              </motion.div>
            ))}
          </div>

          {/* Load More + View All Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mt-10 sm:mt-16 gap-4"
          >
            {hasMoreVaultProducts && (
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/40">
                Showing {vaultProducts.length} of {filteredProducts.length} items
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              {hasMoreVaultProducts && (
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '4px 4px 0px 0px #00ff88' }}
                  whileTap={{ scale: 0.98, y: 2, boxShadow: '1px 1px 0px 0px #000' }}
                  onClick={() => setVaultDisplayCount(prev => prev + 8)}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  className="bg-black text-[#00ff88] border-[2.5px] sm:border-[3px] border-black px-6 py-2.5 sm:px-10 sm:py-3.5 font-black uppercase tracking-widest text-xs sm:text-sm shadow-[4px_4px_0px_0px_#00ff88] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={15} />
                  LOAD MORE
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '4px 4px 0px 0px #000' }}
                whileTap={{ scale: 0.98, y: 2, boxShadow: '1px 1px 0px 0px #00ff88' }}
                onClick={() => navigate('/shop/all')}
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                className="bg-white text-black border-[2.5px] sm:border-[3px] border-black px-6 py-2.5 sm:px-10 sm:py-3.5 font-black uppercase tracking-widest text-xs sm:text-sm shadow-[4px_4px_0px_0px_#000] transition-all flex items-center gap-2 cursor-pointer hover:bg-[#00ff88]"
              >
                <Package size={15} />
                VIEW ALL PRODUCTS
              </motion.button>
            </div>
          </motion.div>


          {filteredProducts.length === 0 && (
            <div className="text-center py-20 border-[4px] border-black border-dashed">
              <h3 className="text-3xl font-black uppercase">Data Not Found</h3>
              <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest">No artifacts match this filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Experience Section */}
      <ScrollAnimatedSection>
        <section className="py-24 bg-black relative border-y-[8px] border-black overflow-hidden">
          {/* Top Marquee for Video */}
          <div className="absolute top-0 inset-x-0 border-b-[8px] border-black bg-white z-20">
            <InfiniteMarquee 
              text="RAW FOOTAGE // BEHIND THE SCENES // ELEVEZ LABS // UNCUT // NO COMPROMISE //" 
              className="py-3 text-black text-xl font-black" 
            />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10 pt-20">
            <h2 className="text-5xl md:text-8xl font-black mb-12 relative z-20 font-syne uppercase tracking-tighter" style={{ WebkitTextStroke: '2px #00ff88', color: 'transparent' }}>The Elevez Experience</h2>

            {/* Frame is STATIC — parallax applied only to content inside */}
            <div
              className="relative aspect-video w-full max-w-6xl mx-auto overflow-hidden border-[8px] border-[#00ff88] shadow-[24px_24px_0_0_#00ff88] group bg-black"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              {/* Static Neo-Brutalist Placeholder behind the video */}
              <div className="absolute inset-0 bg-black flex items-center justify-center z-0">
                <div className="text-center">
                  <p className="text-[#00ff88] text-xl font-black uppercase tracking-widest opacity-30">ELEVEZ // SS26 // LOADING...</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                <div className="w-32 h-20 bg-[#00ff88] border-[4px] border-black shadow-[8px_8px_0_0_#000] flex items-center justify-center group-hover:scale-110 transition-transform hover:bg-white cursor-pointer">
                  <Play className="w-10 h-10 text-black fill-black" />
                </div>
              </div>
              {/* Parallax only on the video element itself, not the frame */}
              <motion.video
                style={{ y: videoSectionY, scale: 1.15 }}
                src="https://assets.mixkit.co/videos/preview/mixkit-urban-model-posing-in-neon-light-39857-large.mp4"
                autoPlay muted loop playsInline
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 absolute inset-0 z-[5]"
                onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
              />
              <div className="absolute bottom-8 left-8 z-20 text-left bg-black border-[4px] border-white p-4 shadow-[8px_8px_0_0_#fff]">
                <h3 className="text-4xl md:text-6xl font-black text-white font-syne leading-none uppercase">
                  FOR<br />BIGGER<br />BLAZES
                </h3>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimatedSection>

      {/* Newsletter Signup - End of Page */}
      <NewsletterSyndicate />
    </div>
  );
};

const assignMissingVibes = (productsList: any[]) => {
  const vibes = ['CUTE', 'FUNKY', 'BEAUTIFUL', 'ANIME', 'COLORFUL', 'OLD MONEY'];
  return productsList.map(p => {
    const tags = p.tags ? p.tags.map((t: string) => t.toUpperCase().replace('_', ' ')) : [];
    const hasVibe = tags.some((t: string) => vibes.includes(t));
    if (!hasVibe) {
      let assigned = 'FUNKY';
      const nameLower = (p.name || '').toLowerCase();
      if (nameLower.includes('cute') || nameLower.includes('bunny') || nameLower.includes('butterfly')) {
        assigned = 'CUTE';
      } else if (nameLower.includes('premium') || nameLower.includes('sovereign') || nameLower.includes('glass')) {
        assigned = 'OLD MONEY';
      } else if (nameLower.includes('anime') || nameLower.includes('kanji') || nameLower.includes('samurai') || nameLower.includes('dragon')) {
        assigned = 'ANIME';
      } else if (nameLower.includes('colorful') || nameLower.includes('gradient') || nameLower.includes('vibrant')) {
        assigned = 'COLORFUL';
      } else if (nameLower.includes('beautiful') || nameLower.includes('blossom') || nameLower.includes('ascent')) {
        assigned = 'BEAUTIFUL';
      } else {
        assigned = vibes[p.id % vibes.length];
      }
      return {
        ...p,
        tags: [...(p.tags || []), assigned]
      };
    }
    return p;
  });
};

const Shop = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const { category } = useParams<{ category?: string }>();
  useSEO({
    title: `Shop ${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Streetwear'} - Elevez`,
    description: `Explore our custom ${category || 'streetwear'} collection. Oversized fits, limited hoodie designs, graphic tees.`,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tagFilter = searchParams.get('tag');
  const typeFilter = searchParams.get('type');
  const collectionParam = searchParams.get('collection');

  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Restructured Filters States
  const [activeVibeFilter, setActiveVibeFilter] = useState<string | null>(null);
  const [activePriceFilter, setActivePriceFilter] = useState<number | null>(null);

  // Vibe Animation States
  const [animTrigger, setAnimTrigger] = useState(0);

  // Track page-level touch start/move/end to detect swipe gestures on the Shop page
  const pageSwipeStartX = useRef<number | null>(null);
  const pageSwipeStartY = useRef<number | null>(null);

  const handlePageTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    pageSwipeStartX.current = touch.clientX;
    pageSwipeStartY.current = touch.clientY;
  };

  const handlePageTouchMove = (e: React.TouchEvent) => {
    if (pageSwipeStartX.current === null || pageSwipeStartY.current === null) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - pageSwipeStartX.current;
    const diffY = touch.clientY - pageSwipeStartY.current;

    // Detect horizontal swipes (wider than tall)
    if (Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      // Right-to-left swipe (Swipe Left) -> Open filters
      if (diffX < -35) {
        if (!isMobileFilterOpen) {
          setIsMobileFilterOpen(true);
          audioService.playSwipe();
        }
        // Reset references so it only fires once per touch sequence
        pageSwipeStartX.current = null;
        pageSwipeStartY.current = null;
      }
      // Left-to-right swipe (Swipe Right) -> Close filters
      else if (diffX > 35) {
        if (isMobileFilterOpen) {
          setIsMobileFilterOpen(false);
          audioService.playSwipe();
        }
        pageSwipeStartX.current = null;
        pageSwipeStartY.current = null;
      }
    }
  };

  const handlePageTouchEnd = () => {
    pageSwipeStartX.current = null;
    pageSwipeStartY.current = null;
  };



  useEffect(() => {
    const handleStoreUpdate = () => {
      // Always read from localCollectionService so SSE-triggered refreshes work in all envs
      const freshProducts = localCollectionService.getActiveProducts();
      const productsWithVibes = assignMissingVibes(freshProducts.length > 0 ? freshProducts : PRODUCTS);
      setProducts(productsWithVibes);
      const storedCollections = localCollectionService.getAllCollections();
      setCollections(storedCollections);
    };

    handleStoreUpdate();

    if (collectionParam) {
      setSelectedCollection(collectionParam);
    } else if (category === 'men' || category === 'women') {
      setSelectedCollection(category);
    } else {
      setSelectedCollection('all');
    }

    window.addEventListener('elevez_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('elevez_store_updated', handleStoreUpdate);
  }, [collectionParam, category]);

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

        let matchesFilters = false;
        if (collection.filters) {
          matchesFilters = true;
          if (collection.filters.tags && collection.filters.tags.length > 0) {
            matchesFilters = collection.filters.tags.some((tag: string) => p.tags?.includes(tag));
          }
          if (matchesFilters && collection.filters.category) {
            if (collection.filters.category === 'Men') {
              if (p.category !== 'Men' && p.category !== 'Unisex') matchesFilters = false;
            } else if (collection.filters.category === 'Women') {
              if (p.category !== 'Women' && p.category !== 'Unisex') matchesFilters = false;
            } else if (p.category !== collection.filters.category) {
              matchesFilters = false;
            }
          }
          if (matchesFilters && collection.filters.type && p.type !== collection.filters.type) matchesFilters = false;
          if (matchesFilters && collection.filters.minPrice !== undefined && p.price < collection.filters.minPrice) matchesFilters = false;
          if (matchesFilters && collection.filters.maxPrice !== undefined && p.price > collection.filters.maxPrice) matchesFilters = false;
        }

        const inCollection =
          matchesFilters ||
          collection.productHandles?.includes(productHandle) ||
          collection.productHandles?.includes(p.handle) ||
          collection.productHandles?.includes(productId) ||
          p.collections?.includes(collection.name);

        if (!inCollection) return false;
      }
    }

    const matchesCategory = category === 'all' || !category ? true : p.category?.toLowerCase() === category || p.category === 'Unisex';
    // Normalize filter string
    const normalizedFilter = filter.toLowerCase().replace(/s$/, '').replace(/[^a-z0-9]/g, '');

    let matchesFilter = true;
    if (filter === 'All') matchesFilter = true;
    else if (normalizedFilter === 'hoodie') {
      matchesFilter = p.type?.toLowerCase().includes('hoodie') || p.tags?.some((t: string) => t.toLowerCase() === 'hoodie') || p.shopifyHandle?.toLowerCase().includes('hoodie') || p.name?.toLowerCase().includes('hoodie');
    } else if (normalizedFilter === 'tshirt' || normalizedFilter === 'tee') {
      matchesFilter = (p.type?.toLowerCase() === 'tee' || p.type?.toLowerCase().includes('t-shirt') || p.type?.toLowerCase().includes('tshirt') || p.shopifyHandle?.toLowerCase().includes('tshirt') || p.shopifyHandle?.toLowerCase().includes('tee') || p.name?.toLowerCase().includes('tshirt') || p.name?.toLowerCase().includes('t-shirt') || p.tags?.some((t: string) => t.toLowerCase() === 'tshirt' || t.toLowerCase() === 't-shirt')) && !p.name?.toLowerCase().includes('hoodie');
    } else if (normalizedFilter === 'croptop') {
      matchesFilter = p.type?.toLowerCase().includes('crop') || p.tags?.some((t: string) => t.toLowerCase() === 'croptop' || t.toLowerCase() === 'crop top') || p.shopifyHandle?.toLowerCase().includes('croptop') || p.name?.toLowerCase().includes('crop');
    } else if (normalizedFilter === 'oversized') {
      matchesFilter = p.type?.toLowerCase().includes('oversized') || p.tags?.some((t: string) => t.toLowerCase() === 'oversized') || p.shopifyHandle?.toLowerCase().includes('oversized') || p.name?.toLowerCase().includes('oversized');
    }
    else if (['men', 'women', 'unisex'].includes(filter.toLowerCase())) {
      matchesFilter = p.category?.toLowerCase() === filter.toLowerCase();
    }
    else if (filter.toUpperCase() === 'OLD') matchesFilter = p.tags?.some((t: string) => t.toUpperCase() === 'VINTAGE');
    else if (filter.toUpperCase() === 'BOLD') matchesFilter = p.tags?.some((t: string) => t.toUpperCase() === 'COLORFUL');
    else if (filter.toUpperCase() === 'PREMIUM') matchesFilter = p.tags?.some((t: string) => t.toUpperCase() === 'PREMIUM');
    else if (filter.toUpperCase() === 'ESSENTIAL') matchesFilter = p.tags?.some((t: string) => t.toUpperCase() === 'ESSENTIAL');

    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPrice = p.price >= priceRange[0] && (priceRange[1] >= 5000 ? true : p.price <= priceRange[1]);

    return matchesCategory && matchesFilter && matchesSearch && matchesPrice;
  });

  return (
    <div 
      onTouchStart={handlePageTouchStart}
      onTouchMove={handlePageTouchMove}
      onTouchEnd={handlePageTouchEnd}
      onTouchCancel={handlePageTouchEnd}
      style={{ touchAction: 'pan-y' }}
      className="min-h-screen pt-48 pb-20 px-6 bg-white relative"
    >
      {/* Vibe Animation Overlay */}
      <VibeAnimationEngine vibe={activeVibeFilter} trigger={animTrigger} />

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
            {category === 'men' ? "Men's Gear" : category === 'women' ? "Women's Style" : "THE COLLECTION"}
          </h1>
          <p className="text-black font-black uppercase text-xl mt-4">Discover all {filteredProducts.length} pieces of pure identity.</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16 relative items-start">
          {/* Product Grid */}
          <div className="w-full">
            {/* Search and Filter Bar — sticky once scrolled past hero */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b-[3px] border-black -mx-6 px-6 py-3 mb-8 flex gap-3 w-[calc(100%+3rem)] shadow-[0_4px_0px_0px_rgba(0,0,0,0.08)]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                <input
                  type="text"
                  placeholder="SEARCH COLLECTION..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-[3px] border-black px-10 py-3 text-black font-black placeholder-gray-400 focus:shadow-[4px_4px_0px_0px_#00ff88] outline-none transition-all uppercase text-xs"
                />
              </div>
              <motion.button
                onClick={() => setIsMobileFilterOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93, x: 2, y: 2 }}
                className="bg-black text-[#00ff88] border-[3px] border-black font-black uppercase text-xs px-5 py-3 shadow-[4px_4px_0px_0px_#00ff88] transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <SlidersHorizontal size={14} /> FILTERS
              </motion.button>
            </div>

            <div key={`grid-${filter}-${selectedCollection}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => {
                  const normalizedVibe = activeVibeFilter ? activeVibeFilter.toUpperCase() : null;
                  const matchesVibe = !normalizedVibe || product.tags?.some((t: string) => {
                    const normalizedTag = t.toUpperCase().replace('_', ' ');
                    return normalizedTag === normalizedVibe;
                  });
                  const matchesPrice = !activePriceFilter || product.price <= activePriceFilter;
                  const isHighlighted = matchesVibe && matchesPrice;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.96 }}
                      animate={{ 
                        opacity: isHighlighted ? 1 : 0.12, 
                        scale: isHighlighted ? 1 : 0.93,
                        filter: isHighlighted ? 'blur(0px)' : 'blur(2px)',
                        y: 0 
                      }}
                      exit={{ opacity: 0, scale: 0.88, y: -10 }}
                      transition={{ 
                        duration: 0.45, 
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className={isHighlighted ? "" : "pointer-events-none"}
                    >
                      <ScrollVelocityContainer skewMax={4} blurMax={1.5}>
                        <ProductCard
                          product={product}
                          onHoverStart={() => setCursorVariant('hover')}
                          onHoverEnd={() => setCursorVariant('default')}
                        />
                      </ScrollVelocityContainer>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 border-[6px] border-black border-dashed bg-gray-50">
                <p className="text-4xl font-black text-black uppercase mb-8">Nothing Found In The Collection</p>
                <button 
                  onClick={() => { 
                    setFilter('All'); 
                    setSearchQuery(''); 
                    setSelectedCollection('all'); 
                    setPriceRange([0, 5000]); 
                    setActiveVibeFilter(null);
                    setActivePriceFilter(null);
                  }} 
                  className="bg-black text-[#00ff88] px-12 py-4 border-[4px] border-black font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Swipe-to-Filter Hint — right edge, mobile only */}
      {createPortal(
        <AnimatePresence>
          {!isMobileFilterOpen && (
            <motion.button
              key="swipe-filter-hint"
              initial={{ opacity: 0, x: 50 }}
              animate={{ 
                opacity: [0.65, 1, 0.65], 
                x: [6, 0, 6],
              }}
              transition={{ 
                duration: 2.4, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 2.0
              }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              onClick={() => { setIsMobileFilterOpen(true); audioService.playSwipe(); }}
              className="fixed right-0 top-[62%] -translate-y-1/2 z-[99999] bg-[#00ff88] text-black border-2 border-r-0 border-black px-1.5 py-4 font-black uppercase text-[8px] tracking-wider [writing-mode:vertical-lr] rotate-180 flex flex-col items-center justify-center rounded-l-md shadow-[-3px_2px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-x-[1px] transition-all cursor-pointer"
            >
              <span>⟵ SWIPE LEFT</span>
            </motion.button>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Mobile Filters Right Drawer Panel */}
      {createPortal(
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
            {/* Backdrop */}
            <motion.div
              key="filter-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99980]"
            />
            {/* Right Drawer Panel */}
            <motion.div
              key="filter-sheet-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              drag="x"
              dragConstraints={{ left: 0 }}
              dragElastic={{ left: 0.05, right: 0.3 }}
              onDragEnd={(_: any, info: any) => { if (info.offset.x > 80) setIsMobileFilterOpen(false); }}
              className="fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-white z-[99990] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.3)] border-l-[3px] border-black rounded-l-2xl"
            >
              {/* Scrollable inner content */}
              <div className="flex flex-col overflow-y-auto p-4 flex-1 pb-safe">
                {/* Sheet Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b-[3px] border-black mt-1">
                  <span className="font-black font-syne text-lg uppercase text-black">Filters</span>
                  <motion.button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    whileTap={{ scale: 0.88, rotate: 90 }}
                    className="bg-black text-[#00ff88] p-1.5 border-[2px] border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#00ff88] cursor-pointer"
                  >
                    <X size={12} />
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="space-y-4 flex-1">
                  {/* Price Filters */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-black mb-2 bg-black text-white px-2 py-0.5 inline-block">Price</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: '≤ ₹499', value: 499 },
                        { label: '≤ ₹549', value: 549 },
                        { label: '≤ ₹599', value: 599 },
                        { label: '≤ ₹699', value: 699 },
                        { label: '≤ ₹999', value: 999 },
                      ].map(opt => {
                        const isActive = activePriceFilter === opt.value;
                        return (
                          <motion.button
                            key={opt.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const nextState = isActive ? null : opt.value;
                              setActivePriceFilter(nextState);
                              audioService.playClick();
                            }}
                            className={`text-center py-1.5 border-[2px] border-black font-black text-[9px] uppercase transition-all tracking-wider ${
                              isActive 
                                ? 'bg-[#00ff88] text-black shadow-[2px_2px_0px_0px_#000]' 
                                : 'bg-white text-black hover:bg-gray-50'
                            }`}
                          >
                            {opt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vibe Filters */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-black mb-2 bg-black text-white px-2 py-0.5 inline-block">Vibe</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {/* CUTE 🧸 */}
                      <motion.button
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'CUTE';
                          setActiveVibeFilter(isActive ? null : 'CUTE');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playClick();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'CUTE' 
                            ? 'bg-[#ff69b4] text-white shadow-[0_0_8px_rgba(255,105,180,0.5)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        CUTE 🧸
                      </motion.button>

                      {/* FUNKY ⚡ */}
                      <motion.button
                        animate={{ x: [0, 2, -2, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                        whileHover={{ scale: 1.05, skewX: 3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'FUNKY';
                          setActiveVibeFilter(isActive ? null : 'FUNKY');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playSwipe();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'FUNKY' 
                            ? 'bg-[#00ff88] text-black shadow-[0_0_8px_rgba(0,255,136,0.5)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        FUNKY ⚡
                      </motion.button>

                      {/* BEAUTIFUL ✨ */}
                      <motion.button
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'BEAUTIFUL';
                          setActiveVibeFilter(isActive ? null : 'BEAUTIFUL');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playClick();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'BEAUTIFUL' 
                            ? 'bg-[#ffd700] text-black shadow-[0_0_8px_rgba(255,215,0,0.5)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        BEAUTY ✨
                      </motion.button>

                      {/* ANIME 🌸 */}
                      <motion.button
                        animate={{ rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'ANIME';
                          setActiveVibeFilter(isActive ? null : 'ANIME');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playClick();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'ANIME' 
                            ? 'bg-black text-[#ffff00] shadow-[0_0_8px_rgba(255,255,0,0.4)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        ANIME 🌸
                      </motion.button>

                      {/* COLORFUL 🌈 */}
                      <motion.button
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'COLORFUL';
                          setActiveVibeFilter(isActive ? null : 'COLORFUL');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playSwipe();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'COLORFUL' 
                            ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 text-white shadow-[0_0_8px_rgba(255,100,0,0.4)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        COLOR 🌈
                      </motion.button>

                      {/* OLD MONEY ☕ */}
                      <motion.button
                        animate={{ y: [0, -1.5, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          const isActive = activeVibeFilter === 'OLD MONEY';
                          setActiveVibeFilter(isActive ? null : 'OLD MONEY');
                          setAnimTrigger(prev => prev + 1);
                          audioService.playClick();
                        }}
                        className={`border-[2px] border-black py-2 font-black uppercase text-[8px] tracking-wider cursor-pointer origin-center ${
                          activeVibeFilter === 'OLD MONEY' 
                            ? 'bg-[#1b263b] text-[#e0e1dd] shadow-[0_0_8px_rgba(27,38,59,0.6)]' 
                            : 'bg-white text-black'
                        }`}
                      >
                        CLASSIC ☕
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 border-t-[3px] border-black bg-white flex gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveVibeFilter(null);
                    setActivePriceFilter(null);
                    audioService.playSwipe();
                  }}
                  className="flex-1 py-2 bg-white text-black border-[2.5px] border-black font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_0px_#000] cursor-pointer text-center"
                >
                  Clear All
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsMobileFilterOpen(false);
                    audioService.playClick();
                  }}
                  className="flex-1 py-2 bg-[#00ff88] text-black border-[2.5px] border-black font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_0px_#000] cursor-pointer text-center"
                >
                  Apply
                </motion.button>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

const ProductSchema = ({ product, url }: { product: any; url: string }) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description || `Buy the premium ${product.name} at Elevez. High quality limited streetwear.`,
    "sku": `ELVZ-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Elevez"
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Elevez"
      }
    }
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

const ProductDetail = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const { id } = useParams();
  const { items, addToCart, setIsCartOpen, isCartOpen } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  // isLoading prevents 'Product Not Found' from flashing during SSE re-fetch
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && product) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile.success && profile.data?.wishlist) {
            setIsWishlisted(profile.data.wishlist.includes(product.id));
          }
        } catch (error) {
          console.error('Error fetching wishlist status:', error);
        }
      } else {
        setIsWishlisted(false);
      }
    });
    return () => unsubscribe();
  }, [product]);

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    if (!product) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(currentUser.uid, product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(currentUser.uid, product.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/#/product/${product.id}`;
    const shareText = `Check out ${product.name} on Elevez!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  // Scroll visibility state for mobile Add to Cart bar
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down significantly, hide it. If scrolling up, show it.
      if (currentScrollY > lastScrollY && currentScrollY > 100 && currentScrollY - lastScrollY > 5) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 5) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      // Re-appear when standing still for 1.5 seconds
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [lastScrollY]);

  // Set Dynamic SEO Metadata unconditionally at the top level
  useSEO({
    title: product ? `${product.name} - Streetwear Apparel` : 'Product Details',
    description: product ? `Shop ${product.name} for ₹${product?.price || ''}. Premium streetwear, oversized cuts, limited edition drops.` : 'Browse our custom streetwear apparel line.',
    ogImage: product?.image,
    ogType: 'product'
  });

  // States and refs for interactive image swipe slider & automatic slideshow
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0); // Live drag translation for touch feedback



  const productImages = product?.images && product.images.length > 0 ? product.images.slice(0, 5) : (product ? [product.image] : []);

  // Sync activeImage whenever activeImageIndex or productImages changes
  useEffect(() => {
    if (productImages && productImages[activeImageIndex]) {
      setActiveImage(productImages[activeImageIndex]);
    }
  }, [activeImageIndex, productImages]);

  // Slideshow interval (automatically transitions to next unless holding)
  useEffect(() => {
    if (isHolding || productImages.length <= 1) return;
    const intervalId = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % productImages.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [isHolding, productImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsHolding(true);
    const touch = e.touches[0];
    swipeStartX.current = touch.clientX;
    swipeStartY.current = touch.clientY;
    setDragOffsetX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - swipeStartX.current;
    const diffY = touch.clientY - swipeStartY.current;
    // Only track horizontal swipes (prevent fighting with vertical scroll)
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) e.preventDefault();
      // Rubber-band effect: limit drag to ±80px with resistance
      setDragOffsetX(diffX * 0.6);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsHolding(false);
    if (swipeStartX.current === null) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - swipeStartX.current;
    const diffY = touch.clientY - swipeStartY.current!;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swipe Right -> Prev Image
        setActiveImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      } else {
        // Swipe Left -> Next Image
        setActiveImageIndex(prev => (prev + 1) % productImages.length);
      }
    } else {
      // Tap margins navigation
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      const width = rect.width;
      if (clickX < width * 0.35) {
        setActiveImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      } else if (clickX > width * 0.65) {
        setActiveImageIndex(prev => (prev + 1) % productImages.length);
      }
    }
    setDragOffsetX(0); // Reset live drag offset after swipe resolves
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHolding(true);
    swipeStartX.current = e.clientX;
    swipeStartY.current = e.clientY;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHolding(false);
    if (swipeStartX.current === null) return;
    const diffX = e.clientX - swipeStartX.current;
    const diffY = e.clientY - swipeStartY.current!;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        setActiveImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      } else {
        setActiveImageIndex(prev => (prev + 1) % productImages.length);
      }
    } else {
      // Tap margins navigation
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (clickX < width * 0.35) {
        setActiveImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      } else if (clickX > width * 0.65) {
        setActiveImageIndex(prev => (prev + 1) % productImages.length);
      }
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const handleMouseLeaveImage = () => {
    setIsHolding(false);
    swipeStartX.current = null;
    swipeStartY.current = null;
    setCursorVariant('default');
  };

  // Simulated live viewer fluctuations for conversion excitement
  const [liveViewers, setLiveViewers] = useState(() => 14 + Math.floor(Math.random() * 12) + (Number(id || 0) % 5));
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setLiveViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next > 6 ? (next < 35 ? next : 32) : 9;
      });
    }, 8500);
    return () => clearInterval(viewerInterval);
  }, [id]);

  // Fix: Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    const handleStoreUpdate = () => {
      const activeProds = localCollectionService.getActiveProducts();
      setProducts(activeProds);
      const cleanId = String(id).trim();

      const findInList = (list: any[]) => {
        return list.find((p: any) => {
          if (!p) return false;
          
          // Match 1: numeric exact id
          if (p.id === Number(cleanId)) return true;
          
          // Match 2: string exact id
          if (String(p.id) === cleanId) return true;
          
          // Match 3: shopifyId match (exact or exact match on the numeric ID part of the GID)
          if (p.shopifyId) {
            if (String(p.shopifyId) === cleanId) return true;
            const parts = String(p.shopifyId).split('/');
            const lastPart = parts[parts.length - 1];
            if (lastPart === cleanId) return true;
          }
          
          // Match 4: handle match
          if (p.handle && p.handle.toLowerCase() === cleanId.toLowerCase()) return true;
          
          // Match 5: shopifyHandle match
          if (p.shopifyHandle && p.shopifyHandle.toLowerCase() === cleanId.toLowerCase()) return true;
          
          // Match 6: qid match
          if (p.qid && p.qid.toLowerCase() === cleanId.toLowerCase()) return true;

          return false;
        });
      };

      // Try active products list
      let found = findInList(activeProds);
      // Safety net: fall back to compile-time PRODUCTS if not found
      if (!found) {
        found = findInList(PRODUCTS);
      }

      if (found) {
        setProduct(found);
        setActiveImage(found.image);
        setActiveImageIndex(0);
        if (found.colors && found.colors.length > 0) {
          setSelectedColor(prev => found.colors.includes(prev) ? prev : found.colors[0]);
        }
        const sizesToUse = found.sizes && found.sizes.length > 0 ? found.sizes : getAvailableSizes();
        setSelectedSize(prev => sizesToUse.includes(prev) ? prev : sizesToUse[0] || 'M');
      } else {
        setProduct(null);
      }
      setIsLoading(false);
    };

    handleStoreUpdate();

    window.addEventListener('elevez_store_updated', handleStoreUpdate);
    return () => {
      window.removeEventListener('elevez_store_updated', handleStoreUpdate);
    };
  }, [id]);

  // Show loading spinner while fetching — never flash 'Not Found' during re-fetch
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-[#00ff88] rounded-full animate-spin" />
        <span className="font-black uppercase text-sm tracking-widest">Loading...</span>
      </div>
    </div>
  );
  if (!product) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-4xl">Product Not Found</div>;

  return (
    <div className="min-h-screen pt-48 pb-20 bg-white relative overflow-x-hidden">

      <ProductSchema product={product} url={window.location.href} />
      <div className="container mx-auto px-6">
        <Link to="/shop/all" className="inline-flex items-center gap-3 bg-black text-[#00ff88] px-6 py-2 border-[3px] border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] mb-12 transition-all">
          <ArrowLeft size={16} /> Back to Archives
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pb-20 lg:pb-0">
          {/* Left Column - sticky, full image with borders always in view */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
          <div className="bg-white border-[4px] sm:border-[8px] border-black p-2 sm:p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] sm:shadow-[16px_16px_0px_0px_#000] relative flex flex-col h-auto w-full">
            {/* Decorative Spinning Stamp */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -left-10 w-24 h-24 bg-[#00ff88] border-[3px] border-black hidden xl:flex items-center justify-center z-20 cursor-pointer shadow-[4px_4px_0_0_#000]"
              style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
              whileHover={{ scale: 1.15 }}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <motion.span 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="text-[9px] font-black text-black select-none uppercase tracking-tighter text-center leading-none mt-1"
              >
                DRIP<br />VERIFIED
              </motion.span>
            </motion.div>

            {/* Main Interactive Swipe / Tap Container */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeaveImage}
              className="relative w-full h-auto border-[4px] border-black bg-white mb-4 group overflow-hidden select-none cursor-pointer aspect-[4/5] sm:aspect-auto"
              onMouseEnter={() => setCursorVariant('hover')}
            >
              <div 
                className="flex w-full h-full"
                style={{
                  transform: `translateX(calc(-${activeImageIndex * 100}% + ${dragOffsetX}px))`,
                  transition: dragOffsetX === 0 ? 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                }}
              >
                {productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${product.name} - View ${idx + 1}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full shrink-0 object-cover block pointer-events-none"
                  />
                ))}
              </div>
              <div className="absolute top-6 left-6 bg-black text-[#00ff88] px-4 py-1 border-[3px] border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000] z-10">
                {product.type}
              </div>

              {/* Navigation Indicator chevrons */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                <div className="bg-white text-black border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                  <ArrowLeft size={16} />
                </div>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                <div className="bg-white text-black border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* cyber-neobrutalist decrypt image trigger */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <div className="bg-black text-[#00ff88] px-4 py-2 border-[3px] border-[#00ff88] font-black uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow-[4px_4px_0px_0px_#000] pointer-events-auto">
                  <Maximize2 size={12} />
                  DECRYPT IMAGE (CENTER)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(img);
                    setActiveImageIndex(idx);
                  }}
                  className={`aspect-square border-[3px] border-black transition-all ${activeImageIndex === idx ? 'bg-[#00ff88] shadow-[4px_4px_0px_0px_#000] scale-105' : 'bg-white hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#000]'}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div></div>

          {/* Right Column - Details */}
          <div className="lg:col-span-6"><div className="bg-white border-[4px] sm:border-[6px] border-black p-4 sm:p-6 md:p-8 shadow-[8px_8px_0px_0px_#000] sm:shadow-[12px_12px_0px_0px_#000] flex flex-col relative overflow-hidden">
            {/* Corner Decorative Star Badge */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 w-12 h-12 bg-black border-[2px] border-white flex items-center justify-center opacity-10 pointer-events-none"
              style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
            />

            <div className="flex items-center gap-2 mb-3 font-black uppercase text-[10px]">
              <span className="bg-black text-white px-2 py-0.5">Premium Collection</span>
              <GlitchText text={product.category} className="text-black" />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-[0.95] mb-4 font-syne uppercase tracking-tighter relative cursor-default select-none pb-3 border-b-[3px] border-black">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-3">
              <div className="text-[#00ff88] text-4xl font-black font-price stroke-black" style={{ WebkitTextStroke: '1.2px black' }}>
                ₹<GlitchText text={product.price.toString()} triggerOnHover={false} />
              </div>
              <span className="font-price text-xl text-red-400 line-through font-bold">₹{product.originalPrice}</span>
              <div className="bg-[#00ff88] border-[2px] border-black px-2 py-0.5 font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_#000]">
                Save <span className="font-price">₹{(product.originalPrice - product.price).toFixed(0)}</span>
              </div>
            </div>

            {/* Live Hype / Viewing counter */}
            <div className="flex items-center gap-2 mb-4 bg-zinc-50 border-[2px] border-black px-3 py-1.5 w-fit relative select-none shadow-[3px_3px_0px_0px_#000] font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10.5px] font-black text-black uppercase tracking-wider">
                🔥 {liveViewers} looking right now
              </span>
            </div>

            {/* Horizontal Warning Tape */}
            <div className="my-4 -mx-12 border-y-[3px] border-black bg-yellow-300 text-black py-1.5 overflow-hidden flex-shrink-0 select-none pointer-events-none">
              <InfiniteMarquee text="⚠️ STREETWEAR PROTOCOL // SS26 DROP // 100% PREMIUM COTTON // HEAVYWEIGHT 240 GSM // NO REPRINTS ⚠️" className="py-0.5 text-black text-[9px] font-black tracking-widest" />
            </div>

            <p className="text-black font-bold uppercase text-xs sm:text-sm leading-snug mb-5 border-l-[4px] border-black pl-4 italic">
              {product.description || 'Premium quality streetwear with personality-driven design. Engineered for durability and style in the urban environment.'}
            </p>

            {/* Selection Options */}
            <div className="space-y-6 mb-8">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase mb-3 text-black" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span className="opacity-40">Color:</span> <span className="transition-all duration-200 text-black">{selectedColor}</span>
                  </h4>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div
                          style={{
                            background: getColorCode(color),
                            border: color.toLowerCase() === 'white' ? '2px solid #333' : '2px solid transparent'
                          }}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${
                            selectedColor === color
                              ? 'ring-2 ring-[#00ff88] ring-offset-2 scale-110'
                              : 'group-hover:scale-105 ring-2 ring-transparent ring-offset-1'
                          }`}
                        />
                        <span className={`text-[9px] font-black uppercase tracking-wide ${
                          selectedColor === color ? 'text-black' : 'text-black opacity-40'
                        }`}>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-black uppercase mb-3 text-black">Size: {selectedSize}</h4>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : getAvailableSizes()).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 md:w-10 md:h-10 border-[2px] sm:border-[3px] border-black font-black text-xs sm:text-sm transition-all ${selectedSize === size ? 'bg-[#00ff88] text-black shadow-[3px_3px_0px_0px_#000]' : 'bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Stock Alert */}
                <div className="mt-3 flex items-center gap-1.5 text-[9.5px] font-black uppercase font-mono">
                  {selectedSize === 'S' || selectedSize === 'L' || (Number(product.id) % 3 === 0 && selectedSize === 'XL') ? (
                    <span className="text-[#ff7e40] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff7e40] animate-pulse"></span>
                      ⚠️ only 2 items left in size {selectedSize}!
                    </span>
                  ) : (
                    <span className="text-[#00ff88] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                      in stock - ready to transmit
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase mb-3 text-black">Quantity</h4>
                <div className="flex items-center border-[2px] sm:border-[3px] border-black w-fit bg-white shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-black text-sm sm:text-lg hover:bg-black hover:text-white text-black transition-all border-r-[2px] sm:border-r-[3px] border-black">
                    -
                  </button>
                  <span className="w-8 sm:w-12 text-center font-black text-xs sm:text-sm text-black">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-black text-sm sm:text-lg hover:bg-black hover:text-white text-black transition-all border-l-[2px] sm:border-l-[3px] border-black">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <DynamicAccordion 
                compact={true}
                items={[
                  { title: "Product Architecture", content: product.description || "Designed for maximum utility and urban aesthetics. Built with high-grade GSM fabric for durability and comfort." },
                  { title: "Material Protocol", content: "100% Premium Cotton // 240 GSM // Pre-shrunk // Bio-washed // Sustainably sourced." },
                  { title: "Shipping Signals", content: "Dispatched within 24-48 hours. Express shipping available. Real-time tracking enabled." }
                ]} 
              />
            </div>



            {/* Desktop Buttons */}
            <div className="hidden lg:flex flex-col gap-3 mb-8">
              <Magnetic>
                <button
                  onClick={() => {
                    addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 bg-black text-[#00ff88] border-[2px] border-black font-black text-sm uppercase tracking-widest shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} /> Initiate Purchase
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
                className="w-full bg-[#00ff88] text-black font-black text-xs py-2.5 border-[2px] border-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Buy It Now
              </button>
            </div>

            {/* Wishlist & Share - visible on all devices */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleToggleWishlist}
                className={`flex-1 py-2.5 border-[2px] border-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer ${
                  isWishlisted ? 'bg-[#ff007f] text-white' : 'bg-white text-black'
                }`}
              >
                <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 bg-white text-black border-[2px] border-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
              >
                <Share2 size={16} />
                Share Asset
              </button>
            </div>

            {/* Mobile Sticky Add to Cart (Portal) */}
            {createPortal(
              <AnimatePresence>
                {isVisible && !isCartOpen && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      zIndex: 200,
                      backgroundColor: 'white',
                      borderTop: '3px solid #000000',
                      boxShadow: '0 -4px 10px rgba(0,0,0,0.15)',
                      paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
                    }}
                    className="lg:hidden flex items-center justify-between px-4 py-3 gap-3"
                  >
                    {/* Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9, rotate: -5 }}
                      onClick={() => setIsCartOpen(true)}
                      className="w-12 h-12 bg-white text-black border-[3px] border-black rounded-xl flex items-center justify-center relative shadow-[3px_3px_0px_0px_#000] cursor-pointer z-10"
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ShoppingCart size={20} />
                      </motion.div>
                      {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-[#ff007f] text-white border-[2.5px] border-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-20">
                          {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      )}
                    </motion.button>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
                      }}
                      className="flex-1 bg-[#ff007f] text-white font-black text-xs sm:text-sm py-3 px-4 border-[3px] border-black rounded-xl uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer overflow-hidden relative z-10"
                    >
                      {/* Shiny Sweep Animation */}
                      <motion.div 
                         className="absolute inset-0 bg-white/30 skew-x-[-20deg] w-12"
                         animate={{ x: ['-300%', '800%'] }}
                         transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Plus size={16} />
                      </motion.div>
                      ADD TO CART
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}

            {/* Service Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t-[3px] border-black">
              {[
                { icon: Truck, label: "3-Day Delivery" },
                { icon: RefreshCw, label: "Easy Returns" },
                { icon: ShieldCheck, label: "Safe Payment" }
              ].map((service, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="w-9 h-9 bg-black text-[#00ff88] flex items-center justify-center border-[2px] border-black shadow-[3px_3px_0px_0px_#ccc]">
                    <service.icon size={16} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-black tracking-widest">{service.label}</span>
                </div>
              ))}
            </div>
          </div></div>
        </div>

        {/* More Like This */}
        <div className="mt-40">
          <div className="border-b-[4px] border-black pb-4 mb-12 flex justify-between items-end">
            <h2 className="text-3xl md:text-4xl font-black font-syne uppercase tracking-tighter text-black">
              More Like This
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-black opacity-60">RECOMMENDED PROTOCOL</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5).map(p => (
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
          <h2 className="text-7xl md:text-[12rem] font-black font-syne mb-12 text-black uppercase leading-[0.85] tracking-tighter">
            OUR <span className="text-[#00ff88]" style={{ WebkitTextStroke: '4px black' }}>STORY</span>
          </h2>
          <p className="text-2xl md:text-4xl text-black font-black uppercase leading-tight max-w-4xl mx-auto italic border-l-[12px] border-black pl-12 text-left">
            Elevez was born in the digital void. We are not just a clothing brand; we are a movement against the static.
          </p>
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
              to="/account?tab=earn-redeem"
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

// Dynamic Leaflet Map Preview Component using CDN
const MapPreview = ({ 
  lat, 
  lon, 
  onLocationChange 
}: { 
  lat: number; 
  lon: number; 
  onLocationChange: (lat: number, lon: number) => void 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    // Inject Leaflet CSS if not present
    let cssLink = document.getElementById('leaflet-css') as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = 'leaflet-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Clean up previous map if it exists
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
      }

      // Initialize map centered at lat, lon
      const map = L.map(mapRef.current).setView([lat, lon], 16);
      leafletMapInstance.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create a draggable marker
      const marker = L.marker([lat, lon], { draggable: true }).addTo(map);
      markerInstance.current = marker;

      // Event listener for drag end
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onLocationChange(position.lat, position.lng);
      });

      // Event listener for clicking on the map to place pin
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });
    };

    // Load Leaflet JS if not already available
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Clean up on component unmount
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [lat, lon]);

  return (
    <div className="w-full border-[3px] border-black shadow-[4px_4px_0px_0px_#000] relative rounded-none overflow-hidden my-3">
      <div ref={mapRef} style={{ width: '100%', height: '220px' }} className="z-[10]" />
      <div className="absolute bottom-2 left-2 z-[999] bg-black text-[#00ff88] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_0px_#000]">
        📍 Drag Marker or Click Map to Pin Delivery Location
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart, isExitDiscountApplied, setIsExitDiscountApplied } = useCart();
  const [user, setUser] = useState<any>(() => auth.currentUser); // sync init — avoids sign-in flash
  const [authLoading, setAuthLoading] = useState(!auth.currentUser); // false immediately if already signed in
  const shouldPlaceOrderAfterLogin = useRef(false);

  const [isCheckoutExitOpen, setIsCheckoutExitOpen] = useState(false);

  // Desktop Mouse Leave exit intent
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      const hasSeen = localStorage.getItem('elevez_checkout_exit_seen') === 'true';
      if (e.clientY <= 0 && !hasSeen && !isExitDiscountApplied) {
        localStorage.setItem('elevez_checkout_exit_seen', 'true');
        setIsCheckoutExitOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isExitDiscountApplied]);

  // Mobile Back Button exit intent / intercept
  useEffect(() => {
    const hasSeen = localStorage.getItem('elevez_checkout_exit_seen') === 'true';
    if (hasSeen || isExitDiscountApplied) return;

    window.history.pushState({ checkoutExit: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      if (!localStorage.getItem('elevez_checkout_exit_seen') && !isExitDiscountApplied) {
        localStorage.setItem('elevez_checkout_exit_seen', 'true');
        setIsCheckoutExitOpen(true);
        window.history.pushState({ checkoutExit: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isExitDiscountApplied]);
  const [formData, setFormData] = useState({
    fullName: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'upi'
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  const [activeStep, setActiveStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!isAddressModalOpen) {
      setLocationError(null);
      setLocationCoords(null);
    }
  }, [isAddressModalOpen]);


  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 600; // Reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landline: '',
    backupPhone: ''
  });

  const activeAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
  
  useEffect(() => {
    if (activeAddress) {
      setFormData(prev => ({
        ...prev,
        fullName: activeAddress.fullName || prev.fullName,
        phone: activeAddress.landline + (activeAddress.backupPhone ? ' / ' + activeAddress.backupPhone : ''),
        address: activeAddress.addressLine1 + (activeAddress.addressLine2 ? ', ' + activeAddress.addressLine2 : ''),
        city: activeAddress.city || prev.city,
        state: activeAddress.state || prev.state,
        pincode: activeAddress.pincode || prev.pincode
      }));
    }
  }, [selectedAddressId, savedAddresses]);

  // Geolocation and Reverse Geocoding via Nominatim API with autonomic self-recovery retries
  const performReverseGeocode = async (latitude: number, longitude: number, retryCount = 0): Promise<void> => {
    try {
      // zoom=18 → street-level detail | accept-language=en → English output
      // User-Agent required by Nominatim ToS to avoid throttling
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'ElevezShop/1.0 (elevez.shop)' } }
      );
      if (!res.ok) throw new Error('Nominatim server returned non-ok response');
      const data = await res.json();

      const a = data.address || {};

      // --- Address Line 1: house/building number + road/street ---
      const houseNo = a.house_number || a.building || '';
      const road    = a.road || a.footway || a.pedestrian || a.path || a.street || a.construction || '';
      const line1   = [houseNo, road].filter(Boolean).join(', ')
                      || data.display_name?.split(',')[0]?.trim()
                      || '';

      // --- Address Line 2: locality / neighbourhood (sub-area within city) ---
      // For India: neighbourhood → suburb → quarter → hamlet → locality (in priority order)
      const line2 = a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.locality || '';

      // --- City ---
      // For India: city/town appears for metros; city_block/municipality for smaller towns.
      // state_district often holds the correct district name (e.g. "Hyderabad", "Bengaluru Urban").
      // We do NOT use `village` here — that's a sub-locality, not a city name.
      const city =
        a.city        ||
        a.town        ||
        a.city_block  ||
        a.municipality ||
        a.state_district ||
        a.county      ||
        a.village     ||
        '';

      // --- State ---
      const state = a.state || '';

      // --- Pincode ---
      const pincode = a.postcode || '';

      setNewAddressForm(prev => ({
        ...prev,
        addressLine1: line1,
        addressLine2: line2,
        city: city,
        state: state,
        pincode: pincode
      }));

      setLocationCoords({ lat: latitude, lon: longitude });
      setIsAddingNewAddress(true); // Switch to manual form so they can confirm/edit details
      setDetectingLocation(false);
    } catch (error) {
      console.error(`Reverse geocoding attempt ${retryCount + 1} failed:`, error);
      if (retryCount < 2) {
        // Autonomic retry: delay 1.5s and retry reverse geocoding to bypass rate limits or transient issues
        setTimeout(() => {
          performReverseGeocode(latitude, longitude, retryCount + 1);
        }, 1500);
      } else {
        setLocationError('Reverse geocoding failed after retries. Please enter address details manually.');
        setDetectingLocation(false);
      }
    }
  };

  const handleAutoChooseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    setLocationError(null);

    const requestPosition = (highAccuracy: boolean, isFallbackAttempt: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await performReverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error(`Geolocation error (highAccuracy=${highAccuracy}):`, error);
          if (highAccuracy && (error.code === 3 || error.code === 2)) {
            // Autonomic retry: timeout or position unavailable, fallback to low accuracy
            console.log('Autonomic recovery: Retrying with low accuracy and longer timeout...');
            requestPosition(false, true);
            return;
          }
          
          let errorMsg = 'Could not acquire location. Please try entering it manually.';
          if (error.code === 1) {
            errorMsg = 'Location request blocked or denied. If you are on Android/Mobile: please close any active overlays (like Facebook Messenger chat heads), active screen recorders, or screen-dimmer apps, then click "Use Current Location" again. Alternatively, add your address manually below.';
          } else if (error.code === 3) {
            errorMsg = 'Location detection timed out. Please try again or enter your address manually.';
          }
          
          setLocationError(errorMsg);
          setDetectingLocation(false);
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 8000 : 15000, 
          maximumAge: 10000 
        }
      );
    };

    // Start with high accuracy
    requestPosition(true, false);
  };

  const handleMapLocationChange = (lat: number, lon: number) => {
    setLocationCoords({ lat, lon });
    // Perform geocoding to update fields in real-time as pin moves
    performReverseGeocode(lat, lon);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Auth state — simple onAuthStateChanged only (we use popup sign-in, no redirect)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || firebaseUser.displayName || '',
          email: prev.email || firebaseUser.email || ''
        }));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);


  // Place order automatically if login was triggered via the Place Order button
  useEffect(() => {
    if (user && shouldPlaceOrderAfterLogin.current) {
      shouldPlaceOrderAfterLogin.current = false;
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }
  }, [user]);

  // Handle Google Sign-In — popup on ALL devices (works on modern mobile browsers)
  // We intentionally avoid signInWithRedirect because getRedirectResult silently fails
  // when authDomain differs from the app's domain, causing the "SIGN IN" button to reappear.
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will pick up the new user automatically
      // Profile creation happens as a side-effect
      try {
        await ensureUserExists(result.user.email || '', result.user.uid, {
          name: result.user.displayName || '',
          source: 'signup'
        });
      } catch (profileError) {
        console.error('Profile creation error (non-fatal):', profileError);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup — do nothing
        return;
      }
      console.error('Google Sign-In error:', error);
      alert('Sign in failed: ' + (error.message || 'Please try again.'));
    }
  };

  // State for address autocomplete suggestions
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Enforce shipping threshold of 650. COD adds an extra 30.
  const baseShippingCost = cartTotal >= 650 ? 0 : 50;
  const expressFee = shippingMethod === 'express' ? 50 : 0;
  const codFee = formData.paymentMethod === 'cod' ? 30 : 0;
  const shippingCost = baseShippingCost + expressFee + codFee;
  
  const effectiveDiscountApplied = discountApplied || !!isExitDiscountApplied;
  const exitDiscountAmount = isExitDiscountApplied ? 15 : 0;
  const discountAmount = (discountApplied ? (cartTotal * discountPercentage) / 100 : 0) + exitDiscountAmount;
  const totalAmount = Math.max(0, cartTotal + shippingCost - discountAmount);

  // Save abandoned cart details to Firebase Firestore under 'abandoned_carts' collection
  useEffect(() => {
    if (items.length === 0) return;
    if (!formData.email && !formData.phone) return;

    const saveAbandonedCart = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, doc, setDoc } = await import('firebase/firestore');
        const { firebaseConfig } = await import('./firebaseConfig');
        
        let app;
        if (getApps().length > 0) {
          app = getApp();
        } else {
          app = initializeApp(firebaseConfig);
        }
        
        const db = getFirestore(app);
        const docId = user?.uid || formData.email || formData.phone;
        if (!docId) return;

        const cartDocRef = doc(db, 'abandoned_carts', docId);
        
        await setDoc(cartDocRef, {
          userId: user?.uid || null,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
            image: item.image || ''
          })),
          subtotal: cartTotal,
          totalAmount: totalAmount,
          lastUpdated: new Date().toISOString(),
          status: 'abandoned'
        });
      } catch (error) {
        console.error('Error logging abandoned cart:', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      saveAbandonedCart();
    }, 2500);

    return () => clearTimeout(debounceTimer);
  }, [formData, items, totalAmount]);

  // Handle discount code validation
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage('Please enter a discount code');
      return;
    }

    try {
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

  // Dynamic helper functions for the mobile sticky footer action bar
  const getStickyActionLabel = () => {
    if (authLoading) return 'LOADING...';
    if (!user) return 'SIGN IN TO PLACE ORDER';
    if (activeStep === 'cart') return `PROCEED TO ADDRESS • ₹${totalAmount.toFixed(0)}`;
    if (activeStep === 'shipping') {
      return selectedAddressId ? `PROCEED TO PAYMENT • ₹${totalAmount.toFixed(0)}` : 'ADD DELIVERY LOCATION';
    }
    return isSubmitting ? 'PROCESSING...' : `PLACE ORDER • ₹${totalAmount.toFixed(0)}`;
  };

  const handleStickyAction = () => {
    if (authLoading) return; // Don't do anything while auth is resolving
    if (!user) {
      handleGoogleSignIn();
      return;
    }
    if (activeStep === 'cart') {
      setActiveStep('shipping');
      // If no addresses saved, immediately open the manual add-address form
      if (savedAddresses.length === 0) {
        setIsAddressModalOpen(true);
        setIsAddingNewAddress(true); // go straight to the manual form
      }
      return;
    }
    if (activeStep === 'shipping') {
      if (!selectedAddressId) {
        setIsAddressModalOpen(true);
        return;
      }
      setActiveStep('payment');
      return;
    }
    // Submit the form
    handleSubmit(new Event('submit') as any);
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

    if (!user) {
      handleGoogleSignIn();
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
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
          image: item.image || '',
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
            await checkoutDiscountService.recordUsage(discountCode, user?.uid);
            console.log(`✅ Discount usage recorded for code: ${discountCode}`);
          } catch (discountError) {
            console.error('Error recording discount usage:', discountError);
          }
        }

        setConfirmedTotal(totalAmount);
        clearCart();

        // Delete abandoned cart document on order success
        try {
          const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
          const { getApp } = await import('firebase/app');
          const db = getFirestore(getApp());
          const docId = user?.uid || formData.email || formData.phone;
          if (docId) {
            await deleteDoc(doc(db, 'abandoned_carts', docId));
          }
        } catch (err) {
          console.error('Error removing abandoned cart:', err);
        }

        setOrderPlaced(true);
      } else {
        console.error('Error saving order:', result.error);
        // Still show success page even if save fails for demo purposes
        setConfirmedTotal(totalAmount);
        clearCart();
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error during order submission:', error);
      // Still show success page even if save fails for demo purposes
      setConfirmedTotal(totalAmount);
      clearCart();
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
      <div className="min-h-screen pt-32 pb-20 bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center px-4"
        >
          <div className="bg-white border-[4px] md:border-[6px] border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_#000] md:shadow-[16px_16px_0px_0px_#000]">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-black text-[#00ff88] border-[3px] border-black flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[4px_4px_0px_0px_#000]">
              <Check className="w-8 h-8 md:w-12 md:h-12" />
            </div>
            <h1 className="text-2xl md:text-5xl font-black uppercase mb-4 md:mb-6 font-syne text-black leading-tight">Order Placed!</h1>
            <p className="text-sm md:text-lg font-bold uppercase text-black/70 mb-6 md:mb-8">
              Thank you, {formData.fullName}. We've sent a confirmation email to {formData.email}.
            </p>
            <div className="bg-gray-100 border-[3px] border-black p-4 md:p-6 mb-6 md:mb-10 shadow-[4px_4px_0px_0px_#000] text-left space-y-3 md:space-y-4">
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <span className="text-xs md:text-sm font-black uppercase text-black/60">Order Total</span>
                <span className="text-lg md:text-2xl font-black text-black">₹{confirmedTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm border-t-2 border-dashed border-black/10 pt-2">
                <span className="text-xs md:text-sm font-black uppercase text-black/60">Payment Method</span>
                <span className="font-black text-black uppercase">{formData.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</span>
              </div>
              {orderId && (
                <div className="flex justify-between items-center text-xs md:text-sm border-t-2 border-dashed border-black/10 pt-2">
                  <span className="text-xs md:text-sm font-black uppercase text-black/60">Order ID</span>
                  <span className="font-mono font-black text-black select-all">{orderId}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/account?tab=orders"
                className="inline-block bg-[#00ff88] text-black py-3.5 md:py-5 px-6 md:px-10 border-[3px] md:border-[4px] border-black font-black uppercase text-sm md:text-xl shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] transition-all tracking-widest"
              >
                View Your Orders
              </Link>
              <Link
                to="/"
                className="inline-block bg-white text-black py-3.5 md:py-5 px-6 md:px-10 border-[3px] md:border-[4px] border-black font-black uppercase text-sm md:text-xl shadow-[4px_4px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] transition-all tracking-widest"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-48 pb-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-8">
            <button onClick={() => navigate(-1)} className="w-8 h-8 md:w-12 md:h-12 bg-black text-[#00ff88] flex items-center justify-center border-[2px] md:border-[3px] border-black shadow-[2px_2px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] md:hover:translate-x-[2px] hover:translate-y-[1px] md:hover:translate-y-[2px] hover:shadow-none transition-all" type="button">
              <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <h1 className="text-3xl md:text-6xl font-black font-syne uppercase text-black leading-none">Checkout</h1>
          </div>

          {/* Reservation Countdown Alert */}
          <div className="bg-red-500 text-white border-[3px] border-black p-3.5 shadow-[4px_4px_0px_0px_#000] mb-6 flex items-center justify-between font-black uppercase text-[10px] md:text-xs tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-sm">⏱️</span>
              <span className="animate-pulse">Order Reserved! Your cart is locked to guarantee stock.</span>
            </div>
            <span className="font-mono bg-black text-[#00ff88] px-2.5 py-0.5 border border-black text-xs">{formatTime(timeLeft)}</span>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="relative mb-8 pt-4">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-black -translate-y-1/2 z-0" />
            <div className="relative flex justify-between z-10">
              <button
                type="button"
                onClick={() => setActiveStep('cart')}
                className="flex flex-col items-center gap-1 bg-white px-2 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full border-[3px] border-black flex items-center justify-center font-black text-xs transition-all shadow-[2px_2px_0px_0px_#000] ${activeStep === 'cart' ? 'bg-[#00ff88] text-black scale-110' : 'bg-black text-white hover:bg-zinc-800'}`}>
                  1
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${activeStep === 'cart' ? 'text-black' : 'text-black/60'}`}>Cart Review</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    handleGoogleSignIn();
                    return;
                  }
                  setActiveStep('shipping');
                }}
                className="flex flex-col items-center gap-1 bg-white px-2 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full border-[3px] border-black flex items-center justify-center font-black text-xs transition-all shadow-[2px_2px_0px_0px_#000] ${activeStep === 'shipping' ? 'bg-[#00ff88] text-black scale-110' : (activeStep === 'payment' ? 'bg-black text-[#00ff88]' : 'bg-white text-black hover:bg-zinc-100')}`}>
                  2
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${activeStep === 'shipping' ? 'text-black' : 'text-black/60'}`}>Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    handleGoogleSignIn();
                    return;
                  }
                  if (!selectedAddressId) {
                    alert('Please select or add a delivery address first.');
                    return;
                  }
                  setActiveStep('payment');
                }}
                className="flex flex-col items-center gap-1 bg-white px-2 focus:outline-none"
              >
                <div className={`w-8 h-8 rounded-full border-[3px] border-black flex items-center justify-center font-black text-xs transition-all shadow-[2px_2px_0px_0px_#000] ${activeStep === 'payment' ? 'bg-[#00ff88] text-black scale-110' : 'bg-white text-black hover:bg-zinc-100'}`}>
                  3
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${activeStep === 'payment' ? 'text-black' : 'text-black/60'}`}>Payment</span>
              </button>
            </div>
          </div>

          {/* Step Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-3.5 bg-yellow-100 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 animate-bounce text-black" />
                <div>
                  <p className="text-xs font-black uppercase text-black leading-none">
                    {shippingMethod === 'express' ? 'Next Day Dispatch (Express)' : 'Delivering in 3-4 Days'}
                  </p>
                  <p className="text-[9px] font-bold uppercase text-black/60 mt-0.5">
                    {shippingMethod === 'express' ? 'Express priority delivery active' : 'Standard courier route active'}
                  </p>
                </div>
              </div>
              <span className="bg-black text-[#00ff88] text-[9px] font-black px-2 py-0.5 border border-black uppercase">
                {items.length} items
              </span>
            </div>

            <div className="p-3.5 bg-red-50 border-[3px] border-red-500 shadow-[3px_3px_0px_0px_#ef4444] flex items-center gap-3">
              <span className="text-lg">🔥</span>
              <div>
                <p className="text-[10px] font-black uppercase text-red-600 leading-none">High Demand Period</p>
                <p className="text-[9px] font-bold uppercase text-red-600/70 mt-0.5">27 rebels are checking out right now. Stock is reserved temporarily.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: CART & SAVINGS DETAILS */}
              {activeStep === 'cart' && (
                <motion.div
                  key="cart-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
                  <h3 className="text-lg font-black uppercase font-syne text-black border-b-[2px] border-black pb-2">Cart Review</h3>
                  
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item) => (
                      <div key={item.cartId} className="flex gap-4 items-center justify-between pb-4 border-b border-dashed border-black/10 last:border-0 last:pb-0">
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-16 border-[2px] border-black overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs uppercase text-black leading-tight mb-0.5">{item.name}</h4>
                            <p className="text-[9px] font-bold uppercase text-black opacity-60">SIZE: {item.size} • COLOR: {item.color}</p>
                            <p className="text-black font-black text-xs mt-0.5 uppercase">₹{item.price.toFixed(0)}</p>
                          </div>
                        </div>

                        {/* Neobrutalist Quantity Adjustment Box */}
                        <div className="flex items-center border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000]">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                addToCart(item, item.size, item.color, -1, false);
                              } else {
                                removeFromCart(item.cartId);
                              }
                            }}
                            className="w-7 h-7 bg-white text-black font-black flex items-center justify-center border-none outline-none hover:bg-red-500 hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-black text-xs text-black">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item, item.size, item.color, 1, false)}
                            className="w-7 h-7 bg-white text-black font-black flex items-center justify-center border-none outline-none hover:bg-[#00ff88] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000]">
                  <h3 className="text-xs font-black uppercase text-black mb-3">Coupons & Offers</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountMessage('');
                      }}
                      placeholder="ENTER PROMO CODE"
                      className="flex-1 bg-white border-[2.5px] border-black px-3 py-2 font-black uppercase focus:bg-[#00ff88] transition-colors outline-none text-xs"
                      disabled={discountApplied}
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={discountApplied}
                      className="px-5 py-2 bg-black text-[#00ff88] border-[2.5px] border-black font-black uppercase text-xs hover:bg-[#00ff88] hover:text-black transition-all shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      {discountApplied ? '✓' : 'APPLY'}
                    </button>
                  </div>
                  {discountMessage && (
                    <p className={`text-[9px] font-black uppercase mt-2 ${discountApplied ? 'text-green-600' : 'text-red-500'}`}>
                      {discountMessage}
                    </p>
                  )}
                </div>

                {/* Bill details */}
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] space-y-3">
                  <h3 className="text-lg font-black uppercase font-syne text-black border-b-[2px] border-black pb-2">Bill Summary</h3>
                  <div className="flex justify-between text-xs font-bold uppercase text-black/60">
                    <span>Item Total</span>
                    <span>₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase text-black/60">
                    <span>Delivery Fee</span>
                    {baseShippingCost > 0 ? (
                      <span className="text-black font-bold">₹{baseShippingCost}</span>
                    ) : (
                      <span className="text-green-600 font-black">FREE</span>
                    )}
                  </div>
                  {shippingMethod === 'express' && (
                    <div className="flex justify-between text-xs font-bold uppercase text-black/60">
                      <span>Express Shipping Upgrade</span>
                      <span className="text-black font-bold">₹50</span>
                    </div>
                  )}
                  {formData.paymentMethod === 'cod' && (
                    <div className="flex justify-between text-xs font-bold uppercase text-black/60">
                      <span>Cash On Delivery Fee</span>
                      <span className="text-black font-bold">₹30</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold uppercase text-black/60">
                    <span>Handling Fee</span>
                    <span className="text-green-600 font-black">FREE</span>
                  </div>
                  {effectiveDiscountApplied && (
                    <div className="flex justify-between text-xs font-black uppercase text-green-600">
                      <span>Discount Applied ({effectiveDiscountPercentage}%){!discountApplied && ' [Exit-Intent]'}</span>
                      <span>-₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black pt-3 border-t-[2.5px] border-black text-black font-syne uppercase">
                    <span>To Pay</span>
                    <span>₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Savings box */}
                <div className="p-4 bg-green-50 border-[3px] border-green-600 shadow-[3px_3px_0px_0px_#059669] text-green-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">SAVED</span>
                    <span className="text-[10px] font-black uppercase">Yay! You saved money on this order!</span>
                  </div>
                  <span className="text-xs font-black">₹{effectiveDiscountApplied ? (discountAmount + 80).toFixed(0) : '80'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('shipping');
                  }}
                  className="w-full bg-[#00ff88] text-black border-[3px] border-black font-black uppercase text-xs md:text-sm py-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Proceed to Delivery Address
                </button>
                </motion.div>
              )}

              {/* STEP 2: DELIVERY ADDRESS SELECTION */}
              {activeStep === 'shipping' && (
                <motion.div
                  key="shipping-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                
                {/* Active address summary */}
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
                  <div className="flex justify-between items-center border-b-[2px] border-black pb-2">
                    <h3 className="text-lg font-black uppercase font-syne text-black">Delivery Location</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewAddress(false);
                        setIsAddressModalOpen(true);
                      }}
                      className="bg-black text-[#00ff88] border-[2px] border-black px-3 py-1 font-black text-[9px] uppercase hover:bg-[#00ff88] hover:text-black transition-all"
                    >
                      Choose / Switch
                    </button>
                  </div>

                  {activeAddress ? (
                    <div className="p-4 bg-[#00ff88]/10 border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000]">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-black" />
                        <span className="font-black text-xs uppercase bg-black text-[#00ff88] px-2 py-0.5">{activeAddress.label}</span>
                      </div>
                      <p className="text-sm font-black uppercase text-black">{activeAddress.fullName}</p>
                      <p className="text-xs font-bold uppercase text-black/70 mt-1">{activeAddress.address}, {activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}</p>
                      <p className="text-xs font-black uppercase text-black mt-2">PHONE: {activeAddress.phone}</p>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 border-[2px] border-dashed border-black/30">
                      <p className="text-xs font-black uppercase text-black/50 mb-3">No delivery address selected</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setIsAddressModalOpen(true);
                        }}
                        className="bg-black text-[#00ff88] px-4 py-2 border-[2px] border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  )}
                </div>

                {/* Shipping Method Option */}
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] space-y-3">
                  <h3 className="text-sm font-black uppercase text-black border-b-[2px] border-black pb-2 font-syne">Shipping Method</h3>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between p-3 border-[2.5px] border-black cursor-pointer transition-all ${shippingMethod === 'standard' ? 'bg-[#00ff88]/20 shadow-[3px_3px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="w-4 h-4 accent-black shrink-0 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black uppercase text-black leading-none">Standard Delivery</p>
                          <p className="text-[9px] font-bold uppercase text-black/50 mt-1">3-4days all over india</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase text-green-600">FREE</span>
                    </label>

                    <label className={`flex items-center justify-between p-3 border-[2.5px] border-black cursor-pointer transition-all ${shippingMethod === 'express' ? 'bg-[#00ff88]/20 shadow-[3px_3px_0px_0px_#000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="w-4 h-4 accent-black shrink-0 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black uppercase text-black leading-none">Express Shipping</p>
                          <p className="text-[9px] font-bold uppercase text-black/50 mt-1">(next day dispatch)</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-black">₹50 Extra</span>
                    </label>
                  </div>
                </div>

                {/* Instant sign-in fallback check */}
                {!user && (
                  <div className="bg-gray-100 border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-black">Sign in with Google</h4>
                      <p className="text-[9px] text-black/60 font-bold uppercase">Keep your delivery details synced</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="bg-black text-[#00ff88] border-[2px] border-black px-4 py-2 font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_#000]"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAddressId) {
                      alert('Please configure your delivery location.');
                      return;
                    }
                    setActiveStep('payment');
                  }}
                  className="w-full bg-[#00ff88] text-black border-[2.5px] border-black font-black uppercase text-xs md:text-sm py-3 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all"
                >
                  Proceed to Payment Selection
                </button>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT METHOD SELECTION */}
              {activeStep === 'payment' && (
                <motion.div
                  key="payment-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                
                {/* To Pay Header */}
                <div className="bg-white border-[4px] border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
                  <div className="flex justify-between items-center border-b-[2px] border-black pb-2">
                    <h3 className="text-lg font-black uppercase font-syne text-black">Payment Selection</h3>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-black/50">TO PAY</p>
                      <p className="text-lg font-black text-black">₹{totalAmount.toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Payment selections list matching Zepto */}
                  <div className="space-y-4">
                    
                    {/* Recommended UPI options */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-black/50 block mb-2">Recommended UPI</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, paymentMethod: 'upi' }));
                            handleSubmit(new Event('submit') as any);
                          }}
                          className="flex items-center justify-center gap-1.5 p-3 bg-white border-[2.5px] border-black font-black uppercase text-[10px] sm:text-xs text-black shadow-[2.5px_2.5px_0px_0px_#000] hover:bg-black hover:text-[#00ff88] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          Google Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, paymentMethod: 'upi' }));
                            handleSubmit(new Event('submit') as any);
                          }}
                          className="flex items-center justify-center gap-1.5 p-3 bg-white border-[2.5px] border-black font-black uppercase text-[10px] sm:text-xs text-black shadow-[2.5px_2.5px_0px_0px_#000] hover:bg-black hover:text-[#00ff88] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          PhonePe
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, paymentMethod: 'upi' }));
                            handleSubmit(new Event('submit') as any);
                          }}
                          className="flex items-center justify-center gap-1.5 p-3 bg-white border-[2.5px] border-black font-black uppercase text-[10px] sm:text-xs text-black shadow-[2.5px_2.5px_0px_0px_#000] hover:bg-black hover:text-[#00ff88] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          Paytm / Other
                        </button>
                      </div>
                    </div>

                    {/* Pay by Card */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-black/50 block mb-2">Credit & Debit Cards</span>
                      <label className={`flex items-start gap-4 p-4 border-[2.5px] border-black cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'bg-[#00ff88] shadow-[4px_4px_0px_0px_#000]' : 'bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleInputChange}
                          className="mt-1 w-5 h-5 accent-black shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-xs uppercase text-black leading-none">Pay via Credit or Debit Card</p>
                          </div>
                          <p className="text-[9px] font-bold uppercase text-black opacity-60">Visa, Mastercard, RuPay cards supported</p>
                        </div>
                      </label>
                    </div>

                    {/* Cash on Delivery */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-black/50 block mb-2">Cash on Delivery</span>
                      <label className={`flex items-start gap-4 p-4 border-[2.5px] border-black cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'bg-[#00ff88] shadow-[4px_4px_0px_0px_#000]' : 'bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="mt-1 w-5 h-5 accent-black shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-xs uppercase text-black leading-none">Cash on Delivery (COD)</p>
                          </div>
                          <p className="text-[9px] font-bold uppercase text-black opacity-60">Pay by cash or UPI on delivery (Includes +₹30 handling fee)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Instant sign-in fallback check */}
                {!user && (
                  <div className="bg-gray-100 border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-black">Sign in with Google</h4>
                      <p className="text-[9px] text-black/60 font-bold uppercase">Keep your delivery details synced</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="bg-black text-[#00ff88] border-[2px] border-black px-4 py-2 font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_#000]"
                    >
                      Sign In
                    </button>
                  </div>
                )}

{/* Points section — disabled */}

                <button
                  type={user ? "submit" : "button"}
                  onClick={async (e) => {
                    if (!user) {
                      e.preventDefault();
                      shouldPlaceOrderAfterLogin.current = true;
                      await handleGoogleSignIn();
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full font-black text-xs md:text-sm py-3 border-[2.5px] border-black transition-all uppercase tracking-widest ${isSubmitting ? 'bg-gray-400 text-black cursor-not-allowed' : 'bg-[#00ff88] text-black shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'}`}
                >
                  {isSubmitting ? 'PROCESSING...' : (!user ? 'SIGN IN WITH GOOGLE & PLACE ORDER' : `PAY & PLACE ORDER • ₹${totalAmount.toFixed(0)}`)}
                </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* ADDRESS SELECTION / DRAWER POPUP */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9996] flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-black p-6 w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black text-[#00ff88] border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              type="button"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-black font-syne uppercase text-black mb-6">Select Address</h3>

            {!isAddingNewAddress ? (
              <div className="space-y-6">
                

                {/* Saved addresses list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-black/50">Saved Locations</span>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setIsAddressModalOpen(false);
                      }}
                      className={`p-4 border-[2.5px] border-black cursor-pointer transition-all ${selectedAddressId === addr.id ? 'bg-[#00ff88]/10 shadow-[3px_3px_0px_0px_#000]' : 'bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]'}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <HomeIcon size={14} className="text-black" />
                        <span className="font-black text-[9px] uppercase bg-black text-[#00ff88] px-1.5 py-0.5">{addr.label}</span>
                      </div>
                      <p className="text-xs font-black uppercase text-black">{addr.fullName}</p>
                      <p className="text-[10px] font-bold uppercase text-black/60 mt-0.5">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        , {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-[9px] font-black text-black mt-1">
                        TEL: {addr.landline}
                        {addr.backupPhone ? ` / ${addr.backupPhone}` : ''}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewAddressForm({
                      label: 'Home',
                      fullName: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      pincode: '',
                      landline: '',
                      backupPhone: ''
                    });
                    setLocationCoords(null);
                    setIsAddingNewAddress(true);
                    setLocationError(null);
                  }}
                  className="w-full bg-white text-black border-[2.5px] border-black font-black uppercase py-2.5 shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs"
                >
                  + Add New Address Manually
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase text-black/50 block">New Address Details</span>
                
                {/* Geolocation Map Preview */}
                {locationCoords && (
                  <MapPreview 
                    lat={locationCoords.lat} 
                    lon={locationCoords.lon} 
                    onLocationChange={handleMapLocationChange} 
                  />
                )}

                {/* Form fields */}
                <div className="space-y-3">
                  {/* Address Type Buttons */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">Location Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setNewAddressForm(prev => ({ ...prev, label }))}
                          className={`flex-1 py-1.5 border-[2px] border-black font-black uppercase text-[10px] transition-all ${newAddressForm.label === label ? 'bg-black text-[#00ff88]' : 'bg-white text-black'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newAddressForm.fullName}
                      onChange={(e) => setNewAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                      placeholder="RECIPIENT NAME"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={newAddressForm.addressLine1}
                      onChange={(e) => setNewAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                      placeholder="STREET NAME, HOUSE NO, APARTMENT"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={newAddressForm.addressLine2}
                      onChange={(e) => setNewAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                      placeholder="AREA, LANDMARK, SECTOR"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">City</label>
                      <input
                        type="text"
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                        placeholder="CITY"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">State</label>
                      <input
                        type="text"
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                        placeholder="STATE"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">Pincode</label>
                      <input
                        type="text"
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, pincode: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                        placeholder="6-DIGIT PIN"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">Landline</label>
                      <input
                        type="text"
                        value={newAddressForm.landline}
                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, landline: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                        placeholder="10-DIGIT LANDLINE"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black mb-1">Backup Phone (Optional)</label>
                      <input
                        type="text"
                        value={newAddressForm.backupPhone}
                        onChange={(e) => setNewAddressForm(prev => ({ ...prev, backupPhone: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full bg-white border-[2px] border-black p-2 text-xs text-black font-black uppercase outline-none"
                        placeholder="10-DIGIT BACKUP"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="flex-1 bg-white text-black border-[2px] border-black font-black uppercase py-2 text-xs hover:bg-zinc-100 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAddressForm.fullName || !newAddressForm.addressLine1 || !newAddressForm.city || !newAddressForm.state || !newAddressForm.pincode || !newAddressForm.landline) {
                        alert('Please fill in all required address fields.');
                        return;
                      }
                      // Strict 6 digit pincode validation
                      if (!/^[0-9]{6}$/.test(newAddressForm.pincode)) {
                        alert('Pincode must be exactly 6 digits.');
                        return;
                      }
                      // Strict 10 digit landline validation
                      if (!/^[0-9]{10}$/.test(newAddressForm.landline)) {
                        alert('Landline must be exactly 10 digits.');
                        return;
                      }
                      // Optional 10 digit backup phone validation
                      if (newAddressForm.backupPhone && !/^[0-9]{10}$/.test(newAddressForm.backupPhone)) {
                        alert('Backup phone number must be exactly 10 digits.');
                        return;
                      }

                      const id = 'addr-' + Date.now();
                      const newAddr = {
                        id,
                        ...newAddressForm
                      };
                      setSavedAddresses(prev => [...prev, newAddr]);
                      setSelectedAddressId(id);
                      setIsAddingNewAddress(false);
                      setIsAddressModalOpen(false);
                    }}
                    className="flex-1 bg-[#00ff88] text-black border-[2px] border-black font-black uppercase py-2 text-xs shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#000] transition-all"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STICKY FOOTER ON MOBILE SCREEN SIZES */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '3px solid #000',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9995,
          boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        }}>
          <div>
            <span className="text-[9px] font-black uppercase text-black/60 block leading-tight">Total Bill</span>
            <span className="text-lg font-black text-black font-syne">₹{totalAmount.toFixed(0)}</span>
          </div>
          <button
            type="button"
            onClick={handleStickyAction}
            className="bg-[#00ff88] text-black border-[2px] border-black font-black uppercase text-xs py-2.5 px-5 shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            {getStickyActionLabel()}
          </button>
        </div>
      )}
      {/* Checkout Exit Intent Popup */}
      <CheckoutExitPopup 
        isOpen={isCheckoutExitOpen} 
        onClose={() => setIsCheckoutExitOpen(false)} 
        onApplyDiscount={() => setIsExitDiscountApplied(true)} 
      />
    </div>
  );
}

// Account Page Component
const Account: React.FC<{ setCursorVariant: (variant: CursorVariant) => void }> = ({ setCursorVariant }) => {
  useSEO({
    title: 'My Account - Loyalty Rewards',
    description: 'Manage your profile, view orders, check your syndicate loyalty points, and redeem custom discount codes.',
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  // Normalize tab
  const normalizedTab = ['orders', 'wishlist'].includes(activeTab) ? activeTab : 'orders';
  const displayTab = normalizedTab;

  const [user, setUser] = useState<any>(() => auth.currentUser);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!!auth.currentUser);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { addToCart } = useCart();

  const {
    profile: loyaltyProfile,
    tierInfo: loyaltyTierInfo,
    nextTier: loyaltyNextTier,
    pointsToNextTier: loyaltyPointsToNextTier,
    tierProgress: loyaltyTierProgress,
  } = useLoyalty();

  // Dynamic rules state for Earn & Redeem tab
  const [dynamicRules, setDynamicRules] = useState<any>(null);
  const [earningRate, setEarningRate] = useState<number>(0.1);
  const [tierThresholds, setTierThresholds] = useState<any[]>([]);

  // Load dynamic rules
  useEffect(() => {
    const loadRules = async () => {
      try {
        const rules = await loyaltyRulesService.getRules();
        setDynamicRules(rules);
        setEarningRate(rules?.pointsEarning?.pointsPerDollar ?? 0.1);
        setTierThresholds(rules?.tiers || []);
      } catch (error) {
        console.error('❌ Error loading loyalty rules:', error);
      }
    };

    loadRules();

    const unsubscribe = loyaltyRulesService.onRulesChange((rules) => {
      setDynamicRules(rules);
      setEarningRate(rules?.pointsEarning?.pointsPerDollar ?? 0.1);
      setTierThresholds(rules?.tiers || []);
    });

    return () => unsubscribe();
  }, []);

  // Auth — simple onAuthStateChanged only (popup sign-in, no redirect)
  useEffect(() => {
    const hasLoadedRef = { current: false };
    // If already signed in synchronously, kick off data load immediately
    if (auth.currentUser) {
      hasLoadedRef.current = true;
      loadUserData(auth.currentUser.uid);
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
          await loadUserData(currentUser.uid);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user data - COMPREHENSIVE AUTO-LOADER
  const loadUserData = async (userId: string) => {
    try {
      console.log('🔄 Auto-loading all user data for:', userId);

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

      return cleanup;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In — popup on ALL devices
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged fires with the new user automatically
      try {
        await ensureUserExists(result.user.email || '', result.user.uid, {
          name: result.user.displayName || '',
          source: 'signup'
        });
      } catch (profileError) {
        console.error('Profile creation error (non-fatal):', profileError);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Sign-In error:', error);
      alert('Sign in failed: ' + (error.message || 'Please try again.'));
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = async (productId: number) => {
    if (!user) return;

    try {
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
      <div className="min-h-screen pt-48 pb-20 bg-white flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-xl w-full">
          <div className="bg-white border-[6px] sm:border-[8px] border-black p-6 sm:p-16 shadow-[12px_12px_0px_0px_#00ff88] sm:shadow-[24px_24px_0px_0px_#00ff88] text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black text-[#00ff88] border-[3px] sm:border-[4px] border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
              <User size={36} className="sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black mb-6 font-syne uppercase text-black leading-none">Access Restricted</h1>
            <p className="text-sm sm:text-xl font-bold text-black uppercase mb-8 sm:mb-12 opacity-70">Please sign in to view your account, orders, and wishlist.</p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-black text-[#00ff88] py-4 lg:py-3 px-4 lg:px-5 border-[3px] border-black font-black flex items-center justify-center gap-3 lg:gap-2 shadow-[6px_6px_0px_0px_#00ff88] lg:shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[4px] lg:hover:translate-x-[2px] hover:translate-y-[4px] lg:hover:translate-y-[2px] transition-all text-lg lg:text-sm uppercase tracking-[0.1em] lg:tracking-wider"
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

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Compact header strip: avatar + name + logout */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-[2px] border-black/10">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full border-[2px] border-black object-cover" />
              ) : (
                <div className="w-7 h-7 bg-black text-[#00ff88] border-[2px] border-black flex items-center justify-center">
                  <User size={14} />
                </div>
              )}
              <span className="text-xs font-black uppercase tracking-wider text-black truncate max-w-[160px]">
                {user.displayName || user.email || 'My Account'}
              </span>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-1.5 bg-black text-[#00ff88] px-3 py-1.5 border-[2px] border-black font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              <LogOut size={11} />
              Logout
            </button>
          </div>

          {/* Sticky Tab Grid — 2 columns, huge buttons */}
          <div className="sticky top-0 z-40 bg-white border-b-[3px] border-black mb-8 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10 pt-3 pb-3 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = displayTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSearchParams({ tab: tab.id })}
                    className={`flex items-center justify-center gap-3 px-4 py-4 border-[3px] border-black font-black uppercase text-xs sm:text-base tracking-widest transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                      isActive
                        ? 'bg-[#00ff88] text-black'
                        : 'bg-white text-black hover:bg-zinc-50'
                    }`}
                  >
                    <Icon size={18} className="sm:w-[20px] sm:h-[20px] shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[400px]">

            {displayTab === 'orders' && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-black" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-black">Order History</h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border-[2px] border-dashed border-black/20 rounded-none">
                    <Package size={40} className="text-black/10 mb-4" />
                    <p className="text-xs font-black uppercase text-black/30 mb-5">No orders yet</p>
                    <Link to="/shop/all" className="bg-black text-[#00ff88] px-6 py-2.5 border-[2px] border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...orders]
                      .sort((a, b) => {
                        const getDate = (orderObj: any) => {
                          const dateValue = orderObj?.orderDate || orderObj?.createdAt;
                          if (!dateValue) return 0;
                          if (typeof dateValue === 'string') return new Date(dateValue).getTime();
                          if (dateValue.seconds) return dateValue.seconds * 1000;
                          return new Date(dateValue).getTime();
                        };
                        return getDate(b) - getDate(a);
                      })
                      .map((order) => {
                        if (!order || !order.id) return null;

                        let orderDateStr = 'N/A';
                        let orderTimeStr = '';
                        try {
                          if (order.orderDate || order.createdAt) {
                            const dateValue = order.orderDate || order.createdAt;
                            const date = typeof dateValue === 'string' ? new Date(dateValue) : (dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue));
                            orderDateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                            orderTimeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                          }
                        } catch (e) {}

                        const s = (order.status || 'pending').toLowerCase();
                        const statusColor = s === 'delivered' ? 'bg-emerald-500 text-white' : s === 'shipped' ? 'bg-blue-500 text-white' : s === 'cancelled' ? 'bg-red-500 text-white' : 'bg-amber-400 text-black';
                        const total = order.totalAmount ?? order.total ?? 0;

                        const handleCardClick = () => {
                          navigate(`/order/${order.id}`);
                        };

                        const addressParts = [
                          order.shippingAddress?.street || order.shippingAddress?.line1 || order.address,
                          order.shippingAddress?.city || order.city,
                          order.shippingAddress?.state || order.state,
                          order.shippingAddress?.pincode || order.shippingAddress?.zip || order.pincode
                        ].filter(Boolean);

                        return (
                          <div key={order.id} className="border-[2px] border-black bg-white overflow-hidden">
                            {/* Top bar: order # + status */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-black">
                              <div className="flex items-center gap-2">
                                <Package size={12} className="text-[#00ff88]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">Order Details</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${statusColor}`}>
                                {order.status || 'Pending'}
                              </span>
                            </div>

                            {/* Date + time + total */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                              <div>
                                <p className="text-xs font-black text-black">{orderDateStr}</p>
                                {orderTimeStr && <p className="text-[10px] text-zinc-400 font-medium">{orderTimeStr}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-zinc-400">Total Paid</p>
                                <p className="text-lg font-black text-black">₹{total.toFixed(0)}</p>
                              </div>
                            </div>

                            {/* Items list */}
                            <div className="px-4 py-3 border-b border-black/10">
                              <p className="text-[9px] font-black uppercase text-zinc-400 mb-2">Items Ordered</p>
                              <div className="space-y-2">
                                {(order.items || []).map((item: any, i: number) => {
                                  const img = item.image || PRODUCTS.find(p => String(p.id) === String(item.id))?.image || '';
                                  return (
                                    <div key={i} className="flex items-center gap-3">
                                      {img && (
                                        <div className="w-9 h-11 border-[1.5px] border-black/20 shrink-0 overflow-hidden bg-zinc-100">
                                          <img src={img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-black truncate uppercase">{item.name}</p>
                                        <p className="text-[9px] text-zinc-400 font-medium">
                                          {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-black">₹{item.price}</p>
                                        <p className="text-[9px] text-zinc-400">×{item.quantity || 1}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Delivery address */}
                            {addressParts.length > 0 && (
                              <div className="px-4 py-3 border-b border-black/10 flex items-start gap-2">
                                <MapPin size={11} className="text-zinc-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">Deliver To</p>
                                  {(order.shippingAddress?.name || order.customerName) && (
                                    <p className="text-[11px] font-black text-black">{order.shippingAddress?.name || order.customerName}</p>
                                  )}
                                  <p className="text-[10px] text-zinc-500 leading-snug">{addressParts.join(', ')}</p>
                                </div>
                              </div>
                            )}

                            {/* Tracking Link (if available) */}
                            {order.trackingLink && (
                              <div className="px-4 pb-3">
                                <a
                                  href={order.trackingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center justify-center gap-2 bg-[#00ff88] text-black py-2 border-[1.5px] border-black font-black uppercase text-[10px] tracking-wider shadow-[2px_2px_0px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer w-full text-center"
                                >
                                  <Truck size={12} />
                                  Track Shipment
                                </a>
                              </div>
                            )}

                            {/* Payment + CTA */}
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <CreditCard size={11} className="text-zinc-400" />
                                <span className="text-[10px] font-black uppercase text-zinc-500">{order.paymentMethod || 'UPI'}</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                                className="flex items-center gap-1.5 bg-black text-[#00ff88] px-4 py-1.5 border-[1.5px] border-black font-black uppercase text-[9px] tracking-wider shadow-[2px_2px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                              >
                                <Eye size={10} />
                                View Full Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            {displayTab === 'wishlist' && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-black text-[#00ff88] border-[2px] sm:border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                    <Heart size={18} />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase font-syne text-black">Wishlist</h2>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white border-[3px] sm:border-[4px] border-black p-8 sm:p-16 text-center shadow-[6px_6px_0px_0px_#000]">
                    <Heart size={48} className="mx-auto mb-4 text-black opacity-10" />
                    <p className="text-sm sm:text-lg font-black text-black uppercase mb-6 opacity-50 italic">No assets saved.</p>
                    <Link to="/shop/all" className="inline-block bg-[#00ff88] text-black px-6 py-3 border-[2.5px] border-black font-black uppercase text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                      Browse All
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="bg-white border-[2.5px] border-black shadow-[3px_3px_0px_0px_#000] overflow-hidden group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-black">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          />
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white border-[2px] border-black text-[#ff007f] flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                          >
                            <Heart size={14} fill="currentColor" />
                          </button>
                        </div>
                        <div className="p-3 border-t-[2.5px] border-black">
                          <h3 className="font-black text-xs sm:text-sm text-black truncate uppercase tracking-tighter mb-1">{product.name}</h3>
                          <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase mb-2">{product.category}</p>
                          <p className="text-xs sm:text-sm font-black text-[#ff007f] mb-3">₹{product.price}</p>
                          <Link
                            to={`/product/${product.id}`}
                            className="block w-full bg-black text-[#00ff88] py-2 text-center border-[2px] border-black font-black uppercase text-[10px] tracking-wider shadow-[2px_2px_0px_0px_#fff] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

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
const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen pt-48 pb-24 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[4px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
          Privacy Policy
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-12 font-syne text-black uppercase leading-[0.9]">
          PRIVACY <span className="text-[#00ff88]" style={{ WebkitTextStroke: '2px black' }}>POLICY</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 border-[6px] border-black shadow-[12px_12px_0px_0px_#000] space-y-8 text-black font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">1. INFORMATION WE COLLECT</h2>
            <p>We collect information directly from you when you register, purchase products, or sign up for our loyalty rules program using Google authentication. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 font-bold uppercase">
              <li>Contact details (Name, email address, phone number, shipping address).</li>
              <li>Authentication profile information (Google ID and email profile).</li>
              <li>Transaction data (Items purchased, points accrued/redeemed).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">2. HOW WE USE YOUR INFORMATION</h2>
            <p>Your data is processed to deliver a customized streetwear shopping experience, specifically to:</p>
            <ul className="list-disc pl-6 space-y-2 font-bold uppercase">
              <li>Process and ship your product orders safely.</li>
              <li>Manage your ELEVEZ rewards points and custom tier benefits.</li>
              <li>Authenticate your identity securely via Firebase Authentication.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">3. SECURITY & STORAGE</h2>
            <p>Your authentication details are handled via Google Firebase with enterprise-grade security encryption. We do not sell or lease your personal data to third parties. We preserve your information only as long as necessary to manage your orders and loyalty status.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">4. CONTACT INFORMATION</h2>
            <p>If you have questions about your data or want to request deletion of your account, you can contact us at:</p>
            <p className="font-black text-xl bg-[#00ff88]/20 p-4 border-[3px] border-black inline-block">EMAIL: SUPPORT@ELEVEZ.SHOP</p>
          </section>
        </div>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen pt-48 pb-24 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="inline-block bg-black text-[#00ff88] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[4px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
          Terms of Service
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-12 font-syne text-black uppercase leading-[0.9]">
          TERMS OF <span className="text-[#00ff88]" style={{ WebkitTextStroke: '2px black' }}>SERVICE</span>
        </h1>
        
        <div className="bg-white p-8 md:p-12 border-[6px] border-black shadow-[12px_12px_0px_0px_#000] space-y-8 text-black font-medium leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">1. OVERVIEW</h2>
            <p>Welcome to ELEVEZ. This website is operated by ELEVEZ. Throughout the site, the terms "we", "us" and "our" refer to ELEVEZ. By visiting our site and/or purchasing from us, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">2. PURCHASES & PAYMENTS</h2>
            <p>We offer premium streetwear products for sale. Prices are subject to change without notice. We reserve the right to refuse or cancel any order for reasons including availability, errors in descriptions or prices, or fraud detection.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">3. REWARDS & ACCOUNTS</h2>
            <p>Account creation is handled securely through Google Single Sign-In via Firebase. Users earn points dynamically on successful orders which can be used to redeem customized discount coupons. Abuse of the points/tier system may result in account termination.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-2">4. LIMITATION OF LIABILITY</h2>
            <p>In no event shall ELEVEZ, our directors, employees, or affiliates be liable for any injury, loss, claim, or any direct or indirect damages arising from your use of any of our products or services.</p>
          </section>
        </div>
      </div>
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
        <button className="w-full bg-black text-[#00ff88] py-4 lg:py-3 border-[3px] lg:border-[2.5px] border-black font-black uppercase text-lg lg:text-sm tracking-[0.15em] shadow-[4px_4px_0px_0px_#000] lg:shadow-[3px_3px_0px_0px_#000] hover:bg-[#00ff88] hover:text-black transition-all">
          Transmit Message
        </button>
      </form>
    </div>
  </div>
);

// --- Navbar & Footer ---

// WhatsApp Icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.436 0 9.86-4.218 9.864-9.406.002-2.518-1.022-4.885-2.883-6.65-1.862-1.767-4.336-2.74-6.97-2.742-5.44 0-9.863 4.218-9.867 9.408 0 1.54.437 3.045 1.265 4.382l-.99 3.619 3.961-.963zM16.924 13.91c-.27-.136-1.597-.79-1.848-.882-.25-.093-.432-.136-.613.136-.18.273-.7 0-.88-.272-.18-.272-.364-.318-.636-.454-.272-.136-1.15-.424-2.19-1.355-.808-.72-1.353-1.61-1.512-1.882-.16-.272-.017-.419.118-.553.123-.122.27-.318.406-.477.136-.16.18-.272.27-.454.09-.182.046-.341-.022-.477-.068-.136-.613-1.477-.84-2.023-.22-.53-.443-.458-.613-.467-.16-.008-.34-.01-.522-.01-.18 0-.477.068-.727.341-.25.272-.954.932-.954 2.273 0 1.34.977 2.636 1.114 2.818.137.182 1.92 2.93 4.654 4.113.65.28 1.157.447 1.553.573.653.208 1.248.178 1.717.108.523-.078 1.598-.654 1.824-1.288.225-.633.225-1.177.157-1.288-.068-.11-.25-.19-.523-.326z"/>
  </svg>
);

// --- TOP HEADER (non-sticky, only at very top of page) ---
// Mobile: Logo | Account | MoreDots | Cart
// Desktop: Logo | Home | Accounts | PRODUCT | Cart | Contact
// FIX: All critical CSS (position, zIndex) via inline style — Tailwind CDN unreliable
const TopHeader = () => {
  const { items, setIsCartOpen, addToCart } = useCart();
  const location = useLocation();
  const currentPath = location.pathname;
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [logoClicks, setLogoClicks] = useState<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const newClicks = [...logoClicks.filter(t => now - t < 3000), now];
    setLogoClicks(newClicks);
    if (newClicks.length >= 5) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('dopamine_overdrive_trigger'));
      setLogoClicks([]);
    } else {
      audioService.playTick();
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleQuickAdd = (event: any) => {
      const { product, size, color, quantity } = event.detail;
      addToCart(product, size, color, quantity);
    };
    window.addEventListener('quickAddToCart', handleQuickAdd);
    return () => window.removeEventListener('quickAddToCart', handleQuickAdd);
  }, [addToCart]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9980,
        width: '100%',
      }}
    >
      {/* Liquid-glass bar */}
      <div style={{
        width: '100%',
        padding: isMobile ? '10px 16px' : '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(12,12,12,0.9) 0%, rgba(6,6,6,0.97) 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}>
        {/* LOGO */}
        <Link
          to="/"
          onClick={handleLogoClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: isMobile ? '56px' : '80px',
            textDecoration: 'none',
            userSelect: 'none',
          }}
        >
          <GlitchImage 
            src="/logo.png?v=5" 
            alt={BRAND_NAME} 
            imgClassName="h-14 md:h-20 w-auto object-contain"
            triggerOnHover={false} 
          />
        </Link>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { to: '/', label: 'Home', icon: <HomeIcon size={13} />, active: currentPath === '/' },
              { to: '/account', label: 'Accounts', icon: <User size={13} />, active: currentPath === '/account' },
            ].map(({ to, label, icon, active }) => (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                fontFamily: 'monospace', padding: '6px 14px', borderRadius: '999px',
                textDecoration: 'none', transition: 'all 0.2s',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#00ff88' : 'rgba(255,255,255,0.7)',
                border: active ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              }}>
                {icon}<span>{label}</span>
              </Link>
            ))}
            {/* PRODUCT */}
            <Link to="/shop/all" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'monospace', padding: '6px 20px', borderRadius: '999px',
              textDecoration: 'none', transition: 'all 0.2s',
              background: currentPath.startsWith('/shop') ? '#00ff88' : 'transparent',
              color: currentPath.startsWith('/shop') ? '#000' : 'rgba(255,255,255,0.7)',
              border: currentPath.startsWith('/shop') ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
              boxShadow: currentPath.startsWith('/shop') ? '0 0 22px rgba(0,255,136,0.7)' : 'none',
            }}>
              <Compass size={13} /><span>PRODUCT</span>
            </Link>
            {/* CART */}
            <button onClick={() => setIsCartOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'monospace', padding: '6px 14px', borderRadius: '999px',
              background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
            }}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <ShoppingBag size={13} />
                {totalItems > 0 && (
                  <motion.span key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1.5, 0.85, 1.1, 1], opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                    style={{
                      position: 'absolute', top: '-8px', right: '-10px',
                      minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '9px', fontWeight: 900,
                      background: '#00ff88', color: '#000', borderRadius: '999px',
                      boxShadow: '0 0 8px rgba(0,255,136,0.6)', padding: '0 2px',
                    }}
                  >{totalItems}</motion.span>
                )}
              </span>
              <span>CART</span>
            </button>
            {/* CONTACT */}
            <Link to="/contact" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
              fontFamily: 'monospace', padding: '6px 14px', borderRadius: '999px',
              textDecoration: 'none', transition: 'all 0.2s',
              background: currentPath === '/contact' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: currentPath === '/contact' ? '#00ff88' : 'rgba(255,255,255,0.7)',
              border: currentPath === '/contact' ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
            }}>
              <Mail size={13} /><span>Contact</span>
            </Link>
          </nav>
        )}

        {/* MOBILE: Menu (3 lines) + Account + Cart icons */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button onClick={() => setMoreOpen(v => !v)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '50%', background: 'transparent',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)',
            }}>
              <Menu size={19} />
            </button>
            <Link to="/account" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '50%', textDecoration: 'none',
              color: currentPath === '/account' ? '#00ff88' : 'rgba(255,255,255,0.75)',
              background: currentPath === '/account' ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}>
              <User size={19} />
            </Link>
            <button onClick={() => setIsCartOpen(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '50%', background: 'transparent',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', position: 'relative',
            }}>
              <ShoppingBag size={19} />
              {totalItems > 0 && (
                <motion.span key={totalItems}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [1.6, 0.8, 1.1, 1], opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 11 }}
                  style={{
                    position: 'absolute', top: '2px', right: '2px',
                    minWidth: '17px', height: '17px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '9px', fontWeight: 900,
                    background: '#00ff88', color: '#000', borderRadius: '999px',
                    boxShadow: '0 0 10px rgba(0,255,136,0.7)', padding: '0 2px',
                  }}
                >{totalItems}</motion.span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile 3-dot dropdown */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: '100%', right: '16px', marginTop: '8px',
              background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              minWidth: '160px', overflow: 'hidden', zIndex: 9990,
            }}
          >
            {[
              { to: '/', label: 'Home', icon: <HomeIcon size={15}/> },
              { to: '/shop/all', label: 'Products', icon: <Compass size={15}/> },
              { to: '/contact', label: 'Contact', icon: <Mail size={15}/> },
            ].map(({ to, label, icon }) => {
              const isActive = currentPath === to || (to === '/shop/all' && currentPath.startsWith('/shop'));
              return (
                <Link key={to} to={to} onClick={() => setMoreOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', fontFamily: 'monospace',
                  color: isActive ? '#00ff88' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                }}>
                  {icon}{label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// --- CART TIMER WIDGET (floating pill, right edge) ---
const CartTimerWidget = () => {
  const { setIsCartOpen, isCartOpen, secondsLeft, expired, isTimerVisible } = useCart();
  const location = useLocation();

  if (!isTimerVisible || isCartOpen || location.pathname === '/checkout') return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  const urgency = secondsLeft < 60; // last minute
  const veryUrgent = secondsLeft < 30;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: expired ? '#00ff88' : veryUrgent ? '#ff0000' : urgency ? '#ff7e40' : '#111111',
          color: expired ? '#000' : '#fff',
          border: `2px solid ${expired ? '#00ff88' : veryUrgent ? '#ff0000' : '#ffffff22'}`,
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          padding: '8px 6px',
          cursor: 'pointer',
          boxShadow: veryUrgent ? '0 0 16px rgba(255,0,0,0.6)' : urgency ? '0 0 12px rgba(255,126,64,0.5)' : '0 4px 16px rgba(0,0,0,0.4)',
          animation: veryUrgent ? 'pulse 0.6s ease-in-out infinite alternate' : urgency ? 'pulse 1.2s ease-in-out infinite alternate' : 'none',
          minWidth: '44px',
          transition: 'background 0.4s, box-shadow 0.4s',
        }}
        aria-label="Cart timer — click to open cart"
      >
        <ShoppingCart size={16} />
        {expired ? (
          <span style={{ fontSize: '8px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.2 }}>CART{"\n"}SAVED ✓</span>
        ) : (
          <span style={{
            fontSize: '9px',
            fontWeight: 900,
            fontFamily: 'monospace',
            letterSpacing: '0.03em',
            color: veryUrgent ? '#fff' : urgency ? '#fff' : '#aaa',
          }}>{timeStr}</span>
        )}
      </button>
    </div>
  );
};


// --- EXIT INTENT POPUP CONTEXT WRAPPER ---
const ExitIntentPopupWithContext = () => {
  const { setIsExitDiscountApplied } = useCart();
  const location = useLocation();
  if (location.pathname === '/checkout') return null;
  return <ExitIntentPopup onApplyDiscount={() => setIsExitDiscountApplied(true)} />;
};


// --- BOTTOM TAB BAR (mobile only) ---
// 5 tabs: Home | Accounts | Product | Cart | Contact
// Chrome-style scroll: hides on scroll DOWN, shows instantly on scroll UP
const BottomTabBar = () => {
  const { items, setIsCartOpen, isCartOpen } = useCart();
  const location = useLocation();
  const currentPath = location.pathname;
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const lastScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chrome-style: hide on scroll DOWN, show on scroll UP
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        
        // Force visible at the very top to prevent overscroll/rubber-band hide glitches
        if (currentY <= 15) {
          setVisible(true);
        } else if (delta > 4) {
          // Scrolling DOWN → hide
          setVisible(false);
        } else if (delta < -4) {
          // Scrolling UP → show immediately
          setVisible(true);
        }
        
        // Clamp last scroll position to non-negative to handle iOS bounce smoothly
        lastScrollY.current = Math.max(0, currentY);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isMobile) return null;
  if (currentPath.startsWith('/product/')) return null;
  // Hide when cart sidebar is open
  if (isCartOpen) return null;

  const ACTIVE = '#00ff88';
  const INACTIVE = 'rgba(255,255,255,0.42)';

  // 5 tabs — Cart is a button (no route), Product highlighted neon
  const tabs = [
    { key: 'home',    label: 'Home',     icon: HomeIcon,     to: '/',          active: currentPath === '/' },
    { key: 'account', label: 'Account',  icon: User,         to: '/account',   active: currentPath === '/account' },
    { key: 'product', label: 'Product',  icon: Compass,      to: '/shop/all',  active: currentPath.startsWith('/shop'), highlight: currentPath.startsWith('/shop') },
    { key: 'cart',    label: 'Cart',     icon: ShoppingBag,  to: null,         active: currentPath === '/checkout' },
    { key: 'contact', label: 'Contact',  icon: Mail,         to: '/contact',   active: currentPath === '/contact' },
  ];

  return (
    <motion.nav
      animate={{ y: visible ? 0 : '115%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.7 }}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
        background: 'linear-gradient(180deg, rgba(8,8,8,0.78) 0%, rgba(4,4,4,0.97) 100%)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around', padding: '8px 0 4px' }}>
        {tabs.map(({ key, label, icon: Icon, to, active, highlight }) => {
          const color = highlight ? ACTIVE : (active ? ACTIVE : INACTIVE);
          const content = (
            <>
              {/* Glow spot behind active icon */}
              {(active || highlight) && (
                <span style={{
                  position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)',
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'rgba(0,255,136,0.2)', filter: 'blur(10px)', pointerEvents: 'none',
                }} />
              )}
              <motion.div animate={{ scale: (active || highlight) ? 1.18 : 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {/* Cart badge */}
                {key === 'cart' && totalItems > 0 && (
                  <motion.span key={totalItems}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [1.6, 0.85, 1.1, 1], opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 11 }}
                    style={{
                      position: 'absolute', top: '-7px', right: '-8px',
                      minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '8px', fontWeight: 900,
                      background: '#00ff88', color: '#000', borderRadius: '999px',
                      boxShadow: '0 0 8px rgba(0,255,136,0.8)', padding: '0 2px', zIndex: 2,
                    }}
                  >{totalItems}</motion.span>
                )}
                <Icon size={21} color={color} strokeWidth={(active || highlight) ? 2.2 : 1.6} />
              </motion.div>
              <span style={{
                fontSize: '8.5px', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.1em', fontFamily: 'monospace', color,
                marginTop: '2px',
              }}>{label}</span>
              {(active || highlight) && (
                <motion.div layoutId="tab-indicator"
                  style={{
                    width: '14px', height: '2px', borderRadius: '2px',
                    background: ACTIVE, boxShadow: '0 0 8px rgba(0,255,136,0.9)',
                    marginTop: '2px',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </>
          );

          const sharedStyle: React.CSSProperties = {
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '2px 10px 4px', minWidth: '56px', position: 'relative',
            background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none',
          };

          return to ? (
            <Link key={key} to={to} style={sharedStyle}>{content}</Link>
          ) : (
            <button key={key} onClick={() => setIsCartOpen(true)} style={sharedStyle}>{content}</button>
          );
        })}
      </div>
    </motion.nav>
  );
};

const Footer = () => {
  const location = useLocation();
  if (location.pathname === '/checkout') return null;

  return (
    <footer className="bg-white border-t-[8px] border-black pt-24 pb-12 relative z-10">
      <div className="container mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <GlitchImage 
                src="/logo.png?v=5" 
                alt={BRAND_NAME} 
                imgClassName="h-16 w-auto object-contain invert"
                triggerOnHover={false} 
              />
            </Link>
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
                <a href="https://www.instagram.com/elevezdotshop/" target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-black text-[#00ff88] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
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
            <Link to="/privacy" className="hover:text-[#00ff88] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#00ff88] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Simple Custom Cursor - Always Visible, Perfectly Synced, ALWAYS ON TOP
// Simple Custom Cursor - Always Visible, Perfectly Synced, ALWAYS ON TOP
const OptimizedCursor = ({ variant }: { variant: CursorVariant }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isHover = variant !== 'default';
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobileWidth = window.innerWidth < 768;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsMobileDevice(mobileWidth || isTouch);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);

    const onPointerMove = (e: PointerEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    // Use capture to ensure we get the event first/consistently
    window.addEventListener("pointermove", onPointerMove, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
    };
  }, []);

  if (isMobileDevice) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed pointer-events-none transition-opacity duration-200 ${variant === 'hidden' ? 'opacity-0' : 'opacity-100'}`}
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

const RewardsRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/account?tab=earn-redeem', { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-[6px] border-black border-t-[#00ff88] animate-spin mx-auto mb-6 shadow-[6px_6px_0px_0px_#000]"></div>
        <p className="text-lg font-black text-black uppercase tracking-widest animate-pulse">Redirecting to Rewards...</p>
      </div>
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
        <Route path="/product/:id" element={<ProductDetail setCursorVariant={setCursorVariant} />} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/account" element={<PageTransition><ErrorBoundary><Account setCursorVariant={setCursorVariant} /></ErrorBoundary></PageTransition>} />
        <Route path="/rewards" element={<PageTransition><ErrorBoundary><RewardsRedirect /></ErrorBoundary></PageTransition>} />
        <Route path="/order/:orderId" element={<PageTransition><OrderDetail /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const LiveActivityTickerWithContext = () => {
  const location = useLocation();
  const { isCartOpen } = useCart();
  if (location.pathname === '/checkout' || isCartOpen) return null;
  return <LiveActivityTicker />;
};

function App() {
  const { cursorVariant, setCursorVariant } = useCursor();
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [showKonamiOverlay, setShowKonamiOverlay] = useState(false);
  const [dopamineOverdrive, setDopamineOverdrive] = useState(false);

  // Dopamine Overdrive listener
  useEffect(() => {
    const handleTrigger = () => {
      setDopamineOverdrive(true);
      audioService.playUnlock();
      setTimeout(() => setDopamineOverdrive(false), 15000); // 15 seconds of extreme overdrive!
    };
    window.addEventListener('dopamine_overdrive_trigger', handleTrigger);
    return () => window.removeEventListener('dopamine_overdrive_trigger', handleTrigger);
  }, []);

  // Konami Code Detector
  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      const nextProgress = [...konamiProgress, e.key].slice(-10);
      setKonamiProgress(nextProgress);

      const isMatch = nextProgress.length === 10 && nextProgress.every((key, index) => key === konamiCode[index]);
      if (isMatch) {
        setShowKonamiOverlay(true);
        audioService.playSuccess();
        setTimeout(() => setShowKonamiOverlay(false), 6000);
        try {
          navigator.clipboard.writeText('KONAMI50');
        } catch {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress]);

  // Initialize Firebase sync and SWR revalidation on app load
  useEffect(() => {
    // Trigger SWR sync at the root so all pages get updated products (loads from local admin server in dev, Firestore in prod)
    console.log('☁️ [SWR Sync] Triggering root data revalidation from cloud/server...');
    localCollectionService.loadFromServer().catch((e) => {
      console.warn('[SWR Sync] Failed to load server data at root:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile on login
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
        <BrowserRouter>
          <AutoScrollToTop />
          {showKonamiOverlay && (
            <div className="fixed inset-0 z-[9999] bg-black/95 border-[10px] border-[#00ff88] flex flex-col items-center justify-center font-mono text-center pointer-events-none select-none">
              <div className="text-5xl md:text-7xl font-black text-[#00ff88] mb-4 animate-pulse">CODE INJECTED</div>
              <div className="text-lg md:text-xl font-black text-white uppercase tracking-widest">
                🎟️ UNLOCKED 50% OFF CODE: <span className="bg-[#00ff88] text-black px-4 py-1">KONAMI50</span>
              </div>
              <div className="text-xs text-zinc-500 mt-6 uppercase">(Copied to clipboard!)</div>
            </div>
          )}
          
          {dopamineOverdrive && (
            <div className="fixed inset-x-0 top-0 z-[9990] bg-[#ff007f] text-black py-2 text-center font-black uppercase text-[10px] tracking-widest border-b-[3px] border-black animate-pulse">
              🚀 DOPAMINE OVERDRIVE ACTIVATED // EXTREME SPARKS ON CLICK 🚀
            </div>
          )}

          <ClickSpark 
            sparkColor={dopamineOverdrive ? "#ff007f" : "#00ff88"} 
            sparkRadius={dopamineOverdrive ? 45 : 25} 
            sparkCount={dopamineOverdrive ? 24 : 10} 
            duration={dopamineOverdrive ? 300 : 500}
          >
            {/* Render fixed components outside the transformed parent to keep them viewport-relative */}
            <ScrollProgressBar />
            <CartSidebar />
            <QuickViewModal />

            <div className={`bg-black min-h-screen text-white selection:bg-[#00ff88] selection:text-black font-space w-full overflow-x-hidden pb-20 md:pb-0 relative ${dopamineOverdrive ? 'border-[8px] border-[#ff007f] shadow-[0_0_30px_rgba(255,0,127,0.5)]' : ''}`}
              style={{
                willChange: 'auto',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}>
              <FloatingElements />
              <div className="noise-overlay" />
              <main className="relative z-10">
                <AnimatedRoutes 
                  setCursorVariant={setCursorVariant} 
                  isRewardsModalOpen={isRewardsModalOpen} 
                  setIsRewardsModalOpen={setIsRewardsModalOpen} 
                />
              </main>
              <InstagramFeed />
              <Footer />

              {/* Floating Rewards Button & Modal */}
              <RewardsModal isOpen={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} />



              {/* Exit Intent Popup */}
              <ExitIntentPopupWithContext />
            </div>
          </ClickSpark>

          {/* TopHeader and BottomTabBar rendered OUTSIDE ClickSpark - ClickSpark has position:relative
              which traps position:fixed children, so these must be siblings of ClickSpark */}
          <TopHeader />
          <BottomTabBar />
          <CartTimerWidget />
          <LiveActivityTickerWithContext />

          {/* Optimized Custom Cursor - Rendered OUTSIDE main container for maximum z-index */}
          <OptimizedCursor variant={cursorVariant} />
        </BrowserRouter>
      </QuickViewProvider>
    </CartProvider>
  );
}

export default App;
