import React, { useState } from 'react';

interface HeaderProps {
  user: { name: string; email: string; avatar: string };
  notificationCount: number;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notificationCount, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-toggle-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          ☰
        </button>
        <div className="header-logo">
          📊 Admin Dashboard
        </div>
      </div>

      <div className="header-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-right">
        <button className="header-icon-btn" title="Notifications">
          🔔
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>

        <button className="header-icon-btn" title="Settings">
          ⚙️
        </button>

        <div className="header-user">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
