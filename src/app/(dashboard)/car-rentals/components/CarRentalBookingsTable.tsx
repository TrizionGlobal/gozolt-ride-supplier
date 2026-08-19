'use client';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
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
            <span className="text-white">{format(new Date(row.startDate), 'dd-MMM-yyyy hh:mm a')}</span>
          </div>
          <div className="text-xs mt-1">
            <span className="text-[#71717A]">Return: </span>
            <span className="text-white">{format(new Date(row.endDate), 'dd-MMM-yyyy hh:mm a')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Rental Status',
      dataIndex: 'status',
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
        const hasOptions = ['PENDING_APPROVAL', 'CONFIRMED', 'ACTIVE'].includes(row.status);
        
        if (!hasOptions) {
          return (
            <div className="flex justify-center">
              <Link href={`/car-rentals/${row.id}/details?source=bookings`} className="rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors">
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
              <DropdownMenuContent align="end" className="w-40 bg-[#111111] border-[#27272A] text-white">
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
                
                {row.status === 'CONFIRMED' && (
                  <>
                    <DropdownMenuItem asChild className="text-[#FACC15] focus:text-[#FACC15] focus:bg-[#FACC15]/10 cursor-pointer">
                      <Link href={`/car-rentals/${row.id}/handover?source=bookings`}>Do Handover</Link>
                    </DropdownMenuItem>
                    {onAssignWorker && (
                      <DropdownMenuItem onClick={() => onAssignWorker(row.id, 'HANDOVER')} className="text-white focus:text-white focus:bg-[#27272A] cursor-pointer">
                        Assign Handover
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#27272A]" />
                  </>
                )}
                
                {row.status === 'ACTIVE' && (
                  <>
                    <DropdownMenuItem asChild className="text-green-500 focus:text-green-400 focus:bg-green-500/10 cursor-pointer">
                      <Link href={`/car-rentals/${row.id}/return?source=bookings`}>Do Return</Link>
                    </DropdownMenuItem>
                    {onAssignWorker && (
                      <DropdownMenuItem onClick={() => onAssignWorker(row.id, 'RETURN')} className="text-white focus:text-white focus:bg-[#27272A] cursor-pointer">
                        Assign Return
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
