import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Trash2, Download, CheckCircle } from 'lucide-react';
import { collectionService, Collection } from '../services/collectionService';

interface BulkOperationsPanelProps {
  onBack: () => void;
  onComplete: () => void;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  onBack,
  onComplete
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);
  const [operation, setOperation] = useState<'duplicate' | 'delete' | 'export' | null>(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.getAllCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const toggleAll = () => {
    if (selectedCollections.size === collections.length) {
      setSelectedCollections(new Set());
    } else {
      setSelectedCollections(new Set(collections.map(c => c.id)));
    }
  };

  const handleDuplicate = async () => {
    if (selectedCollections.size === 0) {
      alert('Please select at least one collection');
      return;
    }

    try {
      setOperating(true);
      setOperation('duplicate');
      setProgress(0);
      setCompleted(false);

      const selectedArray = Array.from(selectedCollections);
      const total = selectedArray.length;

      for (let i = 0; i < selectedArray.length; i++) {
        const collection = collections.find(c => c.id === selectedArray[i]);
        if (collection) {
          await collectionService.createCollection(
            `${collection.name} (Copy)`,
            collection.description,
            collection.image
          );
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setCompleted(true);
      setTimeout(() => {
        onComplete();
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error duplicating collections:', error);
      alert('Failed to duplicate collections');
    } finally {
      setOperating(false);
    }
  };

  const handleDelete = async () => {
    if (selectedCollections.size === 0) {
      alert('Please select at least one collection');
      return;
    }

    if (!window.confirm(`Delete ${selectedCollections.size} collection(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setOperating(true);
      setOperation('delete');
      setProgress(0);
      setCompleted(false);

      const selectedArray = Array.from(selectedCollections);
      const total = selectedArray.length;

      for (let i = 0; i < selectedArray.length; i++) {
        const collectionId = selectedArray[i] as string;
        if (collectionId) {
          await collectionService.deleteCollection(collectionId);
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setCompleted(true);
      setTimeout(() => {
        onComplete();
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error deleting collections:', error);
      alert('Failed to delete collections');
    } finally {
      setOperating(false);
    }
  };

  const handleExport = async () => {
    if (selectedCollections.size === 0) {
      alert('Please select at least one collection');
      return;
    }

    try {
      setOperating(true);
      setOperation('export');
      setProgress(0);
      setCompleted(false);

      const selectedArray = Array.from(selectedCollections);
      const exportData = collections.filter(c => selectedArray.includes(c.id));

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `collections-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setCompleted(true);
      setTimeout(() => {
        setOperating(false);
        setOperation(null);
      }, 1500);
    } catch (error) {
      console.error('Error exporting collections:', error);
      alert('Failed to export collections');
      setOperating(false);
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Collections
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Bulk Operations</h2>
          <p className="text-gray-400">Manage multiple collections at once</p>
        </motion.div>

        {operating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {operation === 'duplicate' && 'Duplicating Collections...'}
                {operation === 'delete' && 'Deleting Collections...'}
                {operation === 'export' && 'Exporting Collections...'}
              </h3>
              {completed && <CheckCircle size={24} className="text-green-400" />}
            </div>
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6f]"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{progress}% Complete</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Collections ({selectedCollections.size} selected)
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAll}
                className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {selectedCollections.size === collections.length ? 'Deselect All' : 'Select All'}
              </motion.button>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => toggleCollection(collection.id)}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedCollections.has(collection.id)}
                    onChange={() => toggleCollection(collection.id)}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{collection.name}</p>
                    <p className="text-sm text-gray-400">{collection.productCount} products</p>
                  </div>
                  {collection.isSystem && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full">
                      System
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDuplicate}
            disabled={operating || selectedCollections.size === 0}
            className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-colors"
          >
            <Copy size={20} />
            Duplicate ({selectedCollections.size})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={operating || selectedCollections.size === 0}
            className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-colors"
          >
            <Download size={20} />
            Export ({selectedCollections.size})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}
            disabled={operating || selectedCollections.size === 0}
            className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-colors"
          >
            <Trash2 size={20} />
            Delete ({selectedCollections.size})
          </motion.button>
        </div>
      </div>
    </div>
  );
};
