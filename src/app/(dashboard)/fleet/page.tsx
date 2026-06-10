'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { VehicleStatusCards } from '@/components/fleet/vehicle-status-cards';
import { VehiclesTable } from '@/components/fleet/vehicles-table';
import { fleetService } from '@/services/fleet/fleet.service';
import type { FleetVehicle } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fleet – Vehicles</h1>
        <Link
          href="/fleet/add"
          className="flex items-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Status Cards */}
      <div className="mb-6">
        <VehicleStatusCards vehicles={allVehicles} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search vehicles or drivers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#71717A] focus:border-[#FACC15] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <VehiclesTable vehicles={vehicles} isLoading={isLoading} />

      {/* Pagination */}
      {totalVehicles > 0 && (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-4 py-4 mt-4 bg-[#111111] rounded-b-lg -mt-2">
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#6B7280]">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalVehicles)} of {totalVehicles} vehicles
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7280]">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="appearance-none rounded-md border border-[#3F3F46] bg-[#0A0A0A] py-1 pl-2 pr-6 text-xs text-white focus:border-[#FACC15] focus:outline-none"
              >
                <option value={20} className="bg-[#111111] text-white">20</option>
                <option value={50} className="bg-[#111111] text-white">50</option>
                <option value={100} className="bg-[#111111] text-white">100</option>
                <option value={200} className="bg-[#111111] text-white">200</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-[#6B7280] hover:text-white disabled:opacity-50 transition-colors"
            >
              &lt; Previous
            </button>
            <span className="text-xs text-[#6B7280]">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="text-xs text-[#6B7280] hover:text-white disabled:opacity-50 transition-colors"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
