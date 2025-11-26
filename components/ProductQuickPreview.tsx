import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductQuickPreviewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductQuickPreview: React.FC<ProductQuickPreviewProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Standard');
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = [product.image]; // You can add more images if available

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-black border border-white/10 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black rounded-full transition-colors"
              >
                <X size={24} className="text-white" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Image Section */}
                <div className="relative">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                    <motion.img
                      key={imageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={images[imageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'high-quality' }}
                    />

                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black rounded-full transition-colors"
                        >
                          <ChevronLeft size={20} className="text-white" />
                        </button>
                        <button
                          onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black rounded-full transition-colors"
                        >
                          <ChevronRight size={20} className="text-white" />
                        </button>
                      </>
                    )}

                    {/* 360 Rotation Indicator */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
                      <p className="text-xs text-gray-300">360° View</p>
                    </div>
                  </div>

                  {/* Wishlist Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-4 left-4 p-3 bg-black/50 hover:bg-[#00ff88] rounded-full transition-colors"
                  >
                    <Heart size={20} className="text-white hover:text-black" />
                  </motion.button>
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                    <p className="text-[#00ff88] font-bold text-2xl mb-4">₹{product.price}</p>

                    {/* Color Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-400 mb-3">COLOR</p>
                      <div className="flex gap-3">
                        {product.colors?.map((color) => (
                          <motion.button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            whileHover={{ scale: 1.1 }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedColor === color
                                ? 'bg-[#00ff88] text-black border-[#00ff88]'
                                : 'bg-transparent text-gray-400 border-white/20 hover:border-white/40'
                            }`}
                          >
                            {color}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-400 mb-3">SIZE</p>
                      <div className="flex gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <motion.button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            whileHover={{ scale: 1.05 }}
                            className={`w-10 h-10 rounded-lg border-2 font-bold transition-all ${
                              selectedSize === size
                                ? 'bg-[#00ff88] text-black border-[#00ff88]'
                                : 'bg-transparent text-gray-400 border-white/20 hover:border-white/40'
                            }`}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-400 mb-3">QUANTITY</p>
                      <div className="flex items-center gap-3 bg-white/10 rounded-lg p-2 w-fit">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1 hover:bg-white/20 rounded transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-1 hover:bg-white/20 rounded transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                  >
                    <ShoppingBag size={20} />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
