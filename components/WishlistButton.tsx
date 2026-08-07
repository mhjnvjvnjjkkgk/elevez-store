import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface WishlistButtonProps {
  productId: string;
  onToggle?: (isWishlisted: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, onToggle }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: any = () => {};
    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            try {
              const { getUserProfile } = await import('../services/userService');
              const result = await getUserProfile(currentUser.uid);
              if (result && result.success && result.data && Array.isArray(result.data.wishlist)) {
                setIsWishlisted(result.data.wishlist.includes(productId));
              }
            } catch (error) {
              console.error('Error checking wishlist:', error);
            }
          }
        });
      }
    } catch (e) {
      console.error('Wishlist auth listener error:', e);
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [productId]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to add items to your wishlist');
      return;
    }

    try {
      const { addToWishlist, removeFromWishlist } = await import('../services/userService');

      if (isWishlisted) {
        await removeFromWishlist(user.uid, productId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(user.uid, productId);
        setIsWishlisted(true);
      }

      onToggle?.(!isWishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleWishlist}
      className={`w-8 h-8 sm:w-9 sm:h-9 border-2 border-black rounded-lg transition-all flex items-center justify-center cursor-pointer ${
        isWishlisted
          ? 'bg-[#ff007f] text-white shadow-[2px_2px_0px_0px_#00ff88]'
          : 'bg-black text-[#ff007f] shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff007f] hover:text-white'
      }`}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2.5} />
    </motion.button>
  );
};
