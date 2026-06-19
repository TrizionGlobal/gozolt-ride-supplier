'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';
import { ToggleSwitch } from '@/components/settings/toggle-switch';
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog';
import type { PrivacySettings } from '@/types';

const TOGGLE_CONFIG: { key: keyof PrivacySettings; label: string; description: string }[] = [
  { key: 'shareAnalytics', label: 'Share Analytics', description: 'Allow us to collect usage data to improve the platform' },
  { key: 'showDriverProfiles', label: 'Show Driver Profiles', description: 'Make driver profiles visible to passengers' },
  { key: 'allowMarketingEmails', label: 'Marketing Emails', description: 'Receive promotional offers and updates' },
];

export function PrivacyTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<PrivacySettings>({
    shareAnalytics: true,
    showDriverProfiles: true,
    allowMarketingEmails: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSettings(settingsService.getPrivacySettings());
      setIsLoading(false);
    }, 0);
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 space-y-2">
          <div className="h-6 w-20 rounded bg-[#27272A] animate-pulse" />
          <div className="h-4 w-72 rounded bg-[#27272A] animate-pulse" />
        </div>
        <div className="divide-y divide-[#27272A]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-40 rounded bg-[#27272A] animate-pulse" />
                <div className="h-3 w-64 rounded bg-[#27272A] animate-pulse" />
              </div>
              <div className="h-6 w-11 rounded-full bg-[#27272A] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          <div className="h-4 w-32 rounded bg-[#27272A] animate-pulse" />
          <div className="h-[74px] w-full rounded-lg bg-[#27272A] animate-pulse" />
          <div className="h-[74px] w-full rounded-lg bg-[#27272A] animate-pulse" />
        </div>
      </div>
    );
  }

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    settingsService.savePrivacySettings(updated);
    toast.success('Privacy settings updated');
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-white">Privacy</h3>
      <p className="mb-6 text-sm text-[#71717A]">Manage your data privacy and account settings</p>

      {/* Privacy toggles */}
      <div className="divide-y divide-[#27272A]">
        {TOGGLE_CONFIG.map(({ key, label, description }) => (
          <ToggleSwitch
            key={key}
            enabled={settings[key]}
            onChange={(val) => handleToggle(key, val)}
            label={label}
            description={description}
          />
        ))}
      </div>

      {/* Data & Account section */}
      <div className="mt-8 space-y-4">
        <h4 className="text-sm font-semibold uppercase text-[#71717A]">Data & Account</h4>

        {/* Delete Account */}
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div>
            <p className="text-sm font-medium text-red-400">Delete Account</p>
            <p className="mt-0.5 text-xs text-[#71717A]">Permanently delete your account and all data</p>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteAccountDialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} />
    </div>
  );
}
