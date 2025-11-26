import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { collectionTemplateService, CollectionTemplate } from '../services/collectionTemplateService';

interface CollectionTemplatesProps {
  onBack: () => void;
  onTemplateApplied: () => void;
}

export const CollectionTemplates: React.FC<CollectionTemplatesProps> = ({
  onBack,
  onTemplateApplied
}) => {
  const [templates, setTemplates] = useState<CollectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await collectionTemplateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: CollectionTemplate) => {
    try {
      setApplying(template.id);
      await collectionTemplateService.applyTemplate(template.id);
      setApplied(template.id);
      setTimeout(() => {
        onTemplateApplied();
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template');
    } finally {
      setApplying(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: 'from-red-500/20 to-red-600/20',
      seasonal: 'from-blue-500/20 to-blue-600/20',
      category: 'from-purple-500/20 to-purple-600/20',
      custom: 'from-green-500/20 to-green-600/20'
    };
    return colors[category] || 'from-gray-500/20 to-gray-600/20';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      sales: 'bg-red-500/20 text-red-400',
      seasonal: 'bg-blue-500/20 text-blue-400',
      category: 'bg-purple-500/20 text-purple-400',
      custom: 'bg-green-500/20 text-green-400'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
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
          <h2 className="text-3xl font-bold text-white mb-2">Collection Templates</h2>
          <p className="text-gray-400">Choose a template to quickly create a new collection</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${getCategoryColor(template.category)} border border-white/10 rounded-lg overflow-hidden hover:border-[#00ff88]/50 transition-all duration-300`}
            >
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{template.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryBadgeColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Default Products:</span>
                    <span className="text-white font-bold">{template.defaultProducts?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Auto-Update:</span>
                    <span className="text-[#00ff88] font-bold">{template.autoUpdate ? 'Yes' : 'No'}</span>
                  </div>
                  {template.rules && template.rules.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Rules:</span>
                      <span className="text-blue-400 font-bold">{template.rules.length}</span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApplyTemplate(template)}
                  disabled={applying === template.id}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    applied === template.id
                      ? 'bg-green-500/20 text-green-400'
                      : applying === template.id
                      ? 'bg-gray-500/20 text-gray-400 cursor-wait'
                      : 'bg-[#00ff88] text-black hover:bg-[#00dd77]'
                  }`}
                >
                  {applied === template.id ? (
                    <>
                      <Check size={18} />
                      Applied!
                    </>
                  ) : applying === template.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400/20 border-t-gray-400 rounded-full animate-spin"></div>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Apply Template
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg">No templates available</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
