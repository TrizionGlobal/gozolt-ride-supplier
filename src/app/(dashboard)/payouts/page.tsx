'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import type { PayoutRecord, PayoutSettings } from '@/types';

export default function PayoutsPage() {
  const [schedule, setSchedule] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('BIWEEKLY');
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PayoutSettings['paymentMethod'] | null>(null);
  
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoadingPayouts(true);
    try {
      const [settingsData, payoutsData] = await Promise.all([
        financialService.getPayoutSettings(),
        financialService.getPayoutHistory()
      ]);
      setSchedule(settingsData.schedule);
      setPaymentMethod(settingsData.paymentMethod);
      setPayouts(payoutsData);
    } catch {
      toast.error('Failed to load payout data');
    } finally {
      setIsLoadingPayouts(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await financialService.updatePayoutSettings(schedule);
      toast.success('Payout settings saved successfully');
    } catch {
      toast.error('Failed to save payout settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payouts</h1>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Payout Schedule */}
        <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent opacity-20" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15]/10">
              <Calendar className="h-5 w-5 text-[#FACC15]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Payout Schedule</h3>
              <p className="text-xs text-[#A1A1AA]">When do you want to receive payouts?</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            {(['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSchedule(option)}
                className={`relative flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  schedule === option
                    ? 'border border-[#FACC15] bg-[#FACC15]/10 text-[#FACC15]'
                    : 'border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white'
                }`}
              >
                <span>{option === 'WEEKLY' ? 'Weekly' : option === 'BIWEEKLY' ? 'Every 2 Weeks' : 'Monthly'}</span>
                {schedule === option && (
                  <div className="h-2 w-2 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl flex flex-col">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Receiving Bank Account</h3>
              <p className="text-xs text-[#A1A1AA]">Where should we send your money?</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center mt-2">
            {paymentMethod ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-white/90">
                    <span className="font-bold text-blue-900 text-xs uppercase">{paymentMethod.brand}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-lg tracking-widest text-white">•••• •••• •••• {paymentMethod.last4}</p>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    EXP {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear.toString().slice(-2)}
                  </p>
                </div>
                <button className="absolute top-4 right-4 text-xs font-medium text-[#FACC15] hover:text-[#EAB308] transition-colors bg-[#FACC15]/10 px-3 py-1.5 rounded-full">
                  Update
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#3F3F46] bg-[#0A0A0A] p-8 text-center">
                <CreditCard className="h-8 w-8 text-[#3F3F46] mb-3" />
                <p className="text-sm font-medium text-white mb-1">No Account Linked</p>
                <p className="text-xs text-[#A1A1AA] mb-4">Add a bank account to receive payouts</p>
                <button className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors">
                  Add Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <PayoutHistoryTable data={payouts} isLoading={isLoadingPayouts} />

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
