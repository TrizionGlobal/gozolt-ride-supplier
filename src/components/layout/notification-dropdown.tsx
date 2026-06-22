'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { notificationsService, NotificationItem } from '@/services/notifications.service';
import { onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { getMessaging, isSupported } from 'firebase/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Fetch count
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch list
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.getNotifications(1, 10); // Fetch top 10
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle open toggle
  const toggleDropdown = async () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      await fetchNotifications();
    }
  };

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to FCM messages while app is open
  useEffect(() => {
    const setupMessaging = async () => {
      const supported = await isSupported();
      if (supported && app) {
        const messaging = getMessaging(app);
        const unsubscribe = onMessage(messaging, (payload) => {
          // Increment unread count or refetch
          fetchUnreadCount();
          // If dropdown is open, refresh the list
          if (isOpen) {
            fetchNotifications();
          }
        });
        return unsubscribe;
      }
    };
    
    let unsubFn: any;
    setupMessaging().then((fn) => {
      unsubFn = fn;
    });

    return () => {
      if (unsubFn && typeof unsubFn === 'function') {
        unsubFn();
      }
    };
  }, [isOpen]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Mark single as read
  const handleMarkRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await notificationsService.markRead([id]);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative text-[#71717A] hover:text-white transition-colors p-1"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-[4px] py-[1px] text-[10px] font-bold leading-none text-black bg-[#FACC15] rounded-full transform translate-x-1/4 -translate-y-1/4">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-[#27272A] bg-[#111111] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A] bg-[#0A0A0A]">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#FACC15] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-[#3F3F46] mb-3" />
                <p className="text-sm text-[#71717A]">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleMarkRead(notification.id, notification.isRead)}
                    className={cn(
                      'group relative cursor-pointer px-4 py-3 border-b border-[#27272A] hover:bg-[#1A1A1A] transition-colors',
                      !notification.isRead ? 'bg-[#18181A]' : ''
                    )}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-[#FACC15]" />
                    )}
                    <div className="pl-3">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn('text-sm font-medium', !notification.isRead ? 'text-white' : 'text-[#A1A1AA]')}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-[#71717A] whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-[#71717A] line-clamp-2">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-2 border-t border-[#27272A] bg-[#0A0A0A] text-center">
            <button
              className="text-xs text-[#71717A] hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
