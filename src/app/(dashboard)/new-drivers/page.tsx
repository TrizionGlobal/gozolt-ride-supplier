'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, CheckCircle, User, Eye, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { Driver } from '@/types';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { useDebounce } from '@/hooks/use-debounce';

export default function NewDriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalDrivers, setTotalDrivers] = useState(0);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await driverService.getDriverPool({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setDrivers(res.data || []);
      setTotalDrivers(res.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load new drivers pool');
      setDrivers([]);
      setTotalDrivers(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleClaim = async (driverId: string) => {
    setClaimingId(driverId);
    try {
      await driverService.claimDriver(driverId);
      toast.success('Driver claimed successfully!');
      fetchDrivers(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to claim driver');
    } finally {
      setClaimingId(null);
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'driver',
      title: 'Driver',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3F3F46] bg-[#27272A]">
            {row.avatarUrl ? (
              <img src={row.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-[#A1A1AA]" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{row.firstName} {row.lastName}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (row) => (
        <div className="flex flex-col gap-1 text-xs text-[#A1A1AA]">
          {row.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {row.email}
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'registeredDate',
      title: 'Registered Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-[#A1A1AA]">
          <Clock className="h-3.5 w-3.5" />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      title: <div className="text-center">Actions</div>,
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/new-drivers/${row.id}`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3F3F46] bg-transparent px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#27272A]"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClaim(row.id);
            }}
            disabled={claimingId === row.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50"
          >
            {claimingId === row.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Claim Driver
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Find New Drivers</h1>
      </div>

      <p className="mb-6 text-[#A1A1AA]">
        These drivers have registered on the Gozolt Driver app but have not yet been claimed by a supplier. You can claim them to add them to your fleet.
      </p>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search unassigned drivers by name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
            className="w-full rounded-lg border border-[#3F3F46] bg-[#18181B] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#A1A1AA] transition-colors focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#27272A] bg-[#0A0A0A] overflow-hidden">
        <ServerSideTable
          columns={columns}
          data={drivers}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={totalDrivers}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          emptyText={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="mb-1 text-lg font-medium text-white">No Drivers Available</h3>
              <p className="text-[#A1A1AA]">There are currently no unassigned drivers in the pool.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
