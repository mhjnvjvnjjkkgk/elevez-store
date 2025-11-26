import React, { lazy, Suspense } from 'react';
import DashboardOverview from './DashboardOverview';

// Lazy load feature components
const AdvancedFilterPanel = lazy(() => import('../../components/AdvancedFilterPanel'));
const BulkOperationsPanel = lazy(() => import('../../components/BulkOperationsPanel'));
const ReportGenerator = lazy(() => import('../../components/ReportGenerator'));
const PerformanceMonitor = lazy(() => import('../../components/PerformanceMonitor'));
const AuditLogViewer = lazy(() => import('../../components/AuditLogViewer'));
const NotificationCenter = lazy(() => import('../../components/NotificationCenter'));
const SegmentBuilder = lazy(() => import('../../components/SegmentBuilder'));
const PredictiveAnalytics = lazy(() => import('../../components/PredictiveAnalytics'));
const ABTestBuilder = lazy(() => import('../../components/ABTestBuilder'));

interface MainContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
    <div style={{ fontSize: '24px' }}>⏳ Loading...</div>
  </div>
);

const MainContent: React.FC<MainContentProps> = ({ activeTab, onTabChange }) => {
  const getTabTitle = (tab: string): string => {
    const titles: Record<string, string> = {
      overview: 'Dashboard Overview',
      filters: 'Advanced Filters',
      bulk: 'Bulk Operations',
      reports: 'Reports & Analytics',
      performance: 'Performance Monitor',
      audit: 'Audit Logs',
      notifications: 'Notifications',
      segments: 'User Segments',
      analytics: 'Predictive Analytics',
      abtests: 'A/B Testing',
    };
    return titles[tab] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'filters':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedFilterPanel />
          </Suspense>
        );
      case 'bulk':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BulkOperationsPanel />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ReportGenerator />
          </Suspense>
        );
      case 'performance':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PerformanceMonitor />
          </Suspense>
        );
      case 'audit':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AuditLogViewer />
          </Suspense>
        );
      case 'notifications':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <NotificationCenter />
          </Suspense>
        );
      case 'segments':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SegmentBuilder />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PredictiveAnalytics />
          </Suspense>
        );
      case 'abtests':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ABTestBuilder />
          </Suspense>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="main-content">
      <div className="content-header">
        <h1 className="content-title">{getTabTitle(activeTab)}</h1>
        <div className="content-actions">
          <button className="btn btn-secondary btn-sm">📥 Import</button>
          <button className="btn btn-secondary btn-sm">📤 Export</button>
          <button className="btn btn-primary btn-sm">➕ Add New</button>
        </div>
      </div>

      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
