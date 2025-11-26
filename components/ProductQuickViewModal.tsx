import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Share2, Ruler, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
  onViewFullDetails?: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToWishlist,
  onViewFullDetails
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const sizes = (product as any).sizes || ['S', 'M', 'L', 'XL'];
  const colors = (product as any).colors || [];
  const images = (product as any).images || [product.image];
  const rating = (product as any).rating || 4.5;
  const reviews = (product as any).reviews || 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[90vh] bg-black border border-white/10 rounded-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 bg-black/80 backdrop-blur-sm hover:bg-white/10 rounded-full transition-colors"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-black/80 backdrop-blur-sm hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
              {/* Left: Images */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-[3/4] bg-black/20 rounded-xl overflow-hidden mb-4">
                  <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  {(product as any).isNew && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#00ff88] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                  {(product as any).discount && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      -{(product as any).discount}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          currentImage === index
                            ? 'border-[#00ff88]'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="flex flex-col">
                {/* Product Info */}
                <div className="mb-6">
                  {product.category && (
                    <p className="text-sm text-gray-400 mb-2">{product.category}</p>
                  )}
                  <h2 className="text-3xl font-bold mb-3">{product.name}</h2>
                  
                  {/* Rating */}
                  {reviews > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {rating} ({reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-4xl font-bold text-[#00ff88]">
                      ${product.price.toFixed(2)}
                    </p>
                    {(product as any).originalPrice && (
                      <p className="text-xl text-gray-500 line-through">
                        ${(product as any).originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-bold">Size</label>
                      <button className="text-sm text-[#00ff88] hover:text-white transition-colors flex items-center gap-1">
                        <Ruler size={14} />
                        Size Guide
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 rounded-lg border-2 font-bold transition-all ${
                            selectedSize === size
                              ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <label className="font-bold mb-3 block">Color</label>
                    <div className="flex gap-2">
                      {colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === color
                              ? 'border-[#00ff88] scale-110'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="font-bold mb-3 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 mt-auto">
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      addedToCart
                        ? 'bg-green-500 text-white'
                        : 'bg-[#00ff88] text-black hover:bg-white'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onAddToWishlist?.(product)}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Heart size={18} />
                      Wishlist
                    </button>
                    <button
                      onClick={() => onViewFullDetails?.(product)}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Full Details
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                {(product as any).inStock !== false ? (
                  <p className="text-sm text-green-400 mt-4 flex items-center gap-2">
                    <Check size={16} />
                    In Stock - Ships within 24 hours
                  </p>
                ) : (
                  <p className="text-sm text-red-400 mt-4">
                    Out of Stock
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
