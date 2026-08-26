'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Calendar, ChevronDown, CreditCard, Landmark, Banknote } from 'lucide-react';
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import { financialService } from '@/services/financials/financial.service';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import { useAuth } from '@/hooks/use-auth';
import type { PayoutRecord } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;

const periodOptions = [
  'All Time',
  'Today',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Custom Range',
];

export default function EarningsAndPayoutsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Earnings state
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [period, setPeriod] = useState('All Time');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Payouts state
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    try {
      let fromDate: Date | undefined;
      const today = new Date();
      if (period === 'Today') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } else if (period === 'This Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (period === 'Last Month') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      } else if (period === 'Last 3 Months') {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      } else if (period === 'Custom Range') {
        if (customFrom) fromDate = new Date(customFrom);
      }
      
      let toDate: Date | undefined;
      if (period === 'Today') {
        toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      } else if (period === 'Last Month') {
        toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      } else if (period === 'Custom Range') {
        if (customTo) {
          toDate = new Date(customTo);
          toDate.setHours(23, 59, 59, 999);
        }
      }

      const params: any = {};
      if (fromDate) params.startDate = fromDate.toISOString();
      if (toDate) params.endDate = toDate.toISOString();
      
      const res = await apiClient.get('/supplier-earnings', { params });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (period !== 'Custom Range' || (customFrom && customTo)) {
      fetchEarnings();
    }
  }, [fetchEarnings, period, customFrom, customTo]);

  const fetchPayouts = useCallback(async () => {
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
    fetchPayouts();
  }, [fetchPayouts]);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Earnings & Payouts</h1>
          <p className="text-gray-400">Track your completed rental earnings and view your payouts.</p>
        </div>
      </div>

      <div className="animate-in fade-in duration-300">
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-md border border-[#3F3F46] bg-[#1A1A1A] p-2 text-[#A1A1AA] hover:text-white transition-colors">
              <Calendar className="h-4 w-4" />
            </button>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none rounded-md border border-[#3F3F46] bg-[#1A1A1A] pl-3 pr-8 py-2 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              >
                {periodOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
            </div>
            
            {period === 'Custom Range' && (
              <div className="flex items-center ml-2">
                <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                  <RangePicker
                    value={[customFrom ? dayjs(customFrom) : null, customTo ? dayjs(customTo) : null]}
                    onChange={(dates) => {
                      if (dates) {
                        setCustomFrom(dates[0] ? dates[0].format('YYYY-MM-DD') : '');
                        setCustomTo(dates[1] ? dates[1].format('YYYY-MM-DD') : '');
                      } else {
                        setCustomFrom('');
                        setCustomTo('');
                      }
                    }}
                    className="rounded-md border border-[#3F3F46] bg-[#1A1A1A] px-3 py-2 text-sm focus:border-[#FACC15] hover:border-[#FACC15]"
                  />
                </ConfigProvider>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#27272A] p-6 rounded-xl animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">Supplier Total Earnings</h3>
              </div>
              <p className="text-2xl font-bold text-white mt-2">€{(summary.totalGrossAmount || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">User Cancellation Refund</h3>
              </div>
              <p className="text-2xl font-bold text-red-400 mt-2">€{(summary.cancellationRefunds || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">Refunded Amount (Early Return)</h3>
              </div>
              <p className="text-2xl font-bold text-orange-400 mt-2">€{(summary.earlyReturnRefunds || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">Net Amount</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2">€{(summary.totalEarnings || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">Already Paid</h3>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-2">€{(summary.totalAlreadyPaid || 0).toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-[#27272A] p-5 rounded-xl flex flex-col justify-between">
              <div className="min-h-[48px] flex items-start">
                <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">Pending Payouts</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-2">€{(summary.pendingEarnings || 0).toFixed(2)}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8">

          <h2 className="text-xl font-bold text-white mb-4">Payout History</h2>
          <PayoutHistoryTable data={payouts} isLoading={isLoadingPayouts} />
        </div>
      </div>
    </div>
  );
}
