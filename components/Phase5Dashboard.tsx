import React from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Wifi,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Database,
  Activity
} from 'lucide-react';
import { usePhase5Integration } from '../hooks/usePhase5Integration';

interface Phase5DashboardProps {
  adminId: string;
}

export const Phase5Dashboard: React.FC<Phase5DashboardProps> = ({ adminId }) => {
  const {
    status,
    clearCache,
    syncOfflineQueue,
    retryFailedOperations,
    getPerformanceReport,
    getSlowOperations
  } = usePhase5Integration();

  const slowOps = getSlowOperations();
  const perfReport = getPerformanceReport();

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
            Phase 5 - Advanced Optimization
          </h1>
          <p className="text-gray-400">Caching, Offline Support & Performance Monitoring</p>
        </motion.div>

        {/* Status Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Cache Status */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-[#00ff88]">
                  {status.cacheStats.hitRate.toFixed(1)}%
                </p>
              </div>
              <Database size={24} className="text-[#00ff88]" />
            </div>
            <p className="text-xs text-gray-500">
              {status.cacheStats.totalEntries} entries
            </p>
          </div>

          {/* Offline Status */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Connection</p>
                <p className="text-2xl font-bold text-white">
                  {status.offlineStatus.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              {status.offlineStatus.isOnline ? (
                <CheckCircle size={24} className="text-green-400" />
              ) : (
                <AlertCircle size={24} className="text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {status.offlineStatus.queuedOperations} queued
            </p>
          </div>

          {/* Performance */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Avg Render Time</p>
                <p className="text-2xl font-bold text-blue-400">
                  {perfReport.avgRenderTime.toFixed(0)}ms
                </p>
              </div>
              <Zap size={24} className="text-blue-400" />
            </div>
            <p className="text-xs text-gray-500">
              {perfReport.totalMetrics} metrics
            </p>
          </div>

          {/* Error Rate */}
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Error Rate</p>
                <p className="text-2xl font-bold text-red-400">
                  {perfReport.errorRate.toFixed(1)}%
                </p>
              </div>
              <Activity size={24} className="text-red-400" />
            </div>
            <p className="text-xs text-gray-500">
              {status.offlineStatus.failedOperations} failed ops
            </p>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cache Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HardDrive size={20} className="text-[#00ff88]" />
              Cache Management
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Total Entries</span>
                <span className="text-white font-bold">
                  {status.cacheStats.totalEntries}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Memory Usage</span>
                <span className="text-white font-bold">
                  {(status.cacheStats.memoryUsage / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Total Hits</span>
                <span className="text-[#00ff88] font-bold">
                  {status.cacheStats.totalHits}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Total Misses</span>
                <span className="text-red-400 font-bold">
                  {status.cacheStats.totalMisses}
                </span>
              </div>

              <button
                onClick={clearCache}
                className="w-full mt-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </motion.div>

          {/* Offline Sync */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Wifi size={20} className="text-blue-400" />
              Offline Sync
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Status</span>
                <span className={`font-bold ${
                  status.offlineStatus.isOnline ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {status.offlineStatus.isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Queued Operations</span>
                <span className="text-white font-bold">
                  {status.offlineStatus.queuedOperations}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Failed Operations</span>
                <span className="text-red-400 font-bold">
                  {status.offlineStatus.failedOperations}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                <span className="text-gray-400">Sync In Progress</span>
                <span className={`font-bold ${
                  status.offlineStatus.syncInProgress ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {status.offlineStatus.syncInProgress ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={syncOfflineQueue}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 px-4 py-2 rounded-lg transition-colors"
                >
                  Sync Now
                </button>
                <button
                  onClick={retryFailedOperations}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 px-4 py-2 rounded-lg transition-colors"
                >
                  Retry Failed
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" />
            Performance Metrics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Avg Render Time</p>
              <p className="text-2xl font-bold text-blue-400">
                {perfReport.avgRenderTime.toFixed(0)}ms
              </p>
            </div>

            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Avg Network Time</p>
              <p className="text-2xl font-bold text-green-400">
                {perfReport.avgNetworkTime.toFixed(0)}ms
              </p>
            </div>

            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Avg Cache Time</p>
              <p className="text-2xl font-bold text-yellow-400">
                {perfReport.avgCacheTime.toFixed(0)}ms
              </p>
            </div>

            <div className="bg-black/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">Avg Sync Time</p>
              <p className="text-2xl font-bold text-purple-400">
                {perfReport.avgSyncTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </motion.div>

        {/* Slow Operations */}
        {slowOps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-red-500/30 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Slow Operations ({slowOps.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {slowOps.slice(0, 10).map((op, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                  <div>
                    <p className="text-white font-mono text-sm">{op.name}</p>
                    <p className="text-xs text-gray-400">{op.category}</p>
                  </div>
                  <span className="text-red-400 font-bold">{op.duration.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
