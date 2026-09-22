'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { MdFilterList } from 'react-icons/md';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';

import { getSupplierQuickServiceBySlug } from '@/lib/supplier-quick-services';
import { useSupplierQuickServiceBookings } from '@/hooks/use-supplier-quick-service-bookings';

import type {
  QuickServiceAssignmentFilter,
  QuickServiceBooking,
  QuickServiceBookingStatus,
} from '@/services/quick-services/quick-service-booking.types';

export default function ServiceBookingManagementPage() {
  const params = useParams<{ service: string }>();

  const service = getSupplierQuickServiceBySlug(
    params.service
  );

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [childService, setChildService] =
    useState('');

  const [status, setStatus] =
    useState<QuickServiceBookingStatus | ''>('');

  const [assignment, setAssignment] =
    useState<QuickServiceAssignmentFilter>('ALL');

  const [selectedBooking, setSelectedBooking] =
    useState<QuickServiceBooking | null>(null);

  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(
    () => ({
      search: search || undefined,
      categoryId: service?.id,
      childService: childService || undefined,
      status,
      assignment,
      page,
      limit,
    }),
    [
      search,
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

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setChildService('');
    setStatus('');
    setAssignment('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#27272A] bg-[#04213C]">
            <Image
              src={service.icon}
              alt={service.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              {service.name} Booking Management
            </h1>

            <p className="mt-1 text-sm text-[#8793B2]">
              Review bookings, customer requirements,
              schedules and assigned workers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#27272A] bg-[#111111] px-4 py-2.5 text-sm font-medium text-white hover:border-[#FCD223] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 text-[#FCD223] ${
              isLoading ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>
      </div>

      <Link
        href="/quick-services/booking-management"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#FCD223] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All Quick Services
      </Link>

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
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              applySearch();
            }
          }}
          placeholder="Search"
          className="h-10 w-full rounded-l-lg border border-r-0 border-[#27272A] bg-[#0A0A0A] pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#71717A] focus:border-[#FCD223]"
        />
      </div>

      <button
        type="button"
        onClick={applySearch}
        className="h-10 shrink-0 rounded-r-lg bg-[#FCD223] px-4 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
      >
        Search
      </button>
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

      {service.childServices.map((child) => (
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
      <MdFilterList className="h-5 w-5" />
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#0A0A0A]">
              <tr>
                <TableHeading>Booking</TableHeading>
                <TableHeading>Customer</TableHeading>
                <TableHeading>Service</TableHeading>
                <TableHeading>Schedule</TableHeading>
                <TableHeading>Location</TableHeading>
                <TableHeading>Worker</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Actions</TableHeading>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-sm text-[#71717A]"
                  >
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center"
                  >
                    <ClipboardList className="mx-auto h-10 w-10 text-[#52525B]" />

                    <p className="mt-3 text-sm font-medium text-white">
                      No bookings found
                    </p>

                    <p className="mt-1 text-xs text-[#71717A]">
                      {service.name} bookings will appear
                      here.
                    </p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-[#27272A] hover:bg-[#171717]"
                  >
                    <TableCell>
                      <span className="font-medium text-[#FCD223]">
                        {booking.bookingReference}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 text-[#71717A]" />

                        <div>
                          <p className="text-white">
                            {booking.customer.name}
                          </p>

                          <p className="text-xs text-[#71717A]">
                            {booking.customer.mobile}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-white">
                        {booking.categoryName}
                      </p>

                      <p className="text-xs text-[#FCD223]">
                        {booking.childService ??
                          'General'}
                      </p>
                    </TableCell>

                    <TableCell>
                      <span className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD223]" />
                        {formatDateTime(
                          booking.scheduledAt
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="flex max-w-[220px] items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD223]" />
                        {booking.serviceAddress}
                      </span>
                    </TableCell>

                    <TableCell>
                      {booking.assignedToSelf
                        ? 'Assigned to me'
                        : booking.worker?.name ??
                          'Unassigned'}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={booking.status}
                      />
                    </TableCell>

                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBooking(booking)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#27272A] px-3 py-2 text-xs font-medium text-white hover:border-[#FCD223] hover:text-[#FCD223]"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#27272A] px-5 py-4">
          <p className="text-xs text-[#71717A]">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              className="rounded-lg border border-[#27272A] px-3 py-2 text-xs text-white disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages || isLoading
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              className="rounded-lg border border-[#27272A] px-3 py-2 text-xs text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Temporary selected-booking confirmation */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111111] p-6">
            <h2 className="text-xl font-bold text-white">
              Booking Details
            </h2>

            <p className="mt-2 text-sm text-[#FCD223]">
              {selectedBooking.bookingReference}
            </p>

            <p className="mt-4 text-sm text-[#A1A1AA]">
              The complete customer, payment, requirement
              and timeline details will be added in the next
              step.
            </p>

            <button
              type="button"
              onClick={() =>
                setSelectedBooking(null)
              }
              className="mt-6 w-full rounded-full bg-[#FCD223] py-2.5 text-sm font-semibold text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#71717A]">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 text-sm text-[#D4D4D8]">
      {children}
    </td>
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