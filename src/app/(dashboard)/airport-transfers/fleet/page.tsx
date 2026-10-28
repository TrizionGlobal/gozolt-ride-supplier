'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { ExportButton } from '@/components/ui/export-button';
import { useDebounce } from '@/hooks/use-debounce';
import {
  airportTransfersService,
  AirportTransferVehicle,
} from '@/services/airport-transfers/airport-transfers.service';
import { useAirportTransfersStore } from '@/stores/airport-transfers.store';
import { AirportTransfersTable } from '../components/AirportTransfersTable';

export default function AirportTransfersFleetPage() {
  const {
    fleetVehicles,
    fleetTotal,
    fleetPage,
    fleetLimit,
    fleetSearch,
    setFleetCache,
  } = useAirportTransfersStore();

  const [vehicles, setVehicles] = useState<AirportTransferVehicle[]>(fleetVehicles);
  const [isLoading, setIsLoading] = useState(fleetVehicles.length === 0);
  const [search, setSearch] = useState(fleetSearch || '');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(fleetPage || 1);
  const [limit, setLimit] = useState(fleetLimit || 20);
  const [totalVehicles, setTotalVehicles] = useState(fleetTotal || 0);

  const fetchVehicles = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        fleetVehicles.length > 0 &&
        fleetPage === page &&
        fleetLimit === limit &&
        fleetSearch === debouncedSearch
      ) {
        return;
      }
      setIsLoading(true);
      try {
        const res = await airportTransfersService.getVehicles({
          page,
          limit,
          search: debouncedSearch || undefined,
        });
        const items = res.items || [];
        const total = res.total || 0;
        setVehicles(items);
        setTotalVehicles(total);
        setFleetCache(items, total, page, limit, debouncedSearch);
      } catch (e) {
        console.error('Failed to load fleet vehicles:', e);
        setVehicles([]);
        setTotalVehicles(0);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, debouncedSearch]
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div>
      {/* Header with Title and Actions matching Car Rentals */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Transfer Fleet Management</h1>
        <div className="flex items-center gap-3">
          <ExportButton
            filename="airport-transfers-export"
            data={vehicles.map((v) => ({
              Vehicle: `${v.make ? v.make + ' ' : ''}${v.model}`,
              'Reg & Year': `${v.registrationNo} (${v.year || '-'})`,
              Category: v.vehicleType?.replace(/_/g, ' '),
              'Rate Per KM': `€${Number(v.pricePerKm || 2.50).toFixed(2)}/km`,
              Capacity: `${v.passengerCapacity} Passengers, ${v.luggageCapacity} Bags`,
              'Meet & Greet': v.isMeetAndGreetIncluded ? 'Included' : 'No',
              'Free Waiting': `${v.freeWaitingMinutes || 60} mins`,
              Status: v.status,
            }))}
          />
          <Link
            href="/airport-transfers/new"
            className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Transfer Vehicle
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search transfer vehicles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
          />
        </div>
      </div>

      {/* Server-Side Table */}
      <AirportTransfersTable
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
