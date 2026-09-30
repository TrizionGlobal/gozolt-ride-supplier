'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  Filter,
  MoreVertical,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AssignWorkerModal } from '@/components/quick-services/assign-worker-modal';

import { getSupplierQuickServiceBySlug } from '@/lib/supplier-quick-services';
import { useSupplierQuickServiceBookings } from '@/hooks/use-supplier-quick-service-bookings';
import { useDebounce } from '@/hooks/use-debounce';

import {
  QuickServiceAssignmentFilter,
  QuickServiceBooking,
  QuickServiceBookingStatus,
} from '@/services/quick-services/quick-service-booking.types';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { QUICK_SERVICES_CATALOG } from '@/lib/quick-services-catalog';
import { useAuthStore } from '@/stores/auth.store';

export default function ServiceBookingManagementPage() {
  const params = useParams<{ service: string }>();
  const router = useRouter();

  const service = getSupplierQuickServiceBySlug(
    params.service
  );

  const { user } = useAuthStore();
  let userChildServices: string[] = [];
  try {
    const parsed = typeof user?.quickServicesOffered === 'string' 
      ? JSON.parse(user.quickServicesOffered) 
      : user?.quickServicesOffered;
      
    if (Array.isArray(parsed)) {
      parsed.forEach((s: any) => {
        if (s.category === service?.id) {
          userChildServices = s.services || [];
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
  
  const catalogEntry = QUICK_SERVICES_CATALOG.find((c) => c.id === service?.id);
  const childNames = userChildServices.map((cid) => {
    const child = catalogEntry?.children?.find((c) => c.id === cid);
    return child ? child.name : cid;
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [childService, setChildService] =
    useState('');

  const [status, setStatus] =
    useState<QuickServiceBookingStatus | ''>('');

  const [assignment, setAssignment] =
    useState<QuickServiceAssignmentFilter>('ALL');

  const [selectedBooking, setSelectedBooking] =
    useState<QuickServiceBooking | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      categoryId: service?.id,
      childService: childService || undefined,
      status,
      assignment,
      page,
      limit,
    }),
    [
      debouncedSearch,
      service?.id,
      childService,
      status,
      assignment,
      page,
    ]
  );

  const {
    bookings,
    total,
    isLoading,
    error,
    refresh,
  } = useSupplierQuickServiceBookings(filters);

  const totalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  if (!service) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-bold text-white">
          Quick Service not found
        </h1>

        <Link
          href="/quick-services/booking-management"
          className="mt-4 inline-flex text-sm font-medium text-[#FCD223]"
        >
          Return to Booking Management
        </Link>
      </div>
    );
  }

  const clearFilters = () => {
    setSearch('');
    setChildService('');
    setStatus('');
    setAssignment('ALL');
    setPage(1);
  };

  const columns: ColumnDef<QuickServiceBooking>[] = [
    {
      key: 'customer',
      title: 'Customer',
      render: (row) => (
        <div className="flex items-start gap-2">
          <UserRound className="mt-0.5 h-4 w-4 text-[#71717A]" />
          <div>
            <p className="text-white">
              {row.customer?.name || row.userName || (row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Unknown')}
            </p>
            <p className="text-xs text-[#71717A]">
              {row.customer?.mobile || row.userPhone || row.user?.phone || 'N/A'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      title: 'Service',
      render: (row) => (
        <div>
          <p className="text-white text-sm">{row.serviceCategory || row.categoryName || 'Quick Service'}</p>
          <p className="text-xs text-[#FCD223]">{row.serviceTitle || row.childService || 'General'}</p>
        </div>
      ),
    },
    {
      key: 'schedule',
      title: 'Schedule',
      render: (row) => (
        <span className="flex items-start gap-2 text-sm text-[#D4D4D8]">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD223]" />
          {formatDateTime(row.scheduledAt)}
        </span>
      ),
    },
    {
      key: 'location',
      title: 'Location',
      render: (row) => (
        <span className="flex max-w-[220px] items-start gap-2 text-sm text-[#D4D4D8]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD223]" />
          {row.serviceAddress}
        </span>
      ),
    },
    {
      key: 'worker',
      title: 'Worker',
      render: (row) => (
        <span className="text-sm text-[#D4D4D8]">
          {row.assignedToSelf ? 'Assigned to me' : row.worker?.name ?? 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-center',
      render: (row) => {
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1 transition-colors outline-none">
                Options <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-[#111111] border-[#27272A] text-white">
                <DropdownMenuItem 
                  onClick={() => router.push(`/quick-services/booking-management/${params.service}/${row.id || (row as any)._id}`)}
                  className="cursor-pointer focus:bg-[#27272A] focus:text-white"
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedBookingId(row.id || (row as any)._id);
                    setIsAssignModalOpen(true);
                  }}
                  className="cursor-pointer focus:bg-[#27272A] focus:text-white"
                >
                  Assign to Worker
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-[#27272A] focus:text-white text-[#FACC15]"
                >
                  Start Work
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            href="/quick-services/booking-management"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FCD223] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">
            {service.name} Bookings
          </h1>

          <p className="text-sm text-[#A1A1AA]">
            Manage all your {service.name.toLowerCase()} requests and assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isLoading ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      {/* Filters */}
<div className="rounded-xl border border-[#27272A] bg-[#111111] p-4">
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.4fr)_minmax(190px,1fr)_minmax(160px,0.8fr)_minmax(180px,0.9fr)_44px]">
    {/* Search */}
    <div className="flex min-w-0">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />

        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2 pl-10 pr-3 text-sm text-white placeholder-[#71717A] outline-none focus:border-[#FCD223]"
        />
      </div>
    </div>

    {/* Child service */}
    <select
      value={childService}
      onChange={(event) => {
        setChildService(event.target.value);
        setPage(1);
      }}
      className="h-10 min-w-0 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 text-sm text-white outline-none focus:border-[#FCD223]"
    >
      <option value="">
        All {service.name} services
      </option>

      {childNames.map((child) => (
        <option key={child} value={child}>
          {child}
        </option>
      ))}
    </select>

    {/* Status */}
    <select
      value={status}
      onChange={(event) => {
        setStatus(
          event.target
            .value as QuickServiceBookingStatus | ''
        );
        setPage(1);
      }}
      className="h-10 min-w-0 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 text-sm text-white outline-none focus:border-[#FCD223]"
    >
      <option value="">All statuses</option>
      <option value="PENDING">Pending</option>
      <option value="CONFIRMED">Confirmed</option>
      <option value="TO_ASSIGN">To Assign</option>
      <option value="ASSIGNED">Assigned</option>
      <option value="IN_PROGRESS">
        In Progress
      </option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
      <option value="REJECTED">Rejected</option>
    </select>

    {/* Assignment */}
    <select
      value={assignment}
      onChange={(event) => {
        setAssignment(
          event.target
            .value as QuickServiceAssignmentFilter
        );
        setPage(1);
      }}
      className="h-10 min-w-0 rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3 text-sm text-white outline-none focus:border-[#FCD223]"
    >
      <option value="ALL">
        All assignments
      </option>

      <option value="UNASSIGNED">
        Unassigned
      </option>

      <option value="ASSIGNED_TO_ME">
        Assigned to Me
      </option>

      <option value="WORKER_ASSIGNED">
        Worker Assigned
      </option>
    </select>

    {/* Clear filters icon */}
    <button
      type="button"
      onClick={clearFilters}
      title="Clear filters"
      aria-label="Clear filters"
      className="flex h-10 w-11 items-center justify-center rounded-lg border border-[#27272A] bg-[#0A0A0A] text-[#A1A1AA] transition-colors hover:border-[#FCD223] hover:bg-[#FCD223]/10 hover:text-[#FCD223]"
    >
      <Filter className="h-5 w-5" />
    </button>
  </div>
</div>

   
      {/* Yellow API error */}
      {error && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-400">
            Booking information could not be loaded.
          </p>

          <p className="mt-1 text-xs text-[#D4D4D8]">
            Confirm that the supplier backend supports
            categoryId, childService, status and
            assignment filters.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#27272A] bg-[#111111]">
        <div className="flex items-center justify-between border-b border-[#27272A] p-5">
          <div>
            <h2 className="font-semibold text-white">
              {service.name} Bookings
            </h2>

            <p className="mt-1 text-xs text-[#71717A]">
              {total} bookings found
            </p>
          </div>

          <ClipboardList className="h-5 w-5 text-[#FCD223]" />
        </div>

        <ServerSideTable<QuickServiceBooking>
          columns={columns}
          data={bookings}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={() => {}}
          rowKey="id"
          emptyText={
            <div className="flex flex-col items-center justify-center py-10">
              <ClipboardList className="h-10 w-10 text-[#52525B]" />
              <p className="mt-3 text-sm font-medium text-white">No bookings found</p>
              <p className="mt-1 text-xs text-[#71717A]">{service.name} bookings will appear here.</p>
            </div>
          }
        />
      </div>

      {isAssignModalOpen && selectedBookingId && (
        <AssignWorkerModal
          bookingId={selectedBookingId}
          onClose={() => setIsAssignModalOpen(false)}
          onAssigned={() => {
            setIsAssignModalOpen(false);
            // the page will reload or you could refetch if using a context
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}



function StatusBadge({
  status,
}: {
  status: QuickServiceBookingStatus;
}) {
  const styles: Record<
    QuickServiceBookingStatus,
    string
  > = {
    PENDING:
      'border-amber-500/30 bg-amber-500/10 text-amber-400',
    CONFIRMED:
      'border-blue-500/30 bg-blue-500/10 text-blue-400',
    TO_ASSIGN:
      'border-orange-500/30 bg-orange-500/10 text-orange-400',
    ASSIGNED:
      'border-purple-500/30 bg-purple-500/10 text-purple-400',
    IN_PROGRESS:
      'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    COMPLETED:
      'border-green-500/30 bg-green-500/10 text-green-400',
    CANCELLED:
      'border-red-500/30 bg-red-500/10 text-red-400',
    REJECTED:
      'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not scheduled';
  }

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}