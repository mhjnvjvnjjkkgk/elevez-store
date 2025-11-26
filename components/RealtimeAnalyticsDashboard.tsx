import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Download,
  Activity,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAutoSync, useSyncStatus } from '../hooks/useRealtimeSync';
import { SyncEvent } from '../services/realtimeSyncService';
import {
  calculateDashboardMetrics,
  generateAnalyticsReport,
  downloadReport
} from '../services/analyticsService';

interface RealtimeAnalyticsDashboardProps {
  adminId: string;
}

type Period = 'day' | 'week' | 'month' | 'year';

export const RealtimeAnalyticsDashboard: React.FC<RealtimeAnalyticsDashboardProps> = ({
  adminId
}) => {
  const [period, setPeriod] = useState<Period>('month');
  const [metrics, setMetrics] = useState<any>(null);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const syncStatus = useSyncStatus(1000);
  const { syncStatus: batchSyncStatus, stopAutoSync } = useAutoSync(
    ['users', 'orders', 'products', 'discounts', 'analytics'],
    (event) => {
      setSyncEvents((prev) => [event, ...prev.slice(0, 49)]);
    }
  );

  useEffect(() => {
    loadMetrics();
    const interval = autoRefresh ? setInterval(loadMetrics, 5000) : null;
    return () => {
      if (interval) clearInterval(interval);
      stopAutoSync();
    };
  }, [period, autoRefresh]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await calculateDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      const report = await generateAnalyticsReport(period);
      downloadReport(report, format);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExporting(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'text-green-400';
      case 'modified':
        return 'text-blue-400';
      case 'removed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '➕';
      case 'modified':
        return '✏️';
      case 'removed':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-syne text-white mb-2">
            Real-time Analytics Dashboard
          </h1>
          <p className="text-gray-400">Live metrics with automatic Firebase sync</p>
        </motion.div>

        {/* Sync Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Sync Status</p>
                <p className="text-2xl font-bold text-white">
                  {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              {syncStatus.isConnected ? (
                <CheckCircle size={24} className="text-green-400" />
              ) : (
                <AlertCircle size={24} className="text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Active Listeners</p>
                <p className="text-2xl font-bold text-white">
                  {syncStatus.activeListeners}
                </p>
              </div>
              <Activity size={24} className="text-[#00ff88]" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Synced</p>
                <p className="text-2xl font-bold text-white">
                  {syncStatus.totalSynced}
                </p>
              </div>
              <Zap size={24} className="text-yellow-400" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Sync Errors</p>
                <p className="text-2xl font-bold text-white">
                  {syncStatus.syncErrors}
                </p>
              </div>
              <AlertCircle size={24} className="text-red-400" />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all ${
                  period === p
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
                }`}
              >
                {p}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                autoRefresh
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50'
                  : 'bg-zinc-900 text-gray-400 border border-white/10'
              }`}
            >
              <RefreshCw size={16} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              JSON
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Key Metrics</h3>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block w-12 h-12 border-3 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Loading metrics...</p>
                </div>
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-[#00ff88]">
                    {metrics.totalUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Active Users</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {metrics.activeUsers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">
                    ₹{(metrics.totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Conversion Rate</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : null}
          </motion.div>

          {/* Last Update */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Sync Info</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Last Sync</p>
                <p className="text-sm text-white font-mono">
                  {syncStatus.lastSync.toLocaleTimeString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Connection</p>
                <p className={`text-sm font-bold ${
                  syncStatus.isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {syncStatus.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Listeners</p>
                <p className="text-sm text-white font-mono">
                  {syncStatus.activeListeners} active
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Auto Refresh</p>
                <p className={`text-sm font-bold ${
                  autoRefresh ? 'text-[#00ff88]' : 'text-gray-400'
                }`}>
                  {autoRefresh ? '✓ Enabled' : '✗ Disabled'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sync Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-zinc-900 border border-white/10 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Recent Sync Events</h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {syncEvents.length > 0 ? (
              syncEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-white/5"
                >
                  <span className={`text-lg ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono truncate">
                      {event.collectionName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {event.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    event.type === 'added'
                      ? 'bg-green-500/20 text-green-400'
                      : event.type === 'modified'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {event.type}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No sync events yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
