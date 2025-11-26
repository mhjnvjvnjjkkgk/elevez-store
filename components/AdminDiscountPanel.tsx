import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Copy, Check, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { createDiscountCode, getAllDiscountCodes, deleteDiscountCode, getDiscountAnalytics, FirebaseDiscountCode, DiscountAnalytics } from '../services/firebaseDiscountService';

interface AdminDiscountPanelProps {
  adminId: string;
}

export const AdminDiscountPanel: React.FC<AdminDiscountPanelProps> = ({ adminId }) => {
  const [codes, setCodes] = useState<FirebaseDiscountCode[]>([]);
  const [analytics, setAnalytics] = useState<DiscountAnalytics | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const [formData, setFormData] = useState({
    code: '',
    percentage: 10,
    type: 'admin' as const,
    maxUses: 1,
    expiryDays: 30,
    description: ''
  });

  // Load codes and analytics
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codesData, analyticsData] = await Promise.all([
        getAllDiscountCodes(),
        getDiscountAnalytics()
      ]);
      setCodes(codesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createDiscountCode(
        formData.code || `ADMIN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        formData.percentage,
        formData.type,
        adminId,
        formData.maxUses,
        formData.expiryDays,
        formData.description
      );
      
      setFormData({
        code: '',
        percentage: 10,
        type: 'admin',
        maxUses: 1,
        expiryDays: 30,
        description: ''
      });
      setShowCreateForm(false);
      await loadData();
    } catch (error) {
      console.error('Error creating code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (window.confirm('Are you sure you want to delete this code?')) {
      try {
        setLoading(true);
        await deleteDiscountCode(codeId);
        await loadData();
      } catch (error) {
        console.error('Error deleting code:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredCodes = codes.filter(code => {
    const isExpired = new Date(code.expiresAt) < new Date();
    if (filter === 'active') return !isExpired && code.isActive;
    if (filter === 'expired') return isExpired;
    return true;
  });

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-syne text-white mb-2">Discount Code Management</h1>
          <p className="text-gray-400">Create, manage, and track discount codes in real-time</p>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Codes</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalCodesCreated}</p>
                </div>
                <Zap className="text-[#00ff88]" size={32} />
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Codes</p>
                  <p className="text-3xl font-bold text-[#00ff88]">{analytics.totalCodesActive}</p>
                </div>
                <Check className="text-[#00ff88]" size={32} />
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Usages</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalUsages}</p>
                </div>
                <TrendingUp className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Discount</p>
                  <p className="text-3xl font-bold text-white">₹{analytics.totalDiscountGiven.toFixed(0)}</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Create Code Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-8 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus size={20} />
          Create New Code
        </motion.button>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
            >
              <form onSubmit={handleCreateCode} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Code (auto-generated if empty)</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="CUSTOM123"
                      className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Max Uses</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                      min="1"
                      className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Expiry Days</label>
                    <input
                      type="number"
                      value={formData.expiryDays}
                      onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                      min="1"
                      className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white focus:border-[#00ff88] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded text-white placeholder-gray-500 focus:border-[#00ff88] outline-none transition-colors"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#00ff88] text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Code'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-zinc-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {(['all', 'active', 'expired'] as const).map(f => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
                filter === f
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
              }`}
            >
              {f === 'all' ? 'All Codes' : f === 'active' ? 'Active' : 'Expired'}
            </motion.button>
          ))}
        </div>

        {/* Codes List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredCodes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No codes found</p>
            </div>
          ) : (
            filteredCodes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-[#00ff88]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <code className="text-2xl font-black text-[#00ff88]">{code.code}</code>
                      <span className="bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded text-sm font-bold">
                        {code.percentage}% OFF
                      </span>
                      <span className="bg-zinc-800 text-gray-300 px-3 py-1 rounded text-sm font-bold capitalize">
                        {code.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{code.description}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>Uses: {code.usedCount}/{code.maxUses}</span>
                      <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                      <span>Status: {code.isActive ? '✓ Active' : '✗ Inactive'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopyCode(code.code)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded transition-colors"
                    >
                      {copied === code.code ? <Check size={20} /> : <Copy size={20} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCode(code.id!)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};
