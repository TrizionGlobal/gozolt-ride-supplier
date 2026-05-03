'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import { CredentialsModal } from '@/components/drivers/credentials-modal';
import type { DriverCredentials } from '@/types';

interface DocSlot {
  label: string;
  file: File | null;
  fileName: string | null;
}

export default function AddDriverPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<DriverCredentials | null>(null);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    tollBadge: '',
  });

  // Photo
  const [photo, setPhoto] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  const photoRef = useRef<HTMLInputElement | null>(null);

  // Documents
  const [docs, setDocs] = useState<DocSlot[]>([
    { label: 'License (Front+Back)', file: null, fileName: null },
    { label: 'ID / Passport', file: null, fileName: null },
    { label: 'Criminal Record Check', file: null, fileName: null },
    { label: 'Medical Certificate', file: null, fileName: null },
    { label: 'Toll Badge', file: null, fileName: null },
  ]);
  const docRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setPhoto({ file, preview: URL.createObjectURL(file) });
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
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      toast.error('Please fill in all required fields (First Name, Last Name, Phone)');
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const cleanPhone = form.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Phone must be in E.164 format (e.g. +35699123456)');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await driverService.createDriver({
        phone: cleanPhone,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
      });
      setCredentials(result);
    } catch {
      toast.error('Failed to create driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Add New Driver</h1>

      {/* Form Card */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        {/* Section 1: Personal Information */}
        <h2 className="mb-4 text-lg font-semibold text-white">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">First Name<span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => updateForm('firstName', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Last Name<span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => updateForm('lastName', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Phone<span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="+356XXXXXXXX"
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[#52525B]">Format: +356XXXXXXXX</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-[#D4D4D8]">Photo</label>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#3F3F46] transition-colors hover:border-[#FACC15]"
          >
            {photo.preview ? (
              <img src={photo.preview} alt="Driver" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-[#52525B]" />
            )}
          </button>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Section 2: License Details */}
        <div className="mt-8 border-t border-[#27272A] pt-6">
          <h2 className="mb-4 text-lg font-semibold text-white">License Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">License Number</label>
              <input
                type="text"
                placeholder="MT-DL-12345"
                value={form.licenseNumber}
                onChange={(e) => updateForm('licenseNumber', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#D4D4D8]">License Expiry</label>
              <input
                type="date"
                placeholder="DD-MM-YYYY"
                value={form.licenseExpiry}
                onChange={(e) => updateForm('licenseExpiry', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
          <div className="max-w-[50%]">
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Toll Badge Number</label>
            <input
              type="text"
              placeholder="XXX-XXX"
              value={form.tollBadge}
              onChange={(e) => updateForm('tollBadge', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Documents */}
        <div className="mt-8 border-t border-[#27272A] pt-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Documents</h2>
          <div className="grid grid-cols-3 gap-4">
            {docs.map((doc, i) => (
              <button
                key={doc.label}
                type="button"
                onClick={() => docRefs.current[i]?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 min-h-[100px] transition-colors ${
                  doc.file
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-[#3F3F46] hover:border-[#52525B]'
                }`}
              >
                {doc.file ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Upload className="h-6 w-6 text-[#52525B]" />
                )}
                <span className="text-xs font-medium text-[#D4D4D8] text-center">
                  {doc.fileName || doc.label}
                </span>
                {!doc.file && (
                  <span className="text-[10px] text-[#52525B]">PDF, JPG, PNG — max 5MB</span>
                )}
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

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-full bg-[#FACC15] px-8 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Driver'}
        </button>
      </div>

      {/* Credentials Modal */}
      {credentials && (
        <CredentialsModal
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
}
