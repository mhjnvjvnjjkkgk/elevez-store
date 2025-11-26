import React, { useState, useEffect } from 'react';
import './dashboard-styles.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

type TabType = 'overview' | 'filters' | 'bulk' | 'reports' | 'performance' | 'audit' | 'notifications' | 'segments' | 'analytics' | 'abtests';

interface AdminDashboardAppProps {}

const AdminDashboardApp: React.FC<AdminDashboardAppProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState({ name: 'Admin User', email: 'admin@example.com', avatar: '👤' });

  useEffect(() => {
    // Load initial data
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Mock notifications
    setNotifications([
      { id: 1, message: 'System performance at 95%', type: 'success', timestamp: new Date() },
      { id: 2, message: 'New user segment created', type: 'info', timestamp: new Date() },
    ]);
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'filters', label: 'Advanced Filters', icon: '🔍' },
    { id: 'bulk', label: 'Bulk Operations', icon: '⚙️' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'segments', label: 'Segments', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '🎯' },
    { id: 'abtests', label: 'A/B Tests', icon: '🧪' },
  ];

  return (
    <div className="admin-dashboard-app">
      <Header 
        user={user} 
        notificationCount={notifications.length}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="dashboard-container">
        <Sidebar 
          isOpen={sidebarOpen}
          activeTab={activeTab}
          menuItems={menuItems}
          onSelectTab={(tab) => setActiveTab(tab as TabType)}
        />
        
        <MainContent 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default AdminDashboardApp;
