'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Truck, Navigation, DollarSign, HandCoins } from 'lucide-react';
import { dashboardService } from '@/services/dashboard/dashboard.service';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { StatCard } from '@/components/dashboard/stat-card';
import { RidesChart } from '@/components/dashboard/rides-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActiveRidesTable } from '@/components/dashboard/active-rides-table';
import { AlertsCard } from '@/components/dashboard/alerts-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ExpiringDocsBanner } from '@/components/shared/expiring-docs-banner';
import { formatCurrency } from '@/lib/utils';
import type { DashboardKpis } from '@/types';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(() => {
    dashboardService.getKpis().then((data) => {
      setKpis(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // Listen for real-time dashboard refresh triggers from backend via Socket.io
  useFleetTracking({ onRefresh: fetchKpis });

  return (
    <div>
      {/* Page Title */}
      <h1 className="mb-6 text-3xl font-bold text-white">Dashboard</h1>

      {/* Expiring Documents Banner */}
      <ExpiringDocsBanner docs={[]} />

      {/* Row 1: KPI Stat Cards */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-[#0EA5E9]"
          label="Active Drivers"
          value={loading ? '—' : String(kpis?.activeDrivers ?? 0)}
          badge="+3"
        />
        <StatCard
          icon={Truck}
          iconBg="bg-[#F97316]"
          label="Total Vehicles"
          value={loading ? '—' : String(kpis?.totalVehicles ?? 0)}
          badge="+2"
        />
        <StatCard
          icon={Navigation}
          iconBg="bg-[#EF4444]"
          label="Rides Today"
          value={loading ? '—' : String(kpis?.ridesToday ?? 0)}
          badge="+12"
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-[#8B5CF6]"
          label="Revenue (MTD)"
          value={loading ? '—' : formatCurrency(kpis?.revenueMTD ?? 0)}
          badge="+8%"
        />
        <StatCard
          icon={HandCoins}
          iconBg="bg-green-500"
          label="Tips (MTD)"
          value={loading ? '—' : formatCurrency(kpis?.tipEarningsMTD ?? 0)}
          badge="+€240"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <RidesChart />
        <RevenueChart />
      </div>

      {/* Row 3: Active Rides Table */}
      <div className="mb-6">
        <ActiveRidesTable />
      </div>

      {/* Row 4: Alerts + Quick Actions */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <AlertsCard />
        <QuickActions />
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-xs text-[#52525B]">
          Copyright © {new Date().getFullYear()}. All rights reserved by{' '}
          <span className="text-[#FACC15] font-semibold">PRIMOOO</span>
        </p>
      </div>
    </div>
  );
}
