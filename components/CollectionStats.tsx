import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { Collection } from '../services/collectionService';
import { ProductWithCollections } from '../services/productCollectionService';

interface CollectionStatsProps {
  collections: Collection[];
  products: ProductWithCollections[];
  onBack: () => void;
}

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  collections,
  products,
  onBack
}) => {
  const stats = useMemo(() => {
    const systemCollections = collections.filter(c => c.isSystem);
    const customCollections = collections.filter(c => !c.isSystem);
    
    const totalProducts = products.length;
    const avgProductsPerCollection = collections.length > 0 
      ? Math.round(totalProducts / collections.length) 
      : 0;
    
    const collectionProductCounts = collections.map(collection => ({
      name: collection.name,
      count: collection.productCount,
      isSystem: collection.isSystem
    })).sort((a, b) => b.count - a.count);

    const topCollections = collectionProductCounts.slice(0, 5);
    const totalValue = products.reduce((sum, p) => sum + (p.price * 1), 0);
    const avgProductPrice = products.length > 0 ? totalValue / products.length : 0;

    return {
      systemCollections: systemCollections.length,
      customCollections: customCollections.length,
      totalProducts,
      avgProductsPerCollection,
      topCollections,
      totalValue,
      avgProductPrice
    };
  }, [collections, products]);

  return (
    <div className="max-w-6xl mx-auto">
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

        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Collections Statistics</h2>
          <p className="text-gray-400">Overview and analytics for your collections</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-bold">Total Collections</h3>
            <BarChart3 size={24} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">{collections.length}</p>
          <p className="text-xs text-gray-400">
            {stats.systemCollections} system, {stats.customCollections} custom
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-bold">Total Products</h3>
            <Package size={24} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400">Across all collections</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-bold">Avg Products/Collection</h3>
            <TrendingUp size={24} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">{stats.avgProductsPerCollection}</p>
          <p className="text-xs text-gray-400">Average distribution</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 border border-[#00ff88]/30 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-bold">Total Value</h3>
            <BarChart3 size={24} className="text-[#00ff88]" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">${stats.totalValue.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Avg: ${stats.avgProductPrice.toFixed(2)}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">Top Collections by Product Count</h3>
        <div className="space-y-4">
          {stats.topCollections.map((collection, index) => (
            <motion.div
              key={collection.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#00ff88] font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">{collection.name}</p>
                    {collection.isSystem && (
                      <p className="text-xs text-purple-400">System Collection</p>
                    )}
                  </div>
                  <span className="text-[#00ff88] font-bold">{collection.count} products</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(collection.count / stats.topCollections[0].count) * 100}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6f]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Collection Types</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">System Collections</span>
                <span className="text-purple-400 font-bold">{stats.systemCollections}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${collections.length > 0 ? (stats.systemCollections / collections.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Custom Collections</span>
                <span className="text-green-400 font-bold">{stats.customCollections}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${collections.length > 0 ? (stats.customCollections / collections.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-6">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
              <span className="text-gray-400">Collections with Products</span>
              <span className="text-[#00ff88] font-bold">
                {collections.filter(c => c.productCount > 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
              <span className="text-gray-400">Empty Collections</span>
              <span className="text-yellow-400 font-bold">
                {collections.filter(c => c.productCount === 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
              <span className="text-gray-400">Largest Collection</span>
              <span className="text-blue-400 font-bold">
                {Math.max(...collections.map(c => c.productCount), 0)} products
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
