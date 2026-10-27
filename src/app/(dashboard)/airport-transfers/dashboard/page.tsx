'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plane,
  Truck,
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  PlusCircle,
  Settings,
  List,
  History,
  Wallet,
  Car,
  AlertTriangle,
  MapPin,
  User,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface TransferTask {
  id: string;
  assignedToName?: string | null;
  assignedToEmail?: string | null;
  tripLeg: string;
  isUsed: boolean;
  selfAssigned: boolean;
}

interface RecentTransfer {
  id: string;
  bookingReference: string;
  transferType: string;
  flightNumber?: string | null;
  returnFlightNumber?: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  returnDateTime?: string | null;
  status: string;
  returnStatus?: string | null;
  leadPassengerName?: string | null;
  adults?: number;
  children?: number;
  grandTotal: number;
  vehicle?: {
    make: string;
    model: string;
    registrationNo?: string;
    vehicleType?: string;
  } | null;
  tasks?: TransferTask[];
}

interface DashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  scheduledToday: number;
  activeTransfers: number;
  pendingApprovals: number;
  upcomingBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  totalRevenue: number;
  monthlyEarnings?: Array<{ month: string; earnings: number }>;
  recentTransfers?: RecentTransfer[];
}

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-[#111111]/70 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.45)] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40 pointer-events-none" />
    <div className="relative z-10 p-5 flex flex-col h-full">{children}</div>
  </div>
);

const KpiCard = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  iconColorClass,
  iconBgClass,
  valueColorClass = 'text-white',
  pingDot = false,
  loading = false,
}: {
  title: string;
  value?: React.ReactNode;
  subtitle: string;
  icon: any;
  iconColorClass: string;
  iconBgClass: string;
  valueColorClass?: string;
  pingDot?: boolean;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2.5 flex-1 pr-3">
            <div className="h-2.5 w-24 rounded bg-white/10" />
            <div className="h-8 w-28 rounded-lg bg-white/10" />
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
            <div className="h-5 w-5 rounded bg-white/10" />
          </div>
        </div>
        <div className="mt-3.5 h-3 w-36 rounded bg-white/5" />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-2">
          <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">{title}</p>
          <h3 className={`mt-1 text-2xl sm:text-3xl font-black tracking-tight ${valueColorClass}`}>
            {value}
          </h3>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ${iconColorClass}`}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>
      <span className="text-[11px] text-gray-400 mt-2 block font-medium flex items-center gap-1.5">
        {pingDot && <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-ping" />}
        {subtitle}
      </span>
    </GlassCard>
  );
};

export default function AirportTransfersDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await apiClient.get('/airport-transfers/supplier/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch airport transfer metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Real-time WebSocket listener for live KPI metrics updates
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('supplier_token') || sessionStorage.getItem('supplier_token')
        : null;
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const baseUrl = API_URL.replace(/\/v1$/, '');
    const socket: Socket = io(`${baseUrl}/supplier`, {
      path: '/socket.io/',
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('supplier:refresh', () => fetchMetrics());
    socket.on('airport_transfer:status:changed', () => fetchMetrics());
    socket.on('airport_transfer:cancelled', () => fetchMetrics());

    return () => {
      socket.off('supplier:refresh');
      socket.off('airport_transfer:status:changed');
      socket.off('airport_transfer:cancelled');
      socket.disconnect();
    };
  }, [fetchMetrics]);

  // Fallback monthly data for charts if empty
  const monthlyEarningsData =
    metrics?.monthlyEarnings && metrics.monthlyEarnings.length > 0
      ? metrics.monthlyEarnings
      : [
          { month: 'May', earnings: 120 },
          { month: 'Jun', earnings: 240 },
          { month: 'Jul', earnings: 190 },
          { month: 'Aug', earnings: 380 },
          { month: 'Sep', earnings: 420 },
          { month: 'Oct', earnings: metrics?.totalRevenue ? Math.round(metrics.totalRevenue) : 510 },
        ];

  // Booking distribution data
  const activeCount = metrics?.activeTransfers || 0;
  const upcomingCount = metrics?.upcomingBookings || 0;
  const completedCount = metrics?.completedBookings || 0;
  const pendingCount = metrics?.pendingApprovals || 0;
  const cancelledCount = metrics?.cancelledBookings || 0;

  const bookingDistributionData = [
    { name: 'Active on Road', value: activeCount, color: '#3b82f6' }, // blue-500
    { name: 'Upcoming', value: upcomingCount, color: '#a855f7' }, // purple-500
    { name: 'Completed', value: completedCount, color: '#10b981' }, // emerald-500
    { name: 'Pending Approval', value: pendingCount, color: '#f59e0b' }, // amber-500
    { name: 'Cancelled', value: cancelledCount, color: '#ef4444' }, // red-500
  ].filter((d) => d.value > 0);

  if (bookingDistributionData.length === 0) {
    bookingDistributionData.push({ name: 'Ready for Bookings', value: 1, color: '#FACC15' });
  }

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
            {status.replace(/_/g, ' ')}
          </span>
        );
      case 'EN_ROUTE_TO_PICKUP':
      case 'ARRIVED_AT_AIRPORT':
      case 'PASSENGER_MET':
      case 'IN_TRANSIT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse">
            {status.replace(/_/g, ' ')}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            COMPLETED
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/25">
            PENDING APPROVAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/25">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* ── 1. HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FACC15]/25 to-[#FACC15]/5 border border-[#FACC15]/30 text-[#FACC15] shadow-lg shadow-[#FACC15]/10">
              <Plane className="h-6 w-6 transform -rotate-45" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Airport Transport Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5 font-medium">
                Real-time airport transfer dispatch, incoming flight tracking & fleet metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setLoading(true);
              fetchMetrics();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-gray-300 text-xs font-semibold hover:bg-[#27272A] transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#FACC15]' : ''}`} />
            Refresh
          </button>
          <Link
            href="/airport-transfers/fleet"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors"
          >
            <Truck className="h-3.5 w-3.5 text-blue-400" />
            Transfer Fleet
          </Link>
          <Link
            href="/airport-transfers/bookings"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
            Dispatch & Bookings
          </Link>
          <Link
            href="/airport-transfers/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] text-black text-xs font-bold hover:bg-[#EAB308] transition-colors shadow-lg shadow-[#FACC15]/15"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI CARDS (8 METRICS) ─────────────────────────────────── */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Scheduled Today */}
        <KpiCard
          title="Scheduled Today"
          value={metrics?.scheduledToday ?? 0}
          subtitle="Pickups & drop-offs today"
          icon={Clock}
          iconBgClass="bg-gradient-to-br from-[#FACC15]/20 to-[#FACC15]/5 border border-[#FACC15]/25"
          iconColorClass="text-[#FACC15]"
          pingDot
          loading={loading}
        />

        {/* Active Transfers */}
        <KpiCard
          title="Active on Road"
          value={metrics?.activeTransfers ?? 0}
          subtitle="Currently in transit"
          icon={Plane}
          iconBgClass="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/25"
          iconColorClass="text-blue-400"
          valueColorClass="text-blue-400"
          loading={loading}
        />

        {/* Total Fleet */}
        <KpiCard
          title="Transfer Fleet"
          value={metrics?.totalVehicles ?? 0}
          subtitle={`${metrics?.availableVehicles ?? 0} active & available`}
          icon={Truck}
          iconBgClass="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/25"
          iconColorClass="text-purple-400"
          valueColorClass="text-purple-400"
          loading={loading}
        />

        {/* Total Revenue */}
        <KpiCard
          title="Gross Revenue"
          value={formatCurrency(metrics?.totalRevenue ?? 0)}
          subtitle="Completed transfer payouts"
          icon={DollarSign}
          iconBgClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/25"
          iconColorClass="text-emerald-400"
          valueColorClass="text-[#FACC15]"
          loading={loading}
        />

        {/* Pending Approvals */}
        <KpiCard
          title="Pending Approvals"
          value={metrics?.pendingApprovals ?? 0}
          subtitle="Requires dispatch action"
          icon={AlertTriangle}
          iconBgClass="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/25"
          iconColorClass="text-amber-400"
          valueColorClass={(metrics?.pendingApprovals ?? 0) > 0 ? 'text-amber-400' : 'text-gray-300'}
          loading={loading}
        />

        {/* Upcoming Bookings */}
        <KpiCard
          title="Upcoming Trips"
          value={metrics?.upcomingBookings ?? 0}
          subtitle="Scheduled for future dates"
          icon={CalendarCheck}
          iconBgClass="bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/25"
          iconColorClass="text-indigo-400"
          valueColorClass="text-white"
          loading={loading}
        />

        {/* Completed Transfers */}
        <KpiCard
          title="Completed Transfers"
          value={metrics?.completedBookings ?? 0}
          subtitle="All-time fulfilled rides"
          icon={CheckCircle2}
          iconBgClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/25"
          iconColorClass="text-emerald-400"
          valueColorClass="text-emerald-400"
          loading={loading}
        />

        {/* Fleet Availability % */}
        <KpiCard
          title="Fleet Readiness"
          value={
            metrics?.totalVehicles && metrics.totalVehicles > 0
              ? `${Math.round(((metrics.availableVehicles || 0) / metrics.totalVehicles) * 100)}%`
              : '100%'
          }
          subtitle="Ready for immediate booking"
          icon={ShieldCheck}
          iconBgClass="bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/25"
          iconColorClass="text-cyan-400"
          valueColorClass="text-cyan-400"
          loading={loading}
        />
      </div>

      {/* ── 3. QUICK NAVIGATION CHIPS ────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Link
          href="/airport-transfers/new"
          className="group flex items-center gap-3 rounded-2xl bg-[#111111]/80 border border-[#27272A] p-3 transition-all duration-300 hover:bg-[#1A1A1A] hover:border-[#FACC15]/40 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/10 text-[#FACC15] group-hover:scale-110 transition-transform">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-[13px] font-bold text-white leading-tight">Add Vehicle</h4>
            <p className="text-[10px] text-[#A1A1AA] leading-tight mt-0.5">Register new airport transfer</p>
          </div>
        </Link>

        <Link
          href="/airport-transfers/fleet"
          className="group flex items-center gap-3 rounded-2xl bg-[#111111]/80 border border-[#27272A] p-3 transition-all duration-300 hover:bg-[#1A1A1A] hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-[13px] font-bold text-white leading-tight">Manage Fleet</h4>
            <p className="text-[10px] text-[#A1A1AA] leading-tight mt-0.5">Classes, prices & luggage</p>
          </div>
        </Link>

        <Link
          href="/airport-transfers/bookings"
          className="group flex items-center gap-3 rounded-2xl bg-[#111111]/80 border border-[#27272A] p-3 transition-all duration-300 hover:bg-[#1A1A1A] hover:border-purple-500/40 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <List className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-[13px] font-bold text-white leading-tight">Dispatch & Bookings</h4>
            <p className="text-[10px] text-[#A1A1AA] leading-tight mt-0.5">Assign drivers & track rides</p>
          </div>
        </Link>

        <Link
          href="/airport-transfers/payouts"
          className="group flex items-center gap-3 rounded-2xl bg-[#111111]/80 border border-[#27272A] p-3 transition-all duration-300 hover:bg-[#1A1A1A] hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-[13px] font-bold text-white leading-tight">Settlements & Payouts</h4>
            <p className="text-[10px] text-[#A1A1AA] leading-tight mt-0.5">Statements & bank transfers</p>
          </div>
        </Link>
      </div>

      {/* ── 4. VISUAL CHARTS (REVENUE TRAJECTORY & BOOKING STATUS) ──────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Trajectory Bar Chart */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#FACC15]" />
                Airport Transfer Revenue
              </h2>
              <p className="text-xs font-medium text-[#A1A1AA] mt-0.5">
                Completed gross earnings over the last 6 months
              </p>
            </div>
            <span className="text-xs font-bold text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-1 rounded-full border border-[#FACC15]/20">
              EUR (€)
            </span>
          </div>

          {loading ? (
            <div className="w-full h-[240px] flex items-end justify-between gap-3 sm:gap-6 px-4 sm:px-6 pb-6 pt-4">
              {[45, 75, 55, 90, 80, 60].map((h, i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-white/5 to-[#FACC15]/20 animate-pulse border-t border-[#FACC15]/30"
                    style={{ height: `${h}%` }}
                  />
                  <div className="h-2.5 w-8 rounded bg-white/10 animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAirportEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FACC15" stopOpacity={0.95} />
                      <stop offset="95%" stopColor="#CA8A04" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} dx={-10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 17, 17, 0.9)',
                      backdropFilter: 'blur(12px)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      padding: '8px 12px',
                    }}
                    itemStyle={{ color: '#FACC15', fontWeight: '800', fontSize: '1rem' }}
                    formatter={(value: any) => [`€${Number(value || 0).toFixed(2)}`, 'Revenue']}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar
                    dataKey="earnings"
                    fill="url(#colorAirportEarnings)"
                    shape={<CustomBar />}
                    barSize={38}
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(250,204,21,0.25))' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* Booking Distribution Donut Chart */}
        <GlassCard>
          <div className="mb-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-purple-400" />
              Transfer Distribution
            </h2>
            <p className="text-xs font-medium text-[#A1A1AA] mt-0.5">Status & fulfillment breakdown</p>
          </div>

          {loading ? (
            <div className="w-full h-[210px] flex flex-col items-center justify-center relative">
              <div className="w-36 h-36 rounded-full border-8 border-white/5 border-t-[#FACC15]/40 animate-spin" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="h-6 w-12 rounded bg-white/10 animate-pulse" />
                <div className="h-2 w-10 rounded bg-white/5 animate-pulse mt-1" />
              </div>
            </div>
          ) : (
            <div className="w-full h-[210px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {bookingDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{ filter: `drop-shadow(0px 6px 12px ${entry.color}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 17, 17, 0.9)',
                      backdropFilter: 'blur(12px)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      padding: '6px 12px',
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}
                    cursor={{ fill: 'transparent' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                <span className="text-2xl font-black text-white">
                  {(metrics?.completedBookings || 0) +
                    (metrics?.activeTransfers || 0) +
                    (metrics?.upcomingBookings || 0) +
                    (metrics?.pendingApprovals || 0)}
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
              </div>
            </div>
          )}

          {/* Legend */}
          {loading ? (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse shrink-0" />
                  <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
                  <div className="h-2.5 w-6 rounded bg-white/10 animate-pulse ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
              {bookingDistributionData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400 truncate">{item.name}</span>
                  <span className="text-white font-bold ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── 5. LIVE SCHEDULE & UPCOMING TRANSFERS DISPATCH TABLE ────────────────── */}
      <div className="rounded-2xl bg-[#111111]/80 border border-[#27272A] overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#FACC15]" />
              Schedule & Incoming Flight Dispatch
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live airport transfer reservations, passenger meet & greet details, and assigned drivers.
            </p>
          </div>
          <Link
            href="/airport-transfers/bookings"
            className="flex items-center gap-1.5 text-xs text-[#FACC15] font-bold hover:underline"
          >
            View Full Dispatch Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B]/80 text-[#71717A] uppercase text-[10px] font-bold border-b border-[#27272A]">
                <tr>
                  <th className="py-3 px-4">Flight & Booking</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Pickup Route</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Driver Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-white/5" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-20 rounded bg-white/10" />
                          <div className="h-2 w-16 rounded bg-white/5" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 rounded bg-white/10" />
                        <div className="h-2 w-16 rounded bg-white/5" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3 w-32 rounded bg-white/10" />
                        <div className="h-2 w-24 rounded bg-white/5" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 w-24 rounded bg-white/10" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 rounded bg-white/10" />
                        <div className="h-2 w-14 rounded bg-white/5" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-24 rounded-full bg-white/10" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 w-16 rounded-lg bg-white/10 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : metrics?.recentTransfers && metrics.recentTransfers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B]/80 text-[#71717A] uppercase text-[10px] font-bold border-b border-[#27272A]">
                <tr>
                  <th className="py-3 px-4">Flight & Booking</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Pickup Route</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Driver Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {metrics.recentTransfers.map((b) => {
                  const isRound = b.transferType === 'ROUND_TRIP';
                  const flight = b.flightNumber || b.returnFlightNumber || 'Direct Transfer';
                  const assignedTask = b.tasks && b.tasks.length > 0 ? b.tasks[0] : null;

                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Flight & Booking */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#27272A] text-[#FACC15]">
                            <Plane className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{flight}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{b.bookingReference}</span>
                          </div>
                        </div>
                      </td>

                      {/* Passenger */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{b.leadPassengerName || 'Guest Passenger'}</div>
                        <span className="text-[10px] text-gray-500">
                          {b.adults ?? 1} Adults {(b.children ?? 0) > 0 ? `• ${b.children} Children` : ''}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="truncate text-white font-medium" title={b.pickupLocation}>
                          {b.pickupLocation}
                        </div>
                        <div className="truncate text-gray-500 text-[10px]" title={b.dropoffLocation}>
                          → {b.dropoffLocation}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white font-medium block">
                          {formatDateTime(b.pickupDateTime)}
                        </span>
                        {isRound && b.returnDateTime && (
                          <span className="text-[10px] text-indigo-400 block">
                            Return: {formatDateTime(b.returnDateTime)}
                          </span>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white font-medium block">
                          {b.vehicle?.make} {b.vehicle?.model}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {b.vehicle?.registrationNo || 'Standard Class'}
                        </span>
                      </td>

                      {/* Driver Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {assignedTask ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{assignedTask.assignedToName || 'Driver Assigned'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Needs Assignment</span>
                          </div>
                        )}
                        <div className="mt-1">{getStatusBadge(b.status)}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'REFUNDED' ? (
                          <Link
                            href={`/airport-transfers/history?search=${encodeURIComponent(b.bookingReference)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-emerald-400 text-[11px] font-semibold transition-colors"
                          >
                            History <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/airport-transfers/bookings?search=${encodeURIComponent(b.bookingReference)}&assign=${b.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black text-[11px] font-bold transition-colors shadow-sm"
                          >
                            Dispatch <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Plane className="h-10 w-10 text-gray-600 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-400">No scheduled transfers for today</p>
            <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
              Incoming bookings from user apps and flights will appear here automatically in real time.
            </p>
            <Link
              href="/airport-transfers/fleet"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#FACC15] text-black text-xs font-bold hover:bg-[#EAB308] transition-colors"
            >
              Check Fleet Availability <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── 6. FLEET CLASSES & OPERATIONAL CAPABILITIES ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-44 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
              <div className="h-3 w-72 max-w-full rounded bg-white/5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A] space-y-2">
                    <div className="h-2.5 w-16 rounded bg-white/10" />
                    <div className="h-4 w-20 rounded bg-white/10" />
                    <div className="h-2 w-24 max-w-full rounded bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#FACC15]" />
                  Transfer Fleet Classes
                </h3>
                <Link href="/airport-transfers/fleet" className="text-xs text-[#FACC15] hover:underline font-bold">
                  Manage Fleet →
                </Link>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Available vehicle categories serving Malta International Airport (MLA) and major destinations.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Standard Go</span>
                  <span className="font-bold text-white mt-1 block">Up to 4 Pax</span>
                  <span className="text-[10px] text-gray-500">2 Check-in Luggage</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <span className="text-amber-400 text-[10px] uppercase font-semibold block">Executive</span>
                  <span className="font-bold text-white mt-1 block">Up to 4 Pax</span>
                  <span className="text-[10px] text-gray-500">Premium Sedans</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <span className="text-blue-400 text-[10px] uppercase font-semibold block">SUV Class</span>
                  <span className="font-bold text-white mt-1 block">Up to 6 Pax</span>
                  <span className="text-[10px] text-gray-500">4 Check-in Luggage</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <span className="text-purple-400 text-[10px] uppercase font-semibold block">Van 8P</span>
                  <span className="font-bold text-white mt-1 block">Up to 8 Pax</span>
                  <span className="text-[10px] text-gray-500">Large Groups</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <span className="text-emerald-400 text-[10px] uppercase font-semibold block">Electric</span>
                  <span className="font-bold text-white mt-1 block">Zero Emission</span>
                  <span className="text-[10px] text-gray-500">Eco-Friendly MLA</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#27272A] flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-gray-400 font-semibold">Total Vehicles</span>
                  <span className="text-lg font-black text-[#FACC15] mt-0.5">{metrics?.totalVehicles ?? 0}</span>
                </div>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-52 rounded bg-white/10" />
                <div className="h-5 w-20 rounded-full bg-white/10" />
              </div>
              <div className="h-3 w-80 max-w-full rounded bg-white/5" />
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-white/10" />
                      <div className="h-3 w-40 max-w-[180px] rounded bg-white/10" />
                    </div>
                    <div className="h-4 w-16 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FACC15]" />
                  Airport Service Capabilities
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Live Verified
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Included passenger conveniences and supplier operations standards for airport transfers.
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-medium">Free Waiting Time at MLA</span>
                  </div>
                  <span className="text-[#FACC15] font-bold text-xs">60 Minutes</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-medium">Meet & Greet with Name Sign</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">Included</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-medium">Round Trip 10% Discount Engine</span>
                  </div>
                  <span className="text-blue-400 font-bold text-xs">Active</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white font-medium">Real-Time Driver Magic Link Dispatch</span>
                  </div>
                  <span className="text-purple-400 font-bold text-xs">Enabled</span>
                </div>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
