'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { fleetService } from '@/services/fleet/fleet.service';

const vehicleTypes = ['ECONOMY', 'STANDARD', 'PREMIUM', 'XL', 'ELECTRIC'];
const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'LPG'];

interface PhotoSlot {
  label: string;
  file: File | null;
  preview: string | null;
}

interface DocSlot {
  label: string;
  file: File | null;
  fileName: string | null;
}

export default function AddVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    type: '',
    fuelType: '',
    seats: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    vrtExpiry: '',
    taxRate: '',
    currentMileage: '',
  });

  // Photo uploads
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { label: 'Front', file: null, preview: null },
    { label: 'Back', file: null, preview: null },
    { label: 'Interior (Driver)', file: null, preview: null },
    { label: 'Interior (Passengers)', file: null, preview: null },
  ]);

  // Document uploads
  const [docs, setDocs] = useState<DocSlot[]>([
    { label: 'Vehicle Registration', file: null, fileName: null },
    { label: 'Insurance Certificate', file: null, fileName: null },
    { label: 'VRT Certificate', file: null, fileName: null },
  ]);

  const photoRefs = useRef<(HTMLInputElement | null)[]>([]);
  const docRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (index: number, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    const updated = [...photos];
    updated[index] = { ...updated[index], file, preview: URL.createObjectURL(file) };
    setPhotos(updated);
  };

  const handleDocChange = (index: number, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    const updated = [...docs];
    updated[index] = { ...updated[index], file, fileName: file.name };
    setDocs(updated);
  };

  const handleSubmit = async () => {
    if (!form.plateNumber || !form.make || !form.model || !form.year || !form.color || !form.type || !form.fuelType || !form.seats) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await fleetService.createVehicle({
        type: form.type,
        make: form.make,
        model: form.model,
        year: parseInt(form.year),
        color: form.color,
        plateNumber: form.plateNumber,
        fuelType: form.fuelType,
        seats: parseInt(form.seats),
      });
      toast.success('Vehicle submitted for approval');
      router.push('/fleet');
    } catch {
      toast.error('Failed to create vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/fleet')}
          className="mb-4 flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fleet
        </button>
        <h1 className="text-2xl font-bold text-white">Vehicle Details</h1>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        {/* Section 1: Vehicle Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">License Plate*</label>
            <input
              type="text"
              placeholder="MT - XXX"
              value={form.plateNumber}
              onChange={(e) => updateForm('plateNumber', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Makes*</label>
            <input
              type="text"
              placeholder="Toyota"
              value={form.make}
              onChange={(e) => updateForm('make', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Model*</label>
            <input
              type="text"
              placeholder="Corolla"
              value={form.model}
              onChange={(e) => updateForm('model', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Year*</label>
            <input
              type="number"
              placeholder="2024"
              value={form.year}
              onChange={(e) => updateForm('year', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Color*</label>
            <input
              type="text"
              placeholder="White"
              value={form.color}
              onChange={(e) => updateForm('color', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Type*</label>
            <select
              value={form.type}
              onChange={(e) => updateForm('type', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none appearance-none"
            >
              <option value="" className="text-[#52525B]">Select...</option>
              {vehicleTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Fuel Type*</label>
            <select
              value={form.fuelType}
              onChange={(e) => updateForm('fuelType', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none appearance-none"
            >
              <option value="" className="text-[#52525B]">Select...</option>
              {fuelTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Seats*</label>
            <input
              type="number"
              placeholder="4"
              value={form.seats}
              onChange={(e) => updateForm('seats', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Registration & Insurance */}
        <div className="border-t border-[#27272A] pt-6 mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Registration & Insurance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">Insurance Policy #</label>
              <input
                type="text"
                placeholder="INS-XXX"
                value={form.insurancePolicy}
                onChange={(e) => updateForm('insurancePolicy', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">Insurance Expiry</label>
              <input
                type="date"
                value={form.insuranceExpiry}
                onChange={(e) => updateForm('insuranceExpiry', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">VRT Expiry</label>
              <input
                type="date"
                value={form.vrtExpiry}
                onChange={(e) => updateForm('vrtExpiry', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">Tax Rate</label>
              <input
                type="text"
                placeholder="0.00"
                value={form.taxRate}
                onChange={(e) => updateForm('taxRate', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Current Mileage */}
        <div className="border-t border-[#27272A] pt-6 mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Current Mileage</h2>
          <input
            type="text"
            placeholder="0"
            value={form.currentMileage}
            onChange={(e) => updateForm('currentMileage', e.target.value)}
            className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
          />
        </div>

        {/* Section 4: Vehicle Photos */}
        <div className="border-t border-[#27272A] pt-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, i) => (
              <button
                key={photo.label}
                type="button"
                onClick={() => photoRefs.current[i]?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#3F3F46] bg-[#111111] p-6 transition-colors hover:border-[#FACC15] min-h-[150px]"
              >
                {photo.preview ? (
                  <img src={photo.preview} alt={photo.label} className="h-20 w-full object-contain rounded" />
                ) : (
                  <Camera className="h-8 w-8 text-[#52525B]" />
                )}
                <span className="text-sm font-medium text-[#D4D4D8]">{photo.label}</span>
                <span className="text-[10px] text-[#52525B]">JPG, PNG — max 5MB</span>
                <input
                  ref={(el) => { photoRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(i, e.target.files?.[0] ?? null)}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Document Uploads */}
        <div className="border-t border-[#27272A] pt-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <button
                key={doc.label}
                type="button"
                onClick={() => docRefs.current[i]?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#3F3F46] bg-[#111111] p-4 transition-colors hover:border-[#FACC15] min-h-[100px]"
              >
                <Upload className="h-6 w-6 text-[#52525B]" />
                <span className="text-xs font-medium text-[#D4D4D8]">
                  {doc.fileName || doc.label}
                </span>
                <span className="text-[10px] text-[#52525B]">PDF, JPG, PNG — max 5MB</span>
                <input
                  ref={(el) => { docRefs.current[i] = el; }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleDocChange(i, e.target.files?.[0] ?? null)}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => router.push('/fleet')}
          className="rounded-full border border-[#3F3F46] bg-[#27272A] px-5 py-2 text-sm text-white hover:bg-[#3F3F46] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => toast.info('Draft saved')}
          className="rounded-full border border-[#3F3F46] bg-[#27272A] px-5 py-2 text-sm text-white hover:bg-[#3F3F46] transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-full bg-[#FACC15] px-5 py-2 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </div>
    </div>
  );
}
