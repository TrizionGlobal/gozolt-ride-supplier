'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { notificationsService, NotificationItem } from '@/services/notifications.service';
import { onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { getMessaging, isSupported } from 'firebase/messaging';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth.store';

function isNotificationMatchingService(
  data?: Record<string, any>,
  title?: string,
  body?: string,
  service?: string | null
): boolean {
  if (!service) return true;

  const current = service.toUpperCase();
  const module = String(data?.module || '').toLowerCase();
  const notifService = String(data?.service || '').toUpperCase();
  const text = `${title || ''} ${body || ''}`.toLowerCase();

  // If general payout or system notification without conflicting module
  if (module === 'payouts' || module === 'system') {
    return true;
  }

  if (current === 'AIRPORT_TRANSFER') {
    if (
      module.includes('car-rental') ||
      module.includes('bike-rental') ||
      module.includes('quick-service') ||
      notifService === 'CAR_RENTAL' ||
      notifService === 'BIKE_RENTAL' ||
      notifService === 'QUICK_SERVICES' ||
      notifService === 'CAB'
    ) {
      return false;
    }
    if (
      text.includes('car rental') ||
      text.includes('bike rental') ||
      text.includes('quick service')
    ) {
      return false;
    }
    return true;
  }

  if (current === 'CAR_RENTAL' || current === 'RENTAL') {
    if (
      module.includes('airport') ||
      module.includes('bike-rental') ||
      module.includes('quick-service') ||
      notifService === 'AIRPORT_TRANSFER' ||
      notifService === 'BIKE_RENTAL' ||
      notifService === 'QUICK_SERVICES' ||
      notifService === 'CAB'
    ) {
      return false;
    }
    if (
      text.includes('airport transfer') ||
      text.includes('bike rental') ||
      text.includes('quick service')
    ) {
      return false;
    }
    return true;
  }

  if (current === 'BIKE_RENTAL') {
    if (
      module.includes('airport') ||
      module.includes('car-rental') ||
      module.includes('quick-service') ||
      notifService === 'AIRPORT_TRANSFER' ||
      notifService === 'CAR_RENTAL' ||
      notifService === 'QUICK_SERVICES' ||
      notifService === 'CAB'
    ) {
      return false;
    }
    if (
      text.includes('airport transfer') ||
      text.includes('car rental') ||
      text.includes('quick service')
    ) {
      return false;
    }
    return true;
  }

  if (current === 'QUICK_SERVICES') {
    if (
      module.includes('airport') ||
      module.includes('car-rental') ||
      module.includes('bike-rental') ||
      notifService === 'AIRPORT_TRANSFER' ||
      notifService === 'CAR_RENTAL' ||
      notifService === 'BIKE_RENTAL' ||
      notifService === 'CAB'
    ) {
      return false;
    }
    if (
      text.includes('airport transfer') ||
      text.includes('car rental') ||
      text.includes('bike rental')
    ) {
      return false;
    }
    return true;
  }

  if (current === 'CAB') {
    if (
      module.includes('airport') ||
      module.includes('car-rental') ||
      module.includes('bike-rental') ||
      module.includes('quick-service') ||
      notifService === 'AIRPORT_TRANSFER' ||
      notifService === 'CAR_RENTAL' ||
      notifService === 'BIKE_RENTAL' ||
      notifService === 'QUICK_SERVICES'
    ) {
      return false;
    }
    return true;
  }

  return true;
}

export function NotificationDropdown() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const registeredService = user?.registeredService || (typeof window !== 'undefined' ? localStorage.getItem('gozolt-selected-service') : null);

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const seenNotificationKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [registeredService]);

  // Fetch count
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsService.getUnreadCount(registeredService || undefined);
      const count = data.unreadCount ?? (data as any).count ?? 0;
      setUnreadCount(Number(count));
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch list
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.getNotifications(1, 25, undefined, registeredService || undefined);
      const filtered = (res.data || []).filter((n) =>
        isNotificationMatchingService(n.data, n.title, n.body, registeredService)
      );
      setNotifications(filtered);
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

  const getActionFromData = (data?: Record<string, any>) => {
    if (!data) return null;
    const module = String(data.module || '').toLowerCase();

    return {
      label: 'View',
      onClick: () => {
        setIsOpen(false);

        // 1. Payout notifications
        if (data.payoutId || module === 'payouts') {
          if (registeredService === 'AIRPORT_TRANSFER' || module.includes('airport')) {
            router.push('/airport-transfers/payouts');
          } else if (registeredService === 'QUICK_SERVICES' || module.includes('quick')) {
            router.push('/quick-services/payouts');
          } else if (registeredService === 'BIKE_RENTAL' || module.includes('bike')) {
            router.push('/bike-rentals/payouts');
          } else if (registeredService === 'CAR_RENTAL' || module.includes('car')) {
            router.push('/car-rentals/payouts');
          } else {
            router.push('/payouts');
          }
          return;
        }

        // 2. Airport Transfers
        if (registeredService === 'AIRPORT_TRANSFER' || module.includes('airport')) {
          if (data.bookingId) {
            router.push('/airport-transfers/bookings');
          } else {
            router.push('/airport-transfers/dashboard');
          }
          return;
        }

        // 3. Quick Services
        if (registeredService === 'QUICK_SERVICES' || module.includes('quick')) {
          if (data.bookingId && data.serviceSlug) {
            router.push(`/quick-services/booking-management/${data.serviceSlug}/${data.bookingId}`);
          } else if (data.serviceSlug) {
            router.push(`/quick-services/booking-management/${data.serviceSlug}`);
          } else {
            router.push(`/quick-services/booking-management`);
          }
          return;
        }

        // 4. Car Rentals
        if (registeredService === 'CAR_RENTAL' || module.includes('car')) {
          if (data.bookingId) {
            router.push(`/car-rentals/${data.bookingId}/details`);
          } else {
            router.push('/car-rentals/dashboard');
          }
          return;
        }

        // 5. Bike Rentals
        if (registeredService === 'BIKE_RENTAL' || module.includes('bike')) {
          if (data.bookingId) {
            router.push(`/bike-rentals/${data.bookingId}/details`);
          } else {
            router.push('/bike-rentals/dashboard');
          }
          return;
        }

        // 6. Generic or fallback module
        if (data.bookingId && data.module) {
          router.push(`/${data.module}/${data.bookingId}/details`);
        } else if (data.module) {
          router.push(`/${data.module}`);
        } else {
          router.push('/dashboard');
        }
      },
    };
  };

  // Centralized deduplicated incoming notification handler
  const handleIncomingNotification = (notification: any) => {
    if (!notification) return;

    const title = notification.title || notification.notification?.title || 'Notification';
    const body = notification.body || notification.notification?.body || '';

    // Filter out notifications that don't match this supplier's registered service
    if (!isNotificationMatchingService(notification.data, title, body, registeredService)) {
      return;
    }

    const id = notification.id || notification.data?.notificationId || `${title}:${body}`;
    const dedupeKey = `${id}:${title}:${body}`;

    // Suppress duplicate toasts and duplicate processing within 8 seconds
    if (seenNotificationKeys.current.has(dedupeKey)) {
      return;
    }
    seenNotificationKeys.current.add(dedupeKey);
    setTimeout(() => {
      seenNotificationKeys.current.delete(dedupeKey);
    }, 8000);

    const newNotif: NotificationItem = {
      id: notification.id || `notif_${Date.now()}`,
      title,
      body,
      type: notification.type || 'SYSTEM',
      isRead: false,
      createdAt: notification.createdAt || new Date().toISOString(),
      data: notification.data,
    };

    const action = getActionFromData(notification.data);

    // Show toast with deterministic id to guarantee Sonner never stacks duplicates
    toast(title, {
      id: `toast-${id}`,
      description: body,
      icon: <Bell className="h-4 w-4 text-[#FFD700]" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      style: {
        background: '#1A1A1A',
        border: '1px solid #333',
        color: '#fff',
      },
    });

    // Increment unread count locally and sync with backend
    setUnreadCount((prev) => (typeof prev === 'number' && !isNaN(prev) ? prev + 1 : 1));
    fetchUnreadCount();

    // Deduplicate in state
    setNotifications((prev) => {
      if (prev.some((n) => n.id === newNotif.id || (n.title === newNotif.title && n.body === newNotif.body && Math.abs(new Date(n.createdAt).getTime() - new Date(newNotif.createdAt).getTime()) < 5000))) {
        return prev;
      }
      return [newNotif, ...prev];
    });

    if (isOpenRef.current) {
      fetchNotifications();
    }
  };

  // Listen to FCM messages while app is open (mount once)
  useEffect(() => {
    let unsubFn: any;

    const setupMessaging = async () => {
      try {
        const supported = await isSupported();
        if (supported && app) {
          const messaging = getMessaging(app);
          const unsubscribe = onMessage(messaging, (payload) => {
            handleIncomingNotification({
              id: payload.messageId || (payload.data as any)?.notificationId,
              title: payload.notification?.title || (payload.data as any)?.title,
              body: payload.notification?.body || (payload.data as any)?.body,
              data: payload.data,
            });
          });
          return unsubscribe;
        }
      } catch (err) {
        console.warn('Firebase Messaging not supported or failed to initialize:', err);
      }
    };

    setupMessaging().then((fn) => {
      unsubFn = fn;
    });

    return () => {
      if (unsubFn && typeof unsubFn === 'function') {
        unsubFn();
      }
    };
  }, []);

  // Listen to Socket.IO for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('supplier_token') || sessionStorage.getItem('supplier_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const baseUrl = API_URL.replace(/\/v1$/, '');
    const socket: Socket = io(`${baseUrl}/supplier`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('notification:in_app', (notification: any) => {
      handleIncomingNotification(notification);
    });

    return () => {
      socket.off('notification:in_app');
      socket.disconnect();
    };
  }, []);

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
                      {(notification.data?.payoutId || notification.type === 'PAYMENT') && (
                        <div className="flex items-center gap-1.5 flex-wrap my-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Payout
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-[#A1A1AA] line-clamp-2">
                        {notification.body}
                      </p>
                      {(notification.data?.module || notification.data?.bookingId || notification.data?.payoutId) && (
                        <div className="mt-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const action = getActionFromData(notification.data);
                              if (action) action.onClick();
                              handleMarkRead(notification.id, notification.isRead);
                            }}
                            className="text-xs px-2.5 py-1 bg-[#1F1F22] hover:bg-[#27272A] text-[#FACC15] font-medium rounded border border-[#27272A] transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )}
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
