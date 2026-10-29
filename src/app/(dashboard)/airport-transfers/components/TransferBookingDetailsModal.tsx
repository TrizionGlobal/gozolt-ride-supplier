import { useState, useEffect } from 'react';
import { X, Plane, Clock, User, MapPin, Car, CheckCircle, Sparkles, Navigation, UserCheck, UserPlus, Building2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface TransferBookingDetailsModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (id: string, newStatus: string) => void;
}

export function TransferBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
}: TransferBookingDetailsModalProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assignedDriver, setAssignedDriver] = useState<any>(booking?.driver || null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDriverSelectOpen, setIsDriverSelectOpen] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setAssignedDriver(booking.driver || null);
      apiClient.get('/suppliers/drivers', { params: { status: 'ACTIVE' } })
        .then((res) => {
          setDrivers(res.data.items || res.data || []);
        })
        .catch((err) => {
          console.error('Failed to fetch active drivers:', err);
        });
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleAssignDriver = async (driverId: string) => {
    try {
      setIsAssigning(true);
      await apiClient.post(`/airport-transfers/supplier/bookings/${booking.id}/assign-driver`, { driverId });
      const chosen = drivers.find((d) => d.id === driverId);
      setAssignedDriver(chosen);
      setIsDriverSelectOpen(false);
      toast.success(`Driver ${chosen?.firstName || ''} assigned successfully`);
      if (onStatusUpdate) {
        onStatusUpdate(booking.id, booking.status === 'CONFIRMED' ? 'DRIVER_ASSIGNED' : booking.status);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setIsAssigning(false);
    }
  };

  const isRound = booking.transferType === 'ROUND_TRIP';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#27272A] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-[#FACC15] bg-[#FACC15]/10 px-2.5 py-1 rounded-md">
                {booking.bookingReference}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${isRound ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}`}>
                {isRound ? 'ROUND TRIP TRANSFER' : 'ONE WAY TRANSFER'}
              </span>
              {booking.flightNumber && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Plane className="h-3 w-3" /> Flight {booking.flightNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-[#71717A] mt-2">
              Booking Placed: {formatDateTime(booking.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 py-4 text-sm max-h-[65vh] overflow-y-auto pr-1">
          {/* <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] flex items-start gap-2.5">
            <Car className="h-4 w-4 text-[#FACC15] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <span className="font-semibold text-white">Chauffeured Passenger Transport: </span>
              The chauffeur meets the passenger at the pickup location, assists with luggage, drives them to the destination, and completes drop-off.
              <span className="text-[#A1A1AA] block mt-0.5 font-medium">
                No vehicle handover or self-drive return involved.
              </span>
            </div>
          </div> */}

          {/* Status & Fare */}
          <div className="grid grid-cols-2 gap-4 bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
            <div>
              <p className="text-xs text-[#71717A] uppercase font-semibold">
                {isRound ? 'First Trip Status' : 'Transfer Status'}
              </p>
              <div className="mt-1 font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {booking.status ? booking.status.replace(/_/g, ' ') : 'CONFIRMED'}
              </div>
              {isRound && (
                <div className="mt-2 pt-2 border-t border-[#27272A]">
                  <p className="text-xs text-[#71717A] uppercase font-semibold">Return Trip Status</p>
                  <div className="mt-1 font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                    {booking.returnStatus ? booking.returnStatus.replace(/_/g, ' ') : (booking.status || 'CONFIRMED').replace(/_/g, ' ')}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-[#71717A] uppercase font-semibold">Total Fare</p>
              <div className="mt-1 text-lg font-bold text-emerald-400">
                {booking.currency === 'EUR' || !booking.currency ? '€' : booking.currency} {Number(booking.grandTotal || 0).toFixed(2)}
              </div>
              {isRound && (
                <span className="inline-block mt-2 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Round Trip (First & Return)
                </span>
              )}
            </div>
          </div>

          {/* Outbound / First Trip Route */}
          <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isRound ? 'First Trip Route' : 'Transfer Journey'}
              </p>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#FACC15]" />
                {formatDateTime(booking.pickupDateTime)}
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-[#27272A] text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#71717A] block font-medium">Meet & Pick Up Passenger at:</span>
                  <span className="text-white font-medium">{booking.pickupLocation || 'Pickup location'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#71717A] block font-medium">Drive to & Drop Off at:</span>
                  <span className="text-white font-medium">{booking.dropoffLocation || 'Drop-off destination'}</span>
                </div>
              </div>
            </div>

            {booking.flightNumber && (
              <div className="pt-2 border-t border-[#27272A] text-xs flex items-center gap-2 text-blue-400">
                <Plane className="h-3.5 w-3.5" />
                <span>Flight Arrival / Departure: <strong>{booking.flightNumber}</strong></span>
              </div>
            )}
          </div>

          {/* Return Transfer Route if Round Trip */}
          {isRound && (
            <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Return Trip Route
                </p>
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  {formatDateTime(booking.returnDateTime)}
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#27272A] text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#71717A] block font-medium">Meet & Pick Up Passenger at:</span>
                    <span className="text-white font-medium">{booking.dropoffLocation || 'Return pickup location'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#71717A] block font-medium">Drive to & Drop Off at:</span>
                    <span className="text-white font-medium">{booking.pickupLocation || 'Return destination'}</span>
                  </div>
                </div>
              </div>

              {booking.returnFlightNumber && (
                <div className="pt-2 border-t border-[#27272A] text-xs flex items-center gap-2 text-indigo-400">
                  <Plane className="h-3.5 w-3.5" />
                  <span>Return Flight: <strong>{booking.returnFlightNumber}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* ── PASSENGER & CONTACT ─────────────────────────────── */}
          {(() => {
            const parseField = (field: string): string => {
              if (!booking.specialRequests) return '';
              const regex = new RegExp(`${field}\\s*:\\s*([^|]+)`, 'i');
              const match = booking.specialRequests.match(regex);
              return match ? match[1].trim() : '';
            };
            const whatsapp = parseField('WhatsApp') || parseField('Phone');
            const nationality = parseField('Nationality');
            const fullName = booking.leadPassengerName || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Passenger';
            const phone = booking.leadPassengerPhone || booking.user?.phone || booking.user?.phoneNumber || '';
            const email = booking.user?.email || booking.leadPassengerEmail || '';
            const adults = booking.adults || 1;
            const children = booking.children || 0;
            const infants = booking.infants || 0;
            const luggage = (booking.standardLuggage || 0) + (booking.largeLuggage || 0);
            const rows: { icon: string; label: string; value: string }[] = [
              { icon: '👤', label: 'Primary passenger', value: fullName },
              ...(phone ? [{ icon: '📞', label: 'Phone', value: phone }] : []),
              ...(email ? [{ icon: '✉️', label: 'Email', value: email }] : []),
              ...(whatsapp ? [{ icon: '💬', label: 'WhatsApp', value: whatsapp }] : []),
              ...(nationality ? [{ icon: '🌍', label: 'Nationality', value: nationality }] : []),
            ];
            const passengerStr = [
              `${adults} Adult${adults !== 1 ? 's' : ''}`,
              ...(children ? [`${children} Child${children !== 1 ? 'ren' : ''}`] : []),
              ...(infants ? [`${infants} Infant${infants !== 1 ? 's' : ''}`] : []),
            ].join(', ');
            return (
              <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#27272A] flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-[#FACC15]" />
                  <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider">Passenger &amp; Contact</p>
                </div>
                <div className="divide-y divide-[#27272A]">
                  {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <div className="flex items-center gap-2 text-[#71717A] text-xs shrink-0">
                        <span className="text-sm">{row.icon}</span>
                        <span>{row.label}</span>
                      </div>
                      <span className="text-white text-xs font-medium text-right truncate max-w-[55%]" title={row.value}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#27272A] flex gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs bg-[#27272A] text-gray-200 px-3 py-1.5 rounded-full">
                    <User className="h-3 w-3 text-[#FACC15]" /> {passengerStr}
                  </span>
                  {luggage > 0 && (
                    <span className="flex items-center gap-1.5 text-xs bg-[#27272A] text-gray-200 px-3 py-1.5 rounded-full">
                      🧳 {luggage} Bag{luggage !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── FLIGHT & MEET DETAILS ───────────────────────────── */}
          {(() => {
            const parseField = (field: string): string => {
              if (!booking.specialRequests) return '';
              const regex = new RegExp(`${field}\\s*:\\s*([^|]+)`, 'i');
              const match = booking.specialRequests.match(regex);
              return match ? match[1].trim() : '';
            };
            const airline = parseField('Airline');
            const terminal = parseField('Terminal');
            const sign = parseField('Meet & Greet Sign') || parseField('Sign');
            const instructions = parseField('Meet Instructions') || parseField('Meeting Instructions');
            const assistance = parseField('Special Assistance') || parseField('Assistance');
            const hasMeetGreet = !!(sign || instructions || assistance);
            const flightRows = [
              ...(booking.flightNumber ? [{ icon: '🛬', label: 'Incoming flight', value: booking.flightNumber, badge: true, badgeColor: 'text-blue-300 bg-blue-500/15 border-blue-500/30' }] : []),
              ...(booking.returnFlightNumber ? [{ icon: '🛫', label: 'Return flight', value: booking.returnFlightNumber, badge: true, badgeColor: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30' }] : []),
              ...(airline ? [{ icon: '✈️', label: 'Airline', value: airline, badge: false, badgeColor: '' }] : []),
              ...(terminal ? [{ icon: '🏢', label: 'Terminal', value: terminal, badge: false, badgeColor: '' }] : []),
            ];
            if (!flightRows.length && !hasMeetGreet) return null;
            return (
              <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#27272A] flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5 text-[#FACC15]" />
                  <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider">Flight &amp; Meet Details</p>
                </div>
                {/* Flight info rows */}
                {flightRows.length > 0 && (
                  <div className="divide-y divide-[#27272A]">
                    {flightRows.map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
                        <div className="flex items-center gap-2 text-[#71717A] text-xs shrink-0">
                          <span className="text-sm">{row.icon}</span>
                          <span>{row.label}</span>
                        </div>
                        {row.badge ? (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border font-mono ${row.badgeColor}`}>
                            {row.value}
                          </span>
                        ) : (
                          <span className="text-white text-xs font-medium">{row.value}</span>
                        )}
                      </div>
                    ))}
                    {/* Meet & Greet included row */}
                    {hasMeetGreet && (
                      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
                        <div className="flex items-center gap-2 text-[#71717A] text-xs shrink-0">
                          <span className="text-sm">🤝</span>
                          <span>Meet &amp; Greet</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          ✔ Included
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {/* Meet & Greet detail cards */}
                {hasMeetGreet && (
                  <div className="p-3 space-y-2 border-t border-[#27272A]">
                    {sign && (
                      <div className="bg-[#111111] rounded-lg border border-[#27272A] px-3 py-2.5 flex items-start gap-2.5">
                        <span className="text-xl leading-none mt-0.5">🪧</span>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-[#71717A] tracking-wide">Driver Welcome Sign</div>
                          <div className="text-sm text-white font-semibold mt-0.5">&quot;{sign}&quot;</div>
                        </div>
                      </div>
                    )}
                    {instructions && (
                      <div className="bg-[#111111] rounded-lg border border-[#27272A] px-3 py-2.5 flex items-start gap-2.5">
                        <span className="text-xl leading-none mt-0.5">🚶</span>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-[#71717A] tracking-wide">Meeting Instructions</div>
                          <div className="text-xs text-white font-medium mt-0.5">{instructions}</div>
                        </div>
                      </div>
                    )}
                    {assistance && (
                      <div className="bg-[#111111] rounded-lg border border-[#27272A] px-3 py-2.5 flex items-start gap-2.5">
                        <span className="text-xl leading-none mt-0.5">♿</span>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-[#71717A] tracking-wide">Special Assistance &amp; Requirements</div>
                          <div className="text-xs text-white font-medium mt-0.5">{assistance}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── VEHICLE & SUPPLIER DETAILS ──────────────────────── */}
          <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272A] flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-[#FACC15]" />
              <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider">Vehicle &amp; Supplier Details</p>
            </div>
            {/* Assigned Vehicle card */}
            <div className="p-3 space-y-2">
              <div className="bg-[#111111] rounded-lg border border-[#27272A] px-3 py-2.5 flex items-center gap-3">
                <span className="text-2xl">🚐</span>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-[#71717A] tracking-wide">Assigned Vehicle</div>
                  <div className="text-sm text-white font-semibold mt-0.5">
                    {booking.vehicle?.make ? `${booking.vehicle.make} ${booking.vehicle.model || ''}`.trim() : (booking.vehicle?.name || 'Standard Vehicle')}
                  </div>
                  <span className="text-[10px] font-mono bg-[#27272A] px-2 py-0.5 rounded text-gray-300 mt-1 inline-block">
                    {booking.vehicle?.registrationNo || booking.vehicle?.plateNumber || booking.vehicle?.vehicleType || 'N/A'}
                  </span>
                </div>
              </div>
              {/* Assigned Driver & Magic Link Task Details */}
              <div className="bg-[#111111] rounded-lg border border-[#27272A] p-3 space-y-3">
                <div className="flex items-center gap-2 border-b border-[#27272A] pb-2">
                  <UserCheck className="h-4 w-4 text-[#FACC15]" />
                  <span className="text-xs uppercase font-bold text-[#FACC15] tracking-wider">
                    Assigned Driver &amp; Task Details
                  </span>
                </div>

                {(() => {
                  const isRound = booking.transferType === 'ROUND_TRIP';
                  const outboundTask =
                    booking.tasks?.find((t: any) => t.tripLeg === 'OUTBOUND') ||
                    (!isRound && booking.tasks?.length ? booking.tasks[0] : null);
                  const returnTask = booking.tasks?.find((t: any) => t.tripLeg === 'RETURN');

                  const renderTaskCard = (title: string, task: any, driver: any) => (
                    <div className="bg-[#18181B] rounded-lg border border-[#27272A] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {title}
                        </span>
                        {task ? (
                          task.selfAssigned ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              Self Assigned (Supplier)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Worker Assigned
                            </span>
                          )
                        ) : driver ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Fleet Driver
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#27272A] text-gray-400 border border-[#3F3F46]">
                            {booking.status === 'PENDING_APPROVAL' || booking.status === 'PENDING'
                              ? 'Pending Confirmation'
                              : 'Unassigned'}
                          </span>
                        )}
                      </div>

                      {task ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-300">
                            <span className="text-gray-500">Assigned Driver:</span>
                            <span className="font-semibold text-white">
                              {task.assignedToName} {task.selfAssigned && '(Supplier)'}
                            </span>
                          </div>
                          {task.assignedToEmail && (
                            <div className="flex justify-between text-gray-300">
                              <span className="text-gray-500">Email:</span>
                              <span className="font-mono text-gray-200">{task.assignedToEmail}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-300">
                            <span className="text-gray-500">Assigned At:</span>
                            <span className="text-gray-300">{formatDateTime(task.createdAt)}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span className="text-gray-500">Task Status:</span>
                            <span className={task.isUsed ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                              {task.isUsed ? '✓ Completed' : 'Active (Magic Link Sent)'}
                            </span>
                          </div>
                        </div>
                      ) : driver ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-gray-300">
                            <span className="text-gray-500">Driver Name:</span>
                            <span className="font-semibold text-white">{driver.firstName} {driver.lastName}</span>
                          </div>
                          {driver.phone && (
                            <div className="flex justify-between text-gray-300">
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-gray-200">{driver.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          {booking.status === 'PENDING_APPROVAL' || booking.status === 'PENDING'
                            ? 'Transfer request is pending confirmation. Driver can be assigned once confirmed.'
                            : 'No worker or driver has been assigned to this trip yet.'}
                        </div>
                      )}
                    </div>
                  );

                  if (isRound) {
                    const isOutboundCompleted = booking.status === 'COMPLETED';
                    return (
                      <div className="space-y-2">
                        {renderTaskCard('First Trip', outboundTask, assignedDriver)}
                        {isOutboundCompleted || returnTask ? (
                          renderTaskCard('Return Trip', returnTask, null)
                        ) : (
                          <div className="rounded-lg border border-[#27272A] bg-[#111111] p-3 text-xs text-gray-400 italic">
                            <span className="font-semibold text-indigo-400 block mb-1">Return Trip:</span>
                            Driver assignment will unlock after the first trip is completed.
                          </div>
                        )}
                      </div>
                    );
                  }

                  return renderTaskCard('Transfer Trip', outboundTask, assignedDriver);
                })()}
              </div>
              {/* Supplier Partner */}
              {(booking.supplier?.businessName || booking.supplier?.name) && (
                <div className="bg-[#111111] rounded-lg border border-[#27272A] px-3 py-2.5 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-[#71717A] tracking-wide">Supplier Partner</div>
                    <div className="text-sm text-white font-semibold mt-0.5">
                      {booking.supplier?.businessName || booking.supplier?.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#27272A] pt-4 mt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#27272A] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F3F46] transition-colors"
          >
            Close
          </button>

          {onStatusUpdate && (
            <div className="flex items-center gap-2 flex-wrap">
              {booking.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => { onStatusUpdate(booking.id, 'CONFIRMED'); onClose(); }}
                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    Accept Transfer
                  </button>
                  <button
                    onClick={() => { onStatusUpdate(booking.id, 'CANCELLED'); onClose(); }}
                    className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Decline Request
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
