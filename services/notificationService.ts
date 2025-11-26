import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';

export interface Notification {
  id: string;
  adminId: string;
  type: 'alert' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'discount' | 'points' | 'user' | 'system' | 'report';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreference {
  adminId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  categories: {
    discount: boolean;
    points: boolean;
    user: boolean;
    system: boolean;
    report: boolean;
  };
  thresholds: {
    highValueTransaction: number;
    bulkOperation: number;
    errorRate: number;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreference> = new Map();

  /**
   * Create notification
   */
  async createNotification(
    adminId: string,
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'],
    priority: Notification['priority'] = 'medium',
    actionUrl?: string,
    actionLabel?: string
  ): Promise<Notification> {
    const notificationId = `notif_${Date.now()}`;
    const notification: Notification = {
      id: notificationId,
      adminId,
      type,
      title,
      message,
      category,
      priority,
      read: false,
      actionUrl,
      actionLabel,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.notifications.set(notificationId, notification);

    try {
      await this.saveToFirebase(notification);
    } catch (error) {
      console.error('Failed to save notification:', error);
    }

    return notification;
  }

  /**
   * Get notifications for admin
   */
  getNotifications(
    adminId: string,
    filters?: {
      read?: boolean;
      type?: Notification['type'];
      category?: Notification['category'];
      priority?: Notification['priority'];
      limit?: number;
    }
  ): Notification[] {
    let notifications = Array.from(this.notifications.values()).filter(
      (n) => n.adminId === adminId
    );

    if (filters?.read !== undefined) {
      notifications = notifications.filter((n) => n.read === filters.read);
    }

    if (filters?.type) {
      notifications = notifications.filter((n) => n.type === filters.type);
    }

    if (filters?.category) {
      notifications = notifications.filter((n) => n.category === filters.category);
    }

    if (filters?.priority) {
      notifications = notifications.filter((n) => n.priority === filters.priority);
    }

    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      notifications = notifications.slice(0, filters.limit);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * Mark all as read
   */
  markAllAsRead(adminId: string): number {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.adminId === adminId && !notification.read) {
        notification.read = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId);
  }

  /**
   * Get notification stats
   */
  getStats(adminId: string): NotificationStats {
    const notifications = this.getNotifications(adminId);

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const notif of notifications) {
      byType[notif.type] = (byType[notif.type] || 0) + 1;
      byCategory[notif.category] = (byCategory[notif.category] || 0) + 1;
      byPriority[notif.priority] = (byPriority[notif.priority] || 0) + 1;
    }

    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      byType,
      byCategory,
      byPriority,
    };
  }

  /**
   * Get or create preferences
   */
  getPreferences(adminId: string): NotificationPreference {
    if (this.preferences.has(adminId)) {
      return this.preferences.get(adminId)!;
    }

    const preferences: NotificationPreference = {
      adminId,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      categories: {
        discount: true,
        points: true,
        user: true,
        system: true,
        report: true,
      },
      thresholds: {
        highValueTransaction: 1000,
        bulkOperation: 100,
        errorRate: 5,
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };

    this.preferences.set(adminId, preferences);
    return preferences;
  }

  /**
   * Update preferences
   */
  updatePreferences(adminId: string, updates: Partial<NotificationPreference>): NotificationPreference {
    const preferences = this.getPreferences(adminId);
    const updated = { ...preferences, ...updates };
    this.preferences.set(adminId, updated);
    return updated;
  }

  /**
   * Check if notification should be sent
   */
  shouldSendNotification(adminId: string, category: Notification['category']): boolean {
    const preferences = this.getPreferences(adminId);

    if (!preferences.categories[category]) {
      return false;
    }

    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
      const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
      const [currentHour, currentMin] = currentTime.split(':').map(Number);

      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      const current = currentHour * 60 + currentMin;

      if (startTime > endTime) {
        if (current >= startTime || current < endTime) {
          return false;
        }
      } else {
        if (current >= startTime && current < endTime) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Send bulk notification
   */
  async sendBulkNotification(
    adminIds: string[],
    type: Notification['type'],
    title: string,
    message: string,
    category: Notification['category'],
    priority: Notification['priority'] = 'medium'
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const adminId of adminIds) {
      if (this.shouldSendNotification(adminId, category)) {
        const notification = await this.createNotification(
          adminId,
          type,
          title,
          message,
          category,
          priority
        );
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Cleanup expired notifications
   */
  cleanupExpired(): number {
    const now = new Date();
    let deleted = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Private: Save to Firebase
   */
  private async saveToFirebase(notification: Notification): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: Timestamp.fromDate(notification.createdAt),
        expiresAt: notification.expiresAt ? Timestamp.fromDate(notification.expiresAt) : null,
      });
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
    }
  }
}

export const notificationService = new NotificationService();
