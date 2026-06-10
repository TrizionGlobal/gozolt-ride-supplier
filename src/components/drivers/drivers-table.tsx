'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { Driver } from '@/types';
import { DriverStatus } from '@/types';

interface DriversTableProps {
  drivers: Driver[];
  vehicleMap: Record<string, string>;
  isLoading: boolean;
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

export function DriversTable({ drivers, vehicleMap, isLoading }: DriversTableProps) {
  const router = useRouter();
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111]">
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-[#27272A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] py-12 flex flex-col items-center justify-center">
        <p className="text-sm text-[#6B7280]">No drivers found</p>
        <p className="text-xs text-[#4B5563] mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-transparent">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Driver Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Rides</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Earnings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#9CA3AF]">Vehicle</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#9CA3AF]">Supplier Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#9CA3AF]">Admin Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#9CA3AF]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const style = statusStyles[driver.status] || statusStyles[DriverStatus.ACTIVE];
              const vehicle = vehicleMap[driver.id];
              const fullName = `${driver.firstName} ${driver.lastName}`;
              
              // Format rating to at most 1 decimal place, e.g., 4.56 -> 4.6, 5.0 -> 5
              const formattedRating = Number(driver.avgRating).toFixed(1).replace(/\.0$/, '');

              let supplierStatus = 'Approved';
              let adminStatus = 'Approved';
              
              if (driver.status === DriverStatus.NEW_DRIVER) {
                supplierStatus = 'Pending';
                adminStatus = 'Waiting';
              } else if (driver.status === DriverStatus.SUPPLIER_APPROVED) {
                supplierStatus = 'Approved';
                adminStatus = 'Pending';
              } else if (driver.status === DriverStatus.SUPPLIER_SUSPENDED) {
                supplierStatus = 'Suspended';
                adminStatus = 'Waiting';
              } else if (driver.status === DriverStatus.ADMIN_SUSPENDED || driver.status === DriverStatus.SUSPENDED) {
                supplierStatus = 'Approved';
                adminStatus = 'Suspended';
              }

              let displayLabel = style.label;
              let displayBg = style.bg;
              let displayText = style.text;

              if (driver.status === DriverStatus.SUSPENDED || driver.status === DriverStatus.ADMIN_SUSPENDED || driver.status === DriverStatus.SUPPLIER_SUSPENDED) {
                displayLabel = style.label;
              } else if (driver.status === DriverStatus.NEW_DRIVER) {
                displayLabel = 'Supplier Pending';
                displayBg = 'bg-orange-500/20';
                displayText = 'text-orange-400';
              } else if (driver.status === DriverStatus.SUPPLIER_APPROVED) {
                displayLabel = 'Admin Pending';
                displayBg = 'bg-yellow-500/20';
                displayText = 'text-yellow-400';
              } else if (driver.status === DriverStatus.ADMIN_APPROVED) {
                displayLabel = 'Needs Vehicle';
                displayBg = 'bg-blue-500/20';
                displayText = 'text-blue-400';
              } else if (driver.status === DriverStatus.ACTIVE) {
                displayLabel = driver.isOnline ? 'Online' : 'Offline';
                displayBg = driver.isOnline ? 'bg-green-500/20' : 'bg-zinc-500/20';
                displayText = driver.isOnline ? 'text-green-400' : 'text-zinc-400';
              }

              return (
                <tr
                  key={driver.id}
                  onClick={() => router.push(`/drivers/${driver.id}`)}
                  className="border-b border-[#2A2A2A] last:border-b-0 hover:bg-[#1A1A1A]/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{fullName}</span>
                      <span className="text-xs text-[#6B7280]">{driver.email ?? driver.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border border-opacity-30 border-current ${displayBg} ${displayText}`}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                      {displayLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-white">
                      <Star className="h-3.5 w-3.5 fill-[#FACC15] text-[#FACC15]" />
                      {formattedRating}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#9CA3AF]">
                    {driver.totalRides.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-white">
                    {/* Mock earnings as we don't have _computed locally */}
                    €0
                  </td>
                  <td className="px-4 py-4 text-sm text-[#9CA3AF]">
                    {vehicle ? (
                      vehicle
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/30">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        supplierStatus === 'Pending' || supplierStatus === 'Waiting'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : supplierStatus === 'Rejected'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}
                    >
                      {supplierStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        adminStatus === 'Pending' || adminStatus === 'Waiting'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : adminStatus === 'Rejected'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}
                    >
                      {adminStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {driver.status === DriverStatus.NEW_DRIVER && (
                        <>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await driverService.supplierApproveDriver(driver.id);
                                toast.success('Driver approved');
                                window.location.reload();
                              } catch (err) {
                                toast.error('Failed to approve driver');
                              }
                            }}
                            className="text-xs font-medium text-green-500 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await driverService.supplierSuspendDriver(driver.id);
                                toast.success('Driver suspended');
                                window.location.reload();
                              } catch (err) {
                                toast.error('Failed to suspend driver');
                              }
                            }}
                            className="text-xs font-medium text-orange-500 hover:underline"
                          >
                            Suspend
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/drivers/${driver.id}`);
                        }}
                        className="text-xs font-medium text-[#FACC15] hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDriverToDelete(driver);
                        }}
                        className="text-[11px] font-medium text-red-500 hover:underline"
                        title="Remove Driver"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
