import React from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  menuItems: MenuItem[];
  onSelectTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, menuItems, onSelectTab }) => {
  return (
    <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Navigation</div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
            title={item.label}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>Admin Panel v1.0</div>
        <div style={{ marginTop: '8px', fontSize: '11px' }}>© 2024</div>
      </div>
    </aside>
  );
};

export default Sidebar;
