'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { VehicleStatusCards } from '@/components/fleet/vehicle-status-cards';
import { VehiclesTable } from '@/components/fleet/vehicles-table';
import { fleetService } from '@/services/fleet/fleet.service';
import type { FleetVehicle } from '@/types';
import { ExportButton } from '@/components/ui/export-button';
import { useDebounce } from '@/hooks/use-debounce';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fleetService.getVehicles({ page, limit, search: debouncedSearch || undefined });
      setVehicles(res.data);
      setTotalPages(res.totalPages);
      setTotalVehicles(res.total || 0);
      // Fetch all for status counts (no filter)
      if (!debouncedSearch) {
        setAllVehicles(res.data);
      }
    } catch {
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  // Fetch all vehicles once for status cards
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fleetService.getVehicles({ page: 1, limit: 100 });
        setAllVehicles(res.data);
      } catch {
        // ignore
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Listen for real-time fleet updates from the backend
  useFleetTracking({ onRefresh: fetchVehicles });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            filename="fleet-export"
            data={vehicles.map((vehicle) => ({
              'Vehicle No': vehicle.plateNumber,
              'Make/Model': `${vehicle.make} ${vehicle.model}`,
              'Vehicle Type': vehicle.type,
              'Fuel': vehicle.fuelType,
              'Assigned Driver': vehicle.assignedDriverName || 'Not Assigned',
              'Status': vehicle.status,
            }))}
          />
          <Link
            href="/fleet/add"
            className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="mb-6">
        <VehicleStatusCards vehicles={allVehicles} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
          />
        </div>
      </div>

      {/* Table */}
      <VehiclesTable 
        vehicles={vehicles} 
        isLoading={isLoading} 
        page={page}
        limit={limit}
        total={totalVehicles}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />
    </div>
  );
}
