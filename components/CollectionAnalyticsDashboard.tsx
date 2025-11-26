import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, TrendingUp, Eye, Click, ShoppingCart } from 'lucide-react';
import { Collection } from '../services/collectionService';
import { collectionAnalyticsService, CollectionAnalytics } from '../services/collectionAnalyticsService';

interface CollectionAnalyticsDashboardProps {
  collection: Collection;
  onBack: () => void;
}

export const CollectionAnalyticsDashboard: React.FC<CollectionAnalyticsDashboardProps> = ({
  collection,
  onBack
}) => {
  const [analytics, setAnalytics] = useState<CollectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  useEffect(() => {
    loadAnalytics();
  }, [collection.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await collectionAnalyticsService.getAnalytics(collection.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!analytics) return;

    try {
      const data = await collectionAnalyticsService.exportAnalytics(collection.id, exportFormat);
      const blob = new Blob([data], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${collection.id}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Failed to export analytics');
    }
  };

  const getConversionRate = () => {
    if (!analytics || analytics.clicks === 0) return 0;
    return ((analytics.conversions / analytics.clicks) * 100).toFixed(2);
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Collections
          </button>
          <div className="text-center py-12">
            <p className="text-gray-400">No analytics data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
              <p className="text-gray-400">Collection: {collection.name}</p>
            </div>
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                className="bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff88]"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00dd77] transition-colors"
              >
                <Download size={18} />
                Export
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Views</p>
              <Eye size={20} className="text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.views}</p>
            <p className="text-xs text-cyan-400">
              {getTrend(analytics.views, analytics.previousViews) > 0 ? '+' : ''}
              {getTrend(analytics.views, analytics.previousViews)}% vs last period
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Clicks</p>
              <Click size={20} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.clicks}</p>
            <p className="text-xs text-blue-400">
              {getTrend(analytics.clicks, analytics.previousClicks) > 0 ? '+' : ''}
              {getTrend(analytics.clicks, analytics.previousClicks)}% vs last period
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-green-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Conversions</p>
              <ShoppingCart size={20} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{analytics.conversions}</p>
            <p className="text-xs text-green-400">
              {getTrend(analytics.conversions, analytics.previousConversions) > 0 ? '+' : ''}
              {getTrend(analytics.conversions, analytics.previousConversions)}% vs last period
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <TrendingUp size={20} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">{getConversionRate()}%</p>
            <p className="text-xs text-purple-400">Click to conversion</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Views</span>
                <span className="text-white font-bold">{analytics.views}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((analytics.views / 1000) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Clicks</span>
                <span className="text-white font-bold">{analytics.clicks}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((analytics.clicks / 500) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Conversions</span>
                <span className="text-white font-bold">{analytics.conversions}</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((analytics.conversions / 100) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
        </motion.div>
      </div>
    </div>
  );
};
