'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle2, XCircle, UserRound, Mail } from 'lucide-react';
import { supplierQuickServiceBookingService } from '@/services/quick-services/supplier-quick-service-booking.service';
import { getExpertVisitName, getQuickServiceHourlyRate } from '@/lib/quick-services-pricing';
import { AssignWorkerModal } from '@/components/quick-services/assign-worker-modal';

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
    AWAITING_PAYMENT: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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

  let features: any = {};
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
          
          {(features.startedAt || features.endedAt || features.finalDurationHrs !== undefined) && (
            <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
              <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FCD223]" />
                Work Timing & Duration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.startedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[#A1A1AA] text-xs">Work Started</span>
                    <span className="text-white font-medium">{formatDate(features.startedAt)}</span>
                  </div>
                )}
                {features.endedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[#A1A1AA] text-xs">Work Ended</span>
                    <span className="text-white font-medium">{formatDate(features.endedAt)}</span>
                  </div>
                )}
                {features.finalDurationHrs !== undefined && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[#A1A1AA] text-xs">Billed Duration</span>
                    <span className="text-[#FCD223] font-medium">{Math.max(1, Math.ceil(Number(features.finalDurationHrs)))} hour(s)</span>
                  </div>
                )}
                {features.finalHourlyCost !== undefined && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[#A1A1AA] text-xs">Service Charge</span>
                    <span className="text-emerald-400 font-medium">€{Number(features.finalHourlyCost).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Features Selection</h3>
            {Object.keys(features).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(features)
                  .filter(([key]) => {
                    const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return !['isvalidated', 'validationpin', 'beautytreatmentssubtotal', 'startedat', 'endedat', 'finalhourlycost', 'finaldurationhrs', 'durationhours', 'durationminutes', 'hourlyrate', 'serviceamount', 'alreadypaid', 'upfrontfee', 'materialcost', 'issuedescription', 'requirements'].includes(norm);
                  })
                  .map(([key, val]) => (
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
              <StatusBadge status={booking.status === 'AWAITING_PAYMENT' ? 'AWAITING_PAYMENT' : (booking.status === 'COMPLETED' ? 'COMPLETED' : (booking.serviceStatus === 'COMPLETED' ? 'IN_PROGRESS' : (booking.serviceStatus || booking.status || 'PENDING')))} />
            </div>

            <div className="mt-4 pt-4 border-t border-[#27272A]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#A1A1AA] text-sm font-medium">Assignment</h4>
                {!booking.assignedToSelf && !booking.worker && !booking.workerId && booking.serviceStatus !== 'SELF_ASSIGNED' && booking.serviceStatus !== 'WORKER_ASSIGNED' && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-xs text-[#FCD223] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Mail className="h-3 w-3" />
                    Assign
                  </button>
                )}
              </div>

              {booking.assignedToSelf ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <UserRound className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Assigned to Me</p>
                    <p className="text-[#71717A] text-xs">Self-Assigned (Magic link emailed)</p>
                  </div>
                </div>
              ) : booking.worker ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
                    <UserRound className="h-5 w-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{booking.worker?.name || 'Worker'}</p>
                    <p className="text-[#71717A] text-xs">{booking.worker?.email || booking.worker?.phone || 'Magic link emailed'}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-white/5 p-3 text-center border border-[#27272A]">
                  <p className="text-xs text-[#71717A] mb-2">No worker currently assigned</p>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full rounded-md bg-[#FCD223] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Assign Task & Send Link
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl border border-[#27272A] p-5">
            <h3 className="font-semibold text-white text-lg mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              {/* 1. Already Paid Online Section */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold block mb-1">
                  Already Paid Online
                </span>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Upfront Booking Fee:</span>
                  <span className="text-white font-medium">€{Number(booking.upfrontFee || 0).toFixed(2)}</span>
                </div>
                {Number(booking.materialCost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Materials Included:</span>
                    <span className="text-white font-medium">€{Number(booking.materialCost || 0).toFixed(2)}</span>
                  </div>
                )}
                {Number(booking.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">GoCoins Discount:</span>
                    <span className="text-[#FCD223] font-medium">-€{Number(booking.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5 border-t border-white/10 font-medium text-xs">
                  <span className="text-gray-300">Total Settled Online:</span>
                  <span className="text-emerald-400 font-bold">
                    €{(Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 2. Service Amount Section */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#A1A1AA] font-semibold block mb-1">
                  Service Work Charge
                </span>
                {features.finalDurationHrs !== undefined ? (
                  <div className="flex justify-between items-center">
                    <span className="text-[#A1A1AA]">
                      {getExpertVisitName(childService)} ({Number(features.finalDurationHrs).toFixed(1)} hrs):
                    </span>
                    <span className="text-emerald-400 font-bold">
                      €{Number(features.finalHourlyCost || 0).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[#A1A1AA]">{getExpertVisitName(childService)} (Rate):</span>
                    <span className="text-white font-medium">€{getQuickServiceHourlyRate(childService).toFixed(2)} / hr</span>
                  </div>
                )}
              </div>

              {/* 3. Estimated Spare Price (Informational Only) */}
              {booking.estimatedPrice && (
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs">
                  <span className="text-[#A1A1AA]">Estimated Spare Price:</span>
                  <div className="text-right">
                    <span className="text-amber-400 font-medium block">{booking.estimatedPrice}</span>
                    <span className="text-[10px] text-gray-400 block">(Estimate only, not included in total)</span>
                  </div>
                </div>
              )}

              {/* 4. Payment Breakdown (Separated, Not Combined) */}
              <div className="pt-2 border-t border-[#27272A] space-y-2.5">
                {booking.status === 'COMPLETED' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Already Paid Online:</span>
                      <span className="text-emerald-400 font-semibold">
                        €{(Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Service Amount:</span>
                      <span className="text-white font-semibold">
                        €{Number(features.finalHourlyCost || (Number(booking.totalAmount || 0) - (Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0)))).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <span>Service Charge Status:</span>
                      <span>Paid (€{Number(features.finalHourlyCost || (Number(booking.totalAmount || 0) - (Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0)))).toFixed(2)})</span>
                    </div>
                  </>
                ) : booking.status === 'AWAITING_PAYMENT' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Already Paid Online:</span>
                      <span className="text-emerald-400 font-semibold">
                        €{(Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">Service Amount:</span>
                      <span className="text-amber-400 font-semibold">
                        €{Number(features.finalHourlyCost || Math.max(0, Number(booking.totalAmount || 0) - (Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)))).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <span>Service Amount Due:</span>
                      <span className="text-base">
                        €{Number(features.finalHourlyCost || Math.max(0, Number(booking.totalAmount || 0) - (Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)))).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-white">Amount Paid Online:</span>
                      <span className="text-[#FCD223]">
                        €{(Number(booking.upfrontFee || 0) + Number(booking.materialCost || 0) - Number(booking.discountAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717A] italic">
                      Service charge is separate and will be billed upon completion.
                    </p>
                  </>
                )}

                {booking.status === 'CANCELLED' && booking.paymentStatus === 'PARTIALLY_REFUNDED' && (
                  <div className="flex justify-between text-red-400 mt-2 text-xs">
                    <span>Refunded (Materials):</span>
                    <span className="font-bold">-€{Number(booking.materialCost || 0).toFixed(2)}</span>
                  </div>
                )}
                {booking.status === 'CANCELLED' && booking.paymentStatus === 'PARTIALLY_REFUNDED' && (
                  <div className="flex justify-between text-green-400 font-bold text-xs">
                    <span>Platform Retained (Upfront Fee):</span>
                    <span>€{Number(booking.upfrontFee || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* 5. Payment Method & Status */}
              <div className="mt-4 pt-3 border-t border-[#27272A] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Payment Method:</span>
                  <span className="text-white font-medium uppercase">{booking.paymentMethodType || 'CARD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Payment Status:</span>
                  <span className={`font-semibold uppercase ${
                    booking.status === 'COMPLETED' ? 'text-emerald-400' :
                    booking.status === 'AWAITING_PAYMENT' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {booking.status === 'COMPLETED' ? 'PAID (COMPLETED)' :
                     booking.status === 'AWAITING_PAYMENT' ? 'PARTIALLY PAID (AWAITING SERVICE FEE)' :
                     (booking.paymentStatus || 'PAID (UPFRONT)')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAssignModalOpen && (
        <AssignWorkerModal
          bookingId={booking.id || (booking as any)._id}
          onClose={() => setIsAssignModalOpen(false)}
          onAssigned={() => {
            setIsAssignModalOpen(false);
            fetchBooking();
          }}
        />
      )}
    </div>
  );
}
