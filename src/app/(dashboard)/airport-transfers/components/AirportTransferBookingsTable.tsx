'use client';

import { useMemo } from 'react';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { formatDateTime } from '@/lib/utils';
import {
  Plane,
  MoreVertical,
  MapPin,
  UserCheck,
  CheckCircle2,
  Car,
  Navigation,
  CreditCard,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface AirportTransferBookingsTableProps {
  bookings: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  activeTab?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (booking: any) => void;
  onUpdateStatus: (id: string, newStatus: string, tripLeg?: 'OUTBOUND' | 'RETURN') => void;
  onAssignWorker?: (
    bookingId: string,
    bookingRef: string,
    mode: 'WORKER' | 'SELF',
    tripLeg?: 'OUTBOUND' | 'RETURN',
    booking?: any,
  ) => void;
  onSelfAssign?: (bookingId: string, tripLeg: 'OUTBOUND' | 'RETURN') => void;
}

export function AirportTransferBookingsTable({
  bookings,
  isLoading,
  page,
  limit,
  total,
  activeTab,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onUpdateStatus,
  onAssignWorker,
  onSelfAssign,
}: AirportTransferBookingsTableProps) {
  const allColumns: ColumnDef<any>[] = [
    // ── 1. VEHICLE ─────────────────────────────────────────────────────────────
    {
      key: 'vehicle',
      title: 'Vehicle',
      render: (row) => {
        const vehicleName = row.vehicle?.make
          ? `${row.vehicle.make} ${row.vehicle.model || ''}`.trim()
          : row.vehicle?.name || 'Standard Vehicle';

        const plate =
          row.vehicle?.registrationNo ||
          row.vehicle?.plateNumber ||
          row.vehicle?.vehicleType ||
          'N/A';

        return (
          <div className="min-w-[140px]">
            <div className="text-white font-semibold text-sm leading-tight">{vehicleName}</div>
            <div className="flex items-center gap-1 mt-1">
              <CreditCard className="h-3 w-3 text-[#71717A]" />
              <span className="px-1.5 py-0.5 bg-[#27272A] rounded border border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA]">
                {plate}
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#52525B] mt-1">
              Ref: {row.bookingReference}
            </div>
          </div>
        );
      },
    },

    // ── 2. USER ─────────────────────────────────────────────────────────────────
    {
      key: 'user',
      title: 'User',
      render: (row) => {
        const fullName =
          row.leadPassengerName ||
          `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim() ||
          'Passenger';
        const phone = row.leadPassengerPhone || row.user?.phone || row.user?.phoneNumber || '—';
        const email = row.user?.email || row.leadPassengerEmail || '—';

        return (
          <div className="min-w-[160px] space-y-1">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-[#71717A] shrink-0" />
              <span className="text-white font-semibold text-sm leading-tight">{fullName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[#71717A] shrink-0" />
              <span className="text-xs text-[#A1A1AA]">{phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-[#71717A] shrink-0" />
              <span className="text-xs text-[#A1A1AA] truncate max-w-[160px]" title={email}>
                {email}
              </span>
            </div>
          </div>
        );
      },
    },

    // ── 3. LOCATION ─────────────────────────────────────────────────────────────
    {
      key: 'location',
      title: 'Location',
      render: (row) => {
        const isRound = row.transferType === 'ROUND_TRIP';
        return (
          <div className="space-y-1.5 min-w-[200px] max-w-[260px]">
            {/* Outbound / First Trip */}
            <div className="bg-[#18181B] p-2 rounded-lg border border-[#27272A]/70">
              {isRound && (
                <div className="text-[9px] uppercase font-bold text-emerald-400 mb-1">
                  First Trip
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
                <p className="text-white text-[11px] leading-tight truncate" title={row.pickupLocation}>
                  {row.pickupLocation || 'Pickup'}
                </p>
              </div>
              <div className="flex items-start gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-0.5" />
                <p className="text-white text-[11px] leading-tight truncate" title={row.dropoffLocation}>
                  {row.dropoffLocation || 'Drop-off'}
                </p>
              </div>
            </div>
            {/* Return Trip */}
            {isRound && (
              <div className="bg-[#18181B] p-2 rounded-lg border border-[#27272A]/70">
                <div className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Return Trip</div>
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-white text-[11px] leading-tight truncate" title={row.dropoffLocation}>
                    {row.dropoffLocation || 'Return from'}
                  </p>
                </div>
                <div className="flex items-start gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-0.5" />
                  <p className="text-white text-[11px] leading-tight truncate" title={row.pickupLocation}>
                    {row.pickupLocation || 'Return to'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      },
    },

    // ── 5. TRANSFER SCHEDULE ────────────────────────────────────────────────────
    {
      key: 'schedule',
      title: 'Transfer Schedule',
      render: (row) => {
        const isRound = row.transferType === 'ROUND_TRIP' || !!row.returnDateTime;
        return (
          <div className="space-y-1.5 min-w-[155px]">
            <div>
              <div className="text-[9px] uppercase font-semibold text-[#71717A]">
                {isRound ? 'First Trip Pickup' : 'Pickup Time'}
              </div>
              <div className="text-xs text-white font-medium">{formatDateTime(row.pickupDateTime)}</div>
            </div>
            {row.returnDateTime && (
              <div className="border-t border-[#27272A] pt-1">
                <div className="text-[9px] uppercase font-semibold text-indigo-400">Return Trip Pickup</div>
                <div className="text-xs text-white font-medium">{formatDateTime(row.returnDateTime)}</div>
              </div>
            )}
          </div>
        );
      },
    },

    // ── 6. TRANSFER STATUS ──────────────────────────────────────────────────────
    {
      key: 'status',
      title: 'Transfer Status',
      className: 'text-center',
      render: (row) => {
        const colors: Record<string, string> = {
          PENDING_APPROVAL: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
          PENDING: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
          CONFIRMED: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
          DRIVER_ASSIGNED: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
          EN_ROUTE_TO_PICKUP: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
          ARRIVED_AT_AIRPORT: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
          PASSENGER_MET: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
          IN_TRANSIT: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
          COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
          CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/25',
          REJECTED: 'text-red-400 bg-red-500/10 border-red-500/25',
        };

        const labelMap: Record<string, string> = {
          PENDING_APPROVAL: 'Pending Request',
          PENDING: 'Pending Request',
          CONFIRMED: 'Confirmed',
          DRIVER_ASSIGNED: 'Driver Assigned',
          EN_ROUTE_TO_PICKUP: 'En Route',
          ARRIVED_AT_AIRPORT: 'At Pickup Point',
          PASSENGER_MET: 'Passenger Boarded',
          IN_TRANSIT: 'In Transit',
          COMPLETED: 'Completed',
          CANCELLED: 'Cancelled',
          REJECTED: 'Rejected',
        };

        const isRound = row.transferType === 'ROUND_TRIP';
        const color = colors[row.status] || 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        const label = labelMap[row.status] || row.status?.replace(/_/g, ' ') || 'Unknown';

        const returnStatus = row.returnStatus || row.status;
        const returnColor = colors[returnStatus] || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
        const returnLabel = labelMap[returnStatus] || returnStatus?.replace(/_/g, ' ') || 'Unknown';

        if (isRound) {
          return (
            <div className="flex flex-col gap-1 items-center">
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${color} inline-block whitespace-nowrap`}>
                🛫 {label}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${returnColor} inline-block whitespace-nowrap`}>
                🛬 {returnLabel}
              </span>
            </div>
          );
        }

        return (
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${color} inline-block whitespace-nowrap`}
          >
            {label}
          </span>
        );
      },
    },

    // ── 7. ASSIGNED DRIVER ─────────────────────────────────────────────────────
    {
      key: 'assignedTo',
      title: 'Assigned Driver',
      render: (row) => {
        // Pending bookings cannot have a driver assigned yet
        if (row.status === 'PENDING_APPROVAL' || row.status === 'PENDING') {
          return (
            <div className="min-w-[130px]">
              <span className="text-[11px] text-[#71717A] italic">—</span>
            </div>
          );
        }

        const isRound = row.transferType === 'ROUND_TRIP';
        const outboundTask =
          row.tasks?.find((t: any) => t.tripLeg === 'OUTBOUND') ||
          (!isRound && row.tasks?.length ? row.tasks[0] : null);
        const returnTask = row.tasks?.find((t: any) => t.tripLeg === 'RETURN');

        const renderBadge = (task: any, driver: any) => {
          if (task) {
            if (task.selfAssigned) {
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                  <User className="h-3 w-3" /> Self Assigned
                </span>
              );
            }
            return (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  <UserCheck className="h-3 w-3" /> {task.assignedToName}
                </span>
                {task.assignedToEmail && (
                  <span className="text-[10px] text-[#71717A] truncate max-w-[130px] mt-0.5" title={task.assignedToEmail}>
                    {task.assignedToEmail}
                  </span>
                )}
              </div>
            );
          }
          if (driver) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                <UserCheck className="h-3 w-3" /> {driver.firstName} {driver.lastName}
              </span>
            );
          }
          return (
            <span className="text-[11px] text-[#71717A] italic">
              Unassigned
            </span>
          );
        };

        if (isRound) {
          return (
            <div className="min-w-[130px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-400">First:</span>
                {renderBadge(outboundTask, row.driver)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-indigo-400">Return:</span>
                {renderBadge(returnTask, null)}
              </div>
            </div>
          );
        }

        return (
          <div className="min-w-[130px]">
            {renderBadge(outboundTask, row.driver)}
          </div>
        );
      },
    },

    // ── 8. TRANSFER FARE ────────────────────────────────────────────────────────
    {
      key: 'fare',
      title: 'Transfer Fare',
      render: (row) => {
        const symbol = row.currency === 'USD' ? '$' : row.currency === 'GBP' ? '£' : '€';
        return (
          <div className="text-sm font-bold text-emerald-400 whitespace-nowrap">
            {symbol} {Number(row.grandTotal || 0).toFixed(2)}
          </div>
        );
      },
    },

    // ── 9. ACTIONS ──────────────────────────────────────────────────────────────
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-center',
      render: (row) => {
        const isRound = row.transferType === 'ROUND_TRIP';
        const outboundTask =
          row.tasks?.find((t: any) => t.tripLeg === 'OUTBOUND') ||
          (!isRound && row.tasks?.length ? row.tasks[0] : null);
        const returnTask = row.tasks?.find((t: any) => t.tripLeg === 'RETURN');

        const isOutboundAssigned = !!outboundTask || !!row.driver || row.status === 'DRIVER_ASSIGNED';
        const isReturnAssigned = !!returnTask || row.returnStatus === 'DRIVER_ASSIGNED';

        const isOutboundCompleted = row.status === 'COMPLETED';
        const isReturnCompleted = isRound ? row.returnStatus === 'COMPLETED' : true;
        const isFullyCompleted = isOutboundCompleted && isReturnCompleted;

        // Driver assignment is strictly allowed ONLY after booking is CONFIRMED (never when PENDING or CANCELLED)
        const canAssignOutbound =
          row.status === 'CONFIRMED' &&
          !isOutboundCompleted &&
          !isOutboundAssigned;

        const canAssignReturn =
          isRound &&
          (row.returnStatus || row.status) === 'CONFIRMED' &&
          !isReturnCompleted &&
          !isReturnAssigned;

        const canSelfAssign = canAssignOutbound || canAssignReturn;
        const pendingLegForSelfAssign: 'OUTBOUND' | 'RETURN' = canAssignReturn && !canAssignOutbound ? 'RETURN' : 'OUTBOUND';

        // Only pending approval and unassigned bookings have operational actions in the supplier portal.
        // Once assigned, the driver manages all trip steps (En Route, At Pickup, Boarded, Complete) via the Magic Link.
        const hasActiveActions =
          row.status === 'PENDING_APPROVAL' ||
          canAssignOutbound ||
          canAssignReturn ||
          canSelfAssign;

        // Once assigned or completed, show direct View details button
        if (isFullyCompleted || !hasActiveActions) {
          return (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onViewDetails(row)}
                className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap"
              >
                View details
              </button>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1 transition-colors outline-none">
                Options <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-[#111111] border-[#27272A] text-white">
                {row.status === 'PENDING_APPROVAL' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'CONFIRMED')}
                      className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept Transfer Request
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'CANCELLED')}
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer text-xs"
                    >
                      Decline Request
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {/* Driver Assignments (shown ONLY if not yet assigned) */}
                {canAssignOutbound && (
                  <DropdownMenuItem
                    onClick={() => onAssignWorker?.(row.id, row.bookingReference, 'WORKER', 'OUTBOUND', row)}
                    className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5" /> {isRound ? 'Assign Driver (First Trip)' : 'Assign Driver'}
                  </DropdownMenuItem>
                )}

                {canAssignReturn && (
                  <DropdownMenuItem
                    onClick={() => onAssignWorker?.(row.id, row.bookingReference, 'WORKER', 'RETURN', row)}
                    className="text-indigo-400 focus:text-indigo-300 focus:bg-indigo-500/10 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Users className="h-3.5 w-3.5" /> Assign Driver (Return Trip)
                  </DropdownMenuItem>
                )}

                {canSelfAssign && (
                  <DropdownMenuItem
                    onClick={() => onSelfAssign?.(row.id, pendingLegForSelfAssign)}
                    className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <User className="h-3.5 w-3.5" /> Self Assign ({isRound ? (pendingLegForSelfAssign === 'RETURN' ? 'Return Trip' : 'First Trip') : 'Supplier'})
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-[#27272A]" />

                <DropdownMenuItem
                  onClick={() => onViewDetails(row)}
                  className="cursor-pointer focus:bg-[#27272A] focus:text-white text-xs"
                >
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // In the Pending Requests section, do not display the "Assigned Driver" column
  const visibleColumns = useMemo(() => {
    if (activeTab === 'pending') {
      return allColumns.filter((col) => col.key !== 'assignedTo');
    }
    return allColumns;
  }, [allColumns, activeTab]);

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable
        columns={visibleColumns}
        data={bookings}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText="No airport transfer bookings found."
      />
    </div>
  );
}
