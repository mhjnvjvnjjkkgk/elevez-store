import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Check, X, Package } from 'lucide-react';
import { Collection } from '../services/collectionService';
import { ProductWithCollections, productCollectionService } from '../services/productCollectionService';

interface ProductAssignmentProps {
  collection: Collection;
  products: ProductWithCollections[];
  onBack: () => void;
  onUpdate: () => void;
}

export const ProductAssignment: React.FC<ProductAssignmentProps> = ({
  collection,
  products,
  onBack,
  onUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignedProducts();
  }, [collection.id]);

  const loadAssignedProducts = async () => {
    try {
      setLoading(true);
      const assigned = await productCollectionService.getProductsByCollection(collection.id);
      setSelectedProducts(new Set(assigned.map(p => p.id)));
    } catch (error) {
      console.error('Error loading assigned products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      await productCollectionService.assignProductsToCollection(
        collection.id,
        Array.from(selectedProducts)
      );
      await onUpdate();
      onBack();
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save product assignments');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedProducts.size;
  const totalCount = products.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#00ff88] hover:text-[#00dd77] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Collections
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Assign Products to Collection
            </h2>
            <p className="text-gray-400">
              {collection.name} - {selectedCount} of {totalCount} products selected
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedProducts(new Set(products.map(p => p.id)))}
          className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg font-bold transition-colors"
        >
          Select All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedProducts(new Set())}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg font-bold transition-colors"
        >
          Clear All
        </motion.button>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center py-12"
            >
              <Package size={64} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
              <p className="text-gray-400">Try adjusting your search</p>
            </motion.div>
          ) : (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleToggleProduct(product.id)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden group ${
                  selectedProducts.has(product.id)
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-white/10 bg-zinc-900 hover:border-white/20'
                }`}
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 overflow-hidden relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} className="text-gray-600" />
                    </div>
                  )}

                  {/* Checkbox Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                      selectedProducts.has(product.id)
                        ? 'bg-[#00ff88] border-[#00ff88]'
                        : 'bg-transparent border-white'
                    }`}>
                      {selectedProducts.has(product.id) && (
                        <Check size={24} className="text-black" />
                      )}
                    </div>
                  </div>\n                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white truncate mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">SKU: {product.id}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      selectedProducts.has(product.id)
                        ? 'text-[#00ff88]'
                        : 'text-gray-400'
                    }`}>
                      ${product.price}
                    </span>
                    {selectedProducts.has(product.id) && (
                      <Check size={16} className="text-[#00ff88]" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 sticky bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-6 rounded-lg"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-colors"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveAssignments}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-[#00ff88] hover:bg-[#00dd77] text-black rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : `Save ${selectedCount} Products`}
        </motion.button>
      </motion.div>
    </div>
  );
};
