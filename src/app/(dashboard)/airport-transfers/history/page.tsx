'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, RefreshCw, History as HistoryIcon } from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import { AirportTransferBookingsTable } from '../components/AirportTransferBookingsTable';
import { TransferBookingDetailsModal } from '../components/TransferBookingDetailsModal';

const HISTORY_TABS = [
  { id: 'all', label: 'All History', historyFilter: 'ALL' },
  { id: 'completed', label: 'Completed Rides', historyFilter: 'COMPLETED' },
  { id: 'cancelled', label: 'Cancelled Rides', historyFilter: 'CANCELLED' },
] as const;

function AirportTransfersHistoryContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlSearch = searchParams.get('search') || searchParams.get('ref') || '';

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (urlTab && HISTORY_TABS.some((t) => t.id === urlTab)) return urlTab;
    return 'all';
  });

  const [search, setSearch] = useState<string>(urlSearch);
  const debouncedSearch = useDebounce(search, 400);

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const s = searchParams.get('search') || searchParams.get('ref');
    if (s !== null && s !== search) {
      setSearch(s);
    }
    const t = searchParams.get('tab');
    if (t && HISTORY_TABS.some((tab) => tab.id === t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const activeTabConfig = useMemo(
    () => HISTORY_TABS.find((t) => t.id === activeTab) || HISTORY_TABS[0],
    [activeTab]
  );

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
        historyFilter: activeTabConfig.historyFilter,
        sortBy: 'pickupDateTime',
        order: 'desc',
      };

      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await apiClient.get('/airport-transfers/supplier/bookings', { params });
      setBookings(res.data.items || []);
      setTotal(res.data.total || (res.data.items ? res.data.items.length : 0));
    } catch (err) {
      console.error('Failed to fetch airport transfer booking history:', err);
      toast.error('Failed to load transfer history');
      setBookings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, activeTabConfig]);

  const fetchBookingsRef = useRef(fetchBookings);
  useEffect(() => {
    fetchBookingsRef.current = fetchBookings;
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Real-time WebSocket listener
  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('supplier_token') || sessionStorage.getItem('supplier_token')
        : null;
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const baseUrl = API_URL.replace(/\/v1$/, '');
    const socket: Socket = io(`${baseUrl}/supplier`, {
      path: '/socket.io/',
      transports: ['websocket'],
      auth: { token },
    });

    socket.on('supplier:refresh', () => {
      fetchBookingsRef.current();
    });

    socket.on('airport_transfer:status:changed', () => {
      fetchBookingsRef.current();
    });

    return () => {
      socket.off('supplier:refresh');
      socket.off('airport_transfer:status:changed');
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, tripLeg?: 'OUTBOUND' | 'RETURN') => {
    try {
      await apiClient.put(`/airport-transfers/supplier/bookings/${id}/status`, { status: newStatus, tripLeg });
      toast.success(`Booking status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchBookings();
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2.5">
            <HistoryIcon className="h-6 w-6 text-[#FACC15]" />
            Transfer Booking History
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Archive of completed rides, passenger handover logs, and cancelled airport transfers.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-gray-300 text-xs hover:text-white hover:bg-[#27272A] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#FACC15]' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div
        className="mb-5 flex space-x-1.5 rounded-xl bg-[#141414] p-1.5 border border-[#27272A] max-w-full overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {HISTORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`whitespace-nowrap flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#27272A] text-white shadow-sm border border-white/10'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search by reference, passenger, pickup/drop-off, flight..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-xs text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
          />
        </div>

        {search.trim() && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-400 hover:text-white underline self-start sm:self-auto"
          >
            Clear Search
          </button>
        )}
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

export default function AirportTransfersHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#FACC15] mb-2" />
          Loading transfer history...
        </div>
      }
    >
      <AirportTransfersHistoryContent />
    </Suspense>
  );
}
