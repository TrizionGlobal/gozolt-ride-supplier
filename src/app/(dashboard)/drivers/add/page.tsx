'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { DriverCredentials } from '@/types';

interface DocSlot {
  label: string;
  file: File | null;
  fileName: string | null;
}

export default function AddDriverPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+356',
    phone: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
    countryOfResidence: '',
    nationalId: '',
    homeAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseIssueDate: '',
    licenseCategory: '',
    licenseIssuingCountry: '',
    cpcCertificateNumber: '',
    taxiPhvLicenseNumber: '',
    insurancePolicyNumber: '',
  });

  // Photo
  const [photo, setPhoto] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  const photoRef = useRef<HTMLInputElement | null>(null);

  // Documents
  const [docs, setDocs] = useState<DocSlot[]>([
    { label: 'Passport / National ID Card (Front)', file: null, fileName: null },
    { label: 'Passport / National ID Card (Back)', file: null, fileName: null },
    { label: 'Driving License (Front)', file: null, fileName: null },
    { label: 'Driving License (Back)', file: null, fileName: null },
    { label: 'Passenger Transport / Taxi Permit', file: null, fileName: null },
    { label: 'Police Conduct Certificate', file: null, fileName: null },
    { label: 'Proof of Address (Utility Bill/Bank)', file: null, fileName: null },
    { label: 'Medical Fitness Certificate', file: null, fileName: null },
    { label: 'Work Permit / Residence Permit', file: null, fileName: null },
  ]);
  const [extraDocs, setExtraDocs] = useState<DocSlot[]>([]);
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

  const addExtraDoc = () => {
    setExtraDocs((prev) => [...prev, { label: '', file: null, fileName: null }]);
  };

  const removeExtraDoc = (index: number) => {
    setExtraDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExtraDocLabel = (index: number, label: string) => {
    setExtraDocs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label };
      return updated;
    });
  };

  const handleExtraDocChange = (index: number, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setExtraDocs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file, fileName: file.name };
      return updated;
    });
  };

  const handleClear = () => {
    setForm({
      firstName: '',
      lastName: '',
      countryCode: '+356',
      phone: '',
      email: '',
      dateOfBirth: '',
      nationality: '',
      countryOfResidence: '',
      nationalId: '',
      homeAddress: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      licenseNumber: '',
      licenseExpiry: '',
      licenseIssueDate: '',
      licenseCategory: '',
      licenseIssuingCountry: '',
      cpcCertificateNumber: '',
      taxiPhvLicenseNumber: '',
      insurancePolicyNumber: '',
    });
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhoto({ file: null, preview: null });
    setDocs((prev) => prev.map((d) => ({ ...d, file: null, fileName: null })));
    setExtraDocs([]);
  };

  const handleSubmit = async () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.dateOfBirth.trim() ||
      !form.nationality.trim() ||
      !form.countryOfResidence.trim() ||
      !form.nationalId.trim() ||
      !form.homeAddress.trim() ||
      !form.emergencyContactName.trim() ||
      !form.emergencyContactPhone.trim() ||
      !form.licenseNumber.trim() ||
      !form.licenseExpiry.trim() ||
      !form.licenseIssueDate.trim() ||
      !form.licenseCategory.trim() ||
      !form.licenseIssuingCountry.trim() ||
      !form.cpcCertificateNumber.trim() ||
      !form.taxiPhvLicenseNumber.trim()
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!photo.file) {
      toast.error('Please upload a driver photo.');
      return;
    }

    const missingDocs = docs.filter((doc) => !doc.file);
    if (missingDocs.length > 0) {
      toast.error(`Please upload all required documents: ${missingDocs.map((d) => d.label).join(', ')}`);
      return;
    }

    const fullPhone = `${form.countryCode}${form.phone.replace(/^0+/, '')}`;
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const cleanPhone = fullPhone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Invalid phone number format');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await driverService.createDriver({
        phone: cleanPhone,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        nationality: form.nationality || undefined,
        countryOfResidence: form.countryOfResidence || undefined,
        nationalId: form.nationalId || undefined,
        homeAddress: form.homeAddress || undefined,
        emergencyContacts: (form.emergencyContactName && form.emergencyContactPhone) 
          ? JSON.stringify([{ name: form.emergencyContactName, phone: form.emergencyContactPhone }]) 
          : undefined,
        licenseNumber: form.licenseNumber || undefined,
        licenseExpiryDate: form.licenseExpiry || undefined,
        licenseIssueDate: form.licenseIssueDate || undefined,
        licenseCategory: form.licenseCategory || undefined,
        licenseIssuingCountry: form.licenseIssuingCountry || undefined,
        cpcCertificateNumber: form.cpcCertificateNumber || undefined,
        taxiPhvLicenseNumber: form.taxiPhvLicenseNumber || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
        photo: photo.file as File,
        docs: [
          ...docs.map((d) => ({ label: d.label, file: d.file as File })),
          ...extraDocs.filter((d) => d.file && d.label.trim() !== '').map((d) => ({ label: d.label, file: d.file as File })),
        ],
      });
      toast.success('Driver created successfully. Pending review.');
      router.push('/drivers');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create driver';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/drivers')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-[#A1A1AA] hover:text-white transition-colors border border-[#27272A]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Add New Driver</h1>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        {/* Section 1: Personal Information */}
        <h2 className="mb-6 text-lg font-semibold text-white">Personal Information</h2>

        {/* Top Section: Photo + Core Info */}
        <div className="mb-6 flex flex-col items-start gap-6 md:flex-row">
          {/* Photo upload */}
          <div className="shrink-0">
            <label className="mb-2 block text-xs text-[#D4D4D8]">Profile Photo<span className="text-red-400">*</span></label>
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

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">First Name<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="Enter First Name"
                value={form.firstName}
                onChange={(e) => updateForm('firstName', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Last Name<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="Enter Last Name"
                value={form.lastName}
                onChange={(e) => updateForm('lastName', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Phone<span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <select
                  value={form.countryCode}
                  onChange={(e) => updateForm('countryCode', e.target.value)}
                  className="w-[100px] shrink-0 appearance-none rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white focus:border-[#FACC15] focus:outline-none"
                >
                  <option value="+356">🇲🇹 +356</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Email<span className="text-red-400">*</span></label>
              <input
                type="email"
                placeholder="e.g. driver@example.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">

          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Date of Birth<span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                className={`peer w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none focus:text-white ${!form.dateOfBirth ? 'text-transparent' : 'text-white'}`}
              />
              {!form.dateOfBirth && (
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs text-[#52525B] peer-focus:hidden">
                  DD/MM/YYYY
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Nationality<span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Maltese"
              value={form.nationality}
              onChange={(e) => updateForm('nationality', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Country of Residence<span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Malta"
              value={form.countryOfResidence}
              onChange={(e) => updateForm('countryOfResidence', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">National ID<span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. 123456M"
              value={form.nationalId}
              onChange={(e) => updateForm('nationalId', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#D4D4D8]">Home Address<span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="Full Address"
              value={form.homeAddress}
              onChange={(e) => updateForm('homeAddress', e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Emergency Contact Name<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={form.emergencyContactName}
                onChange={(e) => updateForm('emergencyContactName', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Emergency Contact Phone<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. +35612345678"
                value={form.emergencyContactPhone}
                onChange={(e) => updateForm('emergencyContactPhone', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: License Details */}
        <div className="mt-8 border-t border-[#27272A] pt-6">
          <h2 className="mb-4 text-sm font-semibold text-white">License Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">License Number<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="MT-DL-12345"
                value={form.licenseNumber}
                onChange={(e) => updateForm('licenseNumber', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">License Expiry<span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  value={form.licenseExpiry}
                  onChange={(e) => updateForm('licenseExpiry', e.target.value)}
                  className={`peer w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none focus:text-white ${!form.licenseExpiry ? 'text-transparent' : 'text-white'}`}
                />
                {!form.licenseExpiry && (
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs text-[#52525B] peer-focus:hidden">
                    DD/MM/YYYY
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">License Issue Date<span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  value={form.licenseIssueDate}
                  onChange={(e) => updateForm('licenseIssueDate', e.target.value)}
                  className={`peer w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs focus:border-[#FACC15] focus:outline-none focus:text-white ${!form.licenseIssueDate ? 'text-transparent' : 'text-white'}`}
                />
                {!form.licenseIssueDate && (
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs text-[#52525B] peer-focus:hidden">
                    DD/MM/YYYY
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">License Category<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. B, B1"
                value={form.licenseCategory}
                onChange={(e) => updateForm('licenseCategory', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">License Issuing Country<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. Malta"
                value={form.licenseIssuingCountry}
                onChange={(e) => updateForm('licenseIssuingCountry', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2.5: Professional Details */}
        <div className="mt-8 border-t border-[#27272A] pt-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Professional Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">CPC Certificate Number<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. CPC-12345"
                value={form.cpcCertificateNumber}
                onChange={(e) => updateForm('cpcCertificateNumber', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Taxi/PHV License Number<span className="text-red-400">*</span></label>
              <input
                type="text"
                placeholder="e.g. PHV-MT-9042"
                value={form.taxiPhvLicenseNumber}
                onChange={(e) => updateForm('taxiPhvLicenseNumber', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#D4D4D8]">Insurance Policy Number</label>
              <input
                type="text"
                placeholder="e.g. INS-9876543"
                value={form.insurancePolicyNumber}
                onChange={(e) => updateForm('insurancePolicyNumber', e.target.value)}
                className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Documents */}
        <div className="mt-8 border-t border-[#27272A] pt-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Documents<span className="text-red-400 ml-1">*</span></h2>
          <div className="grid grid-cols-4 gap-4">
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
                  {doc.label}
                </span>
                {doc.fileName ? (
                  <span className="text-[10px] text-[#A1A1AA] text-center truncate max-w-[140px]" title={doc.fileName}>
                    {doc.fileName}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#52525B]">
                    PDF, JPG, PNG — max 5MB
                  </span>
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

          {/* Extra Documents (Optional) */}
          <div className="mt-8 pt-6 border-t border-[#27272A]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Additional Documents (Optional)</h2>
              <button
                type="button"
                onClick={addExtraDoc}
                className="text-xs font-medium text-[#FACC15] hover:text-[#EAB308] flex items-center gap-1"
              >
                + Add Document
              </button>
            </div>
            <div className="space-y-4">
              {extraDocs.map((doc, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-[#27272A] rounded-lg bg-[#0A0A0A]">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs text-[#D4D4D8]">Document Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Work Permit"
                      value={doc.label}
                      onChange={(e) => updateExtraDocLabel(i, e.target.value)}
                      className="w-full rounded-lg border border-[#3F3F46] bg-[#111111] px-3 py-2 text-xs text-white placeholder-[#52525B] focus:border-[#FACC15] focus:outline-none"
                    />
                  </div>
                  <div className="w-[180px]">
                    <label className="mb-1.5 block text-xs text-[#D4D4D8]">File</label>
                    <label className={`flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${doc.file ? 'border-green-500/50 bg-green-500/5 text-green-500' : 'border-[#3F3F46] hover:border-[#52525B] text-[#D4D4D8]'}`}>
                      {doc.file ? <CheckCircle className="h-4 w-4 shrink-0" /> : <Upload className="h-4 w-4 shrink-0" />}
                      <span className="text-xs font-medium truncate max-w-[120px] px-1">{doc.fileName || 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleExtraDocChange(i, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExtraDoc(i)}
                    className="mt-[22px] flex h-9 w-9 items-center justify-center rounded-lg border border-[#3F3F46] bg-[#111111] text-[#71717A] hover:bg-[#27272A] hover:text-white transition-colors shrink-0"
                    title="Remove Document"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleClear}
          disabled={isSubmitting}
          className="rounded-full border border-[#3F3F46] bg-transparent px-8 py-2.5 text-sm font-semibold text-[#D4D4D8] hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
        >
          Clear Form
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-full bg-[#FACC15] px-8 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Driver'}
        </button>
      </div>

    </div>
  );
}
