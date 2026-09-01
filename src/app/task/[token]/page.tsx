'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function HandoverTaskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'VERIFY' | 'SCAN' | 'FORM' | 'SUCCESS'>('VERIFY');
  const [rentalType, setRentalType] = useState('car');
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [formData, setFormData] = useState({ fuelLevel: 'FULL', odometerReading: '', vehicleCondition: 'Good', damageNotes: '', refundAmount: '', refundAccountNumber: '', supplierSignature: '' });
  const [photos, setPhotos] = useState<string[]>([]);
  const [maxRefund, setMaxRefund] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (task?.taskType === 'RETURN' && task?.booking) {
      const start = new Date(task.booking.startDate);
      const end = new Date(task.booking.endDate);
      const now = new Date();
      
      const tDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      // Ensure at least 1 day used
      const uDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const rDays = Math.max(0, tDays - uDays);
      
      setTotalDays(tDays);
      setRemainingDays(rDays);
      
      const totalAmount = task.booking.vehicleTotal || task.booking.bikeTotal || 0;
      const dailyRate = Number(totalAmount) / tDays;
      const calcRefund = Math.round(rDays * dailyRate * 100) / 100;
      setMaxRefund(calcRefund);
      setFormData(prev => ({ ...prev, refundAmount: calcRefund.toString() }));
    }
  }, [task]);

  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get('type') || 'car';
    setRentalType(type);
    
    fetch(`/api/proxy/${type === 'bike' ? 'bike-rentals' : 'car-rentals'}/public/task/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.statusCode && data.statusCode !== 200) {
          setError(data.message || 'Invalid or expired link');
        } else {
          setTask(data);
          setStep('SCAN');
        }
      })
      .catch(err => setError('Failed to load task'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleScan = (result: string) => {
    if (result === task.booking.id) {
      setScanStatus('SUCCESS');
      setTimeout(() => setStep('FORM'), 1500);
    } else {
      setScanStatus('FAILED');
      setTimeout(() => setScanStatus('IDLE'), 2000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(f => URL.createObjectURL(f));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.odometerReading || !formData.supplierSignature) {
      alert("Please fill in all required fields (Odometer and Signatures)");
      setLoading(false);
      return;
    }

    // In a real app we would upload photos to S3 here.
    const payload = {
      fuelLevel: formData.fuelLevel,
      odometerReading: formData.odometerReading,
      vehicleCondition: formData.vehicleCondition,
      damageNotes: formData.damageNotes,
      refundAmount: formData.refundAmount,
      refundAccountNumber: formData.refundAccountNumber,
      supplierSignature: formData.supplierSignature,
      photos,
    };

    try {
      const res = await fetch(`/api/proxy/${rentalType === 'bike' ? 'bike-rentals' : 'car-rentals'}/public/task/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep('SUCCESS');
      } else {
        alert(data.message || 'Failed to complete task');
      }
    } catch (err) {
      alert('Error submitting form');
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-bold">{task?.taskType === 'HANDOVER' ? `${rentalType === 'bike' ? 'Bike' : 'Car'} Handover` : `${rentalType === 'bike' ? 'Bike' : 'Car'} Return`}</h1>
          <p className="text-sm text-gray-400">Assigned to: {task?.worker?.name}</p>
        </div>
      </div>

      {task && (step === 'SCAN' || step === 'FORM') && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex gap-4 items-center">
              <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                {task.booking.vehicle?.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={task.booking.vehicle.images[0]} alt={rentalType === 'bike' ? 'Bike' : 'Car'} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-white">{task.booking.vehicle?.name}</h3>
                <p className="text-sm text-gray-400">
                  {task.booking.vehicle?.category} {task.booking.vehicle?.year ? `• ${task.booking.vehicle.year}` : ''}
                </p>
                <p className="text-xs text-[#FACC15] mt-1 font-medium">Plate: {task.booking.vehicle?.registrationNo || 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col justify-center">
              <p className="text-xs text-gray-500 mb-1">Total Amount Paid</p>
              <p className="text-2xl font-bold text-emerald-500">
                EUR {task.booking?.grandTotal ? Number(task.booking.grandTotal).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider text-xs">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Customer</p>
                <p className="text-sm text-gray-300 font-medium">{task.booking.user?.firstName} {task.booking.user?.lastName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{task.booking.user?.phone || 'No phone'}</p>
              </div>
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Pickup Date & Time</p>
                    <p className="text-sm text-gray-300 font-medium">
                      {new Date(task.booking.startDate).toLocaleDateString()} {new Date(task.booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 break-words">{task.booking.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Return Date & Time</p>
                    <p className="text-sm text-gray-300 font-medium">
                      {new Date(task.booking.endDate).toLocaleDateString()} {new Date(task.booking.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 break-words">{task.booking.dropoffLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'SCAN' && (
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Scan Customer QR</h2>
            <p className="text-gray-400 text-sm">Ask the customer to show their booking QR code.</p>
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

      {step === 'FORM' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Odometer Reading (km)</label>
              <input 
                type="number" 
                required 
                value={formData.odometerReading}
                onChange={e => setFormData({...formData, odometerReading: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-[#FACC15] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Fuel Level</label>
              <select 
                value={formData.fuelLevel}
                onChange={e => setFormData({...formData, fuelLevel: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-[#FACC15] outline-none"
              >
                <option value="FULL">Full (8/8)</option>
                <option value="HALF">Half (4/8)</option>
                <option value="QUARTER">Quarter (2/8)</option>
                <option value="EMPTY">Empty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{rentalType === 'bike' ? 'Bike' : 'Vehicle'} Condition</label>
              <select 
                value={formData.vehicleCondition}
                onChange={e => setFormData({...formData, vehicleCondition: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-[#FACC15] outline-none"
              >
                <option value="Good">Good</option>
                <option value="Minor Scratches">Minor Scratches</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            
            {formData.vehicleCondition !== 'Good' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Damage Notes</label>
                <textarea 
                  value={formData.damageNotes}
                  onChange={e => setFormData({...formData, damageNotes: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-[#FACC15] outline-none h-24"
                  placeholder="Describe the damage..."
                />
              </div>
            )}

            <div className="pt-2">
              <label className="block text-sm text-gray-400 mb-2">Photos (Optional)</label>
              <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-600 transition-colors bg-gray-900/50" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Camera className="h-8 w-8 text-gray-500 mb-2" />
                <p className="text-sm font-medium text-gray-300">Click to upload photos</p>
                <p className="text-xs text-gray-500 mt-1">Upload exterior and interior photos (especially if damaged)</p>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              
              {photos.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {task?.taskType === 'RETURN' && remainingDays > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mt-4">
                <h3 className="text-yellow-500 font-semibold mb-2">Early Return Refund</h3>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Total Booked Days:</span>
                  <span>{totalDays} days</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Remaining Unused Days:</span>
                  <span>{remainingDays} days</span>
                </div>
                <div className="flex justify-between text-sm text-white font-medium mb-3">
                  <span>Calculated Refund:</span>
                  <span>EUR {maxRefund.toFixed(2)}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-yellow-500/80 mb-1">Enter Final Refund Amount (EUR)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      max={maxRefund}
                      value={formData.refundAmount}
                      onChange={e => setFormData({...formData, refundAmount: e.target.value})}
                      className="w-full bg-gray-900 border border-yellow-500/30 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-blue-200">Refund will be automatically processed to the customer's original payment method.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-800 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Digital Signatures</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Staff Signature (Type Name)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.supplierSignature}
                    onChange={e => setFormData({...formData, supplierSignature: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-[#FACC15] outline-none"
                    placeholder="Staff agent name"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FACC15] text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Complete Task'}
          </button>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <CheckCircle2 className="h-20 w-20 text-[#FACC15]" />
          <h2 className="text-2xl font-bold">Task Completed!</h2>
          <p className="text-gray-400">The booking status has been updated. You can close this window.</p>
        </div>
      )}
    </div>
  );
}
