import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getExpertVisitName, getQuickServiceHourlyRate } from '@/lib/quick-services-pricing';

export function QuickServiceTask({ token }: { token: string }) {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'VERIFY' | 'SCAN' | 'ACTIONS' | 'SUCCESS'>('VERIFY');
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [actionLoading, setActionLoading] = useState(false);
  const [finalInvoice, setFinalInvoice] = useState<{ hours: number; hourlyRate: number; finalAmount: number } | null>(null);

  let features: Record<string, any> = {};
  let addOns: any[] = [];
  let attachedPhotos: string[] = [];

  if (task?.booking) {
    try {
      if (typeof task.booking.options === 'string') features = JSON.parse(task.booking.options);
      else if (task.booking.options && typeof task.booking.options === 'object') features = task.booking.options;
    } catch {}

    try {
      if (typeof task.booking.addOns === 'string') addOns = JSON.parse(task.booking.addOns);
      else if (Array.isArray(task.booking.addOns)) addOns = task.booking.addOns;
    } catch {}

    attachedPhotos = task.booking.images || task.booking.attachments || [];
  }

  useEffect(() => {
    fetch(`/api/proxy/quick-services/public/task/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.statusCode && data.statusCode !== 200) {
          setError(data.message || 'Invalid or expired link');
        } else {
          setTask(data);
          // If the booking is already in progress, jump to ACTIONS so they can complete it.
          if (data.booking?.status === 'IN_PROGRESS') {
            setStep('ACTIONS');
          } else {
            setStep('SCAN');
          }
        }
      })
      .catch(err => setError('Failed to load task'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleScan = (result: string) => {
    if (result === task.booking.id) {
      setScanStatus('SUCCESS');
      setTimeout(() => setStep('ACTIONS'), 1500);
    } else {
      setScanStatus('FAILED');
      setTimeout(() => setScanStatus('IDLE'), 2000);
    }
  };

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/proxy/quick-services/public/task/${token}/start`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // Update local state to reflect that work has started
        setTask({ ...task, booking: { ...task.booking, status: 'IN_PROGRESS' } });
      } else {
        alert(data.message || 'Failed to start work');
      }
    } catch (err) {
      alert('Error starting work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndWork = async () => {
    setActionLoading(true);
    try {
      let finalAmount = task.booking.totalAmount;
      let hours = 1;
      const hourlyRate = getQuickServiceHourlyRate(task.booking.serviceTitle);
      
      if (task.booking.status === 'IN_PROGRESS' && task.booking.options?.startedAt) {
        const startedAt = new Date(task.booking.options.startedAt);
        const endedAt = new Date();
        const diffMs = endedAt.getTime() - startedAt.getTime();
        hours = Math.ceil(diffMs / (1000 * 60 * 60));
        if (hours < 1) hours = 1;
        
        const upfront = Number(task.booking.upfrontFee || 0);
        finalAmount = upfront + (hours * hourlyRate);
      }

      const res = await fetch(`/api/proxy/quick-services/public/task/${token}/complete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount: finalAmount })
      });
      const data = await res.json();
      if (res.ok) {
        setFinalInvoice({ hours, hourlyRate, finalAmount });
        setStep('SUCCESS');
      } else {
        alert(data.message || 'Failed to end work');
      }
    } catch (err) {
      alert('Error ending work');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && step === 'VERIFY') {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verifying Link...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Link Expired</h1>
        <p className="text-gray-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800 pt-4">
        <div>
          <h1 className="text-xl font-bold">Quick Service Task</h1>
          <p className="text-sm text-gray-400">Assigned to: {task?.worker?.name}</p>
        </div>
      </div>

      {task && (step === 'SCAN' || step === 'ACTIONS') && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex gap-4 items-center">
              <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <Camera className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-white">{task.booking.serviceTitle}</h3>
                <p className="text-sm text-gray-400">{task.booking.serviceCategory}</p>
                <p className="text-xs text-[#FACC15] mt-1 font-medium">Status: {task.booking.status.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col justify-center">
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-500">
                EUR {task.booking?.totalAmount ? Number(task.booking.totalAmount).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Customer Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm text-gray-300 font-medium">
                  {task.booking.userName || `${task.booking.user?.firstName || ''} ${task.booking.user?.lastName || ''}`.trim()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm text-gray-300 font-medium">
                  {task.booking.userPhone || task.booking.user?.phone || 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-300 font-medium">
                  {task.booking.userEmail || task.booking.user?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Service Category</p>
                <p className="text-sm text-gray-300 font-medium">{task.booking.serviceCategory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Service</p>
                <p className="text-sm text-[#FACC15] font-medium">{task.booking.serviceTitle}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Scheduled Time</p>
                <p className="text-sm text-gray-300 font-medium">
                  {new Date(task.booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(task.booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm text-gray-300 font-medium">{task.booking.location || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Upfront Fee:</p>
                <p className="text-sm font-medium text-white">€{Number(task.booking.upfrontFee || 0).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">{getExpertVisitName(task.booking.serviceTitle)}:</p>
                <p className="text-sm font-medium text-white">€{getQuickServiceHourlyRate(task.booking.serviceTitle).toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Materials Included:</p>
                <p className="text-sm font-medium text-white">€{Number(task.booking.materialCost || 0).toFixed(2)}</p>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-white">Total Amount:</p>
                <p className="text-sm font-bold text-[#FACC15]">€{Number(task.booking.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="text-sm text-gray-300 uppercase font-medium">{task.booking.paymentMethodType || 'CARD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <p className="text-sm text-gray-300 font-medium">{task.booking.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Requirements / Issue Description</p>
                <div className="bg-[#111111] border border-[#27272A] rounded-lg p-3">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {task.booking.requirements || task.booking.description || 'No additional requirements provided.'}
                  </p>
                </div>
              </div>

              {attachedPhotos.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Attached Photos</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {attachedPhotos.map((img: string, idx: number) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block relative h-16 w-16 rounded-md overflow-hidden border border-[#27272A] hover:border-[#FACC15] transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Attachment ${idx + 1}`} className="object-cover w-full h-full" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {Object.keys(features).length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Features Selection</h3>
              <div className="space-y-3">
                {Object.entries(features).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1 border-b border-[#27272A] pb-3 last:border-0 last:pb-0">
                    <span className="text-[#A1A1AA] font-medium text-xs">{key}</span>
                    {Array.isArray(val) ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {val.map((item: any, i: number) => (
                          <div key={i} className="bg-[#1A1A1A] p-3 rounded-md border border-[#27272A]">
                            {typeof item === 'object' && item !== null ? (
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(item).filter(([_, v]) => v != null && v !== '').map(([k, v]) => (
                                  <div key={k} className="flex flex-col">
                                    <span className="text-[#71717A] text-[10px] uppercase tracking-wider">{k}</span>
                                    <span className="text-white text-xs">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-white text-xs">• {String(item)}</span>
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
            </div>
          )}

          {addOns.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-xs">Add-ons Selection</h3>
              <div className="space-y-3">
                {addOns.map((addon: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
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
      )}

      {step === 'SCAN' && (
        <div className="flex flex-col items-center space-y-6 mt-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Scan Customer QR Code</h2>
            <p className="text-gray-400 text-sm">Ask the customer to show their Quick Service booking QR code to verify and start work.</p>
          </div>
          
          <div className="w-64 h-64 bg-gray-900 rounded-2xl overflow-hidden border-2 border-[#FACC15] relative flex items-center justify-center">
            {scanStatus === 'IDLE' && (
              <Scanner 
                constraints={{ facingMode: 'environment' }} 
                onScan={(result) => handleScan(result[0].rawValue)} 
              />
            )}
            
            {scanStatus === 'SUCCESS' && (
              <div className="flex flex-col items-center justify-center text-green-500 animate-in fade-in zoom-in">
                <CheckCircle2 className="w-20 h-20 mb-4" />
                <p className="text-xl font-bold">Verification Success!</p>
              </div>
            )}

            {scanStatus === 'FAILED' && (
              <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in zoom-in">
                <AlertCircle className="w-20 h-20 mb-4" />
                <p className="text-xl font-bold">Verification Failed</p>
                <p className="text-sm mt-2 text-white">Invalid Booking QR</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'ACTIONS' && (
        <div className="mt-8 space-y-6">
          {task.booking.status === 'ASSIGNED' ? (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
              <h2 className="text-lg font-semibold mb-2">Ready to Start?</h2>
              <p className="text-gray-400 text-sm mb-6">You have verified the QR code. You can now start the work.</p>
              <button 
                onClick={handleStartWork}
                disabled={actionLoading}
                className="w-full bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Starting...' : 'Start Work'}
              </button>
            </div>
          ) : task.booking.status === 'IN_PROGRESS' ? (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
              <h2 className="text-lg font-semibold mb-2 text-emerald-500">Work In Progress</h2>
              <p className="text-gray-400 text-sm mb-6">Please end the work when you have successfully completed all tasks.</p>
              <button 
                onClick={handleEndWork}
                disabled={actionLoading}
                className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Ending...' : 'End Work'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <CheckCircle2 className="h-20 w-20 text-[#FACC15]" />
          <h2 className="text-2xl font-bold">Task Completed!</h2>
          <p className="text-gray-400">The quick service booking has been marked as completed successfully.</p>
          
          {finalInvoice && (
            <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4 text-left">
              <h3 className="text-white font-semibold mb-4 text-center">Invoice Summary</h3>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Hours Worked:</span>
                <span className="text-white font-medium">{finalInvoice.hours} {finalInvoice.hours === 1 ? 'hour' : 'hours'}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Hourly Rate:</span>
                <span className="text-white font-medium">€{finalInvoice.hourlyRate.toFixed(2)}/hr</span>
              </div>
              <div className="h-px bg-white/10 my-3"></div>
              <div className="flex justify-between text-lg font-bold text-[#FACC15]">
                <span>Total Amount:</span>
                <span>€{finalInvoice.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {task.booking.supplier && (
            <div className="w-full bg-white/5 border border-[#FACC15]/30 rounded-xl p-5 mt-4 text-left space-y-3">
              <h3 className="text-[#FACC15] font-semibold text-center mb-2">Payment Methods</h3>
              <p className="text-sm text-gray-300 text-center mb-4">Please request payment from the customer using one of the following methods:</p>
              
              {task.booking.supplier.bankName && task.booking.supplier.iban && (
                <div className="bg-black/50 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Bank Transfer (IBAN)</p>
                  <p className="text-sm font-bold text-white">{task.booking.supplier.iban}</p>
                  <p className="text-xs text-gray-400 mt-1">{task.booking.supplier.bankName} - {task.booking.supplier.accountHolder}</p>
                </div>
              )}
            </div>
          )}
          
          <p className="text-emerald-500 text-sm font-medium mt-6">You can now safely close this app/window. This link is no longer valid.</p>
        </div>
      )}
    </div>
  );
}
