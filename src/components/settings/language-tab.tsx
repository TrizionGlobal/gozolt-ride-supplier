'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';
import type { LanguageSettings } from '@/types';

const LANGUAGE_OPTIONS = [
  'English',
  'Maltese',
  'Italian',
  'German',
  'French',
  'Spanish',
  'Portuguese',
  'Arabic',
];

export function LanguageTab() {
  const [settings, setSettings] = useState<LanguageSettings>({
    appLanguage: 'English',
    driverAppLanguage: 'English',
  });

  useEffect(() => {
    setSettings(settingsService.getLanguageSettings());
  }, []);

  const handleChange = (field: keyof LanguageSettings, value: string) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    settingsService.saveLanguageSettings(updated);
    toast.success('Language preferences updated');
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-white">Language</h3>
      <p className="mb-6 text-sm text-[#71717A]">Set language preferences for the portal and driver app</p>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">Portal Language</label>
          <select
            value={settings.appLanguage}
            onChange={(e) => handleChange('appLanguage', e.target.value)}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors md:w-72"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">Driver App Language</label>
          <select
            value={settings.driverAppLanguage}
            onChange={(e) => handleChange('driverAppLanguage', e.target.value)}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors md:w-72"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[#52525B]">
            This sets the default language for the driver mobile app
          </p>
        </div>
      </div>
    </div>
  );
}
