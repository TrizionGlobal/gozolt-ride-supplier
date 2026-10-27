'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, RefreshCw, Filter, Plane, Clock, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import { AirportTransferBookingsTable } from '../components/AirportTransferBookingsTable';
import { TransferBookingDetailsModal } from '../components/TransferBookingDetailsModal';
import { AssignTransferWorkerModal } from '@/components/airport-transfers/assign-transfer-worker-modal';

const TABS = [
  {
    id: 'all',
    label: 'All Active Transfers',
    statuses: [],
  },
  {
    id: 'pending',
    label: 'Pending Requests',
    statuses: ['PENDING_APPROVAL', 'PENDING_PAYMENT'],
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    statuses: ['CONFIRMED', 'DRIVER_ASSIGNED'],
  },
  {
    id: 'en_route_pickup',
    label: 'En Route & At Pickup',
    statuses: ['EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_AIRPORT'],
  },
  {
    id: 'in_transit',
    label: 'In Transit to Drop-off',
    statuses: ['PASSENGER_MET', 'IN_TRANSIT'],
  },
] as {
  id: string;
  label: string;
  statuses: string[];
}[];

function AirportTransfersBookingsContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const urlSearch = searchParams.get('search') || searchParams.get('ref') || '';
  const urlAssignId = searchParams.get('assign') || searchParams.get('bookingId');

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (urlTab && TABS.some((t) => t.id === urlTab)) return urlTab;
    return 'all'; // Default to All Active Transfers so no blank page
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
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    bookingRef?: string;
    tripLeg?: 'OUTBOUND' | 'RETURN';
    isRoundTrip?: boolean;
  } | null>(null);

  const hasOpenedInitialAssign = useRef(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Sync state if URL query params change dynamically
  useEffect(() => {
    const s = searchParams.get('search') || searchParams.get('ref');
    if (s !== null && s !== search) {
      setSearch(s);
      if (s.trim()) {
        setActiveTab('all');
      }
    }
    const t = searchParams.get('tab');
    if (t && TABS.some((tab) => tab.id === t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const activeTabConfig = useMemo(
    () => TABS.find((t) => t.id === activeTab) || TABS[0],
    [activeTab]
  );

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      const hasSearch = Boolean(debouncedSearch && debouncedSearch.trim());

      if (hasSearch) {
        params.search = debouncedSearch.trim();
        // If user is searching on 'all' tab, do not restrict to single sub-status
        // so the search term will immediately find the requested booking
        if (activeTab !== 'all' && activeTabConfig.statuses?.length > 0) {
          params.statuses = activeTabConfig.statuses.join(',');
        }
      } else {
        // Tab-based status filtering: only filter by specific sub-statuses on sub-tabs.
        // On 'all' active tab, backend will automatically return all non-completed, non-cancelled transfers.
        if (activeTab !== 'all' && activeTabConfig.statuses?.length > 0) {
          params.statuses = activeTabConfig.statuses.join(',');
        }
      }

      const res = await apiClient.get('/airport-transfers/supplier/bookings', { params });
      const items = res.data.items || [];
      setBookings(items);
      setTotal(res.data.total || items.length);

      // If URL has assign parameter, automatically trigger the assignment modal for that booking
      if (urlAssignId && !hasOpenedInitialAssign.current && items.length > 0) {
        const found = items.find(
          (b: any) => b.id === urlAssignId || b.bookingReference === urlAssignId
        );
        // Only open assign modal if booking is confirmed (not pending approval)
        if (found && found.status !== 'PENDING_APPROVAL' && found.status !== 'PENDING') {
          hasOpenedInitialAssign.current = true;
          setAssignModal({
            isOpen: true,
            bookingId: found.id,
            bookingRef: found.bookingReference,
            tripLeg: 'OUTBOUND',
            isRoundTrip: found.transferType === 'ROUND_TRIP' || Boolean(found.returnDateTime),
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch airport transfer bookings:', err);
      toast.error('Failed to load transfer bookings');
      setBookings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, activeTabConfig, activeTab, urlAssignId]);

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

  // Real-time WebSocket listener for immediate updates on booking cancellation and status changes
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
      toast.success(`Transfer (${legName}) status updated to ${newStatus.replace(/_/g, ' ')}`);
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

  const handleSelfAssign = async (id: string, tripLeg: 'OUTBOUND' | 'RETURN' = 'OUTBOUND') => {
    const targetBooking = bookings.find((b: any) => b.id === id);
    if (targetBooking?.status === 'PENDING_APPROVAL' || targetBooking?.status === 'PENDING') {
      toast.error('Please accept and confirm the transfer request first before self-assigning.');
      return;
    }
    try {
      await apiClient.post(`/airport-transfers/supplier/bookings/${id}/self-assign`, {
        magicLinkBaseUrl: window.location.origin,
        tripLeg,
      });
      const isRound = targetBooking?.transferType === 'ROUND_TRIP';
      const label = !isRound ? 'One-Way Trip' : tripLeg === 'RETURN' ? 'Return Trip' : 'First Trip';
      toast.success(`Transfer (${label}) self-assigned! Magic link emailed to your supplier address.`);
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to self-assign transfer');
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
            <Plane className="h-6 w-6 text-[#FACC15]" />
            Transfer Bookings
          </h1>
          <p className="text-sm text-[#A1A1AA]">
            Manage driver pickup and drop-off transfers for one-way and round-trip airport bookings.
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
        {TABS.map((tab) => {
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

      {/* Search Bar & Active Filter Info */}
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
        activeTab={activeTab}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onViewDetails={handleViewDetails}
        onUpdateStatus={handleUpdateStatus}
        onAssignWorker={(bookingId, bookingRef, _mode, tripLeg, booking) => {
          if (booking?.status === 'PENDING_APPROVAL' || booking?.status === 'PENDING') {
            toast.error('Please accept and confirm the transfer request first before assigning a driver.');
            return;
          }
          setAssignModal({
            isOpen: true,
            bookingId,
            bookingRef,
            tripLeg: tripLeg || 'OUTBOUND',
            isRoundTrip: booking?.transferType === 'ROUND_TRIP' || Boolean(booking?.returnDateTime),
          });
        }}
        onSelfAssign={handleSelfAssign}
      />

      {/* Details Modal */}
      <TransferBookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onStatusUpdate={handleUpdateStatus}
      />

      {/* Assign Worker Modal */}
      {assignModal?.isOpen && (
        <AssignTransferWorkerModal
          bookingId={assignModal.bookingId}
          bookingRef={assignModal.bookingRef}
          tripLeg={assignModal.tripLeg}
          isRoundTrip={assignModal.isRoundTrip}
          onClose={() => setAssignModal(null)}
          onAssigned={() => {
            fetchBookings();
            setAssignModal(null);
            toast.success('Assignment email sent!');
          }}
        />
      )}
    </div>
  );
}

export default function AirportTransfersBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#FACC15] mb-2" />
          Loading transfer bookings...
        </div>
      }
    >
      <AirportTransfersBookingsContent />
    </Suspense>
  );
}
