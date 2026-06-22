'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { ridesService } from '@/services/rides/rides.service';
import { RideKPICards } from '@/components/rides/ride-kpi-cards';
import { RideTable } from '@/components/rides/ride-table';
import { RideDetailDrawer } from '@/components/rides/ride-detail-drawer';
import { ExportButton } from '@/components/ui/export-button';
import type { SupplierRideListItem, SupplierRideKpis } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function RidesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [rides, setRides] = useState<SupplierRideListItem[]>([]);
  const [kpis, setKpis] = useState<SupplierRideKpis | null>(null);
  const [selectedRide, setSelectedRide] = useState<SupplierRideListItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRides, setTotalRides] = useState(0);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null) {
      setSearchTerm(search);
    } else {
      setSearchTerm('');
    }
  }, [searchParams]);

  const fetchRides = useCallback(async () => {
    setIsLoading(true);
    try {
      const ridesRes = await ridesService.getRides({ status: statusFilter, search: debouncedSearchTerm, page, limit });
      setRides(ridesRes.data);
      setTotalRides(ridesRes.total);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, debouncedSearchTerm, page, limit]);

  const fetchKpis = useCallback(async () => {
    try {
      const kpisRes = await ridesService.getKpis();
      setKpis(kpisRes);
    } catch {
      // handled in service
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // Listen for real-time ride updates from the backend
  useFleetTracking({ 
    onRefresh: () => {
      fetchRides();
      fetchKpis();
    } 
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Rides Management</h1>
        <ExportButton
          filename="rides-export"
          data={rides.map((ride) => ({
            Rider: ride.riderName || 'Unknown',
            Driver: ride.driverName || 'Unassigned',
            Pickup: ride.pickup,
            'Drop-off': ride.dropoff,
            Distance: ride.distance,
            Fare: ride.actualFare || ride.estimatedFare || 0,
            Payment: ride.paymentMethod || 'CASH',
            Status: ride.status,
          }))}
        />
      </div>

      {/* KPI Cards */}
      <RideKPICards kpis={kpis} isLoading={kpis === null} />

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col gap-4 border-b border-[#27272A] sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-6 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW_USER'].map((s) => {
            const statusStyles: Record<string, { label: string }> = {
              COMPLETED: { label: 'Completed' },
              IN_PROGRESS: { label: 'In Progress' },
              CANCELLED: { label: 'Cancelled' },
              NO_SHOW_USER: { label: 'No Show' },
            };
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 ${
                  statusFilter === s
                    ? 'border-[#FACC15] text-[#FACC15]'
                    : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]'
                }`}
              >
                {s === 'ALL' ? 'All Rides' : (statusStyles[s]?.label || s)}
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-sm pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text"
              placeholder="Search rides..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
            />
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <RideTable
        rides={rides}
        isLoading={isLoading}
        onSelectRide={setSelectedRide}
        page={page}
        limit={limit}
        total={totalRides}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Detail Drawer */}
      <RideDetailDrawer ride={selectedRide} onClose={() => setSelectedRide(null)} />
    </div>
  );
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="text-[#A1A1AA]">Loading rides...</div>}>
      <RidesContent />
    </Suspense>
  );
}
