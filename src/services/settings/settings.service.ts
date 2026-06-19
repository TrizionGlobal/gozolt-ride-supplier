'use client';

import { apiClient } from '@/lib/api-client';
import type {
  CompanyProfile,
  NotificationPreferences,
  PrivacySettings,
  TeamUser,
  LanguageSettings,
} from '@/types';


const STORAGE_KEYS = {
  companyProfile: 'gozolt-supplier-company-profile',
  notifications: 'gozolt-supplier-notifications',
  privacy: 'gozolt-supplier-privacy',
  language: 'gozolt-supplier-language',
};

export const settingsService = {
  // ── Company Profile ──
  async getCompanyProfile(): Promise<CompanyProfile> {
    try {
      const res = await apiClient.get('/suppliers/me');
      return res.data;
    } catch {
      return {} as CompanyProfile; // Fallback empty object
    }
  },

  async updateCompanyProfile(data: CompanyProfile): Promise<CompanyProfile> {
    const res = await apiClient.patch('/suppliers/me', data);
    return res.data;
  },

  // ── Notifications ──
  getNotificationPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') return { emailNotifications: true, smsNotifications: false, pushNotifications: true, rideAlerts: true, payoutAlerts: true };
    const stored = localStorage.getItem(STORAGE_KEYS.notifications);
    return stored ? JSON.parse(stored) : { emailNotifications: true, smsNotifications: false, pushNotifications: true, rideAlerts: true, payoutAlerts: true };
  },

  saveNotificationPreferences(prefs: NotificationPreferences): void {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(prefs));
  },

  // ── Privacy ──
  getPrivacySettings(): PrivacySettings {
    if (typeof window === 'undefined') return { shareAnalytics: true, showDriverProfiles: true, allowMarketingEmails: false };
    const stored = localStorage.getItem(STORAGE_KEYS.privacy);
    return stored ? JSON.parse(stored) : { shareAnalytics: true, showDriverProfiles: true, allowMarketingEmails: false };
  },

  savePrivacySettings(settings: PrivacySettings): void {
    localStorage.setItem(STORAGE_KEYS.privacy, JSON.stringify(settings));
  },

  // ── Team Users ──
  async getTeamUsers(): Promise<TeamUser[]> {
    try {
      const res = await apiClient.get('/suppliers/team');
      return res.data;
    } catch {
      return [];
    }
  },

  async inviteUser(email: string, role: TeamUser['role']): Promise<TeamUser> {
    const res = await apiClient.post('/suppliers/team/invite', { email, role });
    return res.data;
  },

  async removeUser(userId: string): Promise<void> {
    await apiClient.delete(`/suppliers/team/${userId}`);
  },

  // ── Language ──
  getLanguageSettings(): LanguageSettings {
    if (typeof window === 'undefined') return { appLanguage: 'English', driverAppLanguage: 'English' };
    const stored = localStorage.getItem(STORAGE_KEYS.language);
    return stored ? JSON.parse(stored) : { appLanguage: 'English', driverAppLanguage: 'English' };
  },

  saveLanguageSettings(settings: LanguageSettings): void {
    localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(settings));
  },

  // ── Account Actions ──
  async exportData(): Promise<void> {
    const res = await apiClient.get('/suppliers/me/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'account-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/suppliers/me');
  },
};
