'use client';

import type { ReactNode } from 'react';
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

import { useQuickServiceAnalytics } from '@/hooks/use-quick-service-analytics';

export default function QuickServicesAnalyticsPage() {
 
  const {
    analytics,
    isLoading,
    error,
    refresh,
  } = useQuickServiceAnalytics('30_DAYS');

  const { summary } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Quick Services Analytics
          </h1>

          <p className="mt-1 text-sm text-[#A1A1AA]">
            Monitor your Quick Services bookings and
            revenue.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:border-[#FCD223] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 text-[#FCD223] ${
                isLoading ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* API warning */}
      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-400">
            Analytics information could not be loaded.
          </p>

          <p className="mt-1 text-xs text-[#D4D4D8]">
            Confirm that the Supplier Quick Services
            Analytics API has been implemented.
          </p>
        </div>
      )}

      {/* Loading message */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#111111] px-4 py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FCD223] border-t-transparent" />

          <p className="text-sm text-[#A1A1AA]">
            Loading analytics...
          </p>
        </div>
      )}

      {/* Four Analytics cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Bookings"
          value={formatNumber(
            summary.totalBookings
          )}
          description="All bookings received"
          icon={
            <ClipboardList className="h-5 w-5" />
          }
          color="yellow"
        />

        <MetricCard
          title="Active Bookings"
          value={formatNumber(
            summary.activeBookings
          )}
          description="Currently being processed"
          icon={<TrendingUp className="h-5 w-5" />}
          color="purple"
        />

        <MetricCard
          title="Completed Bookings"
          value={formatNumber(
            summary.completedBookings
          )}
          description="Successfully completed services"
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          color="green"
        />

        <MetricCard
          title="Revenue"
          value={formatCurrency(
            summary.totalRevenue,
            summary.currency
          )}
          description="Completed-service revenue"
          icon={
            <CircleDollarSign className="h-5 w-5" />
          }
          color="blue"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color:
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple';
}

function MetricCard({
  title,
  value,
  description,
  icon,
  color,
}: MetricCardProps) {
  const colors = {
    yellow:
      'border-[#FCD223]/20 bg-[#FCD223]/10 text-[#FCD223]',
    green:
      'border-green-500/20 bg-green-500/10 text-green-400',
    blue:
      'border-blue-500/20 bg-blue-500/10 text-blue-400',
    purple:
      'border-purple-500/20 bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="rounded-xl border border-[#27272A] bg-[#111111] p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colors[color]}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-[#71717A]">
        {description}
      </p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatCurrency(
  value: number,
  currency = 'EUR'
) {
  try {
    return new Intl.NumberFormat('en-MT', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    return `€${Number(value ?? 0).toFixed(2)}`;
  }
}