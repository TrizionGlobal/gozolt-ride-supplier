'use client';

import { apiClient } from '@/lib/api-client';
import type {
  CompanyProfile,
  NotificationPreferences,
  PrivacySettings,
  TeamUser,
  LanguageSettings,
} from '@/types';
import {
  mockCompanyProfile,
  defaultNotificationPreferences,
  defaultPrivacySettings,
  mockTeamUsers,
  defaultLanguageSettings,
} from '@/lib/mock-data';

const isDevBypassed = () => {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_DEV_BYPASS === 'true' ||
    localStorage.getItem('gozolt-supplier-dev-bypass') === 'true'
  );
};

const STORAGE_KEYS = {
  companyProfile: 'gozolt-supplier-company-profile',
  notifications: 'gozolt-supplier-notifications',
  privacy: 'gozolt-supplier-privacy',
  language: 'gozolt-supplier-language',
};

export const settingsService = {
  // ── Company Profile ──
  async getCompanyProfile(): Promise<CompanyProfile> {
    if (isDevBypassed()) {
      const stored = localStorage.getItem(STORAGE_KEYS.companyProfile);
      return stored ? JSON.parse(stored) : mockCompanyProfile;
    }
    try {
      const res = await apiClient.get('/suppliers/me');
      return res.data;
    } catch {
      return mockCompanyProfile;
    }
  },

  async updateCompanyProfile(data: CompanyProfile): Promise<CompanyProfile> {
    if (isDevBypassed()) {
      localStorage.setItem(STORAGE_KEYS.companyProfile, JSON.stringify(data));
      return data;
    }
    const res = await apiClient.patch('/suppliers/me', data);
    return res.data;
  },

  // ── Notifications ──
  getNotificationPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') return defaultNotificationPreferences;
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    return stored ? JSON.parse(stored) : defaultNotificationPreferences;
  },

  saveNotificationPreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(prefs));
  },

  // ── Privacy ──
  getPrivacySettings(): PrivacySettings {
    if (typeof window === 'undefined') return defaultPrivacySettings;
    const stored = localStorage.getItem(STORAGE_KEYS.privacy);
    return stored ? JSON.parse(stored) : defaultPrivacySettings;
  },

  savePrivacySettings(settings: PrivacySettings): void {
    localStorage.setItem(STORAGE_KEYS.privacy, JSON.stringify(settings));
  },

  // ── Team Users ──
  async getTeamUsers(): Promise<TeamUser[]> {
    if (isDevBypassed()) return mockTeamUsers;
    try {
      const res = await apiClient.get('/suppliers/team');
      return res.data;
    } catch {
      return mockTeamUsers;
    }
  },

  async inviteUser(email: string, role: TeamUser['role']): Promise<TeamUser> {
    if (isDevBypassed()) {
      const newUser: TeamUser = {
        id: `u-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        status: 'Pending',
        joinedAt: new Date().toISOString(),
      };
      return newUser;
    }
    const res = await apiClient.post('/suppliers/team/invite', { email, role });
    return res.data;
  },

  async removeUser(userId: string): Promise<void> {
    if (isDevBypassed()) return;
    await apiClient.delete(`/suppliers/team/${userId}`);
  },

  // ── Language ──
  getLanguageSettings(): LanguageSettings {
    if (typeof window === 'undefined') return defaultLanguageSettings;
    const stored = localStorage.getItem(STORAGE_KEYS.language);
    return stored ? JSON.parse(stored) : defaultLanguageSettings;
  },

  saveLanguageSettings(settings: LanguageSettings): void {
    localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(settings));
  },

  // ── Account Actions ──
  async exportData(): Promise<void> {
    if (isDevBypassed()) return;
    const res = await apiClient.get('/suppliers/me/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'account-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteAccount(): Promise<void> {
    if (isDevBypassed()) return;
    await apiClient.delete('/suppliers/me');
  },
};
