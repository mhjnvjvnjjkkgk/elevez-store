import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Download, Calendar, BarChart3, PieChart, LineChart, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateDashboardMetrics, generateRevenueChart, generateUsersChart, generateTierDistributionChart, generateDiscountTypesChart, generateAnalyticsReport, downloadReport, calculateComparison, ComparisonData } from '../services/analyticsService';

interface AdminAnalyticsDashboardProps {
  adminId: string;
}

type Period = 'day' | 'week' | 'month' | 'year';

export const AdminAnalyticsDashboard: React.FC<AdminAnalyticsDashboardProps> = ({ adminId }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [metrics, setMetrics] = useState<any>(null);
  const [comparisons, setComparisons] = useState<{ [key: string]: ComparisonData }>({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await calculateDashboardMetrics();
      setMetrics(data);

      // Calculate comparisons (mock data)
      setComparisons({
        revenue: calculateComparison(data.totalRevenue, data.totalRevenue * 0.85),
        users: calculateComparison(data.totalUsers, data.totalUsers * 0.92),
        discounts: calculateComparison(data.totalDiscountGiven, data.totalDiscountGiven * 0.78),
        conversion: calculateComparison(data.conversionRate, data.conversionRate * 0.88)
      });
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

  const MetricCard = ({ label, value, comparison, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-75 mb-1">{label}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' && value > 100 ? value.toLocaleString() : value}</p>
        </div>
        <Icon size={32} className="opacity-50" />
      </div>

      {comparison && (
        <div className="flex items-center gap-2">
          {comparison.trend === 'up' ? (
            <ArrowUp size={16} className="text-green-400" />
          ) : (
            <ArrowDown size={16} className="text-red-400" />
          )}
          <span className={comparison.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            {Math.abs(comparison.changePercent).toFixed(1)}%
          </span>
          <span className="text-xs opacity-75">vs last period</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black pt-20 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold font-syne text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time metrics and performance insights</p>
        </motion.div>

        {/* Period Selector & Export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
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

        {/* Key Metrics */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <MetricCard
              label="Total Revenue"
              value={`₹${(metrics.totalRevenue / 1000).toFixed(0)}K`}
              comparison={comparisons.revenue}
              icon={TrendingUp}
              color="from-green-500 to-green-600"
            />
            <MetricCard
              label="Total Users"
              value={metrics.totalUsers}
              comparison={comparisons.users}
              icon={BarChart3}
              color="from-blue-500 to-blue-600"
            />
            <MetricCard
              label="Discount Given"
              value={`₹${(metrics.totalDiscountGiven / 1000).toFixed(0)}K`}
              comparison={comparisons.discounts}
              icon={PieChart}
              color="from-purple-500 to-purple-600"
            />
            <MetricCard
              label="Conversion Rate"
              value={`${metrics.conversionRate.toFixed(1)}%`}
              comparison={comparisons.conversion}
              icon={LineChart}
              color="from-orange-500 to-orange-600"
            />
          </motion.div>
        )}

        {/* Charts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
        >
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <LineChart size={20} className="text-[#00ff88]" />
              Revenue Trend
            </h3>
            <div className="h-64 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-2 text-gray-600" />
                <p className="text-gray-400">Chart visualization</p>
                <p className="text-xs text-gray-500 mt-2">Integration with chart library ready</p>
              </div>
            </div>
          </motion.div>

          {/* Users Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#00ff88]" />
              User Growth
            </h3>
            <div className="h-64 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart size={48} className="mx-auto mb-2 text-gray-600" />
                <p className="text-gray-400">Chart visualization</p>
                <p className="text-xs text-gray-500 mt-2">Integration with chart library ready</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Top Discount Codes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Top Discount Codes</h3>
            <div className="space-y-3">
              {[
                { code: 'GOLD2024', uses: 245, revenue: 45000 },
                { code: 'SILVER100', uses: 189, revenue: 32000 },
                { code: 'EXITABC123', uses: 156, revenue: 28000 },
                { code: 'NEWSXYZ789', uses: 134, revenue: 22000 },
                { code: 'LOYALDEF456', uses: 98, revenue: 18000 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{item.code}</p>
                    <p className="text-xs text-gray-400">{item.uses} uses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ff88] font-bold text-sm">₹{item.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Top Users</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah Williams', points: 5000, tier: 'Platinum' },
                { name: 'John Doe', points: 2500, tier: 'Gold' },
                { name: 'Jane Smith', points: 1200, tier: 'Silver' },
                { name: 'Alex Brown', points: 800, tier: 'Silver' },
                { name: 'Mike Johnson', points: 450, tier: 'Bronze' }
              ].map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ff88] font-bold text-sm">{user.points.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
