'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { bikeRentalsService, BikeRentalBike } from '@/services/bike-rentals/bike-rentals.service';
import { ExportButton } from '@/components/ui/export-button';
import { useDebounce } from '@/hooks/use-debounce';
import { useBikeRentalsStore } from '@/stores/bike-rentals.store';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BikeRentalsTable } from './BikeRentalsTable';

const MySwal = withReactContent(Swal);

export function BikesTab() {
  const {
    fleetVehicles,
    fleetTotal,
    fleetPage,
    fleetLimit,
    fleetSearch,
    setFleetCache,
  } = useBikeRentalsStore();

  const [bikes, setBikes] = useState<BikeRentalBike[]>(fleetVehicles);
  const [isLoading, setIsLoading] = useState(fleetVehicles.length === 0);
  const [search, setSearch] = useState(fleetSearch || '');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(fleetPage || 1);
  const [limit, setLimit] = useState(fleetLimit || 20);
  const [totalBikes, setTotalBikes] = useState(fleetTotal || 0);
  const [actionsContainer, setActionsContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setActionsContainer(document.getElementById('bike-rentals-actions'));
  }, []);

  const fetchBikes = useCallback(async (forceRefresh = false) => {
    // Skip fetch if we already have cached data for the same filters
    if (!forceRefresh && fleetVehicles.length > 0 && fleetPage === page && fleetLimit === limit && fleetSearch === debouncedSearch) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await bikeRentalsService.getBikes({ page, limit, search: debouncedSearch || undefined });
      setBikes(res.data);
      setTotalBikes(res.total || 0);
      setFleetCache(res.data, res.total || 0, page, limit, debouncedSearch);
    } catch (e) {
      console.error(e);
      setBikes([]);
      setTotalBikes(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    try {
      await bikeRentalsService.updateBikeStatus(id, newStatus);
      fetchBikes(true);
      toast.success(`Bike successfully marked as ${newStatus.toLowerCase()}`);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to update bike status');
    }
  };

  return (
    <div>
      {/* Header Actions Portal */}
      {actionsContainer && createPortal(
        <div className="flex items-center gap-3">
          <ExportButton
            filename="bike-rentals-export"
            data={bikes.map((v) => ({
              'Bike': v.name,
              'Category': v.category.replace('_', ' '),
              'Base Price': `€${v.pricePerDay}/day`,
              'Packages': v.protectionPackages?.length || 0,
            }))}
          />
          <Link
            href="/bike-rentals/new"
            className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Bike Rental
          </Link>
        </div>,
        actionsContainer
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search bike rentals..."
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
      <BikeRentalsTable
        bikes={bikes}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={totalBikes}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
