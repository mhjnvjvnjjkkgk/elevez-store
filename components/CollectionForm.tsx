import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Collection } from '../services/collectionService';

interface CollectionFormProps {
  collection?: Collection | null;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  collection,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description,
        image: collection.image || ''
      });
      setImagePreview(collection.image || '');
    }
  }, [collection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'image') {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Collection name is required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlTest = () => {
    if (formData.image) {
      setImagePreview(formData.image);
    }
  };

  const isEditing = !!collection;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-[#00ff88] hover:text-[#00dd77] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Collections
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isEditing ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            <p className="text-gray-400">
              {isEditing ? 'Update collection details' : 'Add a new product collection'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-white/10 rounded-lg p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Collection Name */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter collection name"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed to customers
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter collection description"
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional description for the collection
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Collection Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] transition-colors"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImageUrlTest}
                    className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors"
                  >
                    Test
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional image URL for the collection
                </p>
              </div>
            </div>

            {/* Right Column - Image Preview */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Image Preview
              </label>
              <div className="aspect-video bg-gradient-to-br from-[#00ff88]/20 to-[#00cc6f]/20 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon size={48} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No image preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#00ff88] hover:bg-[#00dd77] text-black rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Collection'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
