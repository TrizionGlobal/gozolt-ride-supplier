'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';
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

export default function AirportTransfersHistoryPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
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

  const selectedBookingRef = useRef(selectedBooking);
  useEffect(() => {
    selectedBookingRef.current = selectedBooking;
  }, [selectedBooking]);

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

    socket.on('airport_transfer:cancelled', (data: any) => {
      fetchBookingsRef.current();
      if (
        selectedBookingRef.current &&
        (selectedBookingRef.current.id === data.bookingId ||
          selectedBookingRef.current.bookingReference === data.bookingReference)
      ) {
        setSelectedBooking((prev: any) =>
          prev
            ? {
                ...prev,
                status: 'CANCELLED',
                cancellationReason: data.reason || 'Cancelled by passenger',
              }
            : null
        );
      }
    });

    socket.on('airport_transfer:status:changed', (data: any) => {
      fetchBookingsRef.current();
      if (selectedBookingRef.current && selectedBookingRef.current.id === data.bookingId) {
        setSelectedBooking((prev: any) =>
          prev
            ? {
                ...prev,
                status: data.status !== undefined ? data.status : prev.status,
                returnStatus: data.returnStatus !== undefined ? data.returnStatus : prev.returnStatus,
              }
            : null
        );
      }
    });

    return () => {
      socket.off('supplier:refresh');
      socket.off('airport_transfer:cancelled');
      socket.off('airport_transfer:status:changed');
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, tripLeg?: 'OUTBOUND' | 'RETURN') => {
    try {
      await apiClient.put(`/airport-transfers/supplier/bookings/${id}/status`, { status: newStatus, tripLeg });
      const target = bookings.find((b: any) => b.id === id);
      const isRound = target?.transferType === 'ROUND_TRIP';
      const legName = tripLeg === 'RETURN' ? 'Return Trip' : isRound ? 'First Trip' : 'Transfer';
      toast.success(
        `Transfer (${legName}) status updated to ${newStatus.replace(/_/g, ' ')}`
      );
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev: any) => {
          if (!prev) return null;
          if (tripLeg === 'RETURN') {
            return { ...prev, returnStatus: newStatus };
          }
          return { ...prev, status: newStatus };
        });
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
          <h1 className="text-2xl font-bold text-white mb-2">Booking History</h1>
          <p className="text-sm text-[#A1A1AA]">
            View completed and cancelled airport transfer rides and past trip records.
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

      {/* Filter Tabs */}
      <div
        className="mb-6 flex space-x-1 rounded-xl bg-[#141414] p-1 border border-[#27272A] max-w-full overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {HISTORY_TABS.map((tab) => (
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
            onChange={(e) => setSearch(e.target.value)}
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
