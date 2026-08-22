'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { format } from 'date-fns';
import { useCarRentalsStore } from '@/stores/car-rentals.store';

export default function VehicleHandoverPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fuelLevel: 'FULL',
    odometerReading: '',
    vehicleCondition: 'Good',
    damageNotes: '',
    customerSignature: '',
    supplierSignature: ''
  });

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (bookingId) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.odometerReading || !formData.customerSignature || !formData.supplierSignature) {
      toast.error("Please fill in all required fields (Odometer and Signatures)");
      return;
    }

    setSubmitting(true);
    const payload = { ...formData, photos };
    
    try {
      await carRentalsService.handoverBooking(bookingId, payload);
      toast.success("Handover completed successfully!");
      useCarRentalsStore.getState().setManagementBookings([], 0, ''); // Invalidate cache
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete handover");
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
          <h1 className="text-2xl font-bold text-white">Vehicle Handover</h1>
          <p className="text-sm text-[#A1A1AA]">Booking ID: {bookingId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Vehicle Info */}
        <div className="bg-[#111111] rounded-xl p-4 border border-[#27272A] flex gap-4 items-center">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            {booking.vehicle?.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={booking.vehicle.images[0]} alt="Car" className="w-full h-full object-cover" />
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

        {/* Customer Verification */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">Customer Verification</h3>
          <div className="flex items-center gap-3 bg-[#1A1A1A] p-4 rounded-lg border border-[#27272A]">
            <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/50">
              <Check className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-white font-medium">ID & Driving Licence Verified</p>
              <p className="text-xs text-gray-400">Customer {booking.user?.firstName} {booking.user?.lastName} documents are valid</p>
            </div>
          </div>
        </div>

        {/* Handover Details */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">Handover Condition</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Fuel Level</label>
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
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Odometer Reading (KM)</label>
              <input 
                type="number" 
                required
                value={formData.odometerReading}
                onChange={e => setFormData({...formData, odometerReading: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
                placeholder="e.g. 25450"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Vehicle Condition</label>
              <select 
                value={formData.vehicleCondition}
                onChange={e => setFormData({...formData, vehicleCondition: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
              >
                <option value="Good">Good</option>
                <option value="Minor Scratches">Minor Scratches</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            
            {formData.vehicleCondition !== 'Good' && (
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
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Vehicle Photos (Optional)</label>
              <div className="border-2 border-dashed border-[#27272A] rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Click to upload photos</span>
                <span className="text-xs mt-1">Upload exterior and interior photos before handover</span>
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
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A]">
          <h3 className="text-lg font-semibold text-white mb-4">Digital Signatures</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Customer Signature (Type Name)</label>
              <input 
                type="text" 
                required
                value={formData.customerSignature}
                onChange={e => setFormData({...formData, customerSignature: e.target.value})}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
                placeholder="Customer's full name"
              />
            </div>
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
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-[#FACC15] text-black hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : 'Complete Handover'}
          </button>
        </div>
      </form>
    </div>
  );
}
