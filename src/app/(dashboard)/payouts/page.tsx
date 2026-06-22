'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, ExternalLink, ShieldCheck, Save } from 'lucide-react';
import { toast } from 'sonner';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import { apiClient } from '@/lib/api-client';
import type { PayoutRecord, PayoutSettings } from '@/types';

export default function PayoutsPage() {
  const [schedule, setSchedule] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('BIWEEKLY');
  const [saving, setSaving] = useState(false);
  
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
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
      setIsStripeConnected(settingsData.isStripeConnected);
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

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      await financialService.connectStripeAccount();
      toast.success('Successfully connected Stripe account!');
      setIsStripeConnected(true);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to connect Stripe');
    } finally {
      setConnecting(false);
    }
  };

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

      {/* Stripe Connect */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-[#FACC15]" />
          <h3 className="text-lg font-semibold text-white">Stripe Connected Account</h3>
        </div>
        <p className="mb-6 text-sm text-[#A1A1AA]">
          Gozolt uses Stripe to securely process and transfer your earnings. You must connect your account to receive payouts.
        </p>
        
        {isStripeConnected ? (
          <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Account Connected</p>
                <p className="text-xs text-[#A1A1AA]">Your payouts will be automatically routed to your bank</p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F3F46] transition-colors">
              Stripe Dashboard <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
            <div>
              <p className="text-sm font-medium text-white">Action Required</p>
              <p className="text-xs text-red-400">Connect your account to start receiving funds</p>
            </div>
            <button 
              onClick={handleConnectStripe}
              disabled={connecting}
              className="flex items-center gap-2 rounded-lg bg-[#635BFF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5851E5] transition-colors disabled:opacity-60"
            >
              {connecting ? 'Connecting...' : 'Connect with Stripe'}
            </button>
          </div>
        )}
      </div>

      {/* Payment Method Info */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-[#FACC15]" />
          <h3 className="text-lg font-semibold text-white">Billing Payment Method</h3>
        </div>
        <p className="mb-4 text-sm text-[#A1A1AA]">
          This card is used for your monthly platform subscription fees.
        </p>
        {paymentMethod ? (
          <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-16 items-center justify-center rounded bg-white">
                <span className="font-bold text-blue-900 uppercase">{paymentMethod.brand}</span>
              </div>
              <div>
                <p className="font-medium text-white">•••• •••• •••• {paymentMethod.last4}</p>
                <p className="text-sm text-[#A1A1AA]">
                  Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear.toString().slice(-2)}
                </p>
              </div>
            </div>
            <button className="text-sm font-medium text-[#FACC15] hover:text-[#EAB308]">
              Update Card
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4">
             <div className="flex items-center gap-4">
                <p className="text-sm text-[#A1A1AA]">No active payment method found.</p>
             </div>
             <button className="text-sm font-medium text-[#FACC15] hover:text-[#EAB308]">
              Add Card
            </button>
          </div>
        )}
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
