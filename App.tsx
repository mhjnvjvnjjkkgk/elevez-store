
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from 'framer-motion';
import { ShoppingBag, Menu, X, ArrowRight, ArrowLeft, Star, Play, Check, Truck, Shield, Award, Instagram, Twitter, Mail, MapPin, Phone, Sparkles, Trash2, Eye, Maximize2, Search, ChevronDown, ChevronUp, ChevronRight, SlidersHorizontal, Heart, Minus, Plus, Timer, RefreshCw, ShieldCheck, CreditCard, Banknote, Package, User, Lock, LogOut, Gift } from 'lucide-react';
import { PRODUCTS, BRAND_NAME } from './constants';
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

const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, [isMobile]);

  return { cursorVariant, setCursorVariant, mousePosition, isMobile };
};

// --- Interaction Components ---

// Interactive Text Component for Hero
const InteractiveText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`inline-flex flex-wrap justify-center gap-x-[0.25em] ${className}`}>
    {text.split(" ").map((word, i) => (
      <span key={i} className="inline-flex whitespace-nowrap">
        {word.split("").map((char, j) => (
          <motion.span
            key={j}
            className="inline-block origin-bottom cursor-default"
            whileHover={{ 
              scale: 1.2, 
              y: -15,
              color: "#00ff88",
              rotate: Math.random() * 10 - 5,
              textShadow: "0 0 30px rgba(0,255,136,0.6)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    ))}
  </div>
);

// 3D Tilt Card Wrapper
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.2, 0.8]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const center = { x: left + width / 2, y: top + height / 2 };
    x.set(clientX - center.x);
    y.set(clientY - center.y);
  };

  const handleMouseLeaveWrapper = () => {
    x.set(0);
    y.set(0);
    if (onMouseLeave) onMouseLeave();
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
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
    let pixels: {x: number, y: number, size: number, alpha: number, speed: number}[] = [];
    let mouse = { x: 0, y: 0 };
    const gridSize = 40; 

    const init = () => {
      canvas.width = width;
      canvas.height = height;
      pixels = [];
      
      for(let x = 0; x < width; x += gridSize) {
        for(let y = 0; y < height; y += gridSize) {
          if(Math.random() > 0.7) { 
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
        // Calculate alpha based on time and position for a wave effect
        const alpha = 0.03 + Math.sin(x * 0.01 + time) * 0.02;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.01, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
         // Vertical scanning wave
        const alpha = 0.03 + Math.sin(y * 0.01 - time) * 0.02;
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.01, alpha)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw Pixels
      pixels.forEach(p => {
        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let activeAlpha = p.alpha;
        if (dist < 200) {
          activeAlpha = p.alpha + (1 - dist/200) * 0.6;
          ctx.fillStyle = `rgba(0, 255, 136, ${activeAlpha})`; // Green tint near mouse
          
          // Slight movement away from mouse
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * 0.5;
          p.y -= Math.sin(angle) * 0.5;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${activeAlpha})`;
          // Return to original grid position (simple easing)
          const targetX = Math.round(p.x / gridSize) * gridSize;
          const targetY = Math.round(p.y / gridSize) * gridSize;
           if(Math.abs(p.x - targetX) > 0.1) p.x += (targetX - p.x) * 0.05;
           if(Math.abs(p.y - targetY) > 0.1) p.y += (targetY - p.y) * 0.05;
        }
        
        ctx.fillRect(p.x, p.y, p.size, p.size); 
      });

      requestAnimationFrame(animate);
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
    window.addEventListener('mousemove', handleMouseMove);
    
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
};

// Product Card
const ProductCard: React.FC<{ product: Product; onHoverStart: () => void; onHoverEnd: () => void }> = ({ product, onHoverStart, onHoverEnd }) => {
  const { openQuickView } = useQuickView();
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

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
    <TiltCard className="group h-full">
      <Link 
        to={`/product/${product.id}`}
        className="relative block overflow-hidden rounded-xl aspect-[4/5] bg-zinc-900 border border-white/5 group-hover:border-[#00ff88]/50 transition-colors duration-500 shadow-2xl"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 transform group-hover:translate-z-10 transition-transform">
          <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.5)] rounded-sm skew-x-[-10deg]">
            50% OFF
          </div>
          {product.tags?.includes('ESSENTIAL') && (
            <div className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-full">
              ESSENTIAL
            </div>
          )}
           {product.tags?.includes('TRENDING') && (
            <div className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-full">
              TRENDING
            </div>
          )}
           {product.tags?.includes('PREMIUM') && (
            <div className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-full">
              PREMIUM
            </div>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#00ff88] transition-all group/heart"
        >
          <Heart 
            size={20} 
            className={`transition-all ${
              isInWishlist 
                ? 'text-[#00ff88] fill-[#00ff88] group-hover/heart:text-black group-hover/heart:fill-black' 
                : 'text-white group-hover/heart:text-black'
            }`}
          />
        </button>

        <img 
          src={product.image} 
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
          decoding="async"
          style={{ imageRendering: 'high-quality' }}
        />
        
        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-end pb-6">
           <button 
            onClick={(e) => {
              e.preventDefault();
              openQuickView(product);
            }}
            className="bg-[#00ff88] text-black font-bold py-3 px-6 rounded-full uppercase tracking-widest hover:bg-white hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
           >
             <Maximize2 size={16} />
             Quick View
           </button>
        </div>
      </Link>
      
      <div className="mt-4 transform translate-z-20">
        <h3 className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors line-clamp-1 font-syne">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
           <div className="flex items-center gap-2">
             <span className="text-[#00ff88] font-bold">₹{product.price.toFixed(2)}</span>
             <span className="text-red-500/70 line-through text-sm">₹{product.originalPrice.toFixed(2)}</span>
           </div>
           <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={`${i < Math.floor(product.rating) ? 'fill-[#00ff88] text-[#00ff88]' : 'text-zinc-700'}`} />
              ))}
           </div>
        </div>
      </div>
    </TiltCard>
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
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={closeQuickView}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 50, rotateX: 10 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.9, y: 50, rotateX: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px]"
        >
          {/* Image Side */}
          <div className="md:w-1/2 relative h-64 md:h-full">
            <img 
              src={activeProduct.image} 
              alt={activeProduct.name} 
              className="w-full h-full object-cover"
              loading="eager"
              decoding="sync"
              style={{ imageRendering: 'high-quality' }}
            />
            <button 
              onClick={closeQuickView} 
              className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Details Side */}
          <div className="md:w-1/2 p-8 flex flex-col h-full overflow-y-auto relative">
             <button 
              onClick={closeQuickView} 
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors hidden md:block"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#00ff88] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">In Stock</span>
                {activeProduct.tags?.includes('BESTSELLER') && <span className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Best Seller</span>}
              </div>
              <h2 className="text-3xl font-bold font-syne leading-tight mb-2">{activeProduct.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#00ff88]">₹{activeProduct.price}</span>
                <span className="text-gray-500 line-through text-lg">₹{activeProduct.originalPrice}</span>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Select Color: <span className="text-white">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-3">
                {activeProduct.colors?.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded border text-sm font-medium transition-all ${selectedColor === color ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-zinc-700 hover:border-zinc-500'}`}
                  >
                    {color}
                  </button>
                ))}
                {!activeProduct.colors && <span className="text-sm text-gray-500">One Color Available</span>}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Select Size: <span className="text-white">{selectedSize}</span></h3>
              <div className="flex gap-3">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 flex items-center justify-center rounded border font-bold text-sm transition-all ${selectedSize === size ? 'bg-[#00ff88] text-black border-[#00ff88]' : 'bg-transparent text-gray-400 border-zinc-700 hover:border-zinc-500'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-3">
               <button 
                onClick={handleAddToCart}
                className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,255,136,0.2)]"
               >
                 Add to Cart - ₹{(activeProduct.price).toFixed(2)}
               </button>
               <Link 
                to={`/product/${activeProduct.id}`} 
                onClick={closeQuickView}
                className="block w-full text-center py-3 text-sm text-gray-400 hover:text-white underline"
               >
                 View Full Details
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-zinc-950 border-l border-white/10 z-[70] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg sm:text-2xl font-syne font-bold uppercase">Your Cart <span className="text-[#00ff88]">({items.length})</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <ShoppingBag size={48} />
                  <p className="text-sm sm:text-base">Your cart is empty</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-[#00ff88] underline text-sm">Continue Shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.cartId} 
                    className="flex gap-3 sm:gap-4 bg-zinc-900/50 p-2 sm:p-3 rounded-lg border border-white/5"
                  >
                    <img src={item.image} alt={item.name} className="w-16 sm:w-20 h-20 sm:h-24 object-cover rounded bg-zinc-900 flex-shrink-0" loading="lazy" style={{ imageRendering: 'high-quality' }} />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-bold text-sm sm:text-lg line-clamp-2">{item.name}</h3>
                        <div className="flex gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                           <span className="bg-white/10 px-2 py-0.5 rounded">{item.size}</span>
                           {item.color && <span className="bg-white/10 px-2 py-0.5 rounded">{item.color}</span>}
                           <span className="bg-white/10 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#00ff88] font-bold text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.cartId)} className="text-zinc-500 hover:text-red-500 transition-colors p-1 hover:bg-red-500/10 rounded flex-shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-zinc-900/50 backdrop-blur flex-shrink-0">
                <div className="flex justify-between mb-4 text-base sm:text-lg font-bold">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 text-center">Shipping calculated at checkout.</p>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-[#00ff88] text-black font-bold py-3 sm:py-4 uppercase tracking-widest hover:bg-white transition-colors rounded-lg shadow-[0_0_20px_rgba(0,255,136,0.2)] text-sm sm:text-base"
                >
                  Checkout Now
                </button>
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
  
  // Get top 4 best-selling products
  const bestSellers = PRODUCTS
    .filter(p => p.isBestSeller || p.isFeatured)
    .slice(0, 4);

  return (
    <ScrollAnimatedSection>
      <section className="min-h-screen relative flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }} />
        </div>
        
        {/* Optimized Floating Particles - Reduced from 20 to 5 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#00ff88] rounded-full blur-sm"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}

        <style>{`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          @keyframes holographic {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}</style>

        <div className="max-w-7xl w-full relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/5 border border-[#00ff88]/30 rounded-full px-6 py-2 mb-6"
            >
              <span className="text-2xl">🔥</span>
              <span className="text-[#00ff88] text-sm font-bold uppercase tracking-[0.3em]">Trending Now</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl md:text-7xl font-black font-syne mb-6"
            >
              Best <span className="text-[#00ff88]">Sellers</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
            >
              The pieces everyone's talking about. Limited stock available.
            </motion.p>

            {/* Animated Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 mb-4"
            >
              {[
                { value: "1000+", label: "Happy Customers", icon: "👥" },
                { value: "50+", label: "Sold Today", icon: "🔥" },
                { value: "4.9", label: "Average Rating", icon: "⭐" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                  className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-[#00ff88]/20 rounded-full px-6 py-3"
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className="text-[#00ff88] font-bold text-lg">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12">
            {bestSellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                viewport={{ once: false }}
                whileHover={{ 
                  y: -20, 
                  scale: 1.03,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.4 }
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                onClick={() => navigate(`/product/${product.id}`)}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.6) 100%)',
                  backdropFilter: 'blur(30px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Holographic Border */}
                <div 
                  className="absolute inset-0 rounded-2xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(90deg, #00ff88, #00ddff, #ff00ff, #00ff88, #00ddff)',
                    backgroundSize: '200% 100%',
                    animation: hoveredCard === index ? 'holographic 3s linear infinite' : 'none',
                  }}
                >
                  <div className="w-full h-full bg-black rounded-2xl" />
                </div>

                {/* Card Content */}
                <div className="relative z-10"
>
                {/* Best Seller Badge */}
                <div className="absolute top-4 left-4 z-20 bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                  BEST SELLER
                </div>

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick view button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#00ff88]"
                  >
                    Quick View
                  </motion.button>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#00ff88] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < 4 ? 'fill-[#00ff88] text-[#00ff88]' : 'text-gray-600'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">(4.8)</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#00ff88]">
                      ${product.price}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center hover:bg-[#00ff88] hover:text-black transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/20 via-[#00ddff]/10 to-transparent" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#00ff88]/30 via-[#00ddff]/20 to-[#ff00ff]/10 blur-2xl" />
                </div>

                {/* Stock Indicator */}
                <div className="absolute top-4 right-4 z-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full"
                  >
                    Only 3 left!
                  </motion.div>
                </div>

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist logic
                  }}
                  className="absolute top-16 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00ff88] hover:border-[#00ff88]"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            viewport={{ once: false }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/shop/all')}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#00ff88] to-[#00dd77] text-black px-12 py-4 rounded-full text-lg font-bold uppercase overflow-hidden hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)]"
            >
              <span className="relative z-10">View All Products</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
              
              {/* Animated background */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </motion.div>
        </div>
      </section>
    </ScrollAnimatedSection>
  );
};

// --- Customer Reviews Carousel with Scroll Hijacking ---
const CustomerReviews = () => {
  const ref = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [hasCompletedReviews, setHasCompletedReviews] = useState(false);
  const scrollAccumulator = useRef(0);
  const isScrollingRef = useRef(false);

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
    },
    {
      id: 4,
      name: "Alex Rivera",
      rating: 4,
      text: "Great products and excellent customer service. The fit guide was super helpful. My new go-to brand for streetwear.",
      date: "3 weeks ago",
      product: "Cargo Pants",
      avatar: "🧑"
    },
    {
      id: 5,
      name: "Lisa Park",
      rating: 5,
      text: "Obsessed with my order! The colors are vibrant, quality is amazing, and it arrived faster than expected. 10/10!",
      date: "1 month ago",
      product: "Graphic Hoodie",
      avatar: "👩‍🦱"
    },
    {
      id: 6,
      name: "Jordan Lee",
      rating: 5,
      text: "Best online shopping experience! The quality exceeded my expectations and customer service was incredibly helpful.",
      date: "1 month ago",
      product: "Denim Jacket",
      avatar: "🧑‍🦱"
    }
  ];

  // Detect when section is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          // Reset when leaving section
          scrollAccumulator.current = 0;
        }
      },
      { threshold: 0.5 } // Section must be 50% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll hijacking logic
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only hijack if section is in view and reviews not completed
      if (!isInView || hasCompletedReviews) return;

      // Prevent default page scroll
      e.preventDefault();
      e.stopPropagation();

      // Accumulate scroll delta
      scrollAccumulator.current += e.deltaY;

      // Threshold for changing review (adjust for sensitivity)
      const threshold = 100;

      if (Math.abs(scrollAccumulator.current) >= threshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        
        setCurrentIndex(prev => {
          const newIndex = Math.max(0, Math.min(reviews.length - 1, prev + direction));
          
          // If reached last review, mark as completed
          if (newIndex === reviews.length - 1 && direction > 0) {
            setTimeout(() => {
              setHasCompletedReviews(true);
            }, 500);
          }
          
          return newIndex;
        });

        // Reset accumulator
        scrollAccumulator.current = 0;
      }
    };

    // Add wheel listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isInView, hasCompletedReviews, reviews.length]);

  const currentReview = reviews[currentIndex];

  return (
    <ScrollAnimatedSection>
      <section ref={ref} className="min-h-screen relative flex items-center justify-center py-20 px-6">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="text-center mb-16"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#00ff88] text-sm font-bold uppercase tracking-[0.3em] mb-4"
            >
              Customer Love
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl md:text-7xl font-black font-syne mb-6"
            >
              What Our <span className="text-[#00ff88]">Customers</span> Say
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg"
            >
              Real reviews from real people. Scroll to see more.
            </motion.p>
          </motion.div>

          {/* Review Card */}
          <motion.div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 0, 0, 0.6) 100%)',
              backdropFilter: 'blur(30px) saturate(200%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%)',
            }}
            className="relative rounded-3xl border border-white/10 p-12 md:p-16 overflow-hidden"
          >
            {/* Decorative Quote Marks */}
            <div className="absolute top-8 left-8 text-[#00ff88]/20 text-8xl font-serif leading-none">"</div>
            <div className="absolute bottom-8 right-8 text-[#00ff88]/20 text-8xl font-serif leading-none rotate-180">"</div>

            {/* Review Content */}
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Avatar */}
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00dd77] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                    animate={{ 
                      boxShadow: [
                        '0 0 30px rgba(0,255,136,0.3)',
                        '0 0 50px rgba(0,255,136,0.5)',
                        '0 0 30px rgba(0,255,136,0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentReview.avatar}
                  </motion.div>

                  {/* Rating Stars */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                      >
                        <Star 
                          className={`w-6 h-6 ${i < currentReview.rating ? 'fill-[#00ff88] text-[#00ff88]' : 'text-gray-600'}`}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 max-w-3xl mx-auto">
                    {currentReview.text}
                  </p>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white">{currentReview.name}</h4>
                    <p className="text-sm text-gray-400">
                      Purchased: <span className="text-[#00ff88]">{currentReview.product}</span>
                    </p>
                    <p className="text-xs text-gray-500">{currentReview.date}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Progress Indicators & Navigation */}
          <div className="mt-12 flex flex-col items-center gap-8">
            {/* Review Counter */}
            <div className="text-center">
              <span className="text-3xl font-bold text-[#00ff88]">{currentIndex + 1}</span>
              <span className="text-gray-500 text-xl"> / {reviews.length}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all border border-white/20 hover:border-[#00ff88]/50"
              >
                <ArrowLeft size={20} className="text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentIndex(Math.min(reviews.length - 1, currentIndex + 1))}
                disabled={currentIndex === reviews.length - 1}
                className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all border border-white/20 hover:border-[#00ff88]/50"
              >
                <ArrowRight size={20} className="text-white" />
              </motion.button>
            </div>

            {/* Dots */}
            <div className="flex gap-3 flex-wrap justify-center">
              {reviews.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex 
                      ? 'w-12 bg-[#00ff88]' 
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  animate={{
                    boxShadow: index === currentIndex 
                      ? '0 0 20px rgba(0,255,136,0.5)' 
                      : 'none'
                  }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Dynamic Scroll Hint */}
            <AnimatePresence mode="wait">
              {!hasCompletedReviews && (
                <motion.div
                  key="scroll-hint"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <motion.p 
                    className="text-sm text-gray-500 mb-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentIndex === reviews.length - 1 
                      ? '🎉 Scroll down to continue to next section' 
                      : `Scroll to see review ${currentIndex + 2}/${reviews.length}`}
                  </motion.p>
                  {isInView && !hasCompletedReviews && (
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[#00ff88] text-2xl"
                    >
                      ↓
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
      gradient: "from-[#00ff88] to-[#00cc6a]"
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Express delivery worldwide, your style arrives in days",
      gradient: "from-[#00ff88] to-[#00ddff]"
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "Bank-level encryption, shop with complete confidence",
      gradient: "from-[#00ff88] to-[#6a5acd]"
    },
    {
      icon: Timer,
      title: "24/7 Support",
      description: "Always here to help, whenever you need us",
      gradient: "from-[#00ff88] to-[#ff6b9d]"
    }
  ];

  return (
    <ScrollAnimatedSection>
      <section className="min-h-screen relative flex items-center justify-center py-20 px-6">
        {/* Glassmorphic Container */}
        <div className="max-w-7xl w-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            className="text-center mb-16"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#00ff88] text-sm font-bold uppercase tracking-[0.3em] mb-4"
            >
              Why Choose ELEVEZ
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl md:text-7xl font-black font-syne mb-6"
            >
              Premium Quality,
              <br />
              <span className="text-[#00ff88]">Unmatched Style</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Experience the difference that sets us apart from the rest
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
                viewport={{ once: false }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                }}
                className="group relative p-8 rounded-2xl border border-white/10 hover:border-[#00ff88]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}
                  >
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-[#00ff88]" />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#00ff88] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl group-hover:bg-[#00ff88]/10 transition-all duration-300" />
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            viewport={{ once: false }}
            className="text-center"
          >
            <Link 
              to="/shop/all"
              className="inline-block bg-[#00ff88] text-black px-12 py-4 rounded-full text-lg font-bold uppercase hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:shadow-[0_0_50px_rgba(0,255,136,0.5)] hover:scale-105"
            >
              Shop Now
            </Link>
          </motion.div>
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
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl max-w-md w-auto ${
        type === 'success' ? 'bg-[#00ff88]/20 border-[#00ff88]/50 text-[#00ff88]' :
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
  
  // Parallax Transforms
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
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

  const heroMoveX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const heroMoveY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);

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
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 perspective-1000 z-10">
        
        {/* Floating Pill */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]), y: useTransform(mouseY, [-0.5, 0.5], [-30, 30]) }}
          className="absolute top-24 md:top-32 z-20"
        >
          <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:scale-105 transition-transform">
             <Sparkles size={14} className="text-[#00ff88]" />
             <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
               New Collection 2024 - <span className="text-[#00ff88]">50% OFF</span>
             </span>
          </div>
        </motion.div>

        <div className="relative z-10 text-center max-w-7xl mx-auto mt-10">
          <motion.div
            style={{ y: heroTextY, x: heroMoveX, rotateX: useTransform(mouseY, [-0.5, 0.5], [5, -5]), rotateY: useTransform(mouseX, [-0.5, 0.5], [-5, 5]) }}
          >
            <h1 
              className="text-6xl md:text-[9rem] font-bold leading-[0.9] tracking-tighter font-syne mb-6 cursor-default relative z-20"
            >
              <div 
                className="block text-white drop-shadow-2xl"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                <InteractiveText text="Elevate Your" />
              </div>
              <span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-emerald-400 to-[#00ff88] bg-[length:200%_auto] animate-gradient"
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
              >
                Style Game
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ y: heroTextY, x: useTransform(mouseX, [-0.5, 0.5], [10, -10]) }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Experience fashion reimagined with cutting-edge design and unparalleled comfort. 
            Welcome to the new era of <span className="text-white font-bold">{BRAND_NAME}</span>.
          </motion.p>
          
          <motion.div 
            style={{ y: heroTextY }}
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
          >
            <MagneticButton
              onClick={() => navigate('/shop/all')}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
              className="px-10 py-5 rounded-full bg-zinc-800 border border-white/10 shadow-[0_0_30px_rgba(0,255,136,0.1)]"
            >
              <span className="text-white group-hover:text-black font-bold text-lg tracking-widest uppercase transition-colors">
                Shop Collection
              </span>
            </MagneticButton>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
              onClick={() => navigate('/about')}
              className="px-10 py-5 rounded-full border border-zinc-700 bg-zinc-900/50 text-white font-bold text-lg tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300 backdrop-blur-sm"
            >
              Explore More
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          style={{ opacity: useTransform(scrollY, [0, 200], [1, 0]) }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 animate-pulse">Scroll to explore</span>
          <ArrowRight className="rotate-90 text-[#00ff88]" />
        </motion.div>
      </section>

      {/* Why Choose Elevez - Parallaxed */}
      <section className="py-32 relative z-10 bg-black/50 backdrop-blur-lg border-t border-white/5">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
             <h2 className="text-5xl md:text-7xl font-bold font-syne mb-4">Why Choose <span className="text-gray-600">Elevez</span></h2>
             <p className="text-gray-400">Excellence in every detail, innovation in every stitch</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: Truck, title: "3-Day Express", desc: "Lightning-fast shipping straight to your doorstep.", tag: "3 Days" },
               { icon: Shield, title: "180gsm Premium", desc: "Superior quality cotton that breathes and lasts.", tag: "180gsm" },
               { icon: Award, title: "Excellent Designs", desc: "Award-winning patterns that stand out.", tag: "Winner" },
               { icon: Star, title: "Personality-Driven", desc: "Each piece tells your unique story.", tag: "Style" }
             ].map((item, i) => (
               <TiltCard
                 key={i}
                 className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-2xl group hover:border-[#00ff88]/50"
               >
                 <div className="absolute -top-3 right-4 bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,255,136,0.4)] group-hover:scale-110 transition-transform">
                   {item.tag}
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-[#00ff88]/10 transition-colors shadow-inner">
                   <item.icon className="w-8 h-8 text-[#00ff88]" />
                 </div>
                 <h3 className="text-xl font-bold mb-3 font-syne">{item.title}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
               </TiltCard>
             ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Social Proof Badges */}
      <SocialProofBadges />

      {/* Best Sellers Section */}
      <BestSellers />

      {/* Product Recommendations */}
      <ProductRecommendations limit={4} />

      {/* Customer Reviews Carousel */}
      <CustomerReviews />

      {/* Featured Collections */}
      <ScrollAnimatedSection>
        <section className="py-32 relative">
        <div className="container mx-auto px-6">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
           >
             <h2 className="text-5xl md:text-7xl font-bold text-center mb-4 font-syne">Our Collections</h2>
             <p className="text-center text-gray-500 mb-16">Curated styles for every personality</p>
           </motion.div>

           <div className="flex flex-wrap justify-center gap-4 mb-16">
              {['All', 'Old Money', 'Bold and Vibrant', 'Premium Streetwear', 'Hoodies', 'Oversized', 'Under ₹50', '₹100+'].map((filter, i) => (
                <button 
                  key={filter}
                  onClick={() => setCollectionFilter(filter)}
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${collectionFilter === filter ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-105' : 'border border-zinc-800 text-zinc-400 hover:border-[#00ff88] hover:text-white hover:scale-105'}`}
                >
                  {filter}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
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
           
           <div className="text-center mt-16">
             <MagneticButton 
               onClick={() => setCollectionFilter('All')} 
               className="inline-block px-8 py-4 border border-[#00ff88] rounded-full"
               onMouseEnter={() => setCursorVariant('hover')}
               onMouseLeave={() => setCursorVariant('default')}
             >
               <span className="text-white group-hover:text-black font-bold uppercase tracking-widest">View All Products</span>
             </MagneticButton>
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
                   FOR<br/>BIGGER<br/>BLAZES
                 </h3>
              </div>
           </div>
        </motion.div>
      </section>

      {/* Redefining Modern Fashion */}
      <section className="py-32 bg-zinc-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <motion.div
             initial={{ x: -50, opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             viewport={{ once: true }}
           >
             <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-8 font-syne">
               Redefining<br/>
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

      {/* Newsletter Signup - End of Page */}
      <NewsletterSignup 
        title="Stay in the Loop"
        subtitle="Get 10% off your first order + exclusive deals & early access"
      />
    </div>
  );
};

const Shop = ({ setCursorVariant }: { setCursorVariant: (v: any) => void }) => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tagFilter = searchParams.get('tag');
  const typeFilter = searchParams.get('type');
  
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
     if (typeFilter) setFilter(typeFilter);
     else if (tagFilter) setFilter(tagFilter);
     else setFilter('All');
  }, [tagFilter, typeFilter]);

  const filteredProducts = PRODUCTS.filter(p => {
    // Only show products that are enabled for shop (default to true if not set)
    if (p.showInShop === false) return false;
    
    // Show ALL products in "all" category
    const matchesCategory = category === 'all' || !category ? true : p.category.toLowerCase() === category || p.category === 'Unisex';
    let matchesFilter = true;
    if (filter === 'All') matchesFilter = true;
    else if (['Hoodie', 'T-Shirt', 'Crop Top', 'Oversized'].includes(filter)) matchesFilter = p.type.includes(filter);
    else if (['Men', 'Women', 'Unisex'].includes(filter)) matchesFilter = p.category === filter;
    else if (filter === 'OLD') matchesFilter = p.tags?.includes('VINTAGE');
    else if (filter === 'BOLD') matchesFilter = p.tags?.includes('COLORFUL');
    else if (filter === 'PREMIUM') matchesFilter = p.tags?.includes('PREMIUM');
    else if (filter === 'ESSENTIAL') matchesFilter = p.tags?.includes('ESSENTIAL');
    else if (filter === 'Under') matchesFilter = p.price < 50;
    else if (filter === '₹100+') matchesFilter = p.price >= 100;

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesFilter && matchesSearch;
  }).slice(0, 3);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
           <h1 className="text-6xl md:text-8xl font-bold uppercase mb-4 font-syne tracking-tighter">
             <div onMouseEnter={() => setCursorVariant && setCursorVariant('hover')} onMouseLeave={() => setCursorVariant && setCursorVariant('default')}>
                <InteractiveText 
                  text={category === 'men' ? "Men's Collection" : category === 'women' ? "Women's Collection" : "Complete Collection"} 
                />
             </div>
           </h1>
           <p className="text-gray-400 text-xl">Discover all {filteredProducts.length} pieces from our curated selection</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-1/4 shrink-0">
             <div className="sticky top-32 bg-zinc-900/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                   <SlidersHorizontal size={20} className="text-[#00ff88]" />
                   <span className="font-bold font-syne text-xl uppercase">Filters</span>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#00ff88] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Filter Groups */}
                <FilterSection title="Category" defaultOpen={true}>
                   {['All', 'Men', 'Women', 'Unisex'].map(c => (
                     <button 
                      key={c} 
                      onClick={() => setFilter(c)}
                      onMouseEnter={() => setCursorVariant('hover')}
                      onMouseLeave={() => setCursorVariant('default')}
                      className={`block w-full text-left text-sm py-1 hover:text-[#00ff88] transition-colors ${filter === c ? 'text-[#00ff88] font-bold' : 'text-gray-400'}`}
                     >
                       {c}
                     </button>
                   ))}
                </FilterSection>

                <FilterSection title="Product Type" defaultOpen={true}>
                   {['Hoodie', 'T-Shirt', 'Crop Top', 'Oversized'].map(c => (
                     <button 
                      key={c} 
                      onClick={() => setFilter(c)}
                      onMouseEnter={() => setCursorVariant('hover')}
                      onMouseLeave={() => setCursorVariant('default')}
                      className={`block w-full text-left text-sm py-1 hover:text-[#00ff88] transition-colors ${filter === c ? 'text-[#00ff88] font-bold' : 'text-gray-400'}`}
                     >
                       {c}
                     </button>
                   ))}
                </FilterSection>

                <FilterSection title="Price">
                   {['Under', '₹100+'].map(c => (
                     <button 
                      key={c} 
                      onClick={() => setFilter(c)}
                      onMouseEnter={() => setCursorVariant('hover')}
                      onMouseLeave={() => setCursorVariant('default')}
                      className={`block w-full text-left text-sm py-1 hover:text-[#00ff88] transition-colors ${filter === c ? 'text-[#00ff88] font-bold' : 'text-gray-400'}`}
                     >
                       {c === 'Under' ? 'Under ₹50' : '₹100+'}
                     </button>
                   ))}
                </FilterSection>

                <FilterSection title="Collections">
                   {['ESSENTIAL', 'PREMIUM', 'OLD', 'BOLD'].map(c => (
                     <button 
                      key={c} 
                      onClick={() => setFilter(c)}
                      onMouseEnter={() => setCursorVariant('hover')}
                      onMouseLeave={() => setCursorVariant('default')}
                      className={`block w-full text-left text-sm py-1 hover:text-[#00ff88] transition-colors ${filter === c ? 'text-[#00ff88] font-bold' : 'text-gray-400'}`}
                     >
                       {c === 'OLD' ? 'Old Money' : c === 'BOLD' ? 'Bold & Vibrant' : c.charAt(0) + c.slice(1).toLowerCase()}
                     </button>
                   ))}
                </FilterSection>
             </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
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
              <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                No products found matching your criteria.
                <button onClick={() => {setFilter('All'); setSearchQuery('')}} className="block mx-auto mt-4 text-[#00ff88] underline">
                  Clear Filters
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
  const product = PRODUCTS.find(p => p.id === Number(id));
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 500], [0, 100]);
  
  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      if (product.colors?.[0]) setSelectedColor(product.colors[0]);
    }
  }, [product]);
  
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product Not Found</div>;

  const productImages = product.images && product.images.length > 0 ? product.images.slice(0, 5) : [product.image];

  const getColorCode = (name: string) => {
     const colors: {[key: string]: string} = {
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
    <div className="min-h-screen pt-32 pb-20 bg-black">
       <div className="container mx-auto px-6">
         {/* Breadcrumb */}
         <Link to="/shop/all" className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors w-fit">
           <ArrowLeft size={16} /> Back to Collection
         </Link>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
           {/* Left Column - Images with Liquid Glass Layout */}
           <div className="lg:col-span-7">
             {/* Main Image */}
             <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  style={{ 
                    imageRendering: '-webkit-optimize-contrast',
                    WebkitImageRendering: '-webkit-optimize-contrast',
                    msInterpolationMode: 'bicubic',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  } as React.CSSProperties}
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-sm shadow-lg">SALE</div>
                
                {/* Liquid Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
             </div>
             
             {/* Thumbnail Grid - Liquid Glass Layout */}
             <div className="grid grid-cols-5 gap-3">
                {productImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group/thumb transition-all duration-300 ${
                        activeImage === img 
                          ? 'ring-2 ring-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.4)]' 
                          : 'ring-1 ring-white/10 hover:ring-white/30'
                      }`}
                    >
                       {/* Liquid Glass Effect */}
                       <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 z-10" />
                       
                       {/* Image */}
                       <img 
                         src={img} 
                         alt={`View ${idx + 1}`} 
                         className="w-full h-full object-cover transition-all duration-500 group-hover/thumb:scale-110 group-hover/thumb:brightness-110" 
                         loading="eager"
                         decoding="sync"
                         style={{ imageRendering: 'high-quality' }}
                       />
                       
                       {/* Active Indicator */}
                       {activeImage === img && (
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute inset-0 border-2 border-[#00ff88] rounded-xl pointer-events-none"
                         />
                       )}
                       
                       {/* Hover Glow */}
                       <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/20 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                ))}
             </div>
             
             {/* Image Counter */}
             <div className="mt-4 text-center text-sm text-gray-500">
               <span className="text-[#00ff88] font-bold">{productImages.indexOf(activeImage) + 1}</span> / {productImages.length}
             </div>
           </div>

           {/* Right Column - Details */}
           <div className="lg:col-span-5 flex flex-col">
             <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 mb-2">
                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded">Essential</span>
                <span>ΓÇó</span>
                <span>{product.category}</span>
                <span>ΓÇó</span>
                <span>{product.type}</span>
             </div>

             <h1 className="text-5xl font-bold mb-2 font-syne leading-tight">{product.name}</h1>
             
             <div className="flex items-center gap-3 mb-6">
               <span className="text-3xl font-bold text-[#00ff88]">₹{product.price}</span>
               <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
               <span className="bg-red-900/50 text-red-400 text-xs font-bold px-2 py-1 rounded">Save ₹{(product.originalPrice - product.price).toFixed(0)}</span>
             </div>

             {/* Countdown Bar */}
             <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-3 flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                   <Timer size={16} className="text-[#00ff88]" />
                   Limited sale ends in
                </div>
                <div className="font-mono font-bold text-white">02d 23h 59m 54s</div>
             </div>

             <p className="text-gray-300 leading-relaxed mb-8">
               Premium 180gsm cotton with personality-driven design. Engineered for durability and style in the urban environment.
             </p>
             
             {/* Color Selector */}
             {product.colors && (
              <div className="mb-6">
                 <div className="flex justify-between mb-3">
                   <span className="font-bold text-sm text-gray-400">Color: <span className="text-white">{selectedColor}</span></span>
                 </div>
                 <div className="flex gap-4">
                   {product.colors.map(color => (
                     <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: getColorCode(color) }}
                      title={color}
                     >
                       {selectedColor === color && <Check size={16} className={color === 'White' || color === 'Dust White' || color === 'Static White' ? 'text-black' : 'text-white'} />}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             {/* Size Selector */}
             <div className="mb-6">
               <div className="flex justify-between mb-3">
                 <span className="font-bold text-sm text-gray-400">Size: <span className="text-[#00ff88]">{selectedSize}</span></span>
                 <button className="text-[#00ff88] text-xs font-bold underline">Size Guide</button>
               </div>
               <div className="flex flex-wrap gap-3">
                 {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                   <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border rounded-lg font-bold text-sm flex items-center justify-center transition-all ${selectedSize === size ? 'bg-[#00ff88] text-black border-[#00ff88]' : 'border-zinc-800 text-gray-400 hover:border-zinc-600 hover:text-white'}`}
                   >
                     {size}
                   </button>
                 ))}
               </div>
             </div>

             {/* Quantity */}
             <div className="mb-8">
                <span className="block font-bold text-sm text-gray-400 mb-3">Quantity</span>
                <div className="flex items-center gap-4 bg-zinc-900 rounded-lg w-fit border border-white/10">
                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-l-lg">
                      <Minus size={16} />
                   </button>
                   <span className="w-8 text-center font-bold">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-r-lg">
                      <Plus size={16} />
                   </button>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-4 mb-10">
               <button 
                 onClick={() => {
                   addToCart(product, selectedSize, selectedColor || 'Standard', quantity);
                   navigate('/checkout');
                 }}
                 className="flex-1 bg-[#00ff88] text-black font-bold text-lg py-4 rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,255,136,0.3)]"
               >
                 Buy Now
               </button>
               <button 
                 onClick={() => addToCart(product, selectedSize, selectedColor || 'Standard', quantity)}
                 className="flex-1 border border-[#00ff88] text-[#00ff88] font-bold text-lg py-4 rounded-full hover:bg-[#00ff88] hover:text-black transition-colors"
               >
                 Add to Cart
               </button>
               <button className="w-14 h-14 border border-zinc-700 rounded-full flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors">
                 <Heart size={20} />
               </button>
             </div>

             {/* Service Icons */}
             <div className="grid grid-cols-3 gap-4 py-6 border-t border-zinc-800 mb-8">
                <div className="flex flex-col items-center text-center gap-2">
                   <Truck className="text-[#00ff88]" size={24} />
                   <span className="text-xs text-gray-400">3-Day Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                   <RefreshCw className="text-[#00ff88]" size={24} />
                   <span className="text-xs text-gray-400">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                   <ShieldCheck className="text-[#00ff88]" size={24} />
                   <span className="text-xs text-gray-400">Secure Payment</span>
                </div>
             </div>

             {/* Product Details List */}
             <div>
                <h3 className="font-bold mb-4 text-lg">Product Details</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                   <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5" />
                      180gsm Premium Cotton
                   </li>
                   <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5" />
                      Premium 180gsm cotton with personality-driven design
                   </li>
                   <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5" />
                      Relaxed fit with modern silhouette
                   </li>
                   <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5" />
                      Reinforced stitching for durability
                   </li>
                   <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-1.5" />
                      Machine washable
                   </li>
                </ul>
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
    <div className="min-h-screen bg-black pt-32 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-7xl md:text-9xl font-black font-syne mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-white to-[#00ff88]"
            style={{ textShadow: '0 0 60px rgba(0, 255, 136, 0.3)' }}
          >
            OUR STORY
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-3xl text-gray-300 leading-relaxed mb-12 max-w-3xl mx-auto"
          >
            Elevez was born in the digital void. We are not just a clothing brand; we are a <span className="text-[#00ff88] font-bold">movement</span> against the static.
          </motion.p>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[#00ff88] text-4xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Origin Section */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <TiltCard className="md:col-span-2 aspect-[16/9] rounded-3xl overflow-hidden border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&q=80&w=1200" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" 
              alt="Studio" 
            />
          </TiltCard>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#00ff88]/20 to-purple-500/20 p-12 rounded-3xl flex flex-col justify-center border border-[#00ff88]/30 backdrop-blur-xl"
          >
            <h3 className="text-5xl font-black font-syne mb-4 text-[#00ff88]">2024</h3>
            <p className="text-xl text-gray-300 leading-relaxed">The year we broke the code. Established in Neo-Tokyo, expanding globally with a vision to redefine streetwear.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black font-syne mb-8 text-white">Our Mission</h2>
          <p className="text-2xl text-[#00ff88] font-bold mb-12">Redefining Streetwear for the Digital Age</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#00ff88]/50 transition-all duration-300 group"
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#00ff88] transition-colors">{value.title}</h3>
              <p className="text-gray-400 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black font-syne mb-8 text-white">How We Create</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#00ff88]/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-8 border border-[#00ff88]/30 h-full">
                <div className="text-6xl font-black font-syne text-[#00ff88] mb-4 opacity-30">{step.number}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#00ff88] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-black font-syne mb-8 text-white">Meet the Team</h2>
          <p className="text-xl text-gray-400">The creative minds behind Elevez</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setActiveTeamMember(index)}
              onHoverEnd={() => setActiveTeamMember(null)}
              className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#00ff88]/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">{member.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
              <p className="text-[#00ff88] font-semibold text-sm mb-3">{member.role}</p>
              <AnimatePresence>
                {activeTeamMember === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-400 text-sm"
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
      <section className="max-w-6xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#00ff88]/10 via-purple-500/10 to-[#00ff88]/10 backdrop-blur-xl rounded-3xl p-12 border border-[#00ff88]/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-4xl md:text-5xl font-black font-syne text-[#00ff88] mb-2"
                  style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#00ff88]/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-[#00ff88]/30 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black font-syne mb-6 text-white">Join the Movement</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Be part of a community redefining streetwear. Explore our collection and experience the future of fashion.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop/all"
              className="px-8 py-4 bg-[#00ff88] text-black font-bold rounded-full uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_30px_rgba(0,255,136,0.3)]"
            >
              Shop Now
            </Link>
            <Link 
              to="/rewards"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-full uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
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
      const { validateDiscountCode } = await import('./services/discountService');
      const result = validateDiscountCode(discountCode);
      
      if (result.valid) {
        setDiscountApplied(true);
        setDiscountPercentage(result.percentage);
        setDiscountMessage(`✓ ${result.percentage}% discount applied!`);
      } else {
        setDiscountApplied(false);
        setDiscountPercentage(0);
        setDiscountMessage(result.message);
      }
    } catch (error) {
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
      <div className="min-h-screen pt-32 pb-20 bg-black flex items-center justify-center">
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
      <div className="min-h-screen pt-32 pb-20 bg-black flex items-center justify-center">
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
    <div className="min-h-screen pt-32 pb-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl md:text-5xl font-bold font-syne">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {!user ? (
                // Show login form if user is not authenticated
                <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                      <Lock size={20} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-bold font-syne">Account Required</h2>
                  </div>
                  <p className="text-gray-400 mb-6">Please sign in with your Google account to continue with your order.</p>
                  <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              ) : (
                // Show checkout form if user is authenticated
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Info */}
                  <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                          <User size={20} className="text-black" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold font-syne">Welcome, {user.displayName}</h2>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => signOut(auth)}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                  
                  {/* Shipping Address */}
                  <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                        <MapPin size={20} className="text-black" />
                      </div>
                      <h2 className="text-2xl font-bold font-syne">Shipping Address</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Full Name *</label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Email *</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Phone *</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Address *</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="flex-1 bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="Enter your full address..."
                          />
                          <button 
                            type="button"
                            onClick={generateMapPreview}
                            className="bg-[#00ff88] text-black px-4 rounded-lg font-bold hover:bg-white transition-colors"
                            title="Generate map preview"
                          >
                            Map
                          </button>
                        </div>
                        {googleMapsError && (
                          <p className="text-xs text-yellow-500 mt-2">Note: Address suggestions are unavailable. Please enter your full address manually.</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-2">City *</label>
                          <input 
                            type="text" 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-2">State *</label>
                          <input 
                            type="text" 
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-gray-400 mb-2">Pincode *</label>
                          <input 
                            type="text" 
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full bg-black/50 border border-white/10 p-4 text-white rounded-lg focus:border-[#00ff88] outline-none transition-colors"
                            placeholder="Pincode"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Preview */}
                  {mapPreview && (
                    <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                          <MapPin size={20} className="text-black" />
                        </div>
                        <h2 className="text-2xl font-bold font-syne">Location Preview</h2>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-white/10">
                        <img 
                          src={mapPreview} 
                          alt="Address location preview" 
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            // If the map image fails to load, show a fallback
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,<svg width="600" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="%23fff" text-anchor="middle" dominant-baseline="middle">Map preview could not be loaded</text></svg>';
                            target.alt = 'Map preview unavailable';
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">Map preview generated from your address</p>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-black" />
                      </div>
                      <h2 className="text-2xl font-bold font-syne">Payment Method</h2>
                    </div>
                    <div className="space-y-3">
                      <label className={`flex items-center gap-4 p-4 bg-black/50 border-2 rounded-lg cursor-pointer transition-all hover:border-[#00ff88] ${
                        formData.paymentMethod === 'upi' ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-white/10'
                      }`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="w-5 h-5 accent-[#00ff88]"
                        />
                        <div className="flex-1 flex items-center gap-3">
                          <CreditCard className="text-[#00ff88]" size={24} />
                          <div>
                            <p className="font-bold">UPI Payment</p>
                            <p className="text-xs text-gray-400">Free shipping</p>
                          </div>
                        </div>
                        <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">FREE SHIPPING</span>
                      </label>
                      <label className={`flex items-center gap-4 p-4 bg-black/50 border-2 rounded-lg cursor-pointer transition-all hover:border-[#00ff88] ${
                        formData.paymentMethod === 'cod' ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-white/10'
                      }`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="w-5 h-5 accent-[#00ff88]"
                        />
                        <div className="flex-1 flex items-center gap-3">
                          <Banknote className="text-[#00ff88]" size={24} />
                          <div>
                            <p className="font-bold">Cash on Delivery</p>
                            <p className="text-xs text-gray-400">Pay when you receive</p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">+₹30 shipping</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold text-lg py-5 rounded-full transition-colors shadow-[0_0_30px_rgba(0,255,136,0.3)] uppercase tracking-widest ${isSubmitting ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-[#00ff88] text-black hover:bg-white'}`}
                  >
                    {isSubmitting ? 'Processing Order...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
                  </button>
                </form>
              )}
            </div>
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-32">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                    <Package size={20} className="text-black" />
                  </div>
                  <h2 className="text-2xl font-bold font-syne">Order Summary</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex gap-3 pb-4 border-b border-white/5">
                      <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded bg-zinc-900" loading="lazy" style={{ imageRendering: 'high-quality' }} />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{item.size} • {item.color} • Qty: {item.quantity}</p>
                        <p className="text-[#00ff88] font-bold mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/5">
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Have a discount code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountMessage('');
                      }}
                      placeholder="Enter code"
                      className="flex-1 bg-white/5 border border-white/10 px-3 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors text-sm"
                      disabled={discountApplied}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyDiscount}
                      disabled={discountApplied}
                      className="px-4 py-2 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-[#00ff88] rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {discountApplied ? '✓ Applied' : 'Apply'}
                    </motion.button>
                  </div>
                  {discountMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs mt-2 ${discountApplied ? 'text-[#00ff88]' : 'text-red-400'}`}
                    >
                      {discountMessage}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-[#00ff88] font-bold' : ''}>
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-[#00ff88] font-bold">
                      <span>Discount ({discountPercentage}%)</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#00ff88]">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Truck className="text-[#00ff88] flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-bold text-[#00ff88]">3-Day Express Delivery</p>
                      <p className="text-xs text-gray-400 mt-1">Your order will be delivered within 3 business days</p>
                    </div>
                  </div>
                </div>

                {/* Points Preview Card */}
                {user && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                             border-2 border-purple-500/30 rounded-2xl relative overflow-hidden"
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 
                                  animate-pulse opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88] to-cyan-500 
                                      rounded-full flex items-center justify-center shadow-lg shadow-[#00ff88]/30">
                          <Gift className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">Loyalty Rewards</p>
                          <p className="text-white/60 text-xs">You'll earn points!</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-white/70 text-sm">Points to Earn:</span>
                          <div className="flex items-baseline gap-1">
                            <motion.span 
                              key={totalAmount}
                              initial={{ scale: 1.5, color: '#00ff88' }}
                              animate={{ scale: 1, color: '#ffffff' }}
                              transition={{ duration: 0.5 }}
                              className="text-3xl font-black font-syne text-[#00ff88]"
                              style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}
                            >
                              +{Math.floor(totalAmount / 10)}
                            </motion.span>
                            <span className="text-white/50 text-xs uppercase">pts</span>
                          </div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#00ff88]/50 to-transparent mb-2" />
                        <p className="text-white/50 text-xs text-center">
                          ₹10 = 1 point • Redeem for discounts
                        </p>
                      </div>
                      
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            '0 0 20px rgba(0, 255, 136, 0.2)',
                            '0 0 30px rgba(0, 255, 136, 0.4)',
                            '0 0 20px rgba(0, 255, 136, 0.2)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-4 p-3 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30"
                      >
                        <p className="text-[#00ff88] text-xs text-center font-semibold">
                          🎉 Complete this order to earn rewards!
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const { getUserProfile, getUserOrders } = await import('./services/userService');
      
      // Get user profile and wishlist
      const profileResult = await getUserProfile(userId);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        
        // Get wishlist products
        const wishlistIds = profileResult.data.wishlist || [];
        const wishlistProds = PRODUCTS.filter(p => wishlistIds.includes(p.id));
        setWishlistProducts(wishlistProds);
      }
      
      // Get user orders
      const ordersResult = await getUserOrders(userId);
      if (ordersResult.success) {
        setOrders(ordersResult.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
      <div className="min-h-screen pt-32 pb-20 bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <div className="w-20 h-20 bg-[#00ff88] rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={40} className="text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-4 font-syne">Account Login</h1>
            <p className="text-gray-400 mb-8">Please sign in to view your account, orders, and wishlist.</p>
            <button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold font-syne">My Account</h1>
              <button
                onClick={() => signOut(auth)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
            
            {/* User Info Card */}
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full border-2 border-[#00ff88]" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{user.displayName}</h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package size={28} className="text-[#00ff88]" />
                <h2 className="text-3xl font-bold font-syne">Past Orders</h2>
                {orders.length > 0 && (
                  <span className="bg-[#00ff88] text-black text-sm font-bold px-3 py-1 rounded-full">
                    {orders.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => loadUserData(user.uid)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors text-sm"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
                <Package size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
                <Link to="/shop/all" className="inline-block bg-[#00ff88] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  // Parse order date properly
                  let orderDateStr = 'N/A';
                  try {
                    if (order.orderDate || order.createdAt) {
                      const dateValue = order.orderDate || order.createdAt;
                      const date = typeof dateValue === 'string' 
                        ? new Date(dateValue)
                        : dateValue.seconds 
                          ? new Date(dateValue.seconds * 1000)
                          : new Date(dateValue);
                      orderDateStr = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                  } catch (e) {
                    console.error('Error parsing order date:', e);
                  }
                  
                  // Determine status badge color and icon
                  const getStatusDisplay = (status: string) => {
                    const statusLower = (status || 'pending').toLowerCase();
                    if (statusLower === 'delivered') return { color: 'text-green-500', icon: '✅', bg: 'bg-green-500/10' };
                    if (statusLower === 'shipped') return { color: 'text-blue-500', icon: '🚚', bg: 'bg-blue-500/10' };
                    if (statusLower === 'processing') return { color: 'text-yellow-500', icon: '🔄', bg: 'bg-yellow-500/10' };
                    return { color: 'text-gray-400', icon: '⏳', bg: 'bg-gray-500/10' };
                  };
                  
                  const statusDisplay = getStatusDisplay(order.status);
                  
                  return (
                    <div key={order.id} className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-[#00ff88]/30 transition-all hover:shadow-lg hover:shadow-[#00ff88]/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-400">
                            Order ID: <span className="text-white font-mono">{order.orderId || order.id}</span>
                          </p>
                          <p className="text-sm text-gray-400 mt-1">{orderDateStr}</p>
                          <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${statusDisplay.bg}`}>
                            <span className="text-lg">{statusDisplay.icon}</span>
                            <span className={`text-xs font-bold uppercase ${statusDisplay.color}`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#00ff88]">₹{order.totalAmount?.toFixed(2)}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                          </p>
                          {order.pointsEarned && (
                            <p className="text-xs text-[#00ff88] mt-1">
                              ⭐ {order.pointsEarned} points earned
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Tracking Link - Prominent Display */}
                      {order.trackingLink && (order.status === 'shipped' || order.status === 'delivered') && (
                        <div className="mb-4 p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
                                <Package size={20} className="text-black" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#00ff88]">Track Your Package</p>
                                <p className="text-xs text-gray-400">Click to see real-time tracking</p>
                              </div>
                            </div>
                            <a
                              href={order.trackingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors"
                            >
                              <Truck size={16} />
                              Track Now
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-4">
                        {order.items?.slice(0, 2).map((item: any, idx: number) => {
                          const product = PRODUCTS.find(p => p.id === item.id);
                          const itemImage = item.image || product?.image || 'https://via.placeholder.com/60x75?text=No+Image';
                          
                          return (
                            <Link
                              key={idx}
                              to={`/product/${item.id}`}
                              className="flex gap-3 pb-3 border-b border-white/5 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer"
                            >
                              <img 
                                src={itemImage} 
                                alt={item.name} 
                                className="w-16 h-20 object-cover rounded bg-zinc-900"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/60x75?text=No+Image';
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-bold text-sm hover:text-[#00ff88] transition-colors">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {item.size} • {item.color} • Qty: {item.quantity}
                                </p>
                                <p className="text-sm text-[#00ff88] font-bold mt-1">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <ChevronRight size={20} className="text-gray-400" />
                              </div>
                            </Link>
                          );
                        })}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-400 text-center py-2">
                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-white/10 space-y-2">
                        <p className="text-sm text-gray-400">
                          <MapPin size={14} className="inline mr-1" />
                          {order.address}, {order.city}, {order.state} - {order.pincode}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Subtotal: ₹{order.subtotal?.toFixed(2)}</span>
                          <span>Shipping: {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost?.toFixed(2)}`}</span>
                        </div>
                      </div>
                      
                      {/* View Full Details Button */}
                      <button
                        onClick={() => {
                          // Convert order to OrderDetailModal format
                          const modalOrder = {
                            id: order.id,
                            orderNumber: (order.orderId || order.id).slice(-8).toUpperCase(),
                            date: order.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                            status: (order.status || 'processing') as any,
                            items: order.items.map((item: any) => ({
                              id: item.id || item.name,
                              name: item.name,
                              image: item.image || '',
                              price: item.price,
                              quantity: item.quantity,
                              size: item.size,
                              color: item.color
                            })),
                            subtotal: order.subtotal || order.totalAmount,
                            shipping: order.shippingCost || 0,
                            tax: 0,
                            discount: order.discount || 0,
                            total: order.totalAmount,
                            customer: {
                              name: order.fullName,
                              email: order.email || user?.email || '',
                              phone: order.phone
                            },
                            shippingAddress: {
                              street: order.address,
                              city: order.city,
                              state: order.state,
                              zip: order.pincode,
                              country: 'India'
                            },
                            payment: {
                              method: order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod,
                              status: 'paid'
                            },
                            tracking: order.trackingLink ? {
                              number: order.trackingLink.split('/').pop() || '',
                              carrier: 'Standard Shipping',
                              url: order.trackingLink
                            } : undefined,
                            timeline: [
                              {
                                status: 'Order Placed',
                                date: order.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
                                description: 'Your order has been received'
                              }
                            ]
                          };
                          setSelectedOrder(modalOrder);
                          setShowOrderModal(true);
                        }}
                        className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Full Order Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Wishlist Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Heart size={28} className="text-[#00ff88]" />
              <h2 className="text-3xl font-bold font-syne">My Wishlist</h2>
            </div>
            
            {wishlistProducts.length === 0 ? (
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
                <Heart size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">Your wishlist is empty. Add some products you love!</p>
                <Link to="/shop/all" className="inline-block bg-[#00ff88] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden group hover:border-[#00ff88]/30 transition-colors">
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        style={{ imageRendering: 'high-quality' }} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#00ff88] transition-colors group"
                      >
                        <Heart size={20} className="text-[#00ff88] fill-[#00ff88] group-hover:text-black" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-2xl font-bold text-[#00ff88] mb-3">₹{product.price}</p>
                      <Link 
                        to={`/product/${product.id}`}
                        className="block w-full bg-[#00ff88] text-black py-2 rounded-lg font-bold text-center hover:bg-white transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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

const Contact = () => (
  <div className="min-h-screen pt-32">
     <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-7xl font-bold mb-8 font-syne">SIGNAL <span className="text-[#00ff88]">US</span></h1>
          <p className="text-xl text-gray-400 mb-12">
            Questions about your order? Want to collaborate? The line is open.
          </p>
          <div className="space-y-8">
             <TiltCard className="flex items-center gap-6 p-6 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-[#00ff88] transition-colors">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-[#00ff88]">
                   <Mail />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-gray-500">Email</h3>
                  <p className="text-xl">support@elevez.com</p>
                </div>
             </TiltCard>
             <TiltCard className="flex items-center gap-6 p-6 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-[#00ff88] transition-colors">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-[#00ff88]">
                   <MapPin />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-gray-500">HQ</h3>
                  <p className="text-xl">Neo-Tokyo, Sector 7</p>
                </div>
             </TiltCard>
          </div>
        </div>
        <form className="bg-zinc-950/80 backdrop-blur-md p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
           <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-xs uppercase font-bold text-gray-500 mb-2">First Name</label>
               <input type="text" className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#00ff88] outline-none transition-colors rounded-lg" />
             </div>
             <div>
               <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Last Name</label>
               <input type="text" className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#00ff88] outline-none transition-colors rounded-lg" />
             </div>
           </div>
           <div>
             <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Email</label>
             <input type="email" className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#00ff88] outline-none transition-colors rounded-lg" />
           </div>
           <div>
             <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Message</label>
             <textarea rows={4} className="w-full bg-black border border-white/10 p-4 text-white focus:border-[#00ff88] outline-none transition-colors rounded-lg" />
           </div>
           <MagneticButton className="w-full bg-white rounded-lg py-4 group">
             <span className="text-black group-hover:text-black font-bold uppercase tracking-widest relative z-20 mix-blend-difference">Transmit Message</span>
           </MagneticButton>
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
    <style>{`
      @keyframes gradientFlow {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      .flowing-gradient {
        background: linear-gradient(
          135deg,
          rgba(0, 255, 136, 0.15) 0%,
          rgba(0, 0, 0, 0.6) 25%,
          rgba(100, 50, 255, 0.15) 50%,
          rgba(0, 0, 0, 0.6) 75%,
          rgba(0, 255, 136, 0.15) 100%
        );
        background-size: 200% 200%;
        animation: gradientFlow 8s ease infinite;
      }
    `}</style>
    <motion.nav 
      style={{
        backdropFilter: `blur(${isScrolled ? 12 : 8}px)`,
        WebkitBackdropFilter: `blur(${isScrolled ? 12 : 8}px)`,
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 255, 136, ${isScrolled ? 0.1 : 0.05})`,
      }}
      className={`flowing-gradient fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'border-white/20 py-3' : 'border-white/10 py-6'}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-3xl font-black tracking-tighter font-syne z-50 relative group">
          {BRAND_NAME}
          <span className="text-[#00ff88] group-hover:text-white transition-colors">.</span>
        </Link>

        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(100, 50, 255, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full border border-white/20 hover:border-[#00ff88]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10"
        >
          <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-colors duration-200 relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-200"></span>
          </Link>
          <Link to="/shop/men" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            Men
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/shop/women" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            Women
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/shop/all" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            Collections
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/about" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/rewards" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            Rewards
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/contact" className="text-xs font-bold uppercase tracking-widest hover:text-[#00ff88] transition-all duration-300 relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff88] group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        <div className="flex items-center gap-6 z-50 relative">
           <Link
            to="/account"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
            className="text-white hover:text-[#00ff88] transition-colors relative group"
           >
             <User className="group-hover:scale-110 transition-transform" />
           </Link>
           <button 
            onClick={() => setIsCartOpen(true)}
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
            className="text-white hover:text-[#00ff88] transition-colors relative group"
           >
             <ShoppingBag className="group-hover:scale-110 transition-transform" />
             {items.length > 0 && (
               <span className="absolute -top-2 -right-2 bg-[#00ff88] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                 {items.length}
               </span>
             )}
           </button>
           <Link to="/shop/all" className="hidden md:block bg-[#00ff88] text-black px-6 py-2 rounded-full text-sm font-bold uppercase hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,255,136,0.3)]">
             Shop Now
           </Link>
           <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>
    </motion.nav>
    {/* Mobile Menu */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 md:hidden"
        >
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Home</Link>
          <Link to="/shop/men" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Men</Link>
          <Link to="/shop/women" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Women</Link>
          <Link to="/shop/all" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Shop All</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">About</Link>
          <Link to="/rewards" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Rewards</Link>
          <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-bold uppercase font-syne">Account</Link>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="bg-black/90 backdrop-blur-md border-t border-white/10 pt-20 pb-10 relative z-10">
     <div className="container mx-auto px-6">
       {/* Loyalty Program Teaser */}
       <div className="mb-16 bg-gradient-to-r from-purple-500/15 to-pink-500/15 backdrop-blur-sm
                     rounded-3xl p-8 border border-white/20 text-center shadow-xl shadow-purple-500/10">
         <div className="flex items-center justify-center gap-3 mb-4">
           <Gift className="w-8 h-8 text-[#00ff88]" />
           <h3 className="text-3xl font-bold">Join Our Rewards Program</h3>
         </div>
         <p className="text-white/70 mb-6 max-w-2xl mx-auto">
           Earn points with every purchase, unlock exclusive tiers, and get amazing discounts. 
           Start earning today!
         </p>
         <Link 
           to="/rewards"
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                    rounded-full text-white font-bold hover:shadow-2xl hover:shadow-purple-500/50 
                    transition-all duration-300 transform hover:scale-105"
         >
           Learn More About Rewards
         </Link>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
         <div>
           <h3 className="text-3xl font-bold mb-6 font-syne">{BRAND_NAME}</h3>
           <p className="text-gray-500 text-sm leading-relaxed">
             Redefining streetwear for the digital age. Quality meets virtual aesthetics. 
             Designed in the Metaverse, worn in reality.
           </p>
         </div>
         <div>
           <h4 className="font-bold uppercase mb-6 text-xs tracking-widest text-[#00ff88]">Shop</h4>
           <ul className="space-y-4 text-gray-400 text-sm">
             <li><Link to="/shop/men" className="hover:text-white transition-colors">Men</Link></li>
             <li><Link to="/shop/women" className="hover:text-white transition-colors">Women</Link></li>
             <li><Link to="/shop/all" className="hover:text-white transition-colors">All Products</Link></li>
             <li><Link to="/shop/all?type=Hoodie" className="hover:text-white transition-colors">Hoodies</Link></li>
           </ul>
         </div>
         <div>
           <h4 className="font-bold uppercase mb-6 text-xs tracking-widest text-[#00ff88]">Support</h4>
           <ul className="space-y-4 text-gray-400 text-sm">
             <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
             <li><Link to="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
             <li><Link to="#" className="hover:text-white transition-colors">Returns</Link></li>
             <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
           </ul>
         </div>
         <div>
           <h4 className="font-bold uppercase mb-6 text-xs tracking-widest text-[#00ff88]">Social</h4>
           <div className="flex gap-4">
             <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-[#00ff88] hover:text-black transition-all"><Instagram size={20}/></a>
             <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-[#00ff88] hover:text-black transition-all"><Twitter size={20}/></a>
           </div>
         </div>
       </div>
       <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs">
         <p>&copy; 2024 {BRAND_NAME}. All rights reserved.</p>
         <div className="flex gap-6 mt-4 md:mt-0">
           <a href="#">Privacy Policy</a>
           <a href="#">Terms of Service</a>
         </div>
       </div>
     </div>
  </footer>
);

// Simple Custom Cursor - Always Visible, Perfectly Synced, ALWAYS ON TOP
const OptimizedCursor = ({ variant, position }: { variant: CursorVariant, position: { x: number, y: number } }) => {
  const isHover = variant !== 'default';
  
  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: 0,
        top: 0,
        zIndex: 2147483647, // Maximum z-index value
        transform: `translate(${position.x}px, ${position.y}px)`,
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

function App() {
  const { cursorVariant, setCursorVariant, mousePosition } = useCursor();
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

  // Optimized mouse tracking with throttling for gradient
  useEffect(() => {
    let rafId: number;
    let lastUpdate = 0;
    const throttleMs = 50; // Update every 50ms max

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        lastUpdate = now;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
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
      <QuickViewProvider>
        <HashRouter>
          <div className="bg-black min-h-screen text-white selection:bg-[#00ff88] selection:text-black font-space"
               style={{
                 willChange: 'auto',
                 transform: 'translateZ(0)',
                 backfaceVisibility: 'hidden',
               }}>
            <ScrollProgressBar />
            <Navbar />
            <CartSidebar />
            <QuickViewModal />
            <ScrollToTop />
            <main className="relative z-10">
              <Routes>
                <Route path="/" element={<Home setCursorVariant={setCursorVariant} />} />
                <Route path="/shop/:category" element={<Shop setCursorVariant={setCursorVariant} />} />
                <Route path="/product/:id" element={<ProductDetail setCursorVariant={setCursorVariant} />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account setCursorVariant={setCursorVariant} />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/order/:orderId" element={<OrderDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Floating Rewards Button & Modal */}
            <FloatingRewardsButton onClick={() => setIsRewardsModalOpen(true)} />
            <RewardsModal isOpen={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} />
            
            {/* Exit Intent Popup */}
            <ExitIntentPopup />
          </div>
          
          {/* Optimized Custom Cursor - Rendered OUTSIDE main container for maximum z-index */}
          <OptimizedCursor variant={cursorVariant} position={mousePosition} />
        </HashRouter>
      </QuickViewProvider>
    </CartProvider>
  );
}

export default App;
