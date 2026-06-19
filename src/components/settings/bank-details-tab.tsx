'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Landmark, Loader2 } from 'lucide-react';

export function BankDetailsTab() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    supplierBankName: '',
    supplierAccountHolder: '',
    supplierAccountNumber: '',
    supplierSwiftCode: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        supplierBankName: user.supplierBankName || '',
        supplierAccountHolder: user.supplierAccountHolder || '',
        supplierAccountNumber: user.supplierAccountNumber || '',
        supplierSwiftCode: user.supplierSwiftCode || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 space-y-2">
          <div className="h-6 w-32 rounded bg-[#27272A] animate-pulse" />
          <div className="h-4 w-64 rounded bg-[#27272A] animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-[#27272A] animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-[#27272A] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-[#27272A] animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-[#27272A] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-[#27272A] animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-[#27272A] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-[#27272A] animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-[#27272A] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.patch('/suppliers/me', formData);
      if (user && res.data) {
        setUser({ ...user, ...res.data });
      }
      toast.success('Bank details updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || 'Failed to update bank details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-white">Bank & Payout Settings</h3>
          <p className="text-sm text-[#71717A]">
            Securely store your bank details to receive payouts directly from Gozolt.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
          <Landmark className="h-6 w-6" />
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-semibold text-white">Settlement Information</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Account Holder */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">Account Holder Name</label>
            <input
              type="text"
              name="supplierAccountHolder"
              value={formData.supplierAccountHolder}
              onChange={handleChange}
              placeholder="Enter Holder Name"
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">Bank Name</label>
            <input
              type="text"
              name="supplierBankName"
              value={formData.supplierBankName}
              onChange={handleChange}
              placeholder="Enter Bank Name"
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>

          {/* IBAN Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">IBAN Number</label>
            <input
              type="text"
              name="supplierAccountNumber"
              value={formData.supplierAccountNumber}
              onChange={handleChange}
              placeholder="MTXX XXXX XXXX XXXX"
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors uppercase"
            />
          </div>

          {/* SWIFT/BIC Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">SWIFT/BIC Code</label>
            <input
              type="text"
              name="supplierSwiftCode"
              value={formData.supplierSwiftCode}
              onChange={handleChange}
              placeholder="XXXXX"
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors uppercase"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#27272A]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#E5B800] transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Bank Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
