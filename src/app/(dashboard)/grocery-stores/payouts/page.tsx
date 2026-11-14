'use client';

import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import {
  foodGrocerySupplierService,
  type SupplierProfileResponse,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

export default function GroceryPayoutsPage() {
  const [data, setData] = useState<SupplierProfileResponse | null>(null);

  useEffect(() => {
    foodGrocerySupplierService.getProfile().then(setData).catch(console.error);
  }, []);

  const totalRev = (data?.stats?.totalRevenue ?? 0).toFixed(2);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
          <Wallet className="h-7 w-7 text-emerald-400" />
          Store Payouts & Earnings
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Net grocery revenue, completed order settlements, and payment history
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Total Store Revenue
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-400">€{totalRev}</p>
          <p className="mt-3 text-xs text-white/60">Automated daily bank transfer</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111111]/80 p-6 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Settlement Frequency
          </p>
          <p className="mt-2 text-3xl font-black text-white">Daily</p>
          <p className="mt-3 text-xs text-[#A1A1AA]">Direct bank account settlement</p>
        </div>
      </div>
    </div>
  );
}

