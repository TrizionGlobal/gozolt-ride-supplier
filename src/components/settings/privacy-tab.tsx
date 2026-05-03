'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
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
  const [settings, setSettings] = useState<PrivacySettings>({
    shareAnalytics: true,
    showDriverProfiles: true,
    allowMarketingEmails: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setSettings(settingsService.getPrivacySettings());
  }, []);

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    settingsService.savePrivacySettings(updated);
    toast.success('Privacy settings updated');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await settingsService.exportData();
      toast.success('Data export started');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
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

        {/* Export Data */}
        <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
          <div>
            <p className="text-sm font-medium text-white">Export Your Data</p>
            <p className="mt-0.5 text-xs text-[#71717A]">Download a copy of all your account data</p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-[#3F3F46] px-4 py-2 text-sm font-medium text-white hover:bg-[#52525B] transition-colors disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

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
