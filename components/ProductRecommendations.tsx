import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface ProductRecommendationsProps {
  currentProductId?: string;
  limit?: number;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  currentProductId, 
  limit = 4 
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  
  // Get CartContext - we'll need to import it from App
  // For now, we'll use a simple state management approach
  const handleQuickAdd = (product: Product) => {
    // Trigger add to cart
    const event = new CustomEvent('quickAddToCart', { detail: { product, size: 'M', color: product.colors?.[0] || 'Standard', quantity: 1 } });
    window.dispatchEvent(event);
    
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  useEffect(() => {
    // Simulate recommendation algorithm
    const getRecommendations = () => {
      let filtered = PRODUCTS.filter(p => p.id !== currentProductId);
      
      // Shuffle and limit
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, limit));
      setLoading(false);
    };

    const timer = setTimeout(getRecommendations, 300);
    return () => clearTimeout(timer);
  }, [currentProductId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full"
        />
      </div>
    );
  }

  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black font-syne text-white mb-4">
            You Might Also Like
          </h2>
          <p className="text-gray-400 text-lg">
            Personalized recommendations based on your interests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {recommendations.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#00ff88]/50 transition-all duration-300 aspect-[4/5]">
                    {/* Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      style={{ imageRendering: 'high-quality' }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <motion.button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAdd(product);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          addedToCart === product.id
                            ? 'bg-green-500 text-white'
                            : 'bg-[#00ff88] text-black hover:bg-white'
                        }`}
                      >
                        {addedToCart === product.id ? (
                          <>
                            <Check size={16} />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={16} />
                            Quick Add
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-[#00ff88]/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-[#00ff88]/30">
                      <p className="text-[#00ff88] text-xs font-bold">Recommended</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4">
                    <h3 className="text-white font-bold line-clamp-2 group-hover:text-[#00ff88] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#00ff88] font-bold">₹{product.price}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < Math.floor(product.rating) ? 'fill-[#00ff88] text-[#00ff88]' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Link
            to="/shop/all"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full uppercase tracking-widest border border-white/20 hover:border-[#00ff88]/50 transition-all flex items-center gap-2 group"
          >
            View All Products
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};
