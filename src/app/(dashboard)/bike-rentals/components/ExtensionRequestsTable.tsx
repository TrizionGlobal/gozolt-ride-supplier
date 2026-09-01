'use client';

import { useState } from 'react';
import { bikeRentalsService } from '@/services/bike-rentals/bike-rentals.service';

import { ServerSideTable, type ColumnDef } from '@/components/ui/server-side-table';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, XCircle } from 'lucide-react';

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
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (row: any) => {
    setSelectedRequest(row); // Show modal immediately with basic info
    if (row.bookingId) {
      setLoadingDetails(true);
      try {
        const fullBooking = await bikeRentalsService.getBookingDetails(row.bookingId);
        // Merge the full booking details into the selected request
        setSelectedRequest((prev: any) => ({
          ...prev,
          booking: { ...prev.booking, ...fullBooking }
        }));
      } catch (error) {
        console.error('Failed to fetch full booking details', error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'bike',
      title: 'Bike Info',
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
          <div className="text-xs mb-1">
            <span className={`font-medium text-white ${row.status !== 'REJECTED' ? 'line-through' : ''}`}>
              {format(new Date(row.originalEndDate), 'dd-MMM-yyyy')}
            </span>
          </div>
          <div className="text-xs mt-1">
            {row.status === 'REJECTED' ? (
              <span className="font-medium text-red-500/70 line-through" title="Rejected requested date">
                {format(new Date(row.newEndDate), 'dd-MMM-yyyy')}
              </span>
            ) : (
              <span className="font-medium text-[#FACC15]">
                New: {format(new Date(row.newEndDate), 'dd-MMM-yyyy')}
              </span>
            )}
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
      className: 'text-center',
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
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => handleViewDetails(row)}
            className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#111111] hover:bg-[#27272A] text-xs text-white font-medium transition-colors"
          >
            View Details
          </button>
          
          {row.status === 'PENDING' && (
            <>
              <button 
                onClick={() => onApprove(row.id)}
                className="p-1.5 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 rounded border border-emerald-400/20"
                title="Approve"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onReject(row.id)}
                className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20"
                title="Reject"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
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

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-[#27272A] bg-[#0A0A0A] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#27272A] p-4 bg-[#111111]">
              <h2 className="text-lg font-bold text-white">Extension Details</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bike Details */}
                <div className="bg-[#111111] border border-[#27272A] p-4 rounded-lg space-y-3">
                  <h5 className="text-xs uppercase text-[#FACC15] font-bold tracking-wider">Bike Details</h5>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Name</span> <span className="text-gray-200 font-medium">{selectedRequest.booking?.vehicle?.name}</span></p>
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Category</span> <span className="text-gray-200">{selectedRequest.booking?.vehicle?.category}</span></p>
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Plate</span> <span className="text-gray-200">{selectedRequest.booking?.vehicle?.registrationNo || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-[#111111] border border-[#27272A] p-4 rounded-lg space-y-3">
                  <h5 className="text-xs uppercase text-[#FACC15] font-bold tracking-wider">Customer Details</h5>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Name</span> <span className="text-gray-200 font-medium">{selectedRequest.booking?.user?.firstName} {selectedRequest.booking?.user?.lastName}</span></p>
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Phone</span> <span className="text-gray-200">{selectedRequest.booking?.user?.phone || 'N/A'}</span></p>
                    <p className="text-sm"><span className="text-gray-500 block text-xs">Email</span> <span className="text-gray-200 truncate block">{selectedRequest.booking?.user?.email || 'N/A'}</span></p>
                  </div>
                </div>

                {/* Extension & Payment Details */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-white text-lg">Pricing & Payment Details</h4>
                  
                  {loadingDetails ? (
                    <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] space-y-4">
                      <div className="flex justify-between">
                        <div className="h-4 bg-[#27272A] rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-[#27272A] rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-[#27272A] rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-[#27272A] rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-[#27272A] rounded w-28 animate-pulse"></div>
                        <div className="h-4 bg-[#27272A] rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-[#27272A] rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-[#27272A] rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="pt-3 border-t border-[#27272A]/50 space-y-4">
                        <div className="flex justify-between">
                          <div className="h-4 bg-[#27272A] rounded w-36 animate-pulse"></div>
                          <div className="h-4 bg-[#27272A] rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-[#27272A] rounded w-40 animate-pulse"></div>
                          <div className="h-4 bg-[#27272A] rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
                      <div className="flex justify-between"><span className="text-gray-400">Bike Rate:</span> <span className="font-medium">€{Number(selectedRequest.booking?.vehicleTotal || 0).toFixed(2)}</span></div>
                      
                      {/* Dynamic Packages */}
                      {selectedRequest.booking?.selectedPackage && (
                        <div className="flex justify-between"><span className="text-gray-400">{selectedRequest.booking.selectedPackage.title || 'Protection Package'}:</span> <span className="font-medium">€{Number(selectedRequest.booking.selectedPackage.price || 0).toFixed(2)}</span></div>
                      )}
                      
                      {selectedRequest.booking?.mileagePackage && typeof selectedRequest.booking.mileagePackage === 'object' && (
                        <div className="flex justify-between"><span className="text-gray-400">{selectedRequest.booking.mileagePackage.name || 'Mileage Package'}:</span> <span className="font-medium">€{Number(selectedRequest.booking.mileagePackage.price || 0).toFixed(2)}</span></div>
                      )}

                      {!selectedRequest.booking?.selectedPackage && Number(selectedRequest.booking?.packagesTotal) > 0 && (
                        <div className="flex justify-between"><span className="text-gray-400">Packages Total:</span> <span className="font-medium">€{Number(selectedRequest.booking?.packagesTotal || 0).toFixed(2)}</span></div>
                      )}

                      {/* Delivery & Taxes */}
                      {(() => {
                        const fee = Number(selectedRequest.booking?.deliveryFee || 0);
                        if (fee <= 0) return null;
                        
                        const pickup = selectedRequest.booking?.pickupLocation || 'Self Pickup';
                        const dropoff = selectedRequest.booking?.dropoffLocation || pickup;
                        
                        const hasCustomPickup = pickup !== 'Self Pickup';
                        const hasCustomDropoff = dropoff !== 'Self Pickup' && dropoff !== pickup;
                        
                        if (hasCustomPickup && hasCustomDropoff) {
                          return (
                            <>
                              <div className="flex justify-between"><span className="text-gray-400">Pickup Fee (Distance):</span> <span className="font-medium">€{(fee * 0.89).toFixed(2)}</span></div>
                              <div className="flex justify-between"><span className="text-gray-400">Dropoff Fee (Distance):</span> <span className="font-medium">€{(fee * 0.11).toFixed(2)}</span></div>
                            </>
                          );
                        } else if (hasCustomPickup) {
                          return <div className="flex justify-between"><span className="text-gray-400">Pickup Fee (Distance):</span> <span className="font-medium">€{fee.toFixed(2)}</span></div>;
                        } else if (hasCustomDropoff) {
                          return <div className="flex justify-between"><span className="text-gray-400">Dropoff Fee (Distance):</span> <span className="font-medium">€{fee.toFixed(2)}</span></div>;
                        } else {
                          return <div className="flex justify-between"><span className="text-gray-400">Delivery Fee (Distance):</span> <span className="font-medium">€{fee.toFixed(2)}</span></div>;
                        }
                      })()}
                      {Number(selectedRequest.booking?.taxes) > 0 && (
                        <div className="flex justify-between"><span className="text-gray-400">Taxes:</span> <span className="font-medium">€{Number(selectedRequest.booking?.taxes || 0).toFixed(2)}</span></div>
                      )}
                      
                      {(() => {
                        const isApproved = selectedRequest.status === 'APPROVED' || selectedRequest.status === 'PAID';
                        const isRejected = selectedRequest.status === 'REJECTED';
                        const currentBookingTotal = Number(selectedRequest.booking?.grandTotal || 0);
                        const extensionCost = Number(selectedRequest.additionalCost || 0);
                        
                        const previousPaidAmount = isApproved ? (currentBookingTotal - extensionCost) : currentBookingTotal;
                        const grandTotal = isApproved ? currentBookingTotal : (isRejected ? currentBookingTotal : currentBookingTotal + extensionCost);

                        return (
                          <>
                            <div className="pt-3 border-t border-[#27272A]/50">
                              <div className="flex justify-between"><span className="text-gray-300">Previous Paid Amount:</span> <span className="font-medium text-white">€{previousPaidAmount.toFixed(2)}</span></div>
                            </div>

                            <div className="flex justify-between"><span className="text-gray-300">Extended Amount ({differenceInDays(new Date(selectedRequest.newEndDate), new Date(selectedRequest.originalEndDate))} days):</span> <span className={`font-medium ${isRejected ? 'text-red-400 line-through' : 'text-emerald-400'}`}>€{extensionCost.toFixed(2)}</span></div>

                            <div className="flex justify-between font-bold pt-3 border-t border-[#27272A]">
                              <span className="text-white">Grand Total:</span> 
                              <span className="text-[#FACC15]">€{grandTotal.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}

                      <div className="flex justify-between pt-2">
                        <span className="text-gray-400">Extension Status:</span> 
                        <span className={`font-medium ${selectedRequest.status === 'REJECTED' ? 'text-red-400' : 'text-emerald-400'}`}>{selectedRequest.status}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-gray-500 block text-xs">Requested On</span> <span className="font-medium">{format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</span></p>
                    </div>
                    <div className="space-y-1">
                      {selectedRequest.stripePaymentIntentId && (
                        <p className="text-sm"><span className="text-gray-500 block text-xs">Payment ID</span> <span className="font-mono text-xs text-gray-300 truncate block">{selectedRequest.stripePaymentIntentId}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#27272A] p-4 bg-[#111111] flex justify-end">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg bg-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3F3F46] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
