'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Landmark, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import { useAuth } from '@/hooks/use-auth';
import type { PayoutRecord } from '@/types';

export default function PayoutsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoadingPayouts(true);
    try {
      const payoutsData = await financialService.getPayoutHistory();
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payouts</h1>

      <div className="grid gap-6 mb-6">

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
            {user?.supplierAccountNumber ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-white/90">
                    <Landmark className="h-4 w-4 text-blue-900" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-lg tracking-widest text-white">{user.supplierAccountNumber}</p>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    {user.supplierBankName} • {user.supplierAccountHolder}
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/settings')}
                  className="absolute top-4 right-4 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full"
                >
                  Manage in Settings
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#3F3F46] bg-[#0A0A0A] p-8 text-center">
                <Banknote className="h-8 w-8 text-[#3F3F46] mb-3" />
                <p className="text-sm font-medium text-white mb-1">No Account Linked</p>
                <p className="text-xs text-[#A1A1AA] mb-4">Add a bank account to receive payouts</p>
                <button 
                  onClick={() => router.push('/settings')}
                  className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
                >
                  Add Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <PayoutHistoryTable data={payouts} isLoading={isLoadingPayouts} />
    </div>
  );
}
