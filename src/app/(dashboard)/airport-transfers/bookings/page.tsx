'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import { AirportTransferBookingsTable } from '../components/AirportTransferBookingsTable';
import { TransferBookingDetailsModal } from '../components/TransferBookingDetailsModal';

const TABS = [
  { id: 'today', label: "Today's Transfers", statuses: ['CONFIRMED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_AIRPORT', 'PASSENGER_MET', 'IN_TRANSIT'], dateFilter: 'TODAY' },
  { id: 'pending', label: 'Pending Requests', statuses: ['PENDING_APPROVAL'], dateFilter: undefined },
  { id: 'confirmed', label: 'Confirmed', statuses: ['CONFIRMED'], dateFilter: undefined },
  { id: 'en_route_pickup', label: 'En Route & At Pickup', statuses: ['EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_AIRPORT'], dateFilter: undefined },
  { id: 'in_transit', label: 'In Transit to Drop-off', statuses: ['PASSENGER_MET', 'IN_TRANSIT'], dateFilter: undefined },
  { id: 'completed', label: 'Completed Drop-offs', statuses: ['COMPLETED'], dateFilter: undefined },
  { id: 'all', label: 'All Transfers', statuses: [], dateFilter: undefined },
] as { id: string; label: string; statuses: string[]; dateFilter?: 'TODAY' | 'UPCOMING' | 'OVERDUE' }[];

export default function AirportTransfersBookingsPage() {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const activeTabConfig = useMemo(() => TABS.find((t) => t.id === activeTab) || TABS[0], [activeTab]);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (activeTabConfig.statuses && activeTabConfig.statuses.length > 0) {
        params.statuses = activeTabConfig.statuses.join(',');
      }

      if (activeTabConfig.dateFilter) {
        params.dateFilter = activeTabConfig.dateFilter;
      }

      const res = await apiClient.get('/airport-transfers/supplier/bookings', { params });
      setBookings(res.data.items || []);
      setTotal(res.data.total || (res.data.items ? res.data.items.length : 0));
    } catch (err) {
      console.error('Failed to fetch airport transfer bookings:', err);
      toast.error('Failed to load transfer bookings');
      setBookings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, activeTabConfig]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/airport-transfers/supplier/bookings/${id}/status`, { status: newStatus });
      toast.success(`Transfer status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev: any) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Transfer Bookings</h1>
          <p className="text-sm text-[#A1A1AA]">
            Manage chauffeured pickup and drop-off transfers for one-way and round-trip bookings.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-gray-300 text-xs hover:text-white hover:bg-[#27272A] transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex space-x-1 rounded-xl bg-[#141414] p-1 border border-[#27272A] max-w-full overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`whitespace-nowrap flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#27272A] text-white shadow'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search by reference, passenger, pickup/drop-off, flight..."
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
      <AirportTransferBookingsTable
        bookings={bookings}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onViewDetails={handleViewDetails}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Details Modal */}
      <TransferBookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusUpdate={handleUpdateStatus}
      />
    </div>
  );
}
