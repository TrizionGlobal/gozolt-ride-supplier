'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { bikeRentalsService } from '@/services/bike-rentals/bike-rentals.service';
import { format } from 'date-fns';
import { useBikeRentalsStore } from '@/stores/bike-rentals.store';

export default function BikeReturnPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fuelLevel: 'FULL',
    odometerReading: '',
    bikeCondition: 'Good',
    damageNotes: '',
    refundAmount: '',
    refundAccountNumber: '',
    supplierSignature: ''
  });
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [maxRefund, setMaxRefund] = useState(0);
  const [remainingDays, setRemainingDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (booking) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const now = new Date();
      
      const tDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const uDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const rDays = Math.max(0, tDays - uDays);
      
      setTotalDays(tDays);
      setRemainingDays(rDays);
      
      let calcRefund = 0;
      const vehicleTotal = Number(booking.vehicleTotal) || Number(booking.grandTotal) || 0;
      const dailyRate = tDays > 0 ? vehicleTotal / tDays : 0;
      calcRefund = Math.round(rDays * dailyRate * 100) / 100;
      
      setMaxRefund(calcRefund);
      setFormData(prev => ({ ...prev, refundAmount: calcRefund > 0 ? calcRefund.toString() : '' }));
    }
  }, [booking]);

  useEffect(() => {
    if (bookingId) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.odometerReading || !formData.supplierSignature) {
      toast.error("Please fill in all required fields (Odometer and Signatures)");
      return;
    }

    setSubmitting(true);
    const refundAmt = parseFloat(formData.refundAmount);
    const payload = {
      ...formData,
      photos,
      refundAmount: !isNaN(refundAmt) && refundAmt > 0 ? refundAmt.toString() : undefined,
    };
    
    try {
      await bikeRentalsService.returnBooking(bookingId, payload);
      toast.success("Return completed successfully!");
      useBikeRentalsStore.getState().setManagementBookings([], 0, ''); // Invalidate cache
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete return");
      setSubmitting(false);
    }
  };

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
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg border border-[#27272A] bg-[#111111] p-2 text-white hover:bg-[#1A1A1A] transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Bike Return</h1>
          <p className="text-sm text-[#A1A1AA]">Booking ID: {bookingId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bike Info */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
          <div className="bg-[#111111] rounded-xl p-4 border border-[#27272A] flex gap-4 items-center">
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {booking.vehicle?.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={booking.vehicle.images[0]} alt="Bike" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white">{booking.vehicle?.name}</h3>
              <p className="text-sm text-gray-400">
                {booking.vehicle?.category} {booking.vehicle?.year ? `• ${booking.vehicle.year}` : ''}
              </p>
              <p className="text-xs text-[#FACC15] mt-1 font-medium">Plate: {booking.vehicle?.registrationNo || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-[#111111] rounded-xl p-4 border border-[#27272A] flex flex-col justify-center">
            <p className="text-xs text-gray-500 mb-1">Total Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-500">
              EUR {booking?.grandTotal ? Number(booking.grandTotal).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
        
        {/* Booking Details */}
        <div className="bg-[#111111] rounded-xl p-4 border border-[#27272A]">
          <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider text-xs">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Customer</p>
              <p className="text-sm text-gray-300 font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{booking.user?.phone || 'No phone'}</p>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Pickup Date & Time</p>
                  <p className="text-sm text-gray-300 font-medium">
                    {new Date(booking.startDate).toLocaleDateString()} {new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Return Date & Time</p>
                  <p className="text-sm text-gray-300 font-medium">
                    {new Date(booking.endDate).toLocaleDateString()} {new Date(booking.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{booking.dropoffLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">Return Condition</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Return Fuel Level</label>
              <select 
                value={formData.fuelLevel}
                onChange={e => setFormData({...formData, fuelLevel: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
              >
                <option value="FULL">Full (8/8)</option>
                <option value="HALF">Half (4/8)</option>
                <option value="QUARTER">Quarter (2/8)</option>
                <option value="EMPTY">Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Return Odometer Reading</label>
              <input 
                type="number" 
                required
                value={formData.odometerReading}
                onChange={e => setFormData({...formData, odometerReading: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
                placeholder="e.g. 25980"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Bike Condition</label>
              <select 
                value={formData.bikeCondition}
                onChange={e => setFormData({...formData, bikeCondition: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
              >
                <option value="Good">Good</option>
                <option value="Minor Scratches">Minor Scratches</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            
            {formData.bikeCondition !== 'Good' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Damage Notes</label>
                <textarea 
                  value={formData.damageNotes}
                  onChange={e => setFormData({...formData, damageNotes: e.target.value})}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none min-h-[100px]"
                  placeholder="Describe the damage..."
                />
              </div>
            )}
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Return Photos (Optional)</label>
              <div className="border-2 border-dashed border-[#27272A] rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Click to upload photos</span>
                <span className="text-xs mt-1">Upload exterior and interior photos (especially if damaged)</span>
                <input id="photo-upload" type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files) {
                    const newPhotos = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                    setPhotos([...photos, ...newPhotos]);
                  }
                }} />
              </div>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPhotos(photos.filter((_, index) => index !== i))} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {booking.isFlexible && remainingDays > 0 && (
              <div className="col-span-2 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mt-4">
                <h3 className="text-yellow-500 font-semibold mb-2">Flexible Return Refund</h3>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Total Booked Days:</span>
                  <span>{totalDays} days</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Remaining Unused Days:</span>
                  <span>{remainingDays} days</span>
                </div>
                <div className="flex justify-between text-sm text-white font-medium mb-3">
                  <span>Calculated Unused Amount:</span>
                  <span>EUR {maxRefund.toFixed(2)}</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-yellow-500/80 mb-1">Enter Final Refund Amount (EUR)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      max={booking.grandTotal ? Number(booking.grandTotal) : maxRefund}
                      value={formData.refundAmount}
                      onChange={e => setFormData({...formData, refundAmount: e.target.value})}
                      className="w-full bg-[#0A0A0A] border border-yellow-500/30 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-blue-200">Refund will be automatically processed to the customer's original payment method.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">Digital Signatures</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier Signature (Type Name)</label>
              <input 
                type="text" 
                required
                value={formData.supplierSignature}
                onChange={e => setFormData({...formData, supplierSignature: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
                placeholder="Supplier agent name"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={submitting}
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : 'Complete Return'}
          </button>
        </div>
      </form>
    </div>
  );
}
