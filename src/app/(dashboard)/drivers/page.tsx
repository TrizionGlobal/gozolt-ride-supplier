'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { DriversTable } from '@/components/drivers/drivers-table';
import { driverService } from '@/services/drivers/driver.service';
import type { Driver } from '@/types';

const statusOptions = [
  { label: 'Status', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING_APPROVAL' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await driverService.getDrivers({
        page,
        limit: 10,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined,
      });
      setDrivers(res.data);
      setTotalPages(res.totalPages);
    } catch {
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    const fetchVehicleMap = async () => {
      try {
        const map = await driverService.getDriverVehicleMap();
        setVehicleMap(map);
      } catch {
        // ignore
      }
    };
    fetchVehicleMap();
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Drivers</h1>
        <Link
          href="/drivers/add"
          className="flex items-center gap-2 rounded-full bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
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
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-lg border border-[#3F3F46] bg-[#0A0A0A] py-2.5 pl-3 pr-9 text-sm text-white focus:border-[#FACC15] focus:outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
        </div>
      </div>

      {/* Table */}
      <DriversTable drivers={drivers} vehicleMap={vehicleMap} isLoading={isLoading} />

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
