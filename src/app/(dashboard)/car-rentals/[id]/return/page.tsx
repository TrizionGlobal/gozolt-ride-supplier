'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { format } from 'date-fns';

export default function VehicleReturnPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fuelLevel: 'Full',
    odometerReading: '',
    vehicleCondition: 'Good',
    damageNotes: '',
    securityDeposit: 'Refund',
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
      await carRentalsService.returnBooking(bookingId, payload);
      toast.success("Return completed successfully!");
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
          <h1 className="text-2xl font-bold text-white">Vehicle Return</h1>
          <p className="text-sm text-[#A1A1AA]">Booking ID: {bookingId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Pre-fetched Details */}
        <div className="bg-[#111111] p-6 rounded-xl border border-[#27272A] grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-400 mb-1">Vehicle Name</span>
            <span className="font-medium text-white">{booking.vehicle?.name}</span>
          </div>
          <div>
            <span className="block text-gray-400 mb-1">Vehicle ID</span>
            <span className="font-medium text-white">CR-{booking.vehicle?.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div>
            <span className="block text-gray-400 mb-1">Return Date & Time</span>
            <span className="font-medium text-white">{format(new Date(booking.endDate), 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <div>
            <span className="block text-gray-400 mb-1">Return Location</span>
            <span className="font-medium text-white">{booking.dropoffLocation}</span>
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
                <option value="Full">Full</option>
                <option value="3/4">3/4</option>
                <option value="1/2">1/2</option>
                <option value="1/4">1/4</option>
                <option value="Empty">Empty</option>
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
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : 'Complete Return'}
          </button>
        </div>
      </form>
    </div>
  );
}
