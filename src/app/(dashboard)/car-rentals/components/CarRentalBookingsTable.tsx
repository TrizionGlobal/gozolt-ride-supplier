/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { MoreVertical, User, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CarRentalBookingsTableProps {
  bookings: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAssignWorker?: (id: string, type: 'HANDOVER' | 'RETURN') => void;
}

export function CarRentalBookingsTable({
  bookings,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onAccept,
  onReject,
  onAssignWorker,
}: CarRentalBookingsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle Info',
      dataIndex: 'vehicle',
      render: (row) => (
        <div>
          <div className="text-white font-medium">{row.vehicle?.name || 'Unknown'}</div>
          <div className="inline-block mt-1 px-1.5 py-0.5 bg-[#27272A] rounded border border-[#3F3F46] text-[10px] font-mono text-[#A1A1AA]">
            {row.vehicle?.registrationNo || 'No Plate'}
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      title: 'Customer Details',
      dataIndex: 'user',
      render: (row) => (
        <div>
          <div className="text-white font-medium">{row.user?.firstName} {row.user?.lastName}</div>
          <div className="text-xs text-[#71717A] mt-1">{row.user?.phone || 'No phone'}</div>
          <div className="text-xs text-[#71717A]">{row.user?.email || 'No email'}</div>
        </div>
      ),
    },
    {
      key: 'locations',
      title: 'Locations & Delivery',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-emerald-400 mb-1">
            {row.deliveryType ? row.deliveryType.replace('_', ' ') : 'SELF PICKUP'}
          </div>
          <div className="text-xs">
            <span className="text-[#71717A]">Pickup: </span>
            <span className="text-white max-w-[150px] truncate inline-block align-bottom" title={row.pickupLocation || row.deliveryAddress}>
              {row.pickupLocation || row.deliveryAddress || 'N/A'}
            </span>
          </div>
          <div className="text-xs mt-1">
            <span className="text-[#71717A]">Return: </span>
            <span className="text-white max-w-[150px] truncate inline-block align-bottom" title={row.dropoffLocation}>
              {row.dropoffLocation || 'N/A'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      title: 'Dates & Times',
      dataIndex: 'startDate',
      render: (row) => (
        <div>
          <div className="text-xs">
            <span className="text-[#71717A]">Pickup: </span>
            <span className="text-white">{formatDateTime(row.startDate)}</span>
          </div>
          <div className="text-xs mt-1">
            <span className="text-[#71717A]">Return: </span>
            <span className="text-white">{formatDateTime(row.endDate)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Rental Status',
      dataIndex: 'status',
      className: 'text-center',
      render: (row) => {
        const colors: Record<string, string> = {
          PENDING_APPROVAL: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
          PENDING_PAYMENT: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          CONFIRMED: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          ACTIVE: 'text-green-500 bg-green-500/10 border-green-500/20',
          COMPLETED: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          CANCELLED: 'text-red-500 bg-red-500/10 border-red-500/20',
          REJECTED: 'text-red-500 bg-red-500/10 border-red-500/20',
        };
        const labelMap: Record<string, string> = {
          PENDING_APPROVAL: 'Pending',
          PENDING_PAYMENT: 'Pending Payment',
          CONFIRMED: 'Confirmed',
          ACTIVE: 'Active',
          COMPLETED: 'Completed',
          CANCELLED: 'Cancelled',
          REJECTED: 'Rejected',
        };
        const color = colors[row.status] || colors.PENDING_PAYMENT;
        const label = labelMap[row.status] || row.status.replace(/_/g, ' ');
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${color}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'assignedTo',
      title: 'Assigned Staff',
      render: (row) => {
        if (['PENDING_APPROVAL', 'PENDING_PAYMENT', 'CANCELLED', 'REJECTED'].includes(row.status)) {
          return (
            <div className="min-w-[130px]">
              <span className="text-[11px] text-[#71717A] italic">—</span>
            </div>
          );
        }

        const handoverTask = row.handoverTasks?.find((t: any) => t.taskType === 'HANDOVER');
        const returnTask = row.handoverTasks?.find((t: any) => t.taskType === 'RETURN');

        const renderWorkerBadge = (workerName?: string, workerEmail?: string) => (
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
              <UserCheck className="h-3 w-3" /> {workerName || 'Assigned Worker'}
            </span>
            {workerEmail && (
              <span className="text-[10px] text-[#71717A] truncate max-w-[130px] mt-0.5" title={workerEmail}>
                {workerEmail}
              </span>
            )}
          </div>
        );

        const renderSelfBadge = () => (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
            <User className="h-3 w-3" /> Self Assigned
          </span>
        );

        const renderUnassigned = () => (
          <span className="text-[11px] text-[#71717A] italic">Unassigned</span>
        );

        if (row.status === 'CONFIRMED') {
          return (
            <div className="min-w-[130px]">
              <div className="text-[9px] font-bold text-emerald-400 uppercase mb-1">Handover</div>
              {handoverTask?.worker ? (
                renderWorkerBadge(handoverTask.worker.name, handoverTask.worker.email)
              ) : row.handover ? (
                row.handover.worker ? renderWorkerBadge(row.handover.worker.name, row.handover.worker.email) : renderSelfBadge()
              ) : (
                renderUnassigned()
              )}
            </div>
          );
        }

        if (row.status === 'ACTIVE') {
          return (
            <div className="min-w-[130px] space-y-1.5">
              <div>
                <div className="text-[9px] font-bold text-emerald-400 uppercase">Handover:</div>
                {row.handover?.worker ? (
                  renderWorkerBadge(row.handover.worker.name, row.handover.worker.email)
                ) : (
                  renderSelfBadge()
                )}
              </div>
              <div className="border-t border-[#27272A] pt-1">
                <div className="text-[9px] font-bold text-indigo-400 uppercase">Return:</div>
                {returnTask?.worker ? (
                  renderWorkerBadge(returnTask.worker.name, returnTask.worker.email)
                ) : row.return ? (
                  row.return.worker ? renderWorkerBadge(row.return.worker.name, row.return.worker.email) : renderSelfBadge()
                ) : (
                  renderUnassigned()
                )}
              </div>
            </div>
          );
        }

        if (row.status === 'COMPLETED') {
          return (
            <div className="min-w-[130px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-400 uppercase">Handover:</span>
                {row.handover?.worker ? (
                  <span className="text-xs text-white font-medium">{row.handover.worker.name}</span>
                ) : (
                  <span className="text-xs text-cyan-300 font-medium">Self Assigned</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-indigo-400 uppercase">Return:</span>
                {row.return?.worker ? (
                  <span className="text-xs text-white font-medium">{row.return.worker.name}</span>
                ) : (
                  <span className="text-xs text-cyan-300 font-medium">Self Assigned</span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="min-w-[130px]">
            {renderUnassigned()}
          </div>
        );
      },
    },
    {
      key: 'amountPaid',
      title: 'Amount Paid',
      render: (row) => (
        <div className="text-sm font-medium text-emerald-400">
          €{Number(row.grandTotal || 0).toFixed(2)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'id',
      className: 'text-center',
      render: (row) => {
        const handoverTask = row.handoverTasks?.find((t: any) => t.taskType === 'HANDOVER');
        const returnTask = row.handoverTasks?.find((t: any) => t.taskType === 'RETURN');

        const isHandoverAssigned = !!handoverTask;
        const isReturnAssigned = !!returnTask;

        const canPerformHandover = row.status === 'CONFIRMED' && !isHandoverAssigned;
        const canPerformReturn = row.status === 'ACTIVE' && !isReturnAssigned;

        const hasOptions =
          row.status === 'PENDING_APPROVAL' ||
          canPerformHandover ||
          canPerformReturn;

        if (!hasOptions) {
          return (
            <div className="flex justify-center">
              <Link href={`/car-rentals/${row.id}/details?source=bookings`} className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                View Details
              </Link>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1 transition-colors">
                Options <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-[#27272A] text-white">
                {row.status === 'PENDING_APPROVAL' && (
                  <>
                    <DropdownMenuItem onClick={() => onAccept && onAccept(row.id)} className="text-blue-500 focus:text-blue-400 focus:bg-blue-500/10 cursor-pointer">
                      Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReject && onReject(row.id)} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {canPerformHandover && (
                  <>
                    <DropdownMenuItem asChild className="text-[#FACC15] focus:text-[#FACC15] focus:bg-[#FACC15]/10 cursor-pointer">
                      <Link href={`/car-rentals/${row.id}/handover?source=bookings`}>Supplier Handover</Link>
                    </DropdownMenuItem>
                    {onAssignWorker && (
                      <DropdownMenuItem onClick={() => onAssignWorker(row.id, 'HANDOVER')} className="text-white focus:text-white focus:bg-[#27272A] cursor-pointer">
                        Assign Worker/Staff to Handover
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                {canPerformReturn && (
                  <>
                    <DropdownMenuItem asChild className="text-green-500 focus:text-green-400 focus:bg-green-500/10 cursor-pointer">
                      <Link href={`/car-rentals/${row.id}/return?source=bookings`}>Supplier Return</Link>
                    </DropdownMenuItem>
                    {onAssignWorker && (
                      <DropdownMenuItem onClick={() => onAssignWorker(row.id, 'RETURN')} className="text-white focus:text-white focus:bg-[#27272A] cursor-pointer">
                        Assign Worker/Staff to Return
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#27272A] focus:text-white">
                  <Link href={`/car-rentals/${row.id}/details?source=bookings`}>View Details</Link>
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
        emptyText="No bookings found."
      />
    </div>
  );
}
