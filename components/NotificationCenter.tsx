import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import '../styles/notification-center.css';

interface NotificationCenterProps {
  adminId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  adminId,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState(notificationService.getStats(adminId));
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<boolean | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const updateNotifications = () => {
      const notifs = notificationService.getNotifications(adminId, {
        type: (filterType as any) || undefined,
        read: filterRead !== null ? filterRead : undefined,
        limit: 50,
      });
      setNotifications(notifs);
      setStats(notificationService.getStats(adminId));
    };

    updateNotifications();
    const interval = setInterval(updateNotifications, 5000);

    return () => clearInterval(interval);
  }, [adminId, filterType, filterRead]);

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAsRead(notificationId);
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setStats(notificationService.getStats(adminId));
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(adminId);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setStats(notificationService.getStats(adminId));
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.deleteNotification(notificationId);
    setNotifications(notifications.filter((n) => n.id !== notificationId));
    setStats(notificationService.getStats(adminId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setStats(notificationService.getStats(adminId));
    }
    onNotificationClick?.(notification);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚡';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <div className="notification-center">
      <div className="center-header">
        <h2>Notifications</h2>
        <div className="header-actions">
          <span className="unread-badge">{stats.unread}</span>
          {stats.unread > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-mark-all">
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="btn-preferences"
          >
            ⚙️
          </button>
        </div>
      </div>

      {showPreferences && (
        <div className="preferences-panel">
          <h3>Notification Preferences</h3>
          <div className="preferences-content">
            <div className="preference-group">
              <label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                />
                Email Notifications
              </label>
            </div>
            <div className="preference-group">
              <label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                />
                Push Notifications
              </label>
            </div>
            <div className="preference-group">
              <label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                />
                In-App Notifications
              </label>
            </div>
            <div className="preference-group">
              <label>Quiet Hours</label>
              <div className="quiet-hours">
                <input type="time" defaultValue="22:00" />
                <span>to</span>
                <input type="time" defaultValue="08:00" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="alert">Alert</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>

        <select
          value={filterRead === null ? '' : filterRead ? 'read' : 'unread'}
          onChange={(e) => {
            if (e.target.value === '') setFilterRead(null);
            else if (e.target.value === 'read') setFilterRead(true);
            else setFilterRead(false);
          }}
        >
          <option value="">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="label">Total</span>
          <span className="value">{stats.total}</span>
        </div>
        <div className="stat">
          <span className="label">Unread</span>
          <span className="value">{stats.unread}</span>
        </div>
        <div className="stat">
          <span className="label">Critical</span>
          <span className="value">{stats.byPriority['critical'] || 0}</span>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-meta">
                  <span className="time">
                    {notification.createdAt.toLocaleTimeString()}
                  </span>
                  <span
                    className="priority"
                    style={{ color: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="btn-read"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={(e) => handleDelete(notification.id, e)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
