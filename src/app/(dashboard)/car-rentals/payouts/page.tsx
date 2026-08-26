'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Landmark, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import { useAuth } from '@/hooks/use-auth';
import type { PayoutRecord } from '@/types';

export default function CarRentalPayoutsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoadingPayouts(true);
    try {
      const payoutsData = await financialService.getCarRentalPayoutHistory();
      setPayouts(payoutsData);
    } catch {
      toast.error('Failed to load rental payout data');
    } finally {
      setIsLoadingPayouts(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Car Rental Payouts</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Track 10-day settlement earnings and payouts for your car rental operations
        </p>
      </div>



      {/* Payout History Table */}
      <PayoutHistoryTable data={payouts} isLoading={isLoadingPayouts} />
    </div>
  );
}
