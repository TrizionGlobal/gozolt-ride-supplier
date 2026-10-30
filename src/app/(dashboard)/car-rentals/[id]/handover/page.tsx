'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { carRentalsService } from '@/services/car-rentals/car-rentals.service';
import { formatDateTime } from '@/lib/utils';
import { useCarRentalsStore } from '@/stores/car-rentals.store';

export default function VehicleHandoverPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fuelLevel: 'FULL',
    odometerReading: '',
    vehicleCondition: 'Good',
    damageNotes: '',
    supplierSignature: ''
  });

  interface PhotoItem {
    file?: File;
    preview: string;
    url?: string;
  }
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const fileName = file.name.toLowerCase();
      const hasAllowedExt = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

      if (!allowedMimeTypes.includes(file.type) || !hasAllowedExt) {
        toast.error(`"${file.name}": Only JPG, JPEG, and PNG images are allowed`);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        toast.error(`"${file.name}": Image size must be less than 15MB`);
        continue;
      }

      if (photos.length + validFiles.length >= 5) {
        toast.error('Maximum 5 photos allowed');
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newItems: PhotoItem[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.odometerReading || !formData.supplierSignature) {
      toast.error("Please fill in all required fields (Odometer and Signatures)");
      return;
    }

    if (photos.length === 0) {
      toast.error("Please upload at least one vehicle photo before handover");
      return;
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify({
        fuelLevel: formData.fuelLevel,
        odometerReading: formData.odometerReading,
        vehicleCondition: formData.vehicleCondition,
        damageNotes: formData.damageNotes,
        supplierSignature: formData.supplierSignature,
        photos: photos.filter(p => p.url).map(p => p.url),
      }));

      for (const p of photos) {
        if (p.file) {
          formDataToSend.append('images', p.file);
        }
      }

      await carRentalsService.handoverBooking(bookingId, formDataToSend);
      toast.success("Handover completed successfully!");
      useCarRentalsStore.getState().setManagementBookings([], 0, ''); // Invalidate cache
      router.back();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to complete handover";
      toast.error(errorMsg);
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
                    {formatDateTime(booking.startDate)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 break-words">{booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Return Date & Time</p>
                  <p className="text-sm text-gray-300 font-medium">
                    {formatDateTime(booking.endDate)}
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
                onChange={e => setFormData({ ...formData, fuelLevel: e.target.value })}
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={formData.odometerReading}
                onChange={e => setFormData({ ...formData, odometerReading: e.target.value.replace(/\D/g, '').slice(0, 7) })}
                className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none"
                placeholder="e.g. 25450"
                maxLength={7}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Vehicle Condition</label>
              <select
                value={formData.vehicleCondition}
                onChange={e => setFormData({ ...formData, vehicleCondition: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, damageNotes: e.target.value })}
                  className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] py-2.5 px-3 text-white focus:border-[#FACC15] outline-none min-h-[100px]"
                  placeholder="Describe the damage..."
                />
              </div>
            )}

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-400">Vehicle Photos</label>
                <span className="text-xs text-[#A1A1AA]">
                  <span className="text-[#FACC15] font-semibold">{photos.length}</span> / 5 photos
                </span>
              </div>
              <div className="border-2 border-dashed border-[#27272A] rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-[#FACC15] hover:text-[#FACC15] transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Click to upload photos</span>
                <span className="text-xs text-[#71717A] mt-1">Upload up to 5 clear photos (JPG, JPEG, PNG up to 15MB each)</span>
                <input id="photo-upload" type="file" multiple accept=".jpg, .jpeg, .png, image/jpeg, image/png" className="hidden" onChange={handlePhotoSelect} />
              </div>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#27272A]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url || photo.preview} alt="Upload preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => {
                          const target = photos[i];
                          if (target.preview && target.preview.startsWith('blob:')) {
                            URL.revokeObjectURL(target.preview);
                          }
                          setPhotos(photos.filter((_, index) => index !== i));
                        }} 
                        className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500"
                      >
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

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier Signature (Type Name)</label>
              <input
                type="text"
                required
                maxLength={15}
                value={formData.supplierSignature}
                onChange={e => setFormData({ ...formData, supplierSignature: e.target.value.slice(0, 15) })}
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
