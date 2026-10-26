'use client';

import { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Plane,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ShieldCheck,
  KeyRound,
  Clock,
  ArrowRight,
  Luggage,
  Users,
  Sparkles,
  Accessibility,
  Globe,
  MessageSquare,
} from 'lucide-react';

interface Props {
  token: string;
}

function parseSpecialRequests(specialRequests?: string | null) {
  const parsed: Record<string, string> = {};
  const extraNotes: string[] = [];

  if (specialRequests && specialRequests.trim().length > 0) {
    const parts = specialRequests.split(/\s*\|\s*|\n+/);
    for (const rawPart of parts) {
      const part = rawPart.trim();
      if (!part) continue;
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        const key = part.substring(0, colonIdx).trim().toLowerCase();
        const val = part.substring(colonIdx + 1).trim();
        parsed[key] = val;
      } else {
        extraNotes.push(part);
      }
    }
  }

  const findVal = (keys: string[]) => {
    for (const k of keys) {
      const v = parsed[k.toLowerCase()];
      if (v && v.length > 0) return v;
    }
    return null;
  };

  return {
    airline: findVal(['Airline', 'Flight Airline']),
    terminal: findVal(['Terminal', 'Arrival Terminal', 'Gate']),
    nationality: findVal(['Nationality', 'Country']),
    whatsApp: findVal(['WhatsApp', 'Whatsapp Number', 'WhatsApp Phone']),
    welcomeSign: findVal([
      'Meet & Greet Sign',
      'Welcome Sign',
      'Driver Welcome Sign',
      'Driver Sign',
      'Sign Name',
      'Sign',
    ]),
    meetInstructions: findVal([
      'Meet Instructions',
      'Meeting Instructions',
      'Instructions',
      'Pickup Instructions',
    ]),
    specialAssistance: findVal([
      'Special Assistance',
      'Special Assistance & Requirements',
      'Assistance',
      'Special Requests',
      'Child Seat',
    ]),
    extraNotes: extraNotes.length > 0 ? extraNotes.join('\n') : null,
  };
}

export function AirportTransferTask({ token }: Props) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/proxy/airport-transfers/public/task/${token}`);
      const data = await res.json();
      if (!res.ok || data.statusCode >= 400) {
        setError(data.message || 'Invalid or expired task link.');
      } else {
        setTask(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to transfer service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [token]);

  const handleStart = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proxy/airport-transfers/public/task/${token}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start journey');
      setActionSuccess('Journey started! Passenger has been notified.');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchTask();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReachedPickup = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proxy/airport-transfers/public/task/${token}/reached-pickup`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update pickup status');
      setActionSuccess('Status updated: Arrived at pickup! 4-digit PIN sent to passenger.');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchTask();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.trim().length !== 4) {
      setActionError('Please enter a valid 4-digit PIN provided by the passenger.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proxy/airport-transfers/public/task/${token}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid PIN code');
      setActionSuccess('PIN verified successfully! Passenger boarded, ride is underway.');
      setPinInput('');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchTask();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proxy/airport-transfers/public/task/${token}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete transfer');
      setActionSuccess('Transfer marked as COMPLETED! Great job.');
      await fetchTask();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading transfer task...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-[#111111] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Expired or Invalid</h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-4">{error || 'This task link has expired or has already been completed.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const booking = task.booking;
  const vehicle = booking?.vehicle;
  const isReturnLeg = task.tripLeg === 'RETURN';
  const isRoundTrip = booking?.transferType === 'ROUND_TRIP';
  const currentStatus = isReturnLeg ? (booking?.returnStatus || 'CONFIRMED') : (booking?.status || 'CONFIRMED');
  const isCompleted = currentStatus === 'COMPLETED' || task.isUsed;

  const legPickupLocation = isReturnLeg ? booking?.dropoffLocation : booking?.pickupLocation;
  const legDropoffLocation = isReturnLeg ? booking?.pickupLocation : booking?.dropoffLocation;
  const legDateTime = isReturnLeg ? (booking?.returnDateTime || booking?.pickupDateTime) : booking?.pickupDateTime;
  const legFlight = isReturnLeg ? booking?.returnFlightNumber : booking?.flightNumber;

  const special = parseSpecialRequests(booking?.specialRequests);

  const adults = Number(booking?.adults ?? 1);
  const children = Number(booking?.children ?? 0);
  const infants = Number(booking?.infants ?? 0);
  const totalPassengers = adults + children + infants;

  const passengerParts: string[] = [];
  if (adults > 0) passengerParts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
  if (children > 0) passengerParts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
  if (infants > 0) passengerParts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`);
  const passengerSummary = passengerParts.length > 0 ? passengerParts.join(', ') : `${totalPassengers} Persons`;

  const standardLuggage = Number(booking?.standardLuggage ?? 0);
  const largeLuggage = Number(booking?.largeLuggage ?? 0);
  const totalBags = standardLuggage + largeLuggage;

  const displayPhone = booking?.leadPassengerPhone || booking?.user?.phone || '';
  const displayEmail = booking?.leadPassengerEmail || booking?.user?.email || '';
  const displayWhatsApp = special.whatsApp || displayPhone;
  const displayNationality = special.nationality || 'Maltese';

  const fmtDateTime = (dtStr?: string) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dtStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-3 sm:p-6 pb-20 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${isReturnLeg ? 'bg-indigo-500/10 text-indigo-400' : 'bg-[#FACC15]/10 text-[#FACC15]'}`}>
              <Plane className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Airport Transfer Service
                </span>
                {isRoundTrip ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isReturnLeg ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'}`}>
                    {isReturnLeg ? '🛬 RETURN TRIP' : '🛫 FIRST TRIP'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">
                    🚗 ONE-WAY TRIP
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                Ref: {booking?.bookingReference}
              </h1>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : currentStatus === 'ARRIVED_AT_AIRPORT'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse'
                : currentStatus === 'EN_ROUTE_TO_PICKUP'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}
          >
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-gray-400">
          <span>Assigned to: <strong className="text-white">{task.assignedToName}</strong></span>
          {task.selfAssigned && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Supplier Self-Assign
            </span>
          )}
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Interactive Flow Controls Based on Status */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl">
        <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#FACC15]" /> Action Required
        </h2>

        {isCompleted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isReturnLeg
                ? 'Return Trip Completed!'
                : isRoundTrip
                  ? 'First Trip Completed!'
                  : 'Transfer Completed!'}
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
              Passenger has been successfully dropped off. All transfer tasks are finished.
            </p>

            {/* Ride Completion & Safely Close Page Card */}
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ride Complete & Securely Synced</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Thank you for your service! All ride records, PIN verifications, and status updates have been saved. <strong>You can now safely close this browser window or tab.</strong>
              </p>
              <div className="pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-300/80">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  This magic link will safely expire in 10 minutes.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.close();
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>

            {isRoundTrip && !isReturnLeg && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-left text-xs text-blue-300">
                <span className="font-semibold text-white block mb-1">🔁 Round Trip - Return Trip Scheduled</span>
                The return trip is scheduled for <strong className="text-white">{fmtDateTime(booking?.returnDateTime)}</strong>. The supplier or driver will receive a dedicated assignment for the return pickup.
              </div>
            )}
          </div>
        ) : currentStatus === 'PENDING_APPROVAL' || currentStatus === 'CONFIRMED' || currentStatus === 'DRIVER_ASSIGNED' ? (
          <div>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              Ready to begin? Click below when you start driving to the passenger pickup point.
            </p>
            <button
              onClick={handleStart}
              disabled={actionLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FACC15]/20 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              {actionLoading ? 'Starting Journey...' : 'Start Journey (Driver En Route)'}
            </button>
          </div>
        ) : currentStatus === 'EN_ROUTE_TO_PICKUP' ? (
          <div>
            <p className="text-xs text-gray-300 mb-3 leading-relaxed">
              Drive safely to the pickup location. Once you arrive at the designated spot or airport terminal, click below.
            </p>
            <button
              onClick={handleReachedPickup}
              disabled={actionLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              {actionLoading ? 'Updating Status...' : 'Reached at Pickup Location'}
            </button>
          </div>
        ) : currentStatus === 'ARRIVED_AT_AIRPORT' ? (
          <div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-3 text-xs text-purple-300 leading-relaxed">
              <strong className="text-white block mb-0.5">Passenger Verification Required</strong>
              Ask the passenger for their <strong>4-digit PIN</strong> displayed inside their GoZolt user app.
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Enter 4-Digit Passenger PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#0A0A0A] border border-[#27272A] text-lg font-mono font-bold tracking-widest text-center text-[#FACC15] outline-none focus:border-[#FACC15] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading || pinInput.length !== 4}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-40"
              >
                {actionLoading ? 'Verifying PIN...' : '✅ Verify PIN & Start Ride'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-3 text-xs text-cyan-300 leading-relaxed">
              <strong className="text-white block mb-0.5">Ride in Progress</strong>
              Passenger has boarded. Driving to destination. Click below once passenger has arrived safely.
            </div>

            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {actionLoading ? 'Completing Transfer...' : 'Complete Transfer (Drop-off Done)'}
            </button>
          </div>
        )}
      </div>

      {/* Booked Passengers & Luggage (Matches User App Exactly) */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="p-3.5 rounded-2xl bg-[#111111] border border-[#27272A] shadow-xl">
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#FACC15]" /> Booked Passengers
          </span>
          <p className="font-bold text-white text-xs sm:text-sm">
            {passengerSummary}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">
            Total: {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111111] border border-[#27272A] shadow-xl">
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-[#FACC15]" /> Booked Luggage
          </span>
          <p className="font-bold text-white text-xs sm:text-sm">
            {totalBags} {totalBags === 1 ? 'Bag' : 'Bags'}
          </p>
          <span className="text-[10px] text-gray-500 block mt-1">
            {standardLuggage > 0 || largeLuggage > 0
              ? `${standardLuggage} Std${largeLuggage > 0 ? ` · ${largeLuggage} Large` : ''}`
              : 'Total luggage pieces'}
          </span>
        </div>
      </div>

      {/* Vehicle Details Card */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl">
        <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-[#FACC15]" /> Assigned Vehicle Details
        </h2>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
          {vehicle?.images && vehicle.images[0] ? (
            <img
              src={vehicle.images[0]}
              alt="Vehicle"
              className="w-16 h-12 object-cover rounded-lg border border-[#27272A]"
            />
          ) : (
            <div className="w-16 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
              <Car className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              {vehicle?.make} {vehicle?.model}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-xs font-bold text-[#FACC15]">
                {vehicle?.registrationNo || 'No Plate'}
              </span>
              <span className="text-[11px] text-gray-400">
                {vehicle?.vehicleType?.replace(/_/g, ' ') || 'Sedan'}
              </span>
              <span className="text-[10px] text-gray-500">
                (Vehicle Max Cap: {vehicle?.passengerCapacity || 4}p · {vehicle?.luggageCapacity || 3}b)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip & Route Details Card */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl">
        <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#FACC15]" /> Route & Schedule
        </h2>

        <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-[#27272A]">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -left-[21px] top-1" />
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              {isReturnLeg ? 'Return Pickup Location' : 'Pickup Location'}
            </span>
            <p className="text-xs font-medium text-white mt-0.5 leading-snug">{legPickupLocation || 'Pickup Location'}</p>
          </div>

          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] absolute -left-[21px] top-1" />
            <span className="text-[10px] uppercase font-bold text-[#FACC15] block">
              {isReturnLeg ? 'Return Drop-off Destination' : 'Drop-off Destination'}
            </span>
            <p className="text-xs font-medium text-white mt-0.5 leading-snug">{legDropoffLocation || 'Drop-off Destination'}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#27272A] grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Pickup Date & Time</span>
            <span className="font-semibold text-white mt-0.5 block text-[11px]">
              {fmtDateTime(legDateTime)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
            <span className="text-[10px] text-gray-500 block uppercase font-medium">Flight NUMBER</span>
            <span className="font-semibold text-white mt-0.5 block text-[11px] text-[#FACC15]">
              {legFlight ? `${legFlight}` : 'No flight provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Flight & Meet Details Card (Structured) */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-[#FACC15]" /> Flight & Meet Details
          </h2>
          {vehicle?.isMeetAndGreetIncluded !== false && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ✓ Meet & Greet Included
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {booking?.flightNumber && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span>🛬</span> Incoming Flight
              </span>
              <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {booking.flightNumber}
              </span>
            </div>
          )}

          {booking?.returnFlightNumber && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span>🛫</span> Return Flight
              </span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {booking.returnFlightNumber}
              </span>
            </div>
          )}

          {special.airline && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400">Airline</span>
              <span className="font-semibold text-white">{special.airline}</span>
            </div>
          )}

          {special.terminal && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400">Terminal / Gate</span>
              <span className="font-semibold text-white">{special.terminal}</span>
            </div>
          )}

          {/* Driver Welcome Sign Card */}
          {special.welcomeSign && (
            <div className="p-3.5 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/40 mt-3">
              <span className="text-[10px] text-[#FACC15] uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" /> Driver Welcome Sign
              </span>
              <p className="text-base sm:text-md font-bold text-white font-mono tracking-wide">
                &ldquo;{special.welcomeSign.replace(/^"+|"+$/g, '')}&rdquo;
              </p>
              <span className="text-[10px] text-gray-400 block mt-1">
                Display this sign when welcoming the passenger at the airport arrival area
              </span>
            </div>
          )}

          {/* Meeting Instructions Card */}
          {special.meetInstructions && (
            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] mt-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" /> Meeting Instructions
              </span>
              <p className="text-xs text-gray-200">
                {special.meetInstructions}
              </p>
            </div>
          )}

          {/* Special Assistance Card */}
          {special.specialAssistance && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mt-2">
              <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-blue-400" /> Special Assistance & Requirements
              </span>
              <p className="text-xs text-blue-100 font-medium">
                {special.specialAssistance}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Passenger Contact Card */}
      <div className="bg-[#111111] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl">
        <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#FACC15]" /> Passenger & Contact
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
            <span className="text-gray-400">Primary Passenger</span>
            <span className="font-bold text-white">{booking?.leadPassengerName}</span>
          </div>

          {displayPhone && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-500" /> Phone
              </span>
              <a
                href={`tel:${displayPhone}`}
                className="font-bold text-[#FACC15] hover:underline"
              >
                {displayPhone}
              </a>
            </div>
          )}

          {displayEmail && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500" /> Email
              </span>
              <a
                href={`mailto:${displayEmail}`}
                className="text-gray-300 hover:underline truncate max-w-[60%]"
              >
                {displayEmail}
              </a>
            </div>
          )}

          {displayWhatsApp && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
              </span>
              <a
                href={`https://wa.me/${displayWhatsApp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                {displayWhatsApp}
              </a>
            </div>
          )}

          {displayNationality && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-500" /> Nationality
              </span>
              <span className="font-semibold text-white">{displayNationality}</span>
            </div>
          )}

          {special.extraNotes && (
            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] mt-2">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">
                Additional Notes
              </span>
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                {special.extraNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
