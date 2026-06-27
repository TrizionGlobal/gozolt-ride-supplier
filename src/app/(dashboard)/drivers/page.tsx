'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DriversTable } from '@/components/drivers/drivers-table';
import { driverService } from '@/services/drivers/driver.service';
import { useDebounce } from '@/hooks/use-debounce';
import type { Driver } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { ExportButton } from '@/components/ui/export-button';

const statusOptions = [
  { label: 'Status (All)', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Supplier Pending', value: 'NEW_DRIVER' },
  { label: 'Admin Pending', value: 'SUPPLIER_APPROVED' },
  { label: 'Needs Vehicle', value: 'ADMIN_APPROVED' },
  { label: 'Vehicle Assigned', value: 'VEHICLE_ASSIGNED' },
  { label: 'Suspended', value: 'SUSPENDED' },
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

  // Listen for real-time driver updates from the backend
  useFleetTracking({ onRefresh: fetchDrivers });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Drivers</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            filename="drivers-export"
            data={drivers.map((driver) => ({
              'Driver ID': driver.driverId,
              'Name': `${driver.firstName} ${driver.lastName}`,
              'Email': driver.email || 'N/A',
              'Phone': driver.phone,
              'Status': driver.status,
              'Rating': driver.avgRating,
              'Trips': driver.totalRides || 0,
              'Vehicle Assigned': vehicleMap[driver.id] || 'Not Assigned',
            }))}
          />
          <Link
            href="/drivers/add"
            className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Driver
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col gap-4 border-b border-[#27272A] sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-6 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 ${
                statusFilter === opt.value
                  ? 'border-[#FACC15] text-[#FACC15]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]'
              }`}
            >
              {opt.label === 'Status (All)' ? 'All Drivers' : opt.label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-sm pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <DriversTable 
        drivers={drivers} 
        vehicleMap={vehicleMap} 
        isLoading={isLoading} 
        page={page}
        limit={limit}
        total={totalDrivers}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onRefresh={fetchDrivers}
      />
    </div>
  );
}
