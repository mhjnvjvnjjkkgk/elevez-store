import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, ShoppingBag, Heart } from 'lucide-react';
import { motion as motionDiv, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '../constants';

interface TickerEvent {
  id: string;
  name: string;
  location: string;
  action: 'purchase' | 'cart' | 'wishlist';
  product: typeof PRODUCTS[0];
  timeAgo: string;
}

const BUYER_NAMES = ["A***k", "M***h", "S***y", "J***n", "T***o", "K***v", "D***e", "R***x", "Z***a", "N***o", "Y***i", "C***o"];
const LOCATIONS = ["Mumbai, MH", "Bengaluru, KA", "New Delhi, DL", "Kolkata, WB", "Chennai, TN", "Hyderabad, TG", "Ahmedabad, GJ", "Pune, MH", "Jaipur, RJ", "Lucknow, UP", "Chandigarh, CH", "Kochi, KL", "Indore, MP", "Guwahati, AS", "Patna, BR", "Bhubaneswar, OR"];

export const LiveActivityTicker: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<TickerEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateRandomEvent = () => {
    // Don't show if user manually closed it recently
    if (isDismissed) return;

    const randomName = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    // Pick a random product from constants PRODUCTS
    const enabledProducts = PRODUCTS.filter(p => p.showInHome !== false);
    const randomProduct = enabledProducts[Math.floor(Math.random() * enabledProducts.length)];
    
    const actions: Array<'purchase' | 'cart' | 'wishlist'> = ['purchase', 'cart', 'purchase', 'wishlist'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const newEvent: TickerEvent = {
      id: Math.random().toString(36).substring(2, 9),
      name: randomName,
      location: randomLocation,
      action: randomAction,
      product: randomProduct,
      timeAgo: 'Just now'
    };

    setCurrentEvent(newEvent);

    // Auto-clear after 6.5 seconds
    setTimeout(() => {
      setCurrentEvent(prev => prev?.id === newEvent.id ? null : prev);
    }, 6500);
  };

  useEffect(() => {
    // Generate initial event after 12 seconds
    const initialTimer = setTimeout(() => {
      generateRandomEvent();
    }, 12000);

    // Set interval to trigger new events every 35 seconds
    intervalRef.current = setInterval(() => {
      generateRandomEvent();
    }, 35000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDismissed]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEvent(null);
    setIsDismissed(true);
    // Re-enable ticker after 5 minutes
    setTimeout(() => {
      setIsDismissed(false);
    }, 300000);
  };

  return (
    <AnimatePresence>
      {currentEvent && (
        <motionDiv
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{ zIndex: 9950 }}
          className="fixed bottom-[80px] md:bottom-6 left-4 md:left-6 flex items-center gap-4 bg-black border-[3px] border-black p-3 pr-8 shadow-[4px_4px_0_0_#00ff88] max-w-[340px] text-white overflow-hidden select-none font-mono"
        >

          {/* Product Thumbnail */}
          <div className="w-11 h-11 shrink-0 border-2 border-white bg-zinc-900 overflow-hidden">
            <img 
              src={currentEvent.product.image} 
              alt={currentEvent.product.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event Content */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              {currentEvent.action === 'purchase' && (
                <span className="flex items-center gap-1 text-[#00ff88] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-[#00ff88]/30 bg-[#00ff88]/10 rounded">
                  <Zap size={8} fill="currentColor" /> Secured
                </span>
              )}
              {currentEvent.action === 'cart' && (
                <span className="flex items-center gap-1 text-[#00bfff] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-[#00bfff]/30 bg-[#00bfff]/10 rounded">
                  <ShoppingBag size={8} /> Hot Cart
                </span>
              )}
              {currentEvent.action === 'wishlist' && (
                <span className="flex items-center gap-1 text-[#ff1493] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-[#ff1493]/30 bg-[#ff1493]/10 rounded">
                  <Heart size={8} fill="currentColor" /> Hyped
                </span>
              )}
              <span className="text-[9px] text-gray-400 font-bold">{currentEvent.location}</span>
            </div>
            <span className="text-[10.5px] font-bold text-white leading-tight uppercase tracking-tight">
              {currentEvent.name} {currentEvent.action === 'purchase' ? 'bought' : currentEvent.action === 'cart' ? 'bagged' : 'liked'} the {currentEvent.product.name}
            </span>
          </div>

          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-1 right-1 p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </motionDiv>
      )}
    </AnimatePresence>
  );
};
