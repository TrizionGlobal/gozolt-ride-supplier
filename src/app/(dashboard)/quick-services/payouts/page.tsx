'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Landmark, Banknote, CreditCard,
  AlertCircle, Car, Bike, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import { PayoutHistoryTable } from '@/components/financials/payout-history-table';
import type { PayoutRecord } from '@/types';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import type { QuickServiceBooking } from '@/services/quick-services/quick-service-booking.types';
import { useAuthStore } from '@/stores/auth.store';

const normalizeServiceName = (str: string) => {
  if (!str) return 'Standard Service';
  return str.replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await supplierQuickServiceBookingService.getBookings({ limit: 1000 });
      setBookings(res.bookings || []);
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validBookings = useMemo(() => {
    const registered = new Set<string>();
    try {
      const parsed = typeof user?.quickServicesOffered === 'string' 
        ? JSON.parse(user.quickServicesOffered) 
        : user?.quickServicesOffered;
        
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          if (Array.isArray(s.services)) {
            s.services.forEach((childService: string) => {
              registered.add(normalizeServiceName(childService));
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    
    return bookings.filter(b => {
      const name = normalizeServiceName(b.childService || 'Standard Service');
      return registered.has(name);
    });
  }, [bookings, user?.quickServicesOffered]);

  const stats = useMemo(() => {
    let grossUpfront = 0;
    let pendingAdminPayout = 0;
    let settledAdminPayout = 0;
    let estimatedCashCollected = 0;
    let refunds = 0;
    let cancellations = 0;
    let supplierNetEarned = 0;

    validBookings.forEach((b) => {
      if (b.status === 'CANCELLED') {
        cancellations += 1;
        return; // Supplier earns nothing on cancelled jobs
      }

      const totalAmount = parseFloat((b as any).totalAmount?.toString() || '0');
      const upfrontFee = parseFloat((b as any).upfrontFee?.toString() || '0');
      const collected = parseFloat((b as any).collectedAmount?.toString() || '0');
      const method = (b as any).paymentMethodType;
      
      const supplierShare = Math.max(0, totalAmount - upfrontFee);
      supplierNetEarned += supplierShare;

      let adminOwesThisJob = supplierShare;

      if (method === 'CASH') {
         estimatedCashCollected += collected;
         adminOwesThisJob -= collected;
      }
      
      adminOwesThisJob = Math.max(0, adminOwesThisJob);

      // In a real app we'd check against actual Payout records to see what is settled.
      // For this UI, if it's PAID and COMPLETED, we'll mark it as pending admin payout
      // (as it waits for the 9-day settlement cycle).
      if (b.paymentStatus === 'PAID') {
        if (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED') {
          pendingAdminPayout += adminOwesThisJob;
        }
      }
    });

    return {
      supplierNetEarned,
      settledAdminPayout, // Would come from Payout API in production
      pendingAdminPayout,
      estimatedCashCollected,
      refunds,
      cancellations
    };
  }, [validBookings]);

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

  // Generate fake payouts history from validBookings for demo purposes
  // ONLY show PAID items in this table per user request
  const generatedPayouts: PayoutRecord[] = useMemo(() => {
    return validBookings
      .filter(b => b.paymentStatus === 'PAID' && (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED'))
      .map(b => {
        const totalAmount = parseFloat((b as any).totalAmount?.toString() || '0');
        const upfrontFee = parseFloat((b as any).upfrontFee?.toString() || '0');
        const materialCost = parseFloat((b as any).materialCost?.toString() || '0');
        const finalServiceCharge = Math.max(0, totalAmount - upfrontFee - materialCost);
        const supplierNetEarned = Math.max(0, totalAmount - upfrontFee);

        return {
          id: b.id,
          amount: supplierNetEarned,
          status: 'COMPLETED' as const,
          periodStart: b.scheduledAt,
          periodEnd: b.scheduledAt,
          processedAt: b.updatedAt || b.scheduledAt,
          createdAt: b.scheduledAt,
          details: { 
            service: b.childService || 'Quick Service',
            materialCost,
            finalServiceCharge
          }
        };
      }).slice((page - 1) * limit, page * limit);
  }, [validBookings, page, limit]);

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

        {/* History Table */}
        <PayoutHistoryTable 
          data={generatedPayouts} 
          isLoading={isLoading} 
          page={page}
          limit={limit}
          total={validBookings.filter(b => b.paymentStatus === 'PAID' && (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED')).length}
          serviceName="Quick Services"
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
}
