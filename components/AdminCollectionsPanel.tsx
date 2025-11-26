import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Grid, List, BarChart3, Package, Edit2, Trash2 } from 'lucide-react';
import { collectionService, Collection } from '../services/collectionService';
import { productCollectionService, ProductWithCollections } from '../services/productCollectionService';
import { CollectionsList } from './CollectionsList';
import { CollectionForm } from './CollectionForm';
import { ProductAssignment } from './ProductAssignment';
import { CollectionStats } from './CollectionStats';
import { CollectionTemplates } from './CollectionTemplates';
import { AutomationRulesBuilder } from './AutomationRulesBuilder';
import { CollectionAnalyticsDashboard } from './CollectionAnalyticsDashboard';
import { BulkOperationsPanel } from './BulkOperationsPanel';

interface AdminCollectionsPanelProps {
  adminId: string;
}

export const AdminCollectionsPanel: React.FC<AdminCollectionsPanelProps> = ({ adminId }) => {
  const [view, setView] = useState<'list' | 'form' | 'assign' | 'stats' | 'templates' | 'automation' | 'analytics' | 'bulk'>('list');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<ProductWithCollections[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
    initializeAllCollection();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [collectionsData, productsData] = await Promise.all([
        collectionService.getAllCollections(),
        productCollectionService.getAllProductsWithCollections()
      ]);
      setCollections(collectionsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAllCollection = async () => {
    try {
      await collectionService.createAllCollection();
    } catch (error) {
      console.error('Error initializing All collection:', error);
    }
  };

  const handleCreateCollection = () => {
    setSelectedCollection(null);
    setView('form');
  };

  const handleEditCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setView('form');
  };

  const handleAssignProducts = (collection: Collection) => {
    setSelectedCollection(collection);
    setView('assign');
  };

  const handleViewAutomation = (collection: Collection) => {
    setSelectedCollection(collection);
    setView('automation');
  };

  const handleViewAnalytics = (collection: Collection) => {
    setSelectedCollection(collection);
    setView('analytics');
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await collectionService.deleteCollection(collectionId);
        await loadData();
      } catch (error) {
        console.error('Error deleting collection:', error);
        alert('Failed to delete collection');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedCollection) {
        await collectionService.updateCollection(selectedCollection.id, formData);
      } else {
        await collectionService.createCollection(
          formData.name,
          formData.description,
          formData.image
        );
      }
      await loadData();
      setView('list');
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCollection(null);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading collections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Collections Management</h2>
                    <p className="text-gray-400">Manage product categories and collections</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('templates')}
                      className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      Templates
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('automation')}
                      className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      Automation
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('analytics')}
                      className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      Analytics
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('bulk')}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      Bulk Ops
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setView('stats')}
                      className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                    >
                      <BarChart3 size={16} />
                      Stats
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateCollection}
                      className="flex items-center gap-2 bg-[#00ff88] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#00dd77] transition-colors text-sm"
                    >
                      <Plus size={16} />
                      New
                    </motion.button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Collections</p>
                    <p className="text-2xl font-bold text-white">{collections.length}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-green-400">{products.length}</p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Avg Products/Collection</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {collections.length > 0 ? Math.round(products.length / collections.length) : 0}
                    </p>
                  </div>
                  <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">System Collections</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {collections.filter(c => c.isSystem).length}
                    </p>
                  </div>
                </div>

                {/* Search and View Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search collections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-[#00ff88] text-black'
                          : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
                      }`}
                    >
                      <Grid size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-[#00ff88] text-black'
                          : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
                      }`}
                    >
                      <List size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Collections List */}
              <CollectionsList
                collections={filteredCollections}
                viewMode={viewMode}
                onEdit={handleEditCollection}
                onDelete={handleDeleteCollection}
                onAssignProducts={handleAssignProducts}
                onViewAutomation={handleViewAutomation}
                onViewAnalytics={handleViewAnalytics}
              />
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollectionForm
                collection={selectedCollection}
                onSubmit={handleFormSubmit}
                onCancel={handleBackToList}
              />
            </motion.div>
          )}

          {view === 'assign' && selectedCollection && (
            <motion.div
              key="assign"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProductAssignment
                collection={selectedCollection}
                products={products}
                onBack={handleBackToList}
                onUpdate={loadData}
              />
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollectionStats
                collections={collections}
                products={products}
                onBack={handleBackToList}
              />
            </motion.div>
          )}

          {view === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollectionTemplates
                onBack={handleBackToList}
                onTemplateApplied={loadData}
              />
            </motion.div>
          )}

          {view === 'automation' && selectedCollection && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AutomationRulesBuilder
                collection={selectedCollection}
                onBack={handleBackToList}
              />
            </motion.div>
          )}

          {view === 'analytics' && selectedCollection && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollectionAnalyticsDashboard
                collection={selectedCollection}
                onBack={handleBackToList}
              />
            </motion.div>
          )}

          {view === 'bulk' && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <BulkOperationsPanel
                onBack={handleBackToList}
                onComplete={loadData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
