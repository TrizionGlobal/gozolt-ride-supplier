'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, AlertTriangle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { Driver } from '@/types';
import { DriverStatus } from '@/types';
import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';

interface DriversTableProps {
  drivers: Driver[];
  vehicleMap: Record<string, string>;
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  [DriverStatus.NEW_DRIVER]: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'New Driver' },
  [DriverStatus.SUPPLIER_APPROVED]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Admin Pending' },
  [DriverStatus.SUPPLIER_SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Supplier Suspended' },
  [DriverStatus.ADMIN_APPROVED]: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Needs Vehicle' },
  [DriverStatus.ADMIN_SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Admin Suspended' },
  [DriverStatus.VEHICLE_ASSIGNED]: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Vehicle Assigned' },
  [DriverStatus.ACTIVE]: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  [DriverStatus.SUSPENDED]: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Suspended' },
};

export function DriversTable({
  drivers,
  vehicleMap,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DriversTableProps) {
  const router = useRouter();
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdownId(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    setIsDeleting(true);
    try {
      await driverService.deleteDriver(driverToDelete.id);
      toast.success('Driver removed successfully');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to remove driver');
      setIsDeleting(false);
      setDriverToDelete(null);
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      key: 'driver',
      title: 'Driver',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{row.firstName} {row.lastName}</span>
          <span className="text-xs text-[#6B7280]">{row.email ?? row.phone}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (row) => <span className="text-sm text-[#A1A1AA]">{row.phone}</span>,
    },
    {
      key: 'driverStatus',
      title: 'Driver Status',
      render: (row) => {
        const style = statusStyles[row.status] || statusStyles[DriverStatus.ACTIVE];
        let displayLabel = style.label;
        let displayBg = style.bg;
        let displayText = style.text;

        if (row.status === DriverStatus.SUSPENDED || row.status === DriverStatus.ADMIN_SUSPENDED || row.status === DriverStatus.SUPPLIER_SUSPENDED) {
          displayLabel = style.label;
        } else if (row.status === DriverStatus.NEW_DRIVER) {
          displayLabel = 'Supplier Pending';
          displayBg = 'bg-orange-500/20';
          displayText = 'text-orange-400';
        } else if (row.status === DriverStatus.SUPPLIER_APPROVED) {
          displayLabel = 'Admin Pending';
          displayBg = 'bg-yellow-500/20';
          displayText = 'text-yellow-400';
        } else if (row.status === DriverStatus.ADMIN_APPROVED) {
          displayLabel = 'Needs Vehicle';
          displayBg = 'bg-blue-500/20';
          displayText = 'text-blue-400';
        } else if (row.status === DriverStatus.ACTIVE) {
          displayLabel = row.isOnline ? 'Online' : 'Offline';
          displayBg = row.isOnline ? 'bg-green-500/20' : 'bg-zinc-500/20';
          displayText = row.isOnline ? 'text-green-400' : 'text-zinc-400';
        }

        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border border-opacity-30 border-current ${displayBg} ${displayText}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${row.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            {displayLabel}
          </span>
        );
      },
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (row) => {
        const formattedRating = Number(row.avgRating).toFixed(1).replace(/\.0$/, '');
        return (
          <span className="inline-flex items-center gap-1 text-sm text-white">
            <Star className="h-3.5 w-3.5 fill-[#FACC15] text-[#FACC15]" />
            {formattedRating}
          </span>
        );
      },
    },
    {
      key: 'trips',
      title: 'Trips',
      render: (row) => <span className="text-sm text-[#9CA3AF]">{(row.totalRides ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'earnings',
      title: 'Earnings',
      render: () => <span className="text-sm text-white">€0</span>,
    },
    {
      key: 'vehicle',
      title: 'Vehicle',
      render: (row) => {
        const vehicle = vehicleMap[row.id];
        return vehicle ? (
          <span className="text-sm text-[#9CA3AF]">{vehicle}</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/30">
            Not Assigned
          </span>
        );
      },
    },
    {
      key: 'supplierStatus',
      title: 'Supplier Status',
      className: 'text-center',
      render: (row) => {
        let supplierStatus = 'Approved';
        if (row.status === DriverStatus.NEW_DRIVER) {
          supplierStatus = 'Pending';
        } else if (row.status === DriverStatus.SUPPLIER_SUSPENDED) {
          supplierStatus = 'Suspended';
        }

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              supplierStatus === 'Pending' || supplierStatus === 'Waiting'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : supplierStatus === 'Rejected' || supplierStatus === 'Suspended'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-green-500/20 text-green-400 border-green-500/30'
            }`}
          >
            {supplierStatus}
          </span>
        );
      },
    },
    {
      key: 'adminStatus',
      title: 'Admin Status',
      className: 'text-center',
      render: (row) => {
        let adminStatus = 'Approved';
        if (row.status === DriverStatus.NEW_DRIVER) {
          adminStatus = 'Waiting';
        } else if (row.status === DriverStatus.SUPPLIER_APPROVED) {
          adminStatus = 'Pending';
        } else if (row.status === DriverStatus.SUPPLIER_SUSPENDED) {
          adminStatus = 'Waiting';
        } else if (row.status === DriverStatus.ADMIN_SUSPENDED || row.status === DriverStatus.SUSPENDED) {
          adminStatus = 'Suspended';
        }

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              adminStatus === 'Pending' || adminStatus === 'Waiting'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : adminStatus === 'Rejected' || adminStatus === 'Suspended'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-green-500/20 text-green-400 border-green-500/30'
            }`}
          >
            {adminStatus}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-center',
      render: (row) => (
        <div className="relative inline-block text-left">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdownId(openDropdownId === row.id ? null : row.id);
            }}
            className="p-1 rounded-md text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openDropdownId === row.id && (
            <div
              className="absolute right-0 mt-1 w-32 origin-top-right rounded-md border border-[#27272A] bg-[#18181B] shadow-2xl focus:outline-none z-50 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {row.status === DriverStatus.NEW_DRIVER && (
                <>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setOpenDropdownId(null);
                      try {
                        await driverService.supplierApproveDriver(row.id);
                        toast.success('Driver approved');
                        window.location.reload();
                      } catch (err) {
                        toast.error('Failed to approve driver');
                      }
                    }}
                    className="block w-full px-4 py-2 text-left text-xs font-medium text-green-500 hover:bg-[#2A2A2A]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setOpenDropdownId(null);
                      try {
                        await driverService.supplierSuspendDriver(row.id);
                        toast.success('Driver suspended');
                        window.location.reload();
                      } catch (err) {
                        toast.error('Failed to suspend driver');
                      }
                    }}
                    className="block w-full px-4 py-2 text-left text-xs font-medium text-orange-500 hover:bg-[#2A2A2A]"
                  >
                    Suspend
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  router.push(`/drivers/${row.id}`);
                }}
                className="block w-full px-4 py-2 text-left text-xs font-medium text-[#FACC15] hover:bg-[#2A2A2A]"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(null);
                  setDriverToDelete(row);
                }}
                className="block w-full px-4 py-2 text-left text-xs font-medium text-red-500 hover:bg-[#2A2A2A]"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <ServerSideTable<Driver>
        columns={columns}
        data={drivers}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onRowClick={(row) => router.push(`/drivers/${row.id}`)}
        rowKey="id"
        emptyText="No drivers found"
      />

      {/* Delete Confirmation Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Remove Driver?</h3>
            </div>
            
            <p className="mb-6 text-sm text-[#A1A1AA]">
              Are you sure you want to remove <strong>{driverToDelete.firstName} {driverToDelete.lastName}</strong> from this platform? This will completely remove their details and automatically send them an email notification. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDriverToDelete(null)}
                disabled={isDeleting}
                className="rounded-md border border-[#3F3F46] bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-[#27272A] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Removing...' : 'Yes, remove driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
