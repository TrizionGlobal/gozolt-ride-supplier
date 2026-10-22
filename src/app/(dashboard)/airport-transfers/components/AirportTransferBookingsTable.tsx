'use client';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { format } from 'date-fns';
import { Plane, MoreVertical, MapPin, Sparkles, ArrowRight, UserCheck, CheckCircle2, Car, Navigation } from 'lucide-react';
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
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (booking: any) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export function AirportTransferBookingsTable({
  bookings,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onUpdateStatus,
}: AirportTransferBookingsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle & Flight',
      dataIndex: 'vehicle',
      render: (row) => {
        const vehicleName = row.vehicle?.make
          ? `${row.vehicle.make} ${row.vehicle.model}`
          : (row.vehicle?.name || 'Standard Vehicle');

        return (
          <div>
            <div className="text-white font-medium">{vehicleName}</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="px-1.5 py-0.5 bg-[#27272A] rounded border border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA]">
                {row.vehicle?.registrationNo || row.vehicle?.vehicleType || 'Plate: N/A'}
              </span>
              {row.flightNumber && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 text-[10px] font-mono">
                  <Plane className="h-2.5 w-2.5" /> Out: {row.flightNumber}
                </span>
              )}
              {row.returnFlightNumber && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 text-[10px] font-mono">
                  <Plane className="h-2.5 w-2.5" /> Ret: {row.returnFlightNumber}
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-[#71717A] mt-1">
              Ref: {row.bookingReference}
            </div>
          </div>
        );
      },
    },
    {
      key: 'customer',
      title: 'Passenger Details',
      render: (row) => {
        const customerName =
          row.leadPassengerName ||
          `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim() ||
          'Passenger';

        return (
          <div>
            <div className="text-white font-medium">{customerName}</div>
            <div className="text-xs text-[#71717A] mt-1">
              {row.leadPassengerPhone || row.user?.phone || 'No phone'}
            </div>
            <div className="text-xs text-[#71717A]">
              {row.adults || 1} Adult{(row.adults || 1) === 1 ? '' : 's'}
              {row.children ? ` · ${row.children} Ch` : ''}
              {row.infants ? ` · ${row.infants} Inf` : ''}
              {(row.standardLuggage || row.largeLuggage) ? ` · ${(row.standardLuggage || 0) + (row.largeLuggage || 0)} Bags` : ''}
            </div>
          </div>
        );
      },
    },
    {
      key: 'locations',
      title: 'Pickup & Drop-off Route',
      render: (row) => {
        const isRound = row.transferType === 'ROUND_TRIP';

        return (
          <div className="space-y-1.5 max-w-[280px]">
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isRound ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}`}>
                {isRound ? 'ROUND TRIP' : 'ONE WAY'}
              </span>
              {row.specialRequests && (
                <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                  <Sparkles className="h-2.5 w-2.5" /> Meet & Greet
                </span>
              )}
            </div>

            {/* Outbound Route */}
            <div className="text-xs bg-[#18181B] p-2 rounded-lg border border-[#27272A]/70">
              {isRound && (
                <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <span>Leg 1: Outbound</span>
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#71717A] uppercase font-medium">Meet at Pickup: </span>
                  <p className="text-white text-xs truncate" title={row.pickupLocation}>
                    {row.pickupLocation || 'Pickup location'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-1.5 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#71717A] uppercase font-medium">Drop-off: </span>
                  <p className="text-white text-xs truncate" title={row.dropoffLocation}>
                    {row.dropoffLocation || 'Drop-off location'}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Route if Round Trip */}
            {isRound && (
              <div className="text-xs bg-[#18181B] p-2 rounded-lg border border-[#27272A]/70">
                <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1 flex items-center gap-1">
                  <span>Leg 2: Return</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#71717A] uppercase font-medium">Meet at Return: </span>
                    <p className="text-white text-xs truncate" title={row.dropoffLocation}>
                      {row.dropoffLocation || 'Return pickup'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#71717A] uppercase font-medium">Drop-off: </span>
                    <p className="text-white text-xs truncate" title={row.pickupLocation}>
                      {row.pickupLocation || 'Return destination'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'dates',
      title: 'Transfer Schedule',
      dataIndex: 'pickupDateTime',
      render: (row) => {
        const formatDateTime = (dtStr?: string) => {
          if (!dtStr) return 'N/A';
          try {
            return format(new Date(dtStr.replace('Z', '')), 'dd MMM yyyy, hh:mm a');
          } catch {
            return dtStr;
          }
        };

        return (
          <div className="space-y-1.5">
            <div className="text-xs">
              <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Outbound Pickup:</span>
              <span className="text-white font-medium">{formatDateTime(row.pickupDateTime)}</span>
            </div>
            {row.returnDateTime && (
              <div className="text-xs border-t border-[#27272A] pt-1">
                <span className="text-[10px] text-indigo-400 uppercase font-semibold block">Return Pickup:</span>
                <span className="text-white font-medium">{formatDateTime(row.returnDateTime)}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Transfer Status',
      dataIndex: 'status',
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
          EN_ROUTE_TO_PICKUP: 'En Route to Pickup',
          ARRIVED_AT_AIRPORT: 'At Pickup Point',
          PASSENGER_MET: 'Passenger Boarded',
          IN_TRANSIT: 'In Transit to Drop-off',
          COMPLETED: 'Dropped Off / Completed',
          CANCELLED: 'Cancelled',
          REJECTED: 'Rejected',
        };

        const color = colors[row.status] || 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        const label = labelMap[row.status] || row.status?.replace(/_/g, ' ') || 'Confirmed';

        return (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${color} inline-block whitespace-nowrap`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'amountPaid',
      title: 'Transfer Fare',
      render: (row) => (
        <div className="text-sm font-semibold text-emerald-400">
          {row.currency === 'EUR' || !row.currency ? '€' : row.currency} {Number(row.grandTotal || 0).toFixed(2)}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      className: 'text-center',
      render: (row) => {
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1 transition-colors outline-none">
                Options <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-[#27272A] text-white">
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

                {(row.status === 'CONFIRMED' || row.status === 'DRIVER_ASSIGNED') && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'EN_ROUTE_TO_PICKUP')}
                      className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Chauffeur En Route to Pickup
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {row.status === 'EN_ROUTE_TO_PICKUP' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'ARRIVED_AT_AIRPORT')}
                      className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Arrived at Pickup (Meet Passenger)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {row.status === 'ARRIVED_AT_AIRPORT' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'PASSENGER_MET')}
                      className="text-purple-400 focus:text-purple-300 focus:bg-purple-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Passenger Met & Boarded Vehicle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {(row.status === 'PASSENGER_MET' || row.status === 'IN_TRANSIT') && (
                  <>
                    {row.status === 'PASSENGER_MET' && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(row.id, 'IN_TRANSIT')}
                        className="text-cyan-400 focus:text-cyan-300 focus:bg-cyan-500/10 cursor-pointer text-xs flex items-center gap-1.5"
                      >
                        <Car className="h-3.5 w-3.5" /> In Transit to Drop-off Location
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(row.id, 'COMPLETED')}
                      className="text-[#FACC15] focus:text-[#FACC15] focus:bg-[#FACC15]/10 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete Drop-off at Destination
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => onViewDetails(row)}
                  className="cursor-pointer focus:bg-[#27272A] focus:text-white text-xs"
                >
                  View Transfer Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText="No airport transfer bookings found."
        onRowClick={(row) => onViewDetails(row)}
      />
    </div>
  );
}
