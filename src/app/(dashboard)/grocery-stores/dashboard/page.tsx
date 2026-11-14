'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ClipboardList,
  Wallet,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Package,
} from 'lucide-react';
import {
  foodGrocerySupplierService,
  type SupplierProfileResponse,
  type SupplierOrder,
} from '@/services/food-grocery-supplier/food-grocery-supplier.service';

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-[#111111]/70 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-emerald-400/30 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40 pointer-events-none" />
    <div className="relative z-10 p-5 flex flex-col h-full">{children}</div>
  </div>
);

export default function GroceryDashboardPage() {
  const [data, setData] = useState<SupplierProfileResponse | null>(null);
  const [activeOrders, setActiveOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, orders] = await Promise.all([
          foodGrocerySupplierService.getProfile(),
          foodGrocerySupplierService.getOrders('active'),
        ]);
        setData(profile);
        setActiveOrders(orders);
      } catch (err) {
        console.error('Failed to load grocery dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        <div className="h-8 w-64 bg-white/10 rounded-md animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const business = data?.business;
  const stats = data?.stats;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Store className="h-5 w-5" />
            </span>
            {business?.name || 'Grocery Store Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            {business?.address} • Live grocery picking, stock, and packing management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/grocery-stores/orders"
            className="flex items-center gap-2 rounded-xl bg-[#FCD223] px-4 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#FCD223]/90 shadow-[0_0_20px_rgba(252,210,35,0.2)]"
          >
            <ClipboardList className="h-4 w-4" />
            Live Packing Orders ({activeOrders.length})
          </Link>
          <Link
            href="/grocery-stores/catalogue"
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <Package className="h-4 w-4 text-[#FCD223]" />
            Manage Catalogue
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Active Picking Orders
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats?.activeOrders ?? activeOrders.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live customer orders
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Today&apos;s Deliveries
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {stats?.todayOrders ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#A1A1AA]">
            Total orders completed: {stats?.totalOrders ?? 0}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Grocery Revenue
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-400">
                €{(stats?.totalRevenue ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-400/80">Disbursed automatically</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Store Rating
              </p>
              <p className="mt-2 text-3xl font-black text-white flex items-center gap-2">
                {business?.rating ? Number(business.rating).toFixed(1) : '5.0'}
                <Star className="h-5 w-5 fill-[#FCD223] text-[#FCD223]" />
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCD223]/10 text-[#FCD223] border border-[#FCD223]/20">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-[#A1A1AA]">
            Based on {business?.ratingCount ?? 0} reviews
          </p>
        </GlassCard>
      </div>

      {/* Live Orders preview */}
      <div className="rounded-2xl border border-white/10 bg-[#111111]/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white">Live Store Orders</h2>
          </div>
          <Link
            href="/grocery-stores/orders"
            className="flex items-center gap-1 text-sm font-semibold text-[#FCD223] hover:underline"
          >
            All Orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-12 text-center text-[#71717A]">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#27272A] mb-3" />
            <p className="text-base font-semibold text-white">No active orders</p>
            <p className="text-sm mt-1">
              Customer grocery orders will appear here automatically for picking and packing.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400 tracking-wide">
                    {order.formattedBookingId}
                  </span>
                  <span className="text-xs font-bold uppercase text-white/70">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-sm font-bold text-white mt-1">{order.customerName}</p>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {order.items.length} items • €{order.totalAmount.toFixed(2)}
                </p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href="/grocery-stores/orders"
                    className="flex-1 rounded-lg bg-emerald-500 py-2 text-center text-xs font-bold text-black hover:bg-emerald-400"
                  >
                    Pack Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

