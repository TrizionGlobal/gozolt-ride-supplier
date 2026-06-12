'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DriversTable } from '@/components/drivers/drivers-table';
import { driverService } from '@/services/drivers/driver.service';
import { useDebounce } from '@/hooks/use-debounce';
import type { Driver } from '@/types';

const statusOptions = [
  { label: 'Status (All)', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending Supplier Review', value: 'PENDING_SUPPLIER_REVIEW' },
  { label: 'Pending Admin Review', value: 'PENDING_ADMIN_APPROVAL' },
  { label: 'Needs Vehicle', value: 'PENDING_VEHICLE_ASSIGNMENT' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await driverService.getDrivers({
        page,
        limit,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
      });
      const data: any = res.data || [];
      setDrivers(Array.isArray(data) ? data : data.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalDrivers(res.total || 0);
    } catch {
      setDrivers([]);
      setTotalDrivers(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch]);

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
              <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
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
      {totalDrivers > 0 && (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-4 py-4 mt-4 bg-[#111111] rounded-b-lg -mt-2">
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#6B7280]">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalDrivers)} of {totalDrivers} drivers
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
                <option value={500} className="bg-[#111111] text-white">500</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 items-center rounded-md px-2 text-xs text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CA3AF]"
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              Previous
            </button>
            <span className="text-xs text-[#6B7280] px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="flex h-8 items-center rounded-md px-2 text-xs text-[#9CA3AF] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#9CA3AF]"
            >
              Next
              <ChevronRight className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
