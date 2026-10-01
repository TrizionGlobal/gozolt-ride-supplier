'use client';

import { useEffect, useState, useMemo } from 'react';
import { BriefcaseBusiness, CalendarCheck, Users, Wrench, ArrowRight, Loader2, Clock, CheckCircle2, CircleDashed, Star, TrendingUp } from 'lucide-react';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import type { QuickServiceBooking } from '@/services/quick-services/quick-service-booking.types';
import Link from 'next/link';

import { useAuthStore } from '@/stores/auth.store';

const normalizeServiceName = (str: string) => {
  if (!str) return 'Standard Service';
  // convert HOME_CLEANING or "Home Cleaning" to "Home Cleaning"
  return str.replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function QuickServicesDashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<QuickServiceBooking[]>([]);
  const [workersCount, setWorkersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, workersRes] = await Promise.all([
          supplierQuickServiceBookingService.getBookings({ limit: 100 }), // Fetch more to get accurate top stats
          supplierQuickServiceBookingService.getWorkers(1, 1),
        ]);
        setBookings(bookingsRes.bookings || []);
        setWorkersCount(workersRes.total || 0);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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

  const activeBookings = validBookings.filter(b => b.serviceStatus === 'IN_PROGRESS' || b.status === 'IN_PROGRESS');
  const completedBookings = validBookings.filter(b => b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED');
  const pendingBookings = validBookings.filter(b => !(['IN_PROGRESS', 'COMPLETED'].includes(b.serviceStatus || '')) && !(['IN_PROGRESS', 'COMPLETED'].includes(b.status)));

  const dashboardCards = [
    {
      title: 'Total Service Requests',
      value: validBookings.length.toString(),
      description: 'All customer requests',
      icon: BriefcaseBusiness,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Active Bookings',
      value: activeBookings.length.toString(),
      description: 'Services currently in progress',
      icon: CalendarCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Staff & Workers',
      value: workersCount.toString(),
      description: 'Registered professionals',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Completed Services',
      value: completedBookings.length.toString(),
      description: 'Successfully completed jobs',
      icon: Wrench,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
  ];

  const recentBookings = validBookings.slice(0, 5);

  const getStatusBadge = (b: QuickServiceBooking) => {
    const sStatus = b.serviceStatus || 'PENDING';
    const aStatus = b.status;
    
    if (sStatus === 'COMPLETED' || aStatus === 'COMPLETED') 
      return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>;
    if (sStatus === 'IN_PROGRESS' || aStatus === 'IN_PROGRESS') 
      return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"><Clock className="h-3.5 w-3.5" /> In Progress</span>;
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400"><CircleDashed className="h-3.5 w-3.5" /> Pending</span>;
  };

  // Group bookings by childService dynamically based ONLY on registered services
  const serviceStats = useMemo(() => {
    const stats: Record<string, { total: number, completed: number, pending: number, active: number, category: string }> = {};
    
    // 1. Initialize stats with ONLY all registered services
    try {
      const parsed = typeof user?.quickServicesOffered === 'string' 
        ? JSON.parse(user.quickServicesOffered) 
        : user?.quickServicesOffered;
        
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          if (s.category && Array.isArray(s.services)) {
            s.services.forEach((childService: string) => {
              const normalizedName = normalizeServiceName(childService);
              if (!stats[normalizedName]) {
                stats[normalizedName] = { 
                  total: 0, 
                  completed: 0, 
                  pending: 0, 
                  active: 0, 
                  category: normalizeServiceName(s.category) 
                };
              }
            });
          }
        });
      }
    } catch (e) {
      console.error('Failed to parse user quick services offered', e);
    }

    // 2. Populate stats from actual valid bookings ONLY if they exist in the registered stats
    validBookings.forEach(b => {
      // Clean up string like HOME_CLEANING into Home Cleaning
      const bookingChild = (b as any).childService || (b as any).serviceTitle || 'Standard Service';
      const name = normalizeServiceName(bookingChild);
      
      // If they didn't register for it, don't show it in the catalog performance grid!
      if (stats[name]) {
        stats[name].total += 1;
        if (b.serviceStatus === 'COMPLETED' || b.status === 'COMPLETED') stats[name].completed += 1;
        else if (b.serviceStatus === 'IN_PROGRESS' || b.status === 'IN_PROGRESS') stats[name].active += 1;
        else stats[name].pending += 1;
      }
    });

    const list = Object.entries(stats).map(([name, data]) => ({ name, ...data }));
    // Sort primarily by total bookings, but keep 0-booking services visible
    list.sort((a, b) => b.total - a.total);
    return list;
  }, [bookings, user?.quickServicesOffered]);

  const top3Services = serviceStats.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header Skeleton */}
        <div>
          <div className="h-9 w-64 rounded-lg bg-[#27272A] animate-pulse"></div>
          <div className="mt-2 h-4 w-96 rounded-lg bg-[#27272A] animate-pulse opacity-50"></div>
        </div>

        {/* Top 4 Cards Skeleton */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111] p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#27272A]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-8 rounded bg-[#27272A]"></div>
                  <div className="h-3 w-24 rounded bg-[#27272A] opacity-50"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Service Catalog Performance */}
          <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#111111] overflow-hidden flex flex-col animate-pulse">
            <div className="flex items-center justify-between border-b border-[#27272A] p-6 bg-[#18181b]/30">
              <div className="space-y-2">
                <div className="h-6 w-56 rounded bg-[#27272A]"></div>
                <div className="h-3 w-72 rounded bg-[#27272A] opacity-50"></div>
              </div>
              <div className="h-5 w-5 rounded bg-[#27272A]"></div>
            </div>
            
            <div className="flex-1 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-[#27272A] bg-[#18181b] p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-[#27272A]"></div>
                        <div className="h-3 w-20 rounded bg-[#27272A] opacity-50"></div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-[#27272A]"></div>
                    </div>
                    <div className="flex justify-between border-t border-[#27272A] pt-4 mt-auto">
                      <div className="h-3 w-10 rounded bg-[#27272A]"></div>
                      <div className="h-3 w-10 rounded bg-[#27272A]"></div>
                      <div className="h-3 w-10 rounded bg-[#27272A]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Top 3 Services Skeleton */}
            <div className="rounded-2xl border border-[#27272A] bg-[#111111] overflow-hidden animate-pulse">
              <div className="border-b border-[#27272A] p-5 bg-[#18181b]/30">
                <div className="h-6 w-32 rounded bg-[#27272A] mb-2"></div>
                <div className="h-3 w-48 rounded bg-[#27272A] opacity-50"></div>
              </div>
              <div className="p-5 space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 rounded-xl bg-[#27272A]"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 rounded bg-[#27272A]"></div>
                      <div className="h-3 w-20 rounded bg-[#27272A] opacity-50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="rounded-2xl border border-[#27272A] bg-[#111111] p-5 flex-1 animate-pulse">
              <div className="h-6 w-32 rounded bg-[#27272A] mb-6"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#27272A]"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-[#27272A]"></div>
                      <div className="h-3 w-20 rounded bg-[#27272A] opacity-50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Quick Services Dashboard
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Monitor your service requests, manage professionals, and track your active operations.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-xl border border-[#27272A] bg-[#111111] p-3 transition-all hover:border-[#3f3f46] hover:bg-[#18181b]"
            >
              <div className="absolute -right-3 -top-3 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
                <Icon className={`h-16 w-16 ${card.color}`} />
              </div>
              <div className="relative flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white tracking-tight leading-none">
                    {card.value}
                  </p>
                  <h2 className="mt-1 text-xs font-semibold text-[#D4D4D8]">
                    {card.title}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* All Registered Quick Services Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#111111] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-[#27272A] p-6 bg-[#18181b]/30">
            <div>
              <h2 className="text-lg font-bold text-white">Service Catalog Performance</h2>
              <p className="text-xs text-[#71717A] mt-1">Detailed breakdown of all your registered services</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#FACC15]" />
          </div>
          
          <div className="flex-1 overflow-x-auto p-6">
            {serviceStats.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {serviceStats.map((service, idx) => (
                  <div key={idx} className="rounded-xl border border-[#27272A] bg-[#18181b] p-4 flex flex-col hover:border-[#3f3f46] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        <p className="text-xs text-[#A1A1AA]">{service.category}</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FACC15]/10 text-[#FACC15] font-bold text-sm">
                        {service.total}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-[#27272A] grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-[#A1A1AA]">Completed</div>
                        <div className="text-sm font-semibold text-emerald-400">{service.completed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#A1A1AA]">Active</div>
                        <div className="text-sm font-semibold text-amber-400">{service.active}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#A1A1AA]">Pending</div>
                        <div className="text-sm font-semibold text-blue-400">{service.pending}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <BriefcaseBusiness className="mb-3 h-8 w-8 text-[#52525B]" />
                <p className="text-sm text-[#A1A1AA]">No service data available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Booking Services & Overview */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#27272A] bg-[#111111] p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Star className="h-24 w-24 text-[#FACC15]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1 relative z-10">Top 3 Services</h2>
            <p className="text-xs text-[#A1A1AA] mb-6 relative z-10">Your highest performing categories</p>
            
            <div className="space-y-4 relative z-10">
              {top3Services.length > 0 ? top3Services.map((service, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                    idx === 0 ? 'bg-[#FACC15] text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 
                    idx === 1 ? 'bg-zinc-300 text-black' : 
                    'bg-amber-600 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-white truncate text-sm">{service.name}</h4>
                    <p className="text-xs text-[#A1A1AA]">{service.total} total bookings</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#A1A1AA] py-4 text-center">No booking data available to rank.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#27272A] bg-[#111111] p-6 flex flex-col flex-1">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4 flex-1">
              {recentBookings.length > 0 ? recentBookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex items-start gap-3 border-b border-[#27272A] pb-4 last:border-0 last:pb-0">
                  <div className="mt-0.5">
                    {booking.serviceStatus === 'COMPLETED' || booking.status === 'COMPLETED' ? (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    ) : booking.serviceStatus === 'IN_PROGRESS' || booking.status === 'IN_PROGRESS' ? (
                      <div className="h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {booking.customer?.name || 'Customer'} <span className="font-normal text-[#A1A1AA]">booked</span> {normalizeServiceName(booking.childService || 'Standard')}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">
                      {new Date(booking.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-[#A1A1AA] text-center">No recent activity.</p>
              )}
            </div>
            
            <Link href="/quick-services/booking-management" className="mt-6 block text-center text-sm font-medium text-[#FACC15] hover:text-[#eab308] hover:underline transition-colors w-full rounded-lg border border-[#27272A] bg-[#18181b] py-2.5">
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
