'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, XCircle, UserRound } from 'lucide-react';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import { getExpertVisitName, getQuickServiceHourlyRate } from '@/lib/quick-services-pricing';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    CONFIRMED: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    TO_ASSIGN: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    ASSIGNED: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    SELF_ASSIGNED: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    WORKER_ASSIGNED: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400',
    IN_PROGRESS: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    COMPLETED: 'border-green-500/30 bg-green-500/10 text-green-400',
    CANCELLED: 'border-red-500/30 bg-red-500/10 text-red-400',
    REJECTED: 'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium uppercase ${styles[status]}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export default function SupplierQuickServiceBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = () => {
    setLoading(true);
    supplierQuickServiceBookingService.getBooking(bookingId)
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FCD223] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Booking not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FCD223] hover:underline">
          Go back to bookings
        </button>
      </div>
    );
  }

  // Parse JSON objects safely
  let addOns = [];
  try {
    if (typeof booking.addOns === 'string') addOns = JSON.parse(booking.addOns);
    else if (Array.isArray(booking.addOns)) addOns = booking.addOns;
  } catch (e) {}

  let features = {};
  try {
    if (typeof booking.options === 'string') features = JSON.parse(booking.options);
    else if (booking.options && typeof booking.options === 'object') features = booking.options;
  } catch (e) {}

  const customerName = booking.userName || booking.customer?.name || (booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown');
  const customerEmail = booking.userEmail || booking.customer?.email || booking.user?.email || 'N/A';
  const customerPhone = booking.userPhone || booking.customer?.mobile || booking.user?.phone || 'N/A';
  const serviceCategory = booking.serviceCategory || booking.categoryName || 'Unknown Category';
  const childService = booking.serviceTitle || booking.childService || 'General';
  const location = booking.location || booking.serviceAddress || 'N/A';
  const bookingDate = booking.bookingDate || booking.scheduledAt || booking.createdAt;

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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Service Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Customer Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[#A1A1AA] text-xs">Name</span>
                <span className="text-white font-medium">{customerName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#A1A1AA] text-xs">Phone</span>
                <span className="text-white font-medium">{customerPhone}</span>
              </div>
              <div className="flex flex-col md:col-span-2">
                <span className="text-[#A1A1AA] text-xs">Email</span>
                <span className="text-white font-medium">{customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#A1A1AA] text-xs">Service Category</span>
                <span className="text-white font-medium">{serviceCategory}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#A1A1AA] text-xs">Service</span>
                <span className="text-[#FCD223] font-medium">{childService}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#A1A1AA] text-xs">Scheduled Time</span>
                <span className="text-white font-medium">{bookingDate ? formatDate(bookingDate) : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[#A1A1AA] text-xs">Location</span>
                <span className="text-white font-medium">{location}</span>
              </div>
            </div>
          </div>

          {(booking.requirements || booking.description || (booking.images && booking.images.length > 0) || (booking.attachments && booking.attachments.length > 0)) && (
            <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
              <h3 className="font-semibold text-white text-lg mb-4">Additional Details</h3>
              <div className="space-y-4">
                {(booking.requirements || booking.description) && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[#A1A1AA] text-xs">Requirements / Issue Description</span>
                    <p className="text-white text-sm bg-[#1A1A1A] p-3 rounded-md border border-[#27272A] whitespace-pre-wrap">
                      {typeof booking.requirements === 'string' ? booking.requirements : booking.description || JSON.stringify(booking.requirements)}
                    </p>
                  </div>
                )}
                {((booking.images && booking.images.length > 0) || (booking.attachments && booking.attachments.length > 0)) && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[#A1A1AA] text-xs">Attached Photos</span>
                    <div className="flex gap-3 flex-wrap">
                      {(booking.attachments || booking.images || []).map((img: string, idx: number) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block relative h-20 w-20 rounded-md overflow-hidden border border-[#27272A] hover:border-[#FCD223] transition-colors">
                          <img src={img} alt={`Attachment ${idx + 1}`} className="object-cover w-full h-full" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Features Selection</h3>
            {Object.keys(features).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(features).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1 border-b border-[#27272A] pb-3 last:border-0 last:pb-0">
                    <span className="text-[#A1A1AA] font-medium">{key}</span>
                    {Array.isArray(val) ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {val.map((item: any, i: number) => (
                          <div key={i} className="bg-[#1A1A1A] p-3 rounded-md border border-[#27272A]">
                            {typeof item === 'object' && item !== null ? (
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(item).filter(([_, v]) => v != null && v !== '').map(([k, v]) => (
                                  <div key={k} className="flex flex-col">
                                    <span className="text-[#71717A] text-xs uppercase tracking-wider">{k}</span>
                                    <span className="text-white text-sm">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white text-sm">• {String(item)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[#A1A1AA] text-sm">No features selected.</div>
            )}
          </div>
          
          {addOns.length > 0 && (
            <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
              <h3 className="font-semibold text-white text-lg mb-4">Add-ons Selection</h3>
              <div className="space-y-3">
                {addOns.map((addon: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-[#A1A1AA]">{addon.name}:</span>
                    <span className="text-white font-medium">
                      {addon.price !== undefined && addon.price !== null
                        ? `€${Number(addon.price).toFixed(2)}`
                        : `${addon.count} item(s)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Status */}
        <div className="space-y-6">
          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Status</h3>
            <div className="flex justify-start">
              <StatusBadge status={booking.serviceStatus || booking.status || 'PENDING'} />
            </div>

            {(booking.assignedToSelf || booking.worker) && (
              <div className="mt-4 pt-4 border-t border-[#27272A]">
                <h4 className="text-[#A1A1AA] text-sm font-medium mb-3">Assignment</h4>
                {booking.assignedToSelf ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <UserRound className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Assigned to Me</p>
                      <p className="text-[#71717A] text-xs">Self-Assigned</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                      <UserRound className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{booking.worker?.name || 'Worker'}</p>
                      {booking.worker?.phone && (
                        <p className="text-[#71717A] text-xs">{booking.worker.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Upfront Fee:</span>
                <span className="text-white font-medium">€{Number(booking.upfrontFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">{getExpertVisitName(childService)}:</span>
                <span className="text-white font-medium">€{getQuickServiceHourlyRate(childService).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Materials Included:</span>
                <span className="text-white font-medium">€{Number(booking.materialCost || 0).toFixed(2)}</span>
              </div>
              {Number(booking.discountAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">GoCoins Discount:</span>
                  <span className="text-[#FCD223] font-medium">-€{Number(booking.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {booking.estimatedPrice && (
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Estimated Spare Price:</span>
                  <span className="text-white font-medium">{booking.estimatedPrice}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#27272A] pt-3 font-bold">
                <span className="text-white">Total Amount:</span>
                <span className="text-[#FCD223]">€{Number(booking.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
            {booking.paymentMethodType && (
              <div className="mt-4 pt-4 border-t border-[#27272A]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Payment Method:</span>
                  <span className="text-white font-medium uppercase">{booking.paymentMethodType}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#A1A1AA]">Payment Status:</span>
                  <span className="text-white font-medium uppercase">{booking.paymentStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
