'use client';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { format } from 'date-fns';
import { MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ExtensionRequestsTableProps {
  requests: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ExtensionRequestsTable({
  requests,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onApprove,
  onReject,
}: ExtensionRequestsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      key: 'vehicle',
      title: 'Vehicle Info',
      render: (row) => (
        <div>
          <div className="text-white font-medium">{row.booking?.vehicle?.name || 'Unknown'}</div>
          <div className="text-xs text-[#71717A] mt-1">{row.booking?.vehicle?.category || 'No category'}</div>
        </div>
      ),
    },
    {
      key: 'customer',
      title: 'Customer Details',
      render: (row) => (
        <div>
          <div className="text-white font-medium">{row.booking?.user?.firstName} {row.booking?.user?.lastName}</div>
          <div className="text-xs text-[#71717A] mt-1">{row.booking?.user?.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      title: 'Dates',
      render: (row) => (
        <div>
          <div className="text-xs text-[#71717A] mb-1">
            <span className="font-medium text-white line-through">
              {format(new Date(row.originalEndDate), 'dd-MMM-yyyy')}
            </span>
          </div>
          <div className="text-xs mt-1">
            <span className="font-medium text-[#FACC15]">
              New: {format(new Date(row.newEndDate), 'dd-MMM-yyyy')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'cost',
      title: 'Additional Cost',
      render: (row) => (
        <div className="font-semibold text-white">€{Number(row.additionalCost).toFixed(2)}</div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => {
        let badgeClasses = '';
        switch (row.status) {
          case 'PENDING':
            badgeClasses = 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10';
            break;
          case 'APPROVED':
            badgeClasses = 'border-blue-500/30 text-blue-500 bg-blue-500/10';
            break;
          case 'PAID':
            badgeClasses = 'border-green-500/30 text-green-500 bg-green-500/10';
            break;
          default:
            badgeClasses = 'border-red-500/30 text-red-500 bg-red-500/10';
        }
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${badgeClasses}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border border-[#27272A] bg-[#141414] text-white hover:bg-[#27272A] focus:outline-none ml-auto gap-1 px-3 w-auto text-xs font-medium">
            Options <MoreVertical className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#141414] border-[#27272A] text-white">
            {row.status === 'PENDING' ? (
              <>
                <DropdownMenuItem 
                  onClick={() => onApprove(row.id)}
                  className="hover:bg-[#27272A] cursor-pointer flex items-center text-green-400 focus:bg-[#27272A] focus:text-green-400"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Extension
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem 
                  onClick={() => onReject(row.id)}
                  className="hover:bg-[#27272A] cursor-pointer flex items-center text-red-400 focus:bg-[#27272A] focus:text-red-400"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Extension
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled className="text-gray-500">
                No actions available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable
        columns={columns}
        data={requests}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        emptyText="No extension requests found."
      />
    </div>
  );
}
