'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { bikeRentalsService } from '@/services/bike-rentals/bike-rentals.service';
import Link from 'next/link';
import { AssignWorkerModal } from '@/components/bike-rentals/assign-worker-modal';

export default function BookingDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const source = searchParams.get('source');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; taskType: 'HANDOVER' | 'RETURN' | null }>({ isOpen: false, taskType: null });

  const getRentalStatus = (b: any) => {
    if (b.status === 'CANCELLED') {
      if (b.return?.bikeCondition === 'SUPPLIER_REJECTED') return 'Supplier Rejected';
      if (b.return?.bikeCondition === 'USER_CANCELLED') return 'User Cancelled';
      return 'Cancelled';
    }
    switch (b.status) {
      case 'PENDING_APPROVAL': return 'Pending';
      case 'CONFIRMED': return 'Upcoming';
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Completed';
      default: return b.status;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_APPROVAL: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      PENDING_PAYMENT: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      CONFIRMED: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      ACTIVE: 'text-green-500 bg-green-500/10 border-green-500/20',
      COMPLETED: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      CANCELLED: 'text-red-500 bg-red-500/10 border-red-500/20',
      REJECTED: 'text-red-500 bg-red-500/10 border-red-500/20',
    };
    return colors[status] || 'text-white bg-[#27272A] border-[#3F3F46]';
  };

  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      bikeRentalsService.getBookingDetails(bookingId)
        .then(data => {
          setBooking(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Booking not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FACC15] hover:underline">
          Go back to bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-lg border border-[#27272A] bg-[#111111] p-2 text-white hover:bg-[#1A1A1A] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Booking Details</h1>
            <p className="text-sm text-[#A1A1AA]">ID: {bookingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {booking.status === 'CONFIRMED' && (
            <>
              <button 
                onClick={() => setAssignModal({ isOpen: true, taskType: 'HANDOVER' })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#27272A] text-white hover:bg-[#3F3F46] border border-[#3F3F46]"
              >
                Assign Handover
              </button>
              <Link href={`/bike-rentals/${booking.id}/handover${source ? `?source=${source}` : ''}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#FACC15] text-black hover:bg-[#EAB308]">
                Start Handover
              </Link>
            </>
          )}
          {booking.status === 'ACTIVE' && (
            <>
              <button 
                onClick={() => setAssignModal({ isOpen: true, taskType: 'RETURN' })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#27272A] text-white hover:bg-[#3F3F46] border border-[#3F3F46]"
              >
                Assign Return
              </button>
              <Link href={`/bike-rentals/${booking.id}/return${source ? `?source=${source}` : ''}`} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600">
                Start Return
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-white space-y-6">
        {/* Top Summary */}
        <div className="flex justify-between items-start bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <div>
            <h3 className="text-xl font-semibold text-white">{booking.vehicle?.name}</h3>
            <p className="text-sm text-gray-400 mt-1">Bike ID: CR-{booking.vehicle?.id.substring(0, 8).toUpperCase()} | Category: {booking.vehicle?.category?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
              {getRentalStatus(booking)}
            </span>
          </div>
        </div>

        {/* Grid Details */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Customer Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg">Customer Details</h4>
            <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Mobile:</span> <span className="font-medium">{booking.user?.phone || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="font-medium">{booking.user?.email || 'N/A'}</span></div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg">Rental Details</h4>
            <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Pickup Date & Time:</span> <span className="font-medium">{format(new Date(booking.startDate), 'MMM dd, yyyy HH:mm')}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Pickup Location:</span> <span className="font-medium truncate max-w-[200px]" title={booking.pickupLocation}>{booking.pickupLocation}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Return Date & Time:</span> <span className="font-medium">{format(new Date(booking.endDate), 'MMM dd, yyyy HH:mm')}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Return Location:</span> <span className="font-medium truncate max-w-[200px]" title={booking.dropoffLocation}>{booking.dropoffLocation}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Delivery Option:</span> <span className="font-medium">{booking.deliveryType?.replace('_', ' ')}</span></div>
            </div>
          </div>

          {/* Pricing & Payment Details */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-semibold text-white text-lg">Payment Details</h4>
            <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
              {(() => {
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);
                let d = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                if (d < 1) d = 1;

                // Adjust original days if there were extensions (to match original booking rate before extensions)
                // We'll just show the total including extensions to keep it simple, or calculate just the bike rate.
                const bikeRate = Number(booking.vehicle?.pricePerDay || 0) * d;

                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-400">Bike Rate:</span> <span className="font-medium">€{bikeRate.toFixed(2)}</span></div>
                    
                    {booking.isFlexible && (
                      <div className="flex justify-between"><span className="text-gray-400">Stay Flexible:</span> <span className="font-medium">€{Number(booking.flexibleTotal || 0).toFixed(2)}</span></div>
                    )}

                    {/* Protection Package */}
                    {booking.selectedPackage ? (
                      <div className="flex justify-between">
                        <span className="text-gray-400">{booking.selectedPackage.title || 'Protection Package'}:</span> 
                        <span className="font-medium">€{Number((booking.selectedPackage.pricePerDay || booking.selectedPackage.price || 0) * d).toFixed(2)}</span>
                      </div>
                    ) : booking.protectionPackageId && booking.vehicle?.protectionPackages && (() => {
                      const pkg = booking.vehicle.protectionPackages.find((p: any) => p.id === booking.protectionPackageId);
                      if (pkg) {
                        return (
                          <div className="flex justify-between"><span className="text-gray-400">{pkg.title || 'Protection Package'}:</span> <span className="font-medium">€{Number((pkg.pricePerDay || 0) * d).toFixed(2)}</span></div>
                        );
                      }
                      return null;
                    })()}

                    {/* Delivery & Taxes */}
                    {(() => {
                      const fee = Number(booking.deliveryFee || 0);
                      if (fee <= 0) return null;
                      
                      const pickup = booking.pickupLocation || 'Self Pickup';
                      const dropoff = booking.dropoffLocation || pickup;
                      
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
                    {Number(booking.taxes) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-400">Taxes:</span> <span className="font-medium">€{Number(booking.taxes || 0).toFixed(2)}</span></div>
                    )}

                    <div className="flex justify-between font-bold pt-3 border-t border-[#27272A]">
                      <span className="text-white">Grand Total:</span> 
                      <span className="text-[#FACC15]">€{Number(booking.grandTotal || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-400">Payment Status:</span> 
                      <span className="font-medium text-emerald-400">Paid</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Documents */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-semibold text-white text-lg">Documents</h4>
            {(booking.drivingLicenceUrl || booking.nationalIdUrl) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.drivingLicenceUrl && (
                  <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-white font-medium capitalize">Driving License</span>
                      <span className="text-gray-400 text-xs">Uploaded document</span>
                    </div>
                    <a href={booking.drivingLicenceUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#27272A] text-white rounded-lg hover:bg-[#3F3F46] text-sm font-medium transition-colors border border-[#3F3F46] text-center inline-block">
                      View
                    </a>
                  </div>
                )}
                {booking.nationalIdUrl && (
                  <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-white font-medium capitalize">National ID</span>
                      <span className="text-gray-400 text-xs">Uploaded document</span>
                    </div>
                    <a href={booking.nationalIdUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#27272A] text-white rounded-lg hover:bg-[#3F3F46] text-sm font-medium transition-colors border border-[#3F3F46] text-center inline-block">
                      View
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm text-gray-400 text-center">
                No documents uploaded for this booking.
              </div>
            )}
          </div>

          {/* Handover Details */}
          {booking.handover && (
            <div className="col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-lg">Handover Details</h4>
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Handled By:</span> <span className="font-medium text-[#FACC15]">{booking.handover.worker ? booking.handover.worker.name : 'Direct Supplier'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Odometer:</span> <span className="font-medium">{booking.handover.odometerReading} km</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fuel Level:</span> <span className="font-medium">{booking.handover.fuelLevel}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bike Condition:</span> <span className="font-medium">{booking.handover.bikeCondition}</span></div>
                {booking.handover.photos?.length > 0 && (
                  <div>
                    <span className="text-gray-400 block mb-2">Photos:</span>
                    <div className="flex gap-2 overflow-x-auto">
                      {booking.handover.photos.map((p: string, i: number) => (
                        <div key={i} className="w-16 h-16 rounded overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt="Handover photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Return Details */}
          {booking.return && booking.status !== 'CANCELLED' && (
            <div className="col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-lg">Return Details</h4>
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Handled By:</span> <span className="font-medium text-[#FACC15]">{booking.return.worker ? booking.return.worker.name : 'Direct Supplier'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Odometer:</span> <span className="font-medium">{booking.return.odometerReading} km</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fuel Level:</span> <span className="font-medium">{booking.return.fuelLevel}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bike Condition:</span> <span className="font-medium">{booking.return.bikeCondition}</span></div>
                {booking.return.damageNotes && (
                  <div className="flex justify-between"><span className="text-gray-400">Damage Notes:</span> <span className="font-medium">{booking.return.damageNotes}</span></div>
                )}
                {booking.return.photos?.length > 0 && (
                  <div>
                    <span className="text-gray-400 block mb-2">Photos:</span>
                    <div className="flex gap-2 overflow-x-auto">
                      {booking.return.photos.map((p: string, i: number) => (
                        <div key={i} className="w-16 h-16 rounded overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p} alt="Return photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Details */}
          {booking.status === 'CANCELLED' && (
            <div className="col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-lg text-red-500">Cancellation Details</h4>
              <div className="bg-[#111111] p-5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Cancelled By:</span> <span className="font-medium text-red-500">{booking.cancelledBy === 'USER' ? 'Customer' : booking.cancelledBy === 'SUPPLIER' ? 'Supplier' : 'Unknown'}</span></div>
                {booking.cancellationReason && (
                  <div className="flex justify-between"><span className="text-gray-400">Reason:</span> <span className="font-medium">{booking.cancellationReason}</span></div>
                )}
                {booking.return?.refundAmount && (
                  <div className="flex justify-between"><span className="text-gray-400">Refund Amount:</span> <span className="font-medium text-emerald-400">€{Number(booking.return.refundAmount).toFixed(2)}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Extension Requests Details */}
          {booking.extensionRequests && booking.extensionRequests.length > 0 && (
            <div className="col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-lg">Extension Requests</h4>
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-4">
                {booking.extensionRequests.map((ext: any, idx: number) => (
                  <div key={ext.id || idx} className="p-4 rounded border border-[#3F3F46] space-y-2 relative">
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        ext.status === 'APPROVED' ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' :
                        ext.status === 'REJECTED' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                        'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        {ext.status}
                      </span>
                    </div>
                    <div className="flex justify-between w-3/4"><span className="text-gray-400">Requested End Date:</span> <span className="font-medium">{format(new Date(ext.newEndDate), 'dd-MMM-yyyy hh:mm a')}</span></div>
                    <div className="flex justify-between w-3/4"><span className="text-gray-400">Additional Cost:</span> <span className="font-medium text-[#FACC15]">€{Number(ext.additionalCost || 0).toFixed(2)}</span></div>
                    {ext.reason && (
                      <div className="flex justify-between w-3/4"><span className="text-gray-400">Reason:</span> <span className="font-medium">{ext.reason}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {assignModal.isOpen && assignModal.taskType && (
        <AssignWorkerModal
          bookingId={booking.id}
          taskType={assignModal.taskType}
          onClose={() => setAssignModal({ isOpen: false, taskType: null })}
          onAssigned={() => {
            setAssignModal({ isOpen: false, taskType: null });
            toast.success('Magic link has been emailed to the worker!');
          }}
        />
      )}
    </div>
  );
}
