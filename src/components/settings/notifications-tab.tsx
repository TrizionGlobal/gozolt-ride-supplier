'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';
import { ToggleSwitch } from '@/components/settings/toggle-switch';
import { requestNotificationPermission } from '@/lib/firebase';
import type { NotificationPreferences } from '@/types';

const TOGGLE_CONFIG: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates and alerts via email' },
  { key: 'smsNotifications', label: 'SMS Notifications', description: 'Get text message alerts for important events' },
  { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
  { key: 'rideAlerts', label: 'Ride Alerts', description: 'Get notified when rides are assigned or completed' },
  { key: 'payoutAlerts', label: 'Payout Alerts', description: 'Get notified when payouts are processed' },
];

export function NotificationsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    rideAlerts: true,
    payoutAlerts: true,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const data = await settingsService.getNotificationPreferences();
        setPrefs(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadPrefs();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 space-y-2">
          <div className="h-6 w-32 rounded bg-[#27272A] animate-pulse" />
          <div className="h-4 w-64 rounded bg-[#27272A] animate-pulse" />
        </div>
        <div className="divide-y divide-[#27272A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded bg-[#27272A] animate-pulse" />
                <div className="h-3 w-56 rounded bg-[#27272A] animate-pulse" />
              </div>
              <div className="h-6 w-11 rounded-full bg-[#27272A] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    
    try {
      await settingsService.saveNotificationPreferences(updated);

      if (key === 'pushNotifications' && value) {
        try {
          const token = await requestNotificationPermission();
          if (token) {
            await settingsService.updateFcmToken(token);
            toast.success('Push notifications enabled successfully');
          } else {
            // If token fetch failed, revert the toggle visually
            setPrefs({ ...prefs, pushNotifications: false });
            await settingsService.saveNotificationPreferences({ ...prefs, pushNotifications: false });
            toast.error('Failed to enable push notifications');
          }
        } catch (error) {
          setPrefs({ ...prefs, pushNotifications: false });
          await settingsService.saveNotificationPreferences({ ...prefs, pushNotifications: false });
          toast.error('Error setting up push notifications');
        }
      } else {
        toast.success('Notification preferences updated');
      }
    } catch (error) {
      toast.error('Failed to update notification preferences');
      setPrefs(prefs); // Revert to old state
    }
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-white">Notifications</h3>
      <p className="mb-6 text-sm text-[#71717A]">Choose how you want to be notified</p>

      <div className="divide-y divide-[#27272A]">
        {TOGGLE_CONFIG.map(({ key, label, description }) => (
          <ToggleSwitch
            key={key}
            enabled={prefs[key]}
            onChange={(val) => handleToggle(key, val)}
            label={label}
            description={description}
          />
        ))}
      </div>
    </div>
  );
}
