'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { VehicleStatusCards } from '@/components/fleet/vehicle-status-cards';
import { VehiclesTable } from '@/components/fleet/vehicles-table';
import { fleetService } from '@/services/fleet/fleet.service';
import type { FleetVehicle } from '@/types';

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<FleetVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fleetService.getVehicles({ page, limit: 10, search: search || undefined });
      setVehicles(res.data);
      setTotalPages(res.totalPages);
      // Fetch all for status counts (no filter)
      if (!search) {
        setAllVehicles(res.data);
      }
    } catch {
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

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
            placeholder="Search drivers..."
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
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-1.5 text-sm text-[#A1A1AA] hover:bg-[#1A1A1A] disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === page
                  ? 'bg-[#FACC15] text-black font-medium'
                  : 'border border-[#3F3F46] bg-[#111111] text-[#A1A1AA] hover:bg-[#1A1A1A]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-1.5 text-sm text-[#A1A1AA] hover:bg-[#1A1A1A] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
