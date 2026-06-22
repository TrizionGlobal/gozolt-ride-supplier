import { apiClient as api } from '../lib/api-client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: NotificationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationsService = {
  /**
   * Fetch paginated notifications
   */
  async getNotifications(page = 1, limit = 20, isRead?: boolean): Promise<PaginatedNotifications> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }

    const { data } = await api.get(`/users/me/notifications?${params.toString()}`);
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const { data } = await api.get('/users/me/notifications/unread-count');
    return data;
  },

  /**
   * Mark specific notifications (or all) as read
   * @param notificationIds Optional array of IDs. If empty, marks all as read.
   */
  async markRead(notificationIds?: string[]): Promise<void> {
    await api.patch('/users/me/notifications/mark-read', { notificationIds });
  },
};
