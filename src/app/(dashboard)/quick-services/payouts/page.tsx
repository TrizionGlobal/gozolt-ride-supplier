'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Landmark, Banknote, CreditCard,
  AlertCircle, Car, Bike, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Wrench,
  Receipt, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { financialService } from '@/services/financials/financial.service';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import type { QuickServiceBooking } from '@/services/quick-services/quick-service-booking.types';
import type { PayoutRecord } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-[#1F1F1F] ${className}`} />
);

function PageSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0D0D0D] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-8 w-8 rounded-lg" />
            <Shimmer className="h-4 w-4 rounded" />
          </div>
          <div className="space-y-2">
            <Shimmer className="h-6 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PayoutsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<QuickServiceBooking[]>([]);
  const [adminPayouts, setAdminPayouts] = useState<PayoutRecord[]>([]);
  const [totalAdminPayouts, setTotalAdminPayouts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payouts pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Bookings settlements pagination
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(10);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, payoutsRes] = await Promise.allSettled([
        supplierQuickServiceBookingService.getBookings({ limit: 1000 }),
        financialService.getPayoutHistory('QUICK_SERVICES', page, limit),
      ]);

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.bookings || []);
      }
      if (payoutsRes.status === 'fulfilled') {
        setAdminPayouts(payoutsRes.value.data || []);
        setTotalAdminPayouts(payoutsRes.value.meta?.total || 0);
      }
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // All bookings assigned by admin to this supplier
  const completedBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.paymentStatus === 'PAID' && (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED')
    );
  }, [bookings]);

  const stats = useMemo(() => {
    let pendingAdminPayout = 0;
    let estimatedCashCollected = 0;
    let refunds = 0;
    let cancellations = 0;
    let supplierNetEarned = 0;

    bookings.forEach((b) => {
      if (b.status === 'CANCELLED') {
        cancellations += 1;
        return;
      }

      const isCompleted = (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED') && b.paymentStatus === 'PAID';
      const totalAmount = parseFloat((b as any).totalAmount?.toString() || '0');
      const upfrontFee = parseFloat((b as any).upfrontFee?.toString() || '0');
      const collected = parseFloat((b as any).collectedAmount?.toString() || '0');
      const method = ((b as any).paymentMethodType || '').toUpperCase();
      const isCash = method === 'CASH';

      const supplierShare = Math.max(0, totalAmount - upfrontFee);

      if (isCompleted) {
        supplierNetEarned += supplierShare;

        let adminOwesThisJob = supplierShare;

        if (isCash) {
          estimatedCashCollected += collected;
          adminOwesThisJob -= collected;
        }

        adminOwesThisJob = Math.max(0, adminOwesThisJob);
        pendingAdminPayout += adminOwesThisJob;
      }
    });

    const settledAdminPayout = adminPayouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (parseFloat(p.amount?.toString() || '0') || 0), 0);

    const adjustedPending = Math.max(0, pendingAdminPayout - settledAdminPayout);

    return {
      supplierNetEarned,
      settledAdminPayout,
      pendingAdminPayout: adjustedPending,
      estimatedCashCollected,
      refunds,
      cancellations,
    };
  }, [bookings, adminPayouts]);

  const fmt = (val: number | undefined) => `€${(val || 0).toFixed(2)}`;

  const KpiCard = ({
    label, value, icon: Icon, color, trend,
  }: {
    label: string; value: string; icon: any; color: string; trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#0D0D0D] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-400" />}
        {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
      </div>
      <div>
        <p className="text-xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-xs font-medium text-[#71717A] mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );

  const bookingColumns: ColumnDef<any>[] = [
    {
      key: 'date',
      title: 'DATE',
      className: 'whitespace-nowrap',
      render: (row) => (
        <span className="text-[#D4D4D8] whitespace-nowrap">
          {new Date(row.scheduledAt || row.bookingDate || row.createdAt).toLocaleDateString('en-CA')}
        </span>
      ),
    },
    {
      key: 'service',
      title: 'SERVICE',
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.serviceTitle || row.childService || 'Quick Service'}</p>
          <p className="text-xs text-[#71717A]">{row.categoryName || row.serviceCategory || ''}</p>
        </div>
      ),
    },
    {
      key: 'materialCost',
      title: 'MATERIAL COST',
      render: (row) => (
        <span className="text-[#D4D4D8]">€{parseFloat(row.materialCost?.toString() || '0').toFixed(2)}</span>
      ),
    },
    {
      key: 'serviceCharge',
      title: 'SERVICE CHARGE',
      render: (row) => {
        const total = parseFloat(row.totalAmount?.toString() || '0');
        const upfront = parseFloat(row.upfrontFee?.toString() || '0');
        const mat = parseFloat(row.materialCost?.toString() || '0');
        const charge = Math.max(0, total - upfront - mat);
        return <span className="text-[#D4D4D8]">€{charge.toFixed(2)}</span>;
      },
    },
    {
      key: 'cashCollected',
      title: 'CASH COLLECTED',
      render: (row) => {
        const method = (row.paymentMethodType || '').toUpperCase();
        const collected = parseFloat(row.collectedAmount?.toString() || '0');
        return method === 'CASH' && collected > 0 ? (
          <span className="text-purple-400 font-medium">€{collected.toFixed(2)}</span>
        ) : (
          <span className="text-[#71717A]">€0.00</span>
        );
      },
    },
    {
      key: 'totalNet',
      title: 'TOTAL (NET)',
      render: (row) => {
        const total = parseFloat(row.totalAmount?.toString() || '0');
        const upfront = parseFloat(row.upfrontFee?.toString() || '0');
        const net = Math.max(0, total - upfront);
        return <span className="font-semibold text-[#22C55E]">€{net.toFixed(2)}</span>;
      },
    },
    {
      key: 'paymentMethod',
      title: 'METHOD',
      render: (row) => {
        const method = (row.paymentMethodType || 'Card').toUpperCase();
        const isCash = method === 'CASH';
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isCash ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {method}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'STATUS',
      render: () => (
        <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-green-500/20 text-green-400">
          Completed
        </span>
      ),
    },
  ];

  const paginatedBookings = useMemo(() => {
    return completedBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);
  }, [completedBookings, bookingPage, bookingLimit]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments &amp; Settlements</h1>
          <p className="text-sm text-[#71717A] mt-1">Revenue summary, settlement status, and earnings breakdown for Quick Services.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-[#27272A] bg-[#1A1A1A] px-4 py-2 text-sm text-[#D4D4D8] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Body */}
      <div className="space-y-8">
        {/* KPI Cards */}
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label="Admin Settled (Paid to You)" value={fmt(stats.settledAdminPayout)} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-500" trend="up" />
            <KpiCard label="Pending Admin Payout" value={fmt(stats.pendingAdminPayout)} icon={Clock} color="bg-yellow-500/10 text-yellow-500" />
            <KpiCard label="Total Net Earned (Total - Upfront)" value={fmt(stats.supplierNetEarned)} icon={Banknote} color="bg-blue-500/10 text-blue-500" />
            <KpiCard label="Cash Collected (Kept by Worker)" value={fmt(stats.estimatedCashCollected)} icon={Landmark} color="bg-purple-500/10 text-purple-500" />
            <KpiCard label="Cancellations" value={stats.cancellations.toString()} icon={AlertCircle} color="bg-orange-500/10 text-orange-500" trend="down" />
          </div>
        )}

        {/* Platform Payout History (Actual Admin Payouts) */}
        <PayoutHistoryTable 
          data={adminPayouts} 
          isLoading={isLoading} 
          page={page}
          limit={limit}
          total={totalAdminPayouts}
          serviceName="Quick Services"
          onPageChange={setPage}
          onLimitChange={setLimit}
        />

        {/* Completed Bookings Settlement Breakdown */}
        <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]/80 p-6 backdrop-blur-xl">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#FACC15] to-transparent opacity-20" />
          <div className="mb-6 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#FACC15]" />
              <h3 className="text-lg font-semibold text-white">Admin-Assigned Job Settlements</h3>
            </div>
            <p className="text-xs text-[#71717A]">
              Breakdown of customer bookings assigned by admin and completed by your workers.
            </p>
          </div>

          <ServerSideTable
            columns={bookingColumns}
            data={paginatedBookings}
            isLoading={isLoading}
            page={bookingPage}
            limit={bookingLimit}
            total={completedBookings.length}
            onPageChange={setBookingPage}
            onLimitChange={setBookingLimit}
            emptyText="No completed job settlements recorded yet."
          />
        </div>
      </div>
    </div>
  );
}
