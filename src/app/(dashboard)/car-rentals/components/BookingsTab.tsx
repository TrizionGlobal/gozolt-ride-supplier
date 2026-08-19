'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { useCarRentalsStore } from '@/stores/car-rentals.store';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { CarRentalBookingsTable } from './CarRentalBookingsTable';
import { useDebounce } from '@/hooks/use-debounce';
import { AssignWorkerModal } from '@/components/car-rentals/assign-worker-modal';
import { ExtensionRequestsTable } from './ExtensionRequestsTable';

const TABS = [
  { id: 'today', label: 'Today\'s Scheduled', statuses: ['CONFIRMED'], dateFilter: 'TODAY' },
  { id: 'pending', label: 'Pending Requests', statuses: ['PENDING_APPROVAL'], dateFilter: undefined },
  { id: 'on_rent', label: 'On Rent', statuses: ['ACTIVE'], dateFilter: undefined },
  { id: 'overdue', label: 'Overdue', statuses: ['ACTIVE'], dateFilter: 'OVERDUE' },
  { id: 'upcoming', label: 'Upcoming', statuses: ['CONFIRMED'], dateFilter: 'UPCOMING' },
  { id: 'extensions', label: 'Extension Requests', statuses: [], dateFilter: undefined },
] as { id: string; label: string; statuses: string[]; dateFilter?: 'TODAY' | 'UPCOMING' | 'OVERDUE' }[];

export function BookingsTab() {
  const { 
    managementBookings, 
    isManagementLoading, 
    managementTotal, 
    managementPage, 
    managementLimit, 
    managementSearch,
    managementTab,
    managementLastFetchedStr,
    setManagementBookings, 
    setManagementLoading, 
    setManagementFilters 
  } = useCarRentalsStore();

  const [search, setSearch] = useState(managementSearch);
  const debouncedSearch = useDebounce(search, 500);
  
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; bookingId: string | null; taskType: 'HANDOVER' | 'RETURN' | null }>({ isOpen: false, bookingId: null, taskType: null });

  // Update store only when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== managementSearch) {
      setManagementFilters(1, managementLimit, debouncedSearch, managementTab);
    }
  }, [debouncedSearch, managementSearch, managementLimit, managementTab, setManagementFilters]);

  const activeTabConfig = useMemo(() => TABS.find(t => t.id === managementTab) || TABS[0], [managementTab]);

  const fetchBookings = useCallback(async (force = false) => {
    const currentParamsStr = JSON.stringify({ page: managementPage, limit: managementLimit, search: managementSearch, tab: managementTab });
    
    if (!force && currentParamsStr === managementLastFetchedStr) {
      return;
    }

    setManagementLoading(true);
    try {
      const res = await carRentalsService.getBookings({ 
        page: managementPage, 
        limit: managementLimit, 
        search: managementSearch || undefined,
        statuses: activeTabConfig.statuses,
        dateFilter: activeTabConfig.dateFilter as any,
      });
      setManagementBookings(res.items || [], res.meta?.total || 0, currentParamsStr);
    } catch (e) {
      console.error(e);
      setManagementBookings([], 0, '');
    } finally {
      setManagementLoading(false);
    }
  }, [managementPage, managementLimit, managementSearch, activeTabConfig, managementTab, managementLastFetchedStr, setManagementLoading, setManagementBookings]);

  const [extensions, setExtensions] = useState<any[]>([]);
  const [isExtensionsLoading, setIsExtensionsLoading] = useState(false);
  const [extensionsTotal, setExtensionsTotal] = useState(0);

  const fetchExtensions = useCallback(async () => {
    setIsExtensionsLoading(true);
    try {
      const res = await carRentalsService.getExtensionRequests({ page: managementPage, limit: managementLimit });
      setExtensions(res.data || []);
      setExtensionsTotal(res.total || 0);
    } catch (e) {
      console.error(e);
      setExtensions([]);
    } finally {
      setIsExtensionsLoading(false);
    }
  }, [managementPage, managementLimit]);

  useEffect(() => {
    if (managementTab === 'extensions') {
      fetchExtensions();
    } else {
      fetchBookings(false);
    }
  }, [fetchBookings, fetchExtensions, managementTab]);

  const handleApproveExtension = async (id: string) => {
    try {
      await carRentalsService.approveExtensionRequest(id);
      toast.success('Extension approved');
      fetchExtensions();
    } catch (e) {
      toast.error('Failed to approve extension');
    }
  };

  const handleRejectExtension = async (id: string) => {
    try {
      await carRentalsService.rejectExtensionRequest(id);
      toast.success('Extension rejected');
      fetchExtensions();
    } catch (e) {
      toast.error('Failed to reject extension');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await carRentalsService.updateBookingStatus(id, status);
      fetchBookings(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex space-x-1 rounded-xl bg-[#141414] p-1 border border-[#27272A] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setManagementFilters(1, managementLimit, managementSearch, tab.id);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              managementTab === tab.id
                ? 'bg-[#27272A] text-white shadow'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" />
          <input
            type="text"
            placeholder={`Search ${activeTabConfig.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15]"
          />
        </div>
      </div>

      {/* Table */}
      {managementTab === 'extensions' ? (
        <ExtensionRequestsTable
          requests={extensions}
          isLoading={isExtensionsLoading}
          page={managementPage}
          limit={managementLimit}
          total={extensionsTotal}
          onPageChange={(p) => setManagementFilters(p, managementLimit, managementSearch, managementTab)}
          onLimitChange={(l) => setManagementFilters(1, l, managementSearch, managementTab)}
          onApprove={handleApproveExtension}
          onReject={handleRejectExtension}
        />
      ) : (
        <CarRentalBookingsTable 
          bookings={managementBookings}
          isLoading={isManagementLoading}
          page={managementPage}
          limit={managementLimit}
          total={managementTotal}
          onPageChange={(p) => setManagementFilters(p, managementLimit, managementSearch, managementTab)}
          onLimitChange={(l) => setManagementFilters(1, l, managementSearch, managementTab)}
          onAccept={(id) => handleUpdateStatus(id, 'CONFIRMED')}
          onReject={(id) => handleUpdateStatus(id, 'CANCELLED')}
          onAssignWorker={(id, taskType) => setAssignModal({ isOpen: true, bookingId: id, taskType })}
        />
      )}

      {assignModal.isOpen && assignModal.bookingId && assignModal.taskType && (
        <AssignWorkerModal
          bookingId={assignModal.bookingId}
          taskType={assignModal.taskType}
          onClose={() => setAssignModal({ isOpen: false, bookingId: null, taskType: null })}
          onAssigned={() => {
            setAssignModal({ isOpen: false, bookingId: null, taskType: null });
            fetchBookings(true);
          }}
        />
      )}
    </div>
  );
}
