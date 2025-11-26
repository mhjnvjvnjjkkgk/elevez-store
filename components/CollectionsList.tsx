import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Package, Zap, BarChart3 } from 'lucide-react';
import { Collection } from '../services/collectionService';

interface CollectionsListProps {
  collections: Collection[];
  viewMode: 'grid' | 'list';
  onEdit: (collection: Collection) => void;
  onDelete: (collectionId: string) => void;
  onAssignProducts: (collection: Collection) => void;
  onViewAutomation?: (collection: Collection) => void;
  onViewAnalytics?: (collection: Collection) => void;
}

export const CollectionsList: React.FC<CollectionsListProps> = ({
  collections,
  viewMode,
  onEdit,
  onDelete,
  onAssignProducts,
  onViewAutomation,
  onViewAnalytics
}) => {
  const getCollectionIcon = (collection: Collection) => {
    if (collection.isSystem) {
      return '🏪';
    }
    return '📦';
  };

  const getCollectionBadge = (collection: Collection) => {
    if (collection.isSystem) {
      return (
        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full">
          System
        </span>
      );
    }
    return null;
  };

  if (collections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Package size={64} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Collections Found</h3>
        <p className="text-gray-400">Create your first collection to get started</p>
      </motion.div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden hover:border-[#00ff88]/50 transition-colors group"
          >
            <div className="aspect-video bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 relative overflow-hidden">
              {collection.image ? (
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">{getCollectionIcon(collection)}</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAssignProducts(collection)}
                  className="p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg text-white transition-colors"
                  title="Assign Products"
                >
                  <Package size={14} />
                </motion.button>
                {onViewAutomation && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onViewAutomation(collection)}
                    className="p-2 bg-orange-500/80 hover:bg-orange-500 rounded-lg text-white transition-colors"
                    title="Automation Rules"
                  >
                    <Zap size={14} />
                  </motion.button>
                )}
                {onViewAnalytics && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onViewAnalytics(collection)}
                    className="p-2 bg-cyan-500/80 hover:bg-cyan-500 rounded-lg text-white transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 size={14} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(collection)}
                  className="p-2 bg-yellow-500/80 hover:bg-yellow-500 rounded-lg text-white transition-colors"
                  title="Edit Collection"
                >
                  <Edit2 size={14} />
                </motion.button>
                {!collection.isSystem && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(collection.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white truncate">{collection.name}</h3>
                {getCollectionBadge(collection)}
              </div>

              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {collection.description || 'No description'}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-[#00ff88]">
                  <Package size={14} />
                  <span>{collection.productCount} products</span>
                </div>
                <div className="text-gray-500">
                  Order: {collection.order}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/50">
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Collection</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Description</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Products</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Order</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Type</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection, index) => (
              <motion.tr
                key={collection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCollectionIcon(collection)}</span>
                    <div>
                      <p className="text-white font-medium">{collection.name}</p>
                      <p className="text-xs text-gray-500">ID: {collection.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 max-w-xs">
                  <p className="truncate">{collection.description || 'No description'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-[#00ff88]">
                    <Package size={14} />
                    <span className="font-bold">{collection.productCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {collection.order}
                </td>
                <td className="px-6 py-4">
                  {getCollectionBadge(collection) || (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                      Custom
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onAssignProducts(collection)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                      title="Assign Products"
                    >
                      <Package size={16} />
                    </motion.button>
                    {onViewAutomation && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onViewAutomation(collection)}
                        className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors text-orange-400"
                        title="Automation Rules"
                      >
                        <Zap size={16} />
                      </motion.button>
                    )}
                    {onViewAnalytics && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onViewAnalytics(collection)}
                        className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors text-cyan-400"
                        title="Analytics"
                      >
                        <BarChart3 size={16} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(collection)}
                      className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors text-yellow-400"
                      title="Edit Collection"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                    {!collection.isSystem && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(collection.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        title="Delete Collection"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
