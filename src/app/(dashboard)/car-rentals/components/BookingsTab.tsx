'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { useCarRentalsStore } from '@/stores/car-rentals.store';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { CarRentalBookingsTable } from './CarRentalBookingsTable';
import { useDebounce } from '@/hooks/use-debounce';
import { AssignWorkerModal } from '@/components/car-rentals/assign-worker-modal';
import Swal from 'sweetalert2';
import { ExtensionRequestsTable } from './ExtensionRequestsTable';

const TABS = [
  { id: 'today', label: 'Today\'s Scheduled', statuses: ['CONFIRMED'], dateFilter: 'TODAY' },
  { id: 'pending', label: 'Pending Requests', statuses: ['PENDING_APPROVAL'], dateFilter: undefined },
  { id: 'confirmed', label: 'Confirmed', statuses: ['CONFIRMED'], dateFilter: undefined },
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
  const [extensionsStatus, setExtensionsStatus] = useState<string>('ALL');

  const fetchExtensions = useCallback(async () => {
    setIsExtensionsLoading(true);
    try {
      const res = await carRentalsService.getExtensionRequests({ 
        page: managementPage, 
        limit: managementLimit, 
        search: managementSearch || undefined,
        status: extensionsStatus !== 'ALL' ? extensionsStatus : undefined
      });
      setExtensions(res.data || []);
      setExtensionsTotal(res.total || 0);
    } catch (e) {
      console.error(e);
      setExtensions([]);
    } finally {
      setIsExtensionsLoading(false);
    }
  }, [managementPage, managementLimit, managementSearch, extensionsStatus]);

  useEffect(() => {
    if (managementTab === 'extensions') {
      fetchExtensions();
    } else {
      fetchBookings(false);
    }
  }, [fetchBookings, fetchExtensions, managementTab]);

  const handleApproveExtension = async (id: string) => {
    const result = await Swal.fire({
      title: 'Approve Extension?',
      text: 'Are you sure you want to approve this extension request?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#3F3F46',
      background: '#111111',
      color: '#ffffff',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await carRentalsService.approveExtensionRequest(id);
          return true;
        } catch (e: any) {
          Swal.showValidationMessage(e.message || 'Failed to approve extension');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      toast.success('Extension approved successfully');
      fetchExtensions();
    }
  };

  const handleRejectExtension = async (id: string) => {
    const result = await Swal.fire({
      title: 'Reject Extension?',
      text: 'Are you sure you want to reject this extension request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#3F3F46',
      background: '#111111',
      color: '#ffffff',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await carRentalsService.rejectExtensionRequest(id);
          return true;
        } catch (e: any) {
          Swal.showValidationMessage(e.message || 'Failed to reject extension');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      toast.success('Extension rejected successfully');
      fetchExtensions();
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
      <div className="mb-6 flex space-x-1 rounded-xl bg-[#141414] p-1 border border-[#27272A] max-w-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setManagementFilters(1, managementLimit, managementSearch, tab.id);
            }}
            className={`whitespace-nowrap flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              managementTab === tab.id
                ? 'bg-[#27272A] text-white shadow'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
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
        
        {managementTab === 'extensions' && (
          <select
            value={extensionsStatus}
            onChange={(e) => {
              setExtensionsStatus(e.target.value);
            }}
            className="rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 px-3 text-sm text-white outline-none focus:border-[#FACC15] w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}
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
