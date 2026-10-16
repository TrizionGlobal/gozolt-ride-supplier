'use client';

import { useState, useEffect } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  DollarSign, 
  QrCode, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });
import { getExpertVisitName, getQuickServiceHourlyRate } from '@/lib/quick-services-pricing';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { io } from 'socket.io-client';

const isInternalFeatureKey = (rawKey: string): boolean => {
  const norm = rawKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return [
    'isvalidated',
    'validationpin',
    'beautytreatmentssubtotal',
    'startedat',
    'endedat',
    'finalhourlycost',
    'finaldurationhrs',
    'durationhours',
    'durationminutes',
    'hourlyrate',
    'serviceamount',
    'alreadypaid',
    'upfrontfee',
    'materialcost',
    'issuedescription',
    'requirements',
    'subtotal',
    'tax',
    'total',
  ].includes(norm);
};

const formatFeatureKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const formatFeatureVal = (val: any): string => {
  if (val == null) return '';
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  }
  if (Array.isArray(val)) {
    return val
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          const title = [item.Brand, item.Model].filter(Boolean).join(' ') || item.Name || item.Title;
          const sub = [
            item.Type ? `(${item.Type})` : null,
            item.Issue || (Array.isArray(item.Issues) ? item.Issues.join(', ') : item.Issues),
          ].filter(Boolean);
          const combined = [title, ...sub].filter(Boolean).join(' - ');
          return combined || Object.entries(item).filter(([_, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`).join(' ');
        }
        return String(item);
      })
      .join(', ');
  }
  if (typeof val === 'object' && val !== null) {
    const title = [val.Brand, val.Model].filter(Boolean).join(' ') || val.Name || val.Title;
    const sub = [
      val.Type ? `(${val.Type})` : null,
      val.Issue || (Array.isArray(val.Issues) ? val.Issues.join(', ') : val.Issues),
    ].filter(Boolean);
    const combined = [title, ...sub].filter(Boolean).join(' - ');
    return combined || Object.entries(val).filter(([_, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`).join(', ');
  }
  const n = Number(val);
  if (!isNaN(n) && String(val).includes('.')) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  }
  return String(val);
};

const formatTime = (dateStr?: string | Date) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return 'N/A';
  }
};

export function QuickServiceTask({ token }: { token: string }) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'VERIFY' | 'SCAN' | 'ACTIONS' | 'SUCCESS'>('VERIFY');
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraSupport, setHasCameraSupport] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<{ method: string, url?: string } | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [cashSubmitting, setCashSubmitting] = useState(false);

  const [finalInvoice, setFinalInvoice] = useState<{ 
    hours: number; 
    hourlyRate: number; 
    serviceAmount?: number;
    finalAmount: number; 
    remainingToPay?: number; 
    alreadyPaid?: number;
    upfrontFee?: number;
    materialCost?: number;
    startedAt?: string;
    endedAt?: string;
    durationMinutes?: number;
  } | null>(null);

  useEffect(() => {
    setHasCameraSupport(typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);
  }, []);

  useEffect(() => {
    if (!task?.booking?.id) return;
    const socket = io((process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000') + '/public', {
      path: '/socket.io/',
      transports: ['websocket'],
    });

    socket.emit('subscribe', { type: 'quick-service', bookingId: task.booking.id });

    socket.on('quick-service:payment-method-selected', (data: any) => {
      setSelectedPayment({ method: data.method, url: data.checkoutUrl });
    });

    socket.on('quick-service:payment-success', () => {
      setPaymentConfirmed(true);
      setTask((prev: any) => prev ? { ...prev, booking: { ...prev.booking, status: 'COMPLETED', paymentStatus: 'PAID' } } : prev);
    });

    socket.on('quick-service:completed', () => {
      setPaymentConfirmed(true);
      setTask((prev: any) => prev ? { ...prev, booking: { ...prev.booking, status: 'COMPLETED', paymentStatus: 'PAID' } } : prev);
    });

    return () => {
      socket.disconnect();
    };
  }, [task?.booking?.id]);

  useEffect(() => {
    fetch(`/api/proxy/quick-services/public/task/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.statusCode && data.statusCode !== 200) {
          setError(data.message || 'Invalid or expired link');
        } else {
          setTask(data);
          if (data.booking?.paymentMethodType) {
            setSelectedPayment({ 
              method: data.booking.paymentMethodType, 
              url: data.booking.paymentMethodType === 'qrcode' ? data.booking.paymentMethodId : undefined 
            });
          }
          if (data.booking?.status === 'COMPLETED' && data.booking?.paymentStatus === 'PAID') {
            setPaymentConfirmed(true);
          }
          
          if (data.isUsed || data.booking?.status === 'AWAITING_PAYMENT' || data.booking?.status === 'COMPLETED') {
            setStep('SUCCESS');
            if (data.booking) {
              const upfront = Number(data.booking.upfrontFee || 0);
              const material = Number(data.booking.materialCost || 0);
              const alreadyPaid = upfront + material;
              const total = Number(data.booking.totalAmount || 0);
              const opts = (typeof data.booking.options === 'string' ? JSON.parse(data.booking.options || '{}') : data.booking.options) || {};
              const hourly = Number(opts.hourlyRate || getQuickServiceHourlyRate(data.booking.serviceTitle));
              const hrs = Math.max(1, Math.ceil(Number(opts.durationHours || opts.finalDurationHrs || 1)));
              const serviceAmt = Number(opts.serviceAmount || opts.finalHourlyCost || (hrs * hourly));
              
              setFinalInvoice({
                hours: hrs,
                hourlyRate: hourly,
                serviceAmount: serviceAmt,
                finalAmount: total || (alreadyPaid + serviceAmt),
                remainingToPay: serviceAmt,
                alreadyPaid: alreadyPaid,
                upfrontFee: upfront,
                materialCost: material,
                startedAt: opts.startedAt,
                endedAt: opts.endedAt,
                durationMinutes: opts.durationMinutes,
              });
            }
          } else if (data.booking?.status === 'IN_PROGRESS' || data.booking?.options?.isValidated) {
            setStep('ACTIONS');
          } else {
            setStep('SCAN');
          }
        }
      })
      .catch(() => setError('Failed to load task'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleScan = async (result: string) => {
    if (!result || !result.trim()) return;
    setVerifyingPin(true);
    try {
      const res = await fetch(`/api/proxy/quick-services/public/task/${token}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: result }),
      });
      if (res.ok) {
        setScanStatus('SUCCESS');
        setTask({ ...task, booking: { ...task.booking, options: { ...task.booking.options, isValidated: true } } });
        setTimeout(() => setStep('ACTIONS'), 1500);
      } else {
        setScanStatus('FAILED');
        setTimeout(() => setScanStatus('IDLE'), 2000);
      }
    } catch {
      setScanStatus('FAILED');
      setTimeout(() => setScanStatus('IDLE'), 2000);
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/proxy/quick-services/public/task/${token}/start`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTask({ 
          ...task, 
          booking: { 
            ...task.booking, 
            status: 'IN_PROGRESS',
            options: {
              ...(task.booking.options || {}),
              startedAt: new Date().toISOString()
            }
          } 
        });
      } else {
        alert(data.message || 'Failed to start work');
      }
    } catch {
      alert('Error starting work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndWork = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/proxy/quick-services/public/task/${token}/complete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        const upfront = Number(data.upfrontFee || task.booking.upfrontFee || 0);
        const material = Number(data.materialCost || task.booking.materialCost || 0);
        const alreadyPaid = data.alreadyPaid ?? (upfront + material);
        const hourlyRate = data.hourlyRate || getQuickServiceHourlyRate(task.booking.serviceTitle);
        const hours = Math.max(1, Math.ceil(Number(data.hours || 1)));
        const serviceAmount = data.serviceAmount ?? (hours * hourlyRate);

        setFinalInvoice({ 
          hours, 
          hourlyRate, 
          serviceAmount,
          finalAmount: data.totalAmount ?? (alreadyPaid + serviceAmount), 
          remainingToPay: data.remainingToPay ?? serviceAmount, 
          alreadyPaid,
          upfrontFee: upfront,
          materialCost: material,
          startedAt: data.startedAt || task.booking.options?.startedAt,
          endedAt: data.endedAt || new Date().toISOString(),
          durationMinutes: data.durationMinutes
        });
        setTask({
          ...task,
          booking: {
            ...task.booking,
            status: 'AWAITING_PAYMENT',
            options: {
              ...(task.booking.options || {}),
              startedAt: data.startedAt || task.booking.options?.startedAt,
              endedAt: data.endedAt || new Date().toISOString(),
              durationHours: hours,
              finalDurationHrs: hours,
              serviceAmount,
              finalHourlyCost: serviceAmount
            }
          }
        });
        setStep('SUCCESS');
      } else {
        alert(data.message || 'Failed to end work');
      }
    } catch {
      alert('Error ending work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCash = async () => {
    setCashSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      let res = await fetch(`/api/proxy/quick-services/public/task/${token}/confirm-cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectedAmount: finalInvoice?.remainingToPay || finalInvoice?.serviceAmount })
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/v1/quick-services/public/task/${token}/confirm-cash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectedAmount: finalInvoice?.remainingToPay || finalInvoice?.serviceAmount })
        });
      }
      if (!res.ok) throw new Error('Failed to confirm cash');
      setPaymentConfirmed(true);
      setTask((prev: any) => prev ? { ...prev, booking: { ...prev.booking, status: 'COMPLETED', paymentStatus: 'PAID' } } : prev);
    } catch (err: any) {
      alert('Error confirming cash payment: ' + (err?.message || 'Please retry'));
    } finally {
      setCashSubmitting(false);
    }
  };

  if (loading && step === 'VERIFY') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="w-10 h-10 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Verifying Quick Service Link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Link Expired or Invalid</h1>
        <p className="text-gray-400 text-sm max-w-sm">{error}</p>
      </div>
    );
  }

  const booking = task?.booking;
  let features: Record<string, any> = {};
  let addOns: any[] = [];
  let attachedPhotos: string[] = [];

  if (booking) {
    try {
      if (typeof booking.options === 'string') features = JSON.parse(booking.options);
      else if (booking.options && typeof booking.options === 'object') features = booking.options;
    } catch {}

    try {
      if (typeof booking.addOns === 'string') addOns = JSON.parse(booking.addOns);
      else if (Array.isArray(booking.addOns)) addOns = booking.addOns;
    } catch {}

    attachedPhotos = booking.images || booking.attachments || [];
  }

  const displayFeatures = Object.entries(features).filter(
    ([key, val]) => !isInternalFeatureKey(key) && val != null && String(val).trim() !== ''
  );

  const status = booking?.status?.toUpperCase() || 'ASSIGNED';
  const displayStatus = 
    status === 'IN_PROGRESS' ? 'In Progress' :
    status === 'AWAITING_PAYMENT' ? 'Awaiting Payment' :
    status === 'COMPLETED' ? 'Completed' :
    status === 'CANCELLED' ? 'Cancelled' : 'Assigned';

  const startedAtTime = finalInvoice?.startedAt || features.startedAt;
  const endedAtTime = finalInvoice?.endedAt || features.endedAt;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 max-w-md mx-auto pb-12 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">GZ Quick Service</h1>
            {booking?.id && (
              <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-mono">
                #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Assigned to: <span className="text-[#FACC15] font-medium">{task?.worker?.name || 'Worker'}</span></p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
          status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
          status === 'AWAITING_PAYMENT' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
          status === 'IN_PROGRESS' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse' :
          'bg-purple-500/15 text-purple-400 border border-purple-500/30'
        }`}>
          {displayStatus}
        </span>
      </div>

      {/* Main Service Card */}
      {booking && (
        <div className="space-y-4">
          <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 flex gap-3.5 items-center">
            <div className="w-14 h-14 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/5">
              <Camera className="h-6 w-6 text-[#FACC15]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-white truncate">{booking.serviceTitle}</h3>
              <p className="text-xs text-gray-400">{booking.serviceCategory}</p>
              <p className="text-xs text-[#FACC15] mt-1 font-medium">
                Standard Rate: €{getQuickServiceHourlyRate(booking.serviceTitle).toFixed(2)} / hr
              </p>
            </div>
          </div>

          {/* Customer & Location Card */}
          <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FACC15]" /> Customer Details
              </span>
              {booking.userPhone && (
                <a 
                  href={`tel:${booking.userPhone}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-black bg-[#FACC15] px-2.5 py-1 rounded-full hover:bg-yellow-400 transition"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500 mb-0.5">Customer Name</p>
                <p className="text-white font-medium">
                  {booking.userName || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Customer'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Phone Number</p>
                <p className="text-white font-medium">{booking.userPhone || booking.user?.phone || 'N/A'}</p>
              </div>
              {booking.userEmail && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-0.5">Email Address</p>
                  <p className="text-gray-300 font-mono text-[11px] truncate">{booking.userEmail}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-[11px]">Scheduled Time</p>
                  <p className="text-white font-medium">
                    {formatDate(booking.bookingDate || booking.scheduledAt)}, {formatTime(booking.bookingDate || booking.scheduledAt)}
                  </p>
                </div>
              </div>
              {booking.location && (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-[11px]">Service Location</p>
                      <p className="text-white font-medium">{booking.location}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FACC15] hover:underline flex items-center gap-0.5 text-[11px] shrink-0 font-medium"
                  >
                    Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Work Duration & Timing Card (When Started, In Progress or Completed) */}
          {(startedAtTime || endedAtTime || finalInvoice || status === 'IN_PROGRESS' || status === 'AWAITING_PAYMENT' || status === 'COMPLETED') && (
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FACC15]" /> Work & Duration Summary
                </span>
                {status === 'IN_PROGRESS' && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    Timer Active
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {startedAtTime && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">Work Started:</span>
                    <span className="font-semibold text-white">{formatTime(startedAtTime)}</span>
                  </div>
                )}
                {endedAtTime && (
                  <div className="flex justify-between items-center text-gray-300">
                    <span className="text-gray-400">Work Ended:</span>
                    <span className="font-semibold text-white">{formatTime(endedAtTime)}</span>
                  </div>
                )}
                {finalInvoice && (
                  <>
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="text-gray-400">Actual Duration:</span>
                      <span className="font-semibold text-white">
                        {finalInvoice.durationMinutes !== undefined && finalInvoice.durationMinutes > 0 
                          ? (finalInvoice.durationMinutes < 60 ? `${finalInvoice.durationMinutes} mins` : `${Math.floor(finalInvoice.durationMinutes / 60)}h ${finalInvoice.durationMinutes % 60}m`)
                          : `${finalInvoice.hours} hour(s)`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="text-gray-400">Billed Duration:</span>
                      <span className="font-bold text-[#FACC15]">{finalInvoice.hours} {finalInvoice.hours === 1 ? 'hour' : 'hours'} (min 1 hr)</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="text-gray-400">Hourly Rate:</span>
                      <span className="font-semibold text-white">€{finalInvoice.hourlyRate.toFixed(2)}/hr</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center text-sm">
                      <span className="font-semibold text-white">Service Charge:</span>
                      <span className="font-bold text-emerald-400 text-base">
                        €{(finalInvoice.serviceAmount ?? (finalInvoice.hours * finalInvoice.hourlyRate)).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Genuine Features & Add-ons (Filtered Cleanly) */}
          {displayFeatures.length > 0 && (
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#FACC15]" /> Service Preferences
              </span>
              <div className="space-y-2 text-xs">
                {displayFeatures.map(([key, val]) => {
                  const isArrayOfObjects = Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null;

                  if (isArrayOfObjects) {
                    return (
                      <div key={key} className="flex flex-col gap-2 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-gray-400">
                          <span>{formatFeatureKey(key)}:</span>
                          <span className="text-[11px] text-[#FACC15] font-semibold">{val.length} item{val.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="space-y-2 pl-1">
                          {val.map((item: any, idx: number) => {
                            const deviceTitle = [item.Brand, item.Model].filter(Boolean).join(' ') || item.Name || item.Title || `Item ${idx + 1}`;
                            const subDetails = [
                              item.Type ? `Type: ${item.Type}` : null,
                              item.Issue ? `Issue: ${item.Issue}` : null,
                              item.Issues ? `Issue: ${Array.isArray(item.Issues) ? item.Issues.join(', ') : item.Issues}` : null,
                            ].filter(Boolean);

                            const otherEntries = Object.entries(item).filter(
                              ([k, v]) => !['Brand', 'Model', 'Type', 'Issue', 'Issues', 'Name', 'Title'].includes(k) && v != null && v !== ''
                            );

                            return (
                              <div key={idx} className="bg-black/50 p-2.5 rounded-xl border border-white/5 text-[11px] space-y-1">
                                <div className="text-white font-semibold text-xs">{deviceTitle}</div>
                                {subDetails.length > 0 && (
                                  <div className="text-gray-300 text-[11px] leading-relaxed">
                                    {subDetails.join(' • ')}
                                  </div>
                                )}
                                {otherEntries.length > 0 && (
                                  <div className="text-gray-400 text-[10px] space-x-2">
                                    {otherEntries.map(([k, v]) => (
                                      <span key={k}>{k}: {String(v)}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="flex justify-between items-start gap-4 pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-gray-400">{formatFeatureKey(key)}:</span>
                      <span className="text-white font-medium text-right">{formatFeatureVal(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons List */}
          {addOns.length > 0 && (
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FACC15]" /> Selected Add-ons ({addOns.length})
              </span>
              <div className="space-y-2 text-xs">
                {addOns.map((addon: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pb-1.5 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-gray-300 font-medium">{addon.name}</span>
                    <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded">
                      {addon.price !== undefined && addon.price !== null
                        ? `€${Number(addon.price).toFixed(2)}`
                        : `${addon.count || 1} item(s)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements & Attached Photos */}
          {(booking.requirements || booking.description || attachedPhotos.length > 0) && (
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#FACC15]" /> Issue Details & Photos
              </span>
              {(booking.requirements || booking.description) && (
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {booking.requirements || booking.description}
                </div>
              )}
              {attachedPhotos.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-400 mb-2">Customer Attached Photos ({attachedPhotos.length}):</p>
                  <div className="flex gap-2 flex-wrap">
                    {attachedPhotos.map((img: string, idx: number) => (
                      <a 
                        key={idx} 
                        href={img} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block relative h-16 w-16 rounded-lg overflow-hidden border border-white/10 hover:border-[#FACC15] transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Issue ${idx + 1}`} className="object-cover w-full h-full" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: SCAN QR / PIN */}
          {step === 'SCAN' && (
            <div className="bg-[#141414] rounded-2xl p-5 border border-[#FACC15]/30 space-y-5 text-center mt-6">
              <div>
                <h2 className="text-base font-bold text-white mb-1">Verify Customer Before Starting</h2>
                <p className="text-xs text-gray-400">Scan customer QR or enter their 4-digit PIN to confirm arrival.</p>
              </div>

              <div className="w-60 h-60 mx-auto bg-black rounded-2xl overflow-hidden border-2 border-[#FACC15] relative flex items-center justify-center">
                {scanStatus === 'IDLE' && !manualMode && (
                  !isCameraOpen ? (
                    <button 
                      onClick={() => setIsCameraOpen(true)}
                      className="flex flex-col items-center justify-center text-[#FACC15] hover:text-yellow-400 p-4 w-full h-full"
                    >
                      <Camera className="w-12 h-12 mb-3" />
                      <span className="font-semibold text-sm">Tap to Open Camera</span>
                    </button>
                  ) : (
                    <ErrorBoundary fallback={
                      <div className="p-4 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                        <p className="text-xs text-red-400">Camera access error.</p>
                        <p className="text-[10px] text-gray-400 mt-1">Please use manual PIN entry.</p>
                      </div>
                    }>
                      {hasCameraSupport ? (
                        <Scanner 
                          onScan={(result) => handleScan(result[0].rawValue)} 
                          onError={() => setHasCameraSupport(false)}
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                          <p className="text-xs text-red-400">Camera not available.</p>
                        </div>
                      )}
                    </ErrorBoundary>
                  )
                )}

                {scanStatus === 'IDLE' && manualMode && (
                  <div className="flex flex-col items-center justify-center p-4 w-full">
                    <p className="text-xs text-gray-400 mb-3">Enter 4-Digit Validation PIN from Customer</p>
                    <input 
                      type="text" 
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                      placeholder="PIN"
                      className="bg-black border border-gray-700 rounded-lg px-4 py-2.5 w-full text-center text-xl font-bold tracking-widest uppercase mb-3"
                      maxLength={4}
                    />
                    <button 
                      onClick={() => handleScan(manualInput)}
                      disabled={verifyingPin || !manualInput.trim()}
                      className="bg-[#FACC15] text-black font-bold py-2.5 px-6 rounded-lg hover:bg-yellow-400 transition w-full text-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {verifyingPin ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Verifying PIN...</span>
                        </>
                      ) : (
                        'Verify PIN'
                      )}
                    </button>
                  </div>
                )}

                {scanStatus === 'SUCCESS' && (
                  <div className="flex flex-col items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-16 h-16 mb-2 animate-bounce" />
                    <p className="text-sm font-bold">Verification Successful!</p>
                  </div>
                )}

                {scanStatus === 'FAILED' && (
                  <div className="flex flex-col items-center justify-center text-red-400 p-4">
                    <AlertCircle className="w-14 h-14 mb-2" />
                    <p className="text-sm font-bold">Verification Failed</p>
                    <p className="text-xs text-gray-400 mt-1">PIN / QR code did not match.</p>
                  </div>
                )}
              </div>

              {scanStatus === 'IDLE' && (
                <button 
                  onClick={() => setManualMode(!manualMode)}
                  className="text-[#FACC15] text-xs underline font-medium block mx-auto"
                >
                  {manualMode ? 'Switch to QR Camera Scanner' : 'Having camera trouble? Enter 4-Digit PIN manually'}
                </button>
              )}
            </div>
          )}

          {/* Step 2: ACTIONS (Start Work or End Work) */}
          {step === 'ACTIONS' && (
            <div className="mt-4 space-y-4">
              {status === 'ASSIGNED' ? (
                <div className="bg-[#141414] p-5 rounded-2xl border border-[#FACC15]/30 text-center space-y-4">
                  <div className="w-12 h-12 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto text-[#FACC15]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Customer Verified!</h2>
                    <p className="text-xs text-gray-400 mt-1">Tap below to officially begin the work and start duration tracking.</p>
                  </div>
                  <button 
                    onClick={handleStartWork}
                    disabled={actionLoading}
                    className="w-full bg-[#FACC15] text-black font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition font-medium text-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Starting Work...' : 'Start Work Now'}
                  </button>
                </div>
              ) : status === 'IN_PROGRESS' ? (
                <div className="bg-[#141414] p-5 rounded-2xl border border-emerald-500/30 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-emerald-400">Work in Progress</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {startedAtTime ? `Started at ${formatTime(startedAtTime)}. ` : ''}
                      When you have finished all tasks, tap End Work to calculate service charges.
                    </p>
                  </div>
                  <button 
                    onClick={handleEndWork}
                    disabled={actionLoading}
                    className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl hover:bg-emerald-400 transition text-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Ending Work...' : 'End Work & Proceed to Payment'}
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 3: SUCCESS & PAYMENT SETTLEMENT */}
          {step === 'SUCCESS' && (
            <div className="space-y-4 mt-6">
              {/* Payment Settlement Card */}
              {finalInvoice && (
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider text-center border-b border-white/5 pb-2">
                    Payment & Settlement
                  </h3>

                  {/* Customer Already Paid Online */}
                  <div className="bg-black/50 rounded-xl p-3 space-y-1.5 border border-white/5 text-xs">
                    <p className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] mb-1">
                      Already Paid Online by Customer
                    </p>
                    <div className="flex justify-between text-gray-400">
                      <span>Upfront Booking Fee:</span>
                      <span className="text-white font-medium">€{(finalInvoice.upfrontFee ?? 0).toFixed(2)}</span>
                    </div>
                    {((finalInvoice.materialCost ?? 0) > 0) && (
                      <div className="flex justify-between text-gray-400">
                        <span>Tools / Materials Included:</span>
                        <span className="text-white font-medium">€{(finalInvoice.materialCost ?? 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300 font-semibold pt-1 border-t border-white/10">
                      <span>Total Settled Online:</span>
                      <span className="text-white">€{(finalInvoice.alreadyPaid ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Service Amount to Collect */}
                  <div className="flex justify-between items-center text-base font-bold bg-[#FACC15]/10 p-4 rounded-xl border border-[#FACC15]/20">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-300">Service Amount to Collect:</span>
                      <span className="text-[10px] text-gray-400 font-normal">Customer pays remaining service charge</span>
                    </div>
                    <span className="text-2xl font-black text-[#FACC15]">
                      €{(finalInvoice.remainingToPay ?? finalInvoice.serviceAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method Flow */}
              {paymentConfirmed ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-emerald-300 font-bold text-lg">Payment Verified & Completed!</h3>
                    <p className="text-gray-300 text-xs mt-1">
                      Payment has been confirmed. The booking is officially closed.
                    </p>
                  </div>

                  <div className="bg-black/60 rounded-xl p-3.5 space-y-2 border border-white/5 text-xs text-left">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Service:</span>
                      <span className="text-white font-medium">{booking?.serviceTitle || 'Quick Service'}</span>
                    </div>
                    {booking?.userName && (
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Customer:</span>
                        <span className="text-white font-medium">{booking.userName}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Payment Method:</span>
                      <span className="text-emerald-400 font-medium">
                        {selectedPayment?.method === 'cash' ? 'Cash Collected' : 
                         selectedPayment?.method === 'qrcode' ? 'Stripe QR Code' : 
                         selectedPayment?.method === 'iban' ? 'Online Payment (Stripe)' : 'Online Card'}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                      <span className="text-gray-300 font-semibold">Service Fee Collected:</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        €{(finalInvoice?.remainingToPay || finalInvoice?.serviceAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-400">
                      <span>Total Booking Amount:</span>
                      <span className="text-white font-medium">
                        €{(finalInvoice?.finalAmount || ((finalInvoice?.alreadyPaid || 0) + (finalInvoice?.serviceAmount || 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-[11px] pt-1">
                    Thank you! You can now safely close this window.
                  </p>
                </div>
              ) : selectedPayment ? (
                <div className="bg-[#141414] border border-[#FACC15]/30 rounded-2xl p-5 text-center space-y-4">
                  <h3 className="text-[#FACC15] font-bold text-sm uppercase tracking-wider">
                    {selectedPayment.method === 'cash' ? 'Cash Payment Requested' : 
                     selectedPayment.method === 'qrcode' ? 'Stripe QR Code Payment' : 
                     selectedPayment.method === 'iban' ? 'Online Payment (Stripe)' : 'Customer Payment Processing...'}
                  </h3>

                  {selectedPayment.method === 'cash' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-300">
                        The customer has selected to pay in cash. Please collect exactly <span className="text-[#FACC15] font-bold">€{(finalInvoice?.remainingToPay || finalInvoice?.serviceAmount || 0).toFixed(2)}</span> directly from them.
                      </p>
                      <button 
                        onClick={handleConfirmCash}
                        disabled={cashSubmitting}
                        className="w-full py-3.5 bg-[#FACC15] text-black font-bold rounded-xl hover:bg-yellow-400 transition font-medium text-sm disabled:opacity-50"
                      >
                        {cashSubmitting ? 'Confirming...' : 'Confirm Cash Received'}
                      </button>
                    </div>
                  )}

                  {selectedPayment.method === 'qrcode' && selectedPayment.url && (
                    <div className="flex flex-col items-center space-y-3">
                      <p className="text-xs text-gray-300">
                        Have the customer scan this QR code with their mobile phone or banking app to pay via Stripe Checkout.
                      </p>
                      <div className="bg-white p-3 rounded-2xl inline-block shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedPayment.url)}`} 
                          alt="Payment QR" 
                          width={220} 
                          height={220} 
                          className="w-48 h-48" 
                        />
                      </div>
                      <p className="text-[11px] text-gray-400">Waiting for Stripe payment confirmation...</p>
                    </div>
                  )}

                  {selectedPayment.method === 'iban' && (
                    <div className="flex flex-col items-center space-y-3 py-2">
                      <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-white">
                        Customer Completing Payment
                      </p>
                      <p className="text-xs text-gray-400 max-w-xs">
                        The customer has chosen Online Payment (Card / SEPA / Bank) and is completing the transaction on their device. This page will update automatically once confirmed.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 text-center space-y-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mb-3" />
                    <h3 className="text-white font-semibold text-sm">Awaiting Customer Payment...</h3>
                    <p className="text-xs text-gray-400 max-w-xs mt-1">
                      Waiting for customer to choose payment method (Cash, QR Code, Card, or IBAN) in their app.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
