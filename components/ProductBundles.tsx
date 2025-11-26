import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { productBundleService, ProductBundle } from '../services/productBundleService';
import { useCart } from '../hooks/useCart';

interface ProductBundlesProps {
  product: Product;
  allProducts: Product[];
}

export const ProductBundles: React.FC<ProductBundlesProps> = ({ product, allProducts }) => {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const recommendedBundles = productBundleService.getRecommendedBundles(product, allProducts);
    setBundles(recommendedBundles);
  }, [product, allProducts]);

  const handleAddBundleToCart = (bundle: ProductBundle) => {
    bundle.items.forEach(item => {
      addToCart(item.product, item.quantity);
    });
  };

  const getBundleIcon = (type: ProductBundle['type']) => {
    switch (type) {
      case 'complete-look':
        return <Sparkles size={20} />;
      case 'frequently-bought':
        return <TrendingUp size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  if (bundles.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Bundle & Save</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00ff88]/50 transition-all"
          >
            {/* Bundle Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#00ff88]/10 rounded-lg text-[#00ff88]">
                {getBundleIcon(bundle.type)}
              </div>
              <div>
                <h3 className="font-bold">{bundle.name}</h3>
                <p className="text-sm text-gray-400">{bundle.description}</p>
              </div>
            </div>

            {/* Bundle Items */}
            <div className="space-y-3 mb-4">
              {bundle.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-400">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Original Price:</span>
                <span className="line-through text-gray-500">
                  ${bundle.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Bundle Price:</span>
                <span className="text-2xl font-bold text-[#00ff88]">
                  ${bundle.bundlePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">You Save:</span>
                <span className="text-sm font-bold text-[#00ff88]">
                  ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}%)
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddBundleToCart(bundle)}
              className="w-full bg-[#00ff88] text-black py-3 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Add Bundle to Cart
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
