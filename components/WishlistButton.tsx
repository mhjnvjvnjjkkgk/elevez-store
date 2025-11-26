import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2 } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface WishlistButtonProps {
  productId: string;
  onToggle?: (isWishlisted: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, onToggle }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if product is in wishlist
        try {
          const { getUserProfile } = await import('../services/userService');
          const result = await getUserProfile(currentUser.uid);
          if (result.success) {
            setIsWishlisted(result.data.wishlist?.includes(productId) || false);
          }
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [productId]);

  const handleToggleWishlist = async () => {
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#/product/${productId}`;
    const shareText = `Check out this amazing product on ${window.location.hostname}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this out!',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleWishlist}
        className={`p-3 rounded-full transition-all border-2 ${
          isWishlisted
            ? 'bg-[#00ff88]/20 border-[#00ff88] text-[#00ff88]'
            : 'bg-white/10 border-white/20 text-white hover:border-[#00ff88]/50'
        }`}
      >
        <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="p-3 rounded-full bg-white/10 border-2 border-white/20 text-white hover:border-[#00ff88]/50 transition-all"
      >
        <Share2 size={20} />
      </motion.button>
    </div>
  );
};
