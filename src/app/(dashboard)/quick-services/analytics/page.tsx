'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import type { QuickServiceBooking } from '@/services/quick-services/quick-service-booking.types';
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
  LineChart,
  Line
} from 'recharts';
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  Clock,
  TrendingUp,
  Wallet
} from 'lucide-react';

const normalizeServiceName = (str: string) => {
  if (!str) return 'Standard Service';
  return str.replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function QuickServicesAnalyticsPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<QuickServiceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await supplierQuickServiceBookingService.getBookings({ limit: 1000 });
      setBookings(res.bookings || []);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Filter valid bookings based on supplier's registered services
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
      const name = normalizeServiceName((b as any).childService || (b as any).serviceTitle || 'Standard Service');
      return registered.has(name);
    });
  }, [bookings, user?.quickServicesOffered]);

  // Aggregate Data
  const {
    totalRevenue,
    totalCompleted,
    totalPaid,
    totalHours,
    earningsByService,
    statusData,
    revenueByDate
  } = useMemo(() => {
    let rev = 0;
    let completed = 0;
    let paid = 0;
    let hours = 0;

    const earningsMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {
      'Completed': 0,
      'In Progress': 0,
      'Pending': 0
    };
    const dateMap: Record<string, number> = {};

    validBookings.forEach((b) => {
      const name = normalizeServiceName((b as any).childService || (b as any).serviceTitle || 'Standard Service');
      const amount = parseFloat((b as any).totalAmount?.toString() || '0');
      
      // Status Grouping
      if (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED') {
        statusMap['Completed'] += 1;
        completed += 1;
        rev += amount;
        
        // Approximate 1.5 hours per completed job since we don't track exact timestamps yet
        hours += 1.5;

        // Earnings by Service
        earningsMap[name] = (earningsMap[name] || 0) + amount;

        // Revenue by Date
        const dateObj = new Date((b as any).bookingDate || (b as any).scheduledAt || (b as any).createdAt || Date.now());
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        dateMap[dateStr] = (dateMap[dateStr] || 0) + amount;
      } 
      else if (b.serviceStatus === 'IN_PROGRESS' || b.status === 'IN_PROGRESS') {
        statusMap['In Progress'] += 1;
      } else {
        statusMap['Pending'] += 1;
      }

      // Total Paid by User (regardless of completion, if paymentStatus is PAID)
      if (b.paymentStatus === 'PAID') {
        paid += amount;
      }
    });

    const earningsArray = Object.keys(earningsMap).map(key => ({ name: key, earnings: earningsMap[key] }));
    const statusArray = Object.keys(statusMap).filter(k => statusMap[k] > 0).map(key => ({ name: key, count: statusMap[key] }));
    const dateArray = Object.keys(dateMap).slice(-7).map(key => ({ date: key, revenue: dateMap[key] })); // Last 7 active days

    return {
      totalRevenue: rev,
      totalCompleted: completed,
      totalPaid: paid,
      totalHours: hours,
      earningsByService: earningsArray,
      statusData: statusArray,
      revenueByDate: dateArray
    };
  }, [validBookings]);

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Services Analytics</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">Monitor your detailed performance, revenue, and working hours.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#111111] px-4 text-sm font-medium text-white transition-colors hover:border-[#FCD223] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#FCD223] ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top KPI Cards Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-[#27272A] bg-[#111111] p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-[#27272A]"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 rounded bg-[#27272A]"></div>
                    <div className="h-7 w-20 rounded bg-[#27272A]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Bar Chart Skeleton */}
            <div className="col-span-1 lg:col-span-2 rounded-xl border border-[#27272A] bg-[#111111] p-6 animate-pulse">
              <div className="h-6 w-64 rounded bg-[#27272A] mb-6"></div>
              <div className="h-72 w-full flex items-end justify-around gap-2 pb-8 border-b border-[#27272A]/50">
                {[40, 70, 45, 90, 60, 30].map((height, i) => (
                  <div key={i} className="w-10 bg-[#27272A] rounded-t-sm" style={{ height: `${height}%` }}></div>
                ))}
              </div>
            </div>

            {/* Pie Chart Skeleton */}
            <div className="col-span-1 rounded-xl border border-[#27272A] bg-[#111111] p-6 animate-pulse flex flex-col items-center">
              <div className="h-6 w-48 rounded bg-[#27272A] mb-8 self-start"></div>
              <div className="h-[180px] w-[180px] rounded-full border-[30px] border-[#27272A] my-4"></div>
              <div className="mt-8 flex gap-4 w-full justify-center">
                <div className="h-4 w-16 rounded bg-[#27272A]"></div>
                <div className="h-4 w-16 rounded bg-[#27272A]"></div>
              </div>
            </div>

            {/* Line Chart Skeleton */}
            <div className="col-span-1 lg:col-span-3 rounded-xl border border-[#27272A] bg-[#111111] p-6 animate-pulse">
              <div className="h-6 w-48 rounded bg-[#27272A] mb-6"></div>
              <div className="h-72 w-full flex flex-col justify-between py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-px w-full bg-[#27272A]/50"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Earnings" value={`€${totalRevenue.toFixed(2)}`} icon={<CircleDollarSign className="h-5 w-5" />} color="green" />
            <MetricCard title="Est. Hours Worked" value={`${totalHours.toFixed(1)} hrs`} icon={<Clock className="h-5 w-5" />} color="blue" />
            <MetricCard title="Completed Jobs" value={totalCompleted.toString()} icon={<CheckCircle2 className="h-5 w-5" />} color="purple" />
            <MetricCard title="Total Customer Payments" value={`€${totalPaid.toFixed(2)}`} icon={<Wallet className="h-5 w-5" />} color="yellow" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Earnings by Service - Bar Chart */}
            <div className="col-span-1 lg:col-span-2 rounded-xl border border-[#27272A] bg-[#111111] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Earnings Breakdown by Service</h2>
              {earningsByService.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earningsByService} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                      <XAxis dataKey="name" stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 12 }} tickFormatter={(val) => `€${val}`} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#27272A' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#FCD223' }} />
                      <Bar dataKey="earnings" fill="#FCD223" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-[#71717A]">No earnings data available yet.</div>
              )}
            </div>

            {/* Job Status Overview - Pie Chart */}
            <div className="col-span-1 rounded-xl border border-[#27272A] bg-[#111111] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Job Pipeline Overview</h2>
              {statusData.length > 0 ? (
                <div className="h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {statusData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs text-[#A1A1AA]">{entry.name} ({entry.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-[#71717A]">No pipeline data available yet.</div>
              )}
            </div>

            {/* Revenue Trend - Line Chart */}
            <div className="col-span-1 lg:col-span-3 rounded-xl border border-[#27272A] bg-[#111111] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Recent Revenue Trend</h2>
              {revenueByDate.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByDate} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                      <XAxis dataKey="date" stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#A1A1AA" tick={{ fill: '#A1A1AA', fontSize: 12 }} tickFormatter={(val) => `€${val}`} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#10B981' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#FCD223', stroke: '#111' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-[#71717A]">Not enough recent revenue to display trend.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    yellow: 'border-[#FCD223]/20 bg-[#FCD223]/10 text-[#FCD223]',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#27272A] bg-[#111111] p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-[#A1A1AA]">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
