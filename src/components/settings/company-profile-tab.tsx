'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';
import type { CompanyProfile } from '@/types';

export function CompanyProfileTab() {
  const [form, setForm] = useState<CompanyProfile>({
    companyName: '',
    registrationNumber: '',
    vatNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsService.getCompanyProfile();
        setForm(data);
      } catch {
        // fallback handled in service
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.updateCompanyProfile(form);
      toast.success('Company profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-[#27272A] animate-pulse" />
        ))}
      </div>
    );
  }

  const fields: { label: string; key: keyof CompanyProfile; type?: string }[] = [
    { label: 'Company Name', key: 'companyName' },
    { label: 'Registration Number', key: 'registrationNumber' },
    { label: 'VAT Number', key: 'vatNumber' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Phone', key: 'phone', type: 'tel' },
    { label: 'Address', key: 'address' },
    { label: 'City', key: 'city' },
    { label: 'Country', key: 'country' },
    { label: 'Postal Code', key: 'postalCode' },
  ];

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-white">Company Profile</h3>
      <p className="mb-6 text-sm text-[#71717A]">Manage your company details and contact information</p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map(({ label, key, type }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">{label}</label>
            <input
              type={type || 'text'}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
