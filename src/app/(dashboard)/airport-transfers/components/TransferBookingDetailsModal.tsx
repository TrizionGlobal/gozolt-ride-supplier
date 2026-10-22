import { useState, useEffect } from 'react';
import { X, Plane, Clock, User, Phone, MapPin, Car, CheckCircle, ShieldCheck, AlertCircle, ArrowRight, Sparkles, Navigation, UserCheck, UserPlus } from 'lucide-react';
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
      toast.success(`Chauffeur ${chosen?.firstName || ''} assigned successfully`);
      if (onStatusUpdate) {
        onStatusUpdate(booking.id, booking.status === 'CONFIRMED' ? 'DRIVER_ASSIGNED' : booking.status);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign chauffeur');
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
          {/* Chauffeur Service Notice */}
          <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] flex items-start gap-2.5">
            <Car className="h-4 w-4 text-[#FACC15] shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <span className="font-semibold text-white">Chauffeured Passenger Transport: </span>
              The chauffeur meets the passenger at the pickup location, assists with luggage, drives them to the destination, and completes drop-off.
              <span className="text-[#A1A1AA] block mt-0.5 font-medium">
                No vehicle handover or self-drive return involved.
              </span>
            </div>
          </div>

          {/* Status & Fare */}
          <div className="grid grid-cols-2 gap-4 bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
            <div>
              <p className="text-xs text-[#71717A] uppercase font-semibold">Transfer Status</p>
              <div className="mt-1 font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FACC15] inline-block" />
                {booking.status ? booking.status.replace(/_/g, ' ') : 'CONFIRMED'}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#71717A] uppercase font-semibold">Total Fare</p>
              <div className="mt-1 text-lg font-bold text-emerald-400">
                {booking.currency === 'EUR' || !booking.currency ? '€' : booking.currency} {Number(booking.grandTotal || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Outbound Transfer Route */}
          <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isRound ? 'Trip 1: Outbound Transfer' : 'Transfer Journey'}
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
                  Trip 2: Return Transfer
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

          {/* Passenger & Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Passenger */}
            <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-2">
              <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider">Passenger Information</p>
              <div>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-400" />
                  {booking.leadPassengerName || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Passenger'}
                </p>
                <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 mt-1">
                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                  {booking.leadPassengerPhone || booking.user?.phone || 'No phone'}
                </p>
                {booking.user?.email && (
                  <p className="text-xs text-[#71717A] mt-0.5">{booking.user.email}</p>
                )}
                <div className="text-xs text-gray-300 mt-2 bg-[#27272A] px-2.5 py-1 rounded inline-block">
                  {booking.adults || 1} Adult{(booking.adults || 1) === 1 ? '' : 's'}
                  {booking.children ? ` · ${booking.children} Children` : ''}
                  {booking.infants ? ` · ${booking.infants} Infants` : ''}
                  {(booking.standardLuggage || booking.largeLuggage) ? ` · ${(booking.standardLuggage || 0) + (booking.largeLuggage || 0)} Luggage` : ''}
                </div>
              </div>
            </div>

            {/* Vehicle & Chauffeur */}
            <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-2">
              <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider">Assigned Vehicle</p>
              <div>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5 text-blue-400" />
                  {booking.vehicle?.make ? `${booking.vehicle.make} ${booking.vehicle.model}` : (booking.vehicle?.name || 'Standard Vehicle')}
                </p>
                <div className="mt-1 flex gap-2">
                  <span className="text-[10px] font-mono bg-[#27272A] px-2 py-0.5 rounded text-gray-300">
                    {booking.vehicle?.registrationNo || booking.vehicle?.vehicleType || 'Plate: N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {assignedDriver ? (
                      <span className="text-emerald-400 font-medium">
                        Chauffeur: {assignedDriver.firstName} {assignedDriver.lastName}
                        {assignedDriver.phone ? ` (${assignedDriver.phone})` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400">Chauffeur: Unassigned</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDriverSelectOpen(!isDriverSelectOpen)}
                      className="text-xs text-[#FACC15] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {assignedDriver ? 'Change' : 'Assign'} Chauffeur
                    </button>
                  </div>

                  {isDriverSelectOpen && (
                    <div className="mt-2 p-2.5 bg-[#27272A] rounded-lg border border-[#3F3F46] space-y-2">
                      <p className="text-[11px] text-gray-300 font-medium">Select a driver from your fleet:</p>
                      {drivers.length === 0 ? (
                        <p className="text-[11px] text-gray-400">No active drivers found.</p>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <select
                            disabled={isAssigning}
                            onChange={(e) => {
                              if (e.target.value) handleAssignDriver(e.target.value);
                            }}
                            defaultValue={assignedDriver?.id || ''}
                            className="bg-[#18181B] border border-[#3F3F46] text-white text-xs rounded px-2.5 py-1.5 flex-1 outline-none focus:border-[#FACC15]"
                          >
                            <option value="">-- Choose Chauffeur --</option>
                            {drivers.map((d: any) => (
                              <option key={d.id} value={d.id}>
                                {d.firstName} {d.lastName} {d.phone ? `(${d.phone})` : ''}
                              </option>
                            ))}
                          </select>
                          {isAssigning && (
                            <span className="text-[11px] text-amber-400 animate-pulse font-medium">Assigning...</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions & Special Requests */}
          {booking.specialRequests && (
            <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-1">
              <p className="text-xs text-[#FACC15] uppercase font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Meet & Greet / Passenger Requests
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">{booking.specialRequests}</p>
            </div>
          )}
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

              {(booking.status === 'CONFIRMED' || booking.status === 'DRIVER_ASSIGNED') && (
                <button
                  onClick={() => { onStatusUpdate(booking.id, 'EN_ROUTE_TO_PICKUP'); onClose(); }}
                  className="rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="h-3.5 w-3.5" /> Chauffeur En Route to Pickup
                </button>
              )}

              {booking.status === 'EN_ROUTE_TO_PICKUP' && (
                <button
                  onClick={() => { onStatusUpdate(booking.id, 'ARRIVED_AT_AIRPORT'); onClose(); }}
                  className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="h-3.5 w-3.5" /> Arrived at Pickup (Meet Passenger)
                </button>
              )}

              {booking.status === 'ARRIVED_AT_AIRPORT' && (
                <button
                  onClick={() => { onStatusUpdate(booking.id, 'PASSENGER_MET'); onClose(); }}
                  className="rounded-lg bg-purple-500/20 border border-purple-500/30 px-4 py-2 text-xs font-bold text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Passenger Met & Boarded Vehicle
                </button>
              )}

              {booking.status === 'PASSENGER_MET' && (
                <>
                  <button
                    onClick={() => { onStatusUpdate(booking.id, 'IN_TRANSIT'); onClose(); }}
                    className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-3 py-2 text-xs font-bold text-cyan-400 hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <Car className="h-3.5 w-3.5" /> In Transit to Drop-off
                  </button>
                  <button
                    onClick={() => { onStatusUpdate(booking.id, 'COMPLETED'); onClose(); }}
                    className="rounded-lg bg-[#FACC15] px-4 py-2 text-xs font-bold text-black hover:bg-[#EAB308] transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Complete Drop-off at Destination
                  </button>
                </>
              )}

              {booking.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => { onStatusUpdate(booking.id, 'COMPLETED'); onClose(); }}
                  className="rounded-lg bg-[#FACC15] px-4 py-2 text-xs font-bold text-black hover:bg-[#EAB308] transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Complete Drop-off at Destination
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
