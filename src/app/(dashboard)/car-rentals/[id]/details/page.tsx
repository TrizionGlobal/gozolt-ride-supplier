'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import Link from 'next/link';
import { AssignWorkerModal } from '@/components/car-rentals/assign-worker-modal';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; taskType: 'HANDOVER' | 'RETURN' | null }>({ isOpen: false, taskType: null });

  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      carRentalsService.getBookingDetails(bookingId)
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
              <Link href={`/car-rentals/${booking.id}/handover`} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#FACC15] text-black hover:bg-[#EAB308]">
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
              <Link href={`/car-rentals/${booking.id}/return`} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600">
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
            <p className="text-sm text-gray-400 mt-1">Vehicle ID: CR-{booking.vehicle?.id.substring(0, 8).toUpperCase()} | Category: {booking.vehicle?.category?.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-1.5 bg-[#27272A] text-white rounded-full text-sm font-medium border border-[#3F3F46]">{booking.status}</span>
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
                // We'll just show the total including extensions to keep it simple, or calculate just the vehicle rate.
                const vehicleRate = Number(booking.vehicle?.pricePerDay || 0) * d;

                return (
                  <>
                    <div className="flex justify-between"><span className="text-gray-400">Vehicle Rate:</span> <span className="font-medium">€{vehicleRate.toFixed(2)}</span></div>
                    
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

                    {/* Add-ons */}
                    {booking.addonIds && booking.vehicle?.addons ? (
                      booking.addonIds.map((id: string) => {
                        const addon = booking.vehicle.addons.find((a: any) => a.id === id);
                        if (addon) {
                          return (
                            <div key={id} className="flex justify-between">
                              <span className="text-gray-400">{addon.name}:</span>
                              <span className="font-medium">€{Number(addon.pricePerDay * d).toFixed(2)}</span>
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : booking.addOns ? (
                      // Fallback for legacy format
                      booking.addOns.map((addon: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-400">{addon.name}:</span>
                          <span className="font-medium">€{Number((addon.pricePerDay || addon.price || 0) * d).toFixed(2)}</span>
                        </div>
                      ))
                    ) : null}

                    {/* Delivery & Taxes */}
                    {Number(booking.deliveryFee) > 0 && (
                      <div className="flex justify-between"><span className="text-gray-400">Delivery Fee:</span> <span className="font-medium">€{Number(booking.deliveryFee || 0).toFixed(2)}</span></div>
                    )}
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
                      View Document
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
                      View Document
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-white font-medium">Rental Agreement</span>
                  <span className="text-gray-400 text-xs">Digitally signed contract</span>
                </div>
                <button className="px-4 py-2 bg-[#27272A] text-white rounded-lg hover:bg-[#3F3F46] text-sm font-medium transition-colors border border-[#3F3F46]">
                  View Document
                </button>
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
                <div className="flex justify-between"><span className="text-gray-400">Vehicle Condition:</span> <span className="font-medium">{booking.handover.vehicleCondition}</span></div>
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
          {booking.return && (
            <div className="col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-lg">Return Details</h4>
              <div className="bg-[#111111] p-5 rounded-xl border border-[#27272A] text-sm space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Handled By:</span> <span className="font-medium text-[#FACC15]">{booking.return.worker ? booking.return.worker.name : 'Direct Supplier'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Odometer:</span> <span className="font-medium">{booking.return.odometerReading} km</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fuel Level:</span> <span className="font-medium">{booking.return.fuelLevel}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Vehicle Condition:</span> <span className="font-medium">{booking.return.vehicleCondition}</span></div>
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
