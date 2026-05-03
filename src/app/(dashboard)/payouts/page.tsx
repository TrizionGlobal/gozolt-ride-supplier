'use client';

import { useState } from 'react';
import { Building2, Calendar, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const [bankName, setBankName] = useState('Deutsche Bank');
  const [iban, setIban] = useState('DE89 3704 0044 0532 0130 00');
  const [bic, setBic] = useState('COBADEFFXXX');
  const [accountHolder, setAccountHolder] = useState('Gozolt Transport GmbH');
  const [schedule, setSchedule] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('BIWEEKLY');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success('Payout settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payouts</h1>

      {/* Payout Schedule */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#FACC15]" />
          <h3 className="text-lg font-semibold text-white">Payout Schedule</h3>
        </div>
        <p className="mb-4 text-sm text-[#A1A1AA]">
          Choose how often you&apos;d like to receive payouts. Changes take effect from the next payout cycle.
        </p>
        <div className="flex gap-3">
          {(['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSchedule(option)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                schedule === option
                  ? 'bg-[#FACC15] text-black'
                  : 'border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              {option === 'WEEKLY' ? 'Weekly' : option === 'BIWEEKLY' ? 'Every 2 Weeks' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-[#FACC15]" />
          <h3 className="text-lg font-semibold text-white">Bank Details</h3>
        </div>
        <p className="mb-4 text-sm text-[#A1A1AA]">
          Your payout bank account information. Ensure details are correct to avoid delays.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Account Holder</label>
            <input
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Bank Name</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">IBAN</label>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">BIC / SWIFT</label>
            <input
              value={bic}
              onChange={(e) => setBic(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Info */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-[#FACC15]" />
          <h3 className="text-lg font-semibold text-white">Payment Method</h3>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0EA5E9]/20">
              <Building2 className="h-5 w-5 text-[#0EA5E9]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Bank Transfer (SEPA)</p>
              <p className="text-xs text-[#71717A]">IBAN ending in ···{iban.slice(-4)}</p>
            </div>
          </div>
          <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
            Active
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Payout Settings'}
        </button>
      </div>
    </div>
  );
}
