'use client';

import { useState } from 'react';
import { Building2, Bell, Users, Globe, Shield, Lock, Landmark } from 'lucide-react';
import { CompanyProfileTab } from '@/components/settings/company-profile-tab';
import { NotificationsTab } from '@/components/settings/notifications-tab';
import { UsersTab } from '@/components/settings/users-tab';
import { LanguageTab } from '@/components/settings/language-tab';
import { PrivacyTab } from '@/components/settings/privacy-tab';
import { SecurityTab } from '@/components/settings/security-tab';
import { BankDetailsTab } from '@/components/settings/bank-details-tab';
import type { SettingsTab } from '@/types';

const TABS: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: 'company', label: 'Company Profile', icon: Building2 },
  { key: 'bank', label: 'Bank Details', icon: Landmark },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'language', label: 'Language', icon: Globe },
  { key: 'privacy', label: 'Privacy', icon: Shield },
  { key: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-[#27272A] bg-[#0A0A0A] p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-[#FACC15] text-black'
                : 'text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        {activeTab === 'company' && <CompanyProfileTab />}
        {activeTab === 'bank' && <BankDetailsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'language' && <LanguageTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}
