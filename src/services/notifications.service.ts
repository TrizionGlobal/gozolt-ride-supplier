import { apiClient as api } from '../lib/api-client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
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
  async getNotifications(page = 1, limit = 20, isRead?: boolean, service?: string): Promise<PaginatedNotifications> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }
    if (service) {
      params.append('service', service);
    }

    const { data } = await api.get(`/users/me/notifications?${params.toString()}`);
    if (data && Array.isArray(data.data)) {
      data.data = data.data.map((item: any) => ({
        ...item,
        isRead: item.read !== undefined ? item.read : (item.isRead ?? false),
      }));
    }
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(service?: string): Promise<{ unreadCount: number }> {
    const params = service ? `?service=${encodeURIComponent(service)}` : '';
    const { data } = await api.get(`/users/me/notifications/unread-count${params}`);
    const count = data?.unreadCount ?? data?.count ?? 0;
    return { unreadCount: Number(count) };
  },

  /**
   * Mark specific notifications (or all) as read
   * @param notificationIds Optional array of IDs. If empty, marks all as read.
   */
  async markRead(notificationIds?: string[]): Promise<void> {
    await api.patch('/users/me/notifications/mark-read', { notificationIds });
  },
};
