import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Users,
  ShoppingCart,
  DollarSign,
  Zap,
  Eye,
  Target,
  Activity
} from 'lucide-react';
import {
  calculateDashboardMetrics,
  generateRevenueChart,
  generateUsersChart,
  generateTierDistributionChart,
  generateDiscountTypesChart,
  generateAnalyticsReport,
  downloadReport,
  calculateComparison,
  ComparisonData,
  subscribeToRealtimeMetrics,
  RealtimeMetrics,
  getUserBehaviorAnalytics,
  UserBehavior,
  getProductPerformanceAnalytics,
  ProductPerformance,
  getFunnelAnalytics,
  FunnelAnalytics,
  getCohortAnalysis,
  CohortData,
  cleanupAnalyticsListeners
} from '../services/analyticsService';

interface AdvancedAnalyticsDashboardProps {
  adminId: string;
}

type Period = 'day' | 'week' | 'month' | 'year';
type AnalyticsView = 'overview' | 'behavior' | 'products' | 'funnel' | 'cohort';

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({ adminId }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [view, setView] = useState<AnalyticsView>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [comparisons, setComparisons] = useState<{ [key: string]: ComparisonData }>({});
  const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelAnalytics | null>(null);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAllAnalytics();
    const unsubscribe = subscribeToRealtimeMetrics(setRealtimeMetrics);
    return () => {
      unsubscribe();
      cleanupAnalyticsListeners();
    };
  }, [period]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [metrics, behavior, products, funnel, cohort] = await Promise.all([
        calculateDashboardMetrics(),
        getUserBehaviorAnalytics(),
        getProductPerformanceAnalytics(),
        getFunnelAnalytics(),
        getCohortAnalysis()
      ]);

      setMetrics(metrics);
      setUserBehavior(behavior);
      setProductPerformance(products);
      setFunnelData(funnel);
      setCohortData(cohort);

      setComparisons({
        revenue: calculateComparison(metrics.totalRevenue, metrics.totalRevenue * 0.85),
        users: calculateComparison(metrics.totalUsers, metrics.totalUsers * 0.92),
        discounts: calculateComparison(metrics.totalDiscountGiven, metrics.totalDiscountGiven * 0.78),
        conversion: calculateComparison(metrics.conversionRate, metrics.conversionRate * 0.88)
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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
          <h1 className="text-4xl font-bold font-syne text-white mb-2">Advanced Analytics</h1>
          <p className="text-gray-400">Comprehensive insights and performance metrics</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex gap-2 flex-wrap">
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

        {/* View Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'behavior', label: 'User Behavior', icon: Users },
            { id: 'products', label: 'Products', icon: ShoppingCart },
            { id: 'funnel', label: 'Funnel', icon: Target },
            { id: 'cohort', label: 'Cohort', icon: Activity }
          ].map(v => (
            <motion.button
              key={v.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(v.id as AnalyticsView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                view === v.id
                  ? 'bg-[#00ff88] text-black font-bold'
                  : 'bg-zinc-900 text-gray-400 border border-white/10 hover:border-[#00ff88]'
              }`}
            >
              <v.icon size={16} />
              {v.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Real-time Metrics */}
        {realtimeMetrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-zinc-900 border border-[#00ff88]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-white">{realtimeMetrics.activeUsers}</p>
                </div>
                <Zap size={24} className="text-[#00ff88]" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-[#00ff88]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Orders In Progress</p>
                  <p className="text-2xl font-bold text-white">{realtimeMetrics.ordersInProgress}</p>
                </div>
                <ShoppingCart size={24} className="text-[#00ff88]" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-[#00ff88]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Revenue Today</p>
                  <p className="text-2xl font-bold text-white">₹{realtimeMetrics.revenueToday.toLocaleString()}</p>
                </div>
                <DollarSign size={24} className="text-[#00ff88]" />
              </div>
            </div>
            <div className="bg-zinc-900 border border-[#00ff88]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Conversion Today</p>
                  <p className="text-2xl font-bold text-white">{realtimeMetrics.conversionToday.toFixed(1)}%</p>
                </div>
                <TrendingUp size={24} className="text-[#00ff88]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Overview View */}
        <AnimatePresence mode="wait">
          {view === 'overview' && metrics && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Key Metrics */}
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
                  icon={Users}
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

              {/* Top Performers */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
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
                        transition={{ delay: 0.1 + index * 0.05 }}
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

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                        transition={{ delay: 0.2 + index * 0.05 }}
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
            </motion.div>
          )}

          {/* User Behavior View */}
          {view === 'behavior' && (
            <motion.div
              key="behavior"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">User Behavior Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">User ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Sessions</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Total Spent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBehavior.slice(0, 10).map((user, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-black/50 transition-colors">
                        <td className="py-3 px-4 text-white text-sm">{user.userId.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{user.sessionCount}</td>
                        <td className="py-3 px-4 text-[#00ff88] font-semibold">₹{user.totalSpent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{user.favoriteCategory}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.conversionStatus === 'converted' ? 'bg-green-500/20 text-green-400' :
                            user.conversionStatus === 'abandoned' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.conversionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Product Performance View */}
          {view === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Product Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Product</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Views</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Purchases</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Conversion</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Revenue</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPerformance.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-black/50 transition-colors">
                        <td className="py-3 px-4 text-white text-sm font-medium">{product.productName}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{product.views}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{product.purchases}</td>
                        <td className="py-3 px-4 text-[#00ff88] font-semibold">{product.conversionRate.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">₹{product.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-yellow-400 font-semibold">★ {product.rating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Funnel View */}
          {view === 'funnel' && funnelData && (
            <motion.div
              key="funnel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Conversion Funnel</h3>
              <div className="space-y-4">
                {funnelData.stages.map((stage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-semibold">{stage.stage}</p>
                        <p className="text-xs text-gray-400">{stage.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00ff88] font-bold">{stage.dropoffPercent.toFixed(1)}% dropoff</p>
                        <p className="text-xs text-gray-400">{stage.dropoff} users</p>
                      </div>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.users / funnelData.stages[0].users) * 100}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6f] flex items-center justify-end pr-3"
                      >
                        <span className="text-xs font-bold text-black">{((stage.users / funnelData.stages[0].users) * 100).toFixed(0)}%</span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-black/50 rounded-lg border border-white/5">
                <p className="text-gray-400 text-sm mb-2">Overall Conversion</p>
                <p className="text-3xl font-bold text-[#00ff88]">{funnelData.totalConversion.toFixed(2)}%</p>
              </div>
            </motion.div>
          )}

          {/* Cohort View */}
          {view === 'cohort' && (
            <motion.div
              key="cohort"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Cohort Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cohort</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Day 0</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Day 7</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Day 30</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">7-Day Retention</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">30-Day Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-black/50 transition-colors">
                        <td className="py-3 px-4 text-white font-semibold">{cohort.cohort}</td>
                        <td className="py-3 px-4 text-gray-300">{cohort.day0}</td>
                        <td className="py-3 px-4 text-gray-300">{cohort.day7}</td>
                        <td className="py-3 px-4 text-gray-300">{cohort.day30}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                            {cohort.retention7.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                            {cohort.retention30.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
