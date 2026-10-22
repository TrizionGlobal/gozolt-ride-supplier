'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Wallet, ArrowDownRight, CheckCircle2, Plane } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function AirportTransfersPayoutsPage() {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancials() {
      try {
        const res = await apiClient.get('/airport-transfers/supplier/dashboard');
        setRevenue(res.data.totalRevenue || 0);
      } catch (err) {
        console.error('Failed to fetch financials:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFinancials();
  }, []);

  const platformCommission = revenue * 0.10;
  const netEarnings = revenue - platformCommission;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wallet className="h-7 w-7 text-[#FACC15]" />
          Airport Transfer Financials & Payouts
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review your gross transfer revenue, platform service fee deductions, and net payout settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A]">
          <span className="text-xs uppercase font-semibold text-gray-400">Gross Transfer Volume</span>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? '—' : `€${revenue.toFixed(2)}`}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">Total completed journeys</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A]">
          <span className="text-xs uppercase font-semibold text-gray-400">Platform Commission (10%)</span>
          <p className="text-3xl font-extrabold text-red-400 mt-3">
            {loading ? '—' : `-€${platformCommission.toFixed(2)}`}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">Platform fee & insurance</span>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-[#27272A]">
          <span className="text-xs uppercase font-semibold text-[#FACC15]">Net Settled Payout</span>
          <p className="text-3xl font-extrabold text-[#FACC15] mt-3">
            {loading ? '—' : `€${netEarnings.toFixed(2)}`}
          </p>
          <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ready for weekly settlement
          </span>
        </div>
      </div>
    </div>
  );
}
