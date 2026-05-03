'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { documentService } from '@/services/documents/document.service';
import type { DocumentTab, DocumentCenterItem } from '@/types';

const docTypesByCategory: Record<DocumentTab, { value: string; label: string }[]> = {
  Company: [
    { value: 'COMPANY_REGISTRATION', label: 'Business Registration' },
    { value: 'VAT_CERTIFICATE', label: 'VAT Certificate' },
    { value: 'VAT_REGISTRATION', label: 'VAT Registration' },
    { value: 'INSURANCE', label: 'Insurance Policy' },
    { value: 'PUBLIC_LIABILITY_INSURANCE', label: 'Public Liability Insurance' },
    { value: 'OPERATOR_LICENSE', label: 'Operator License' },
  ],
  Vehicle: [
    { value: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'ROADWORTHINESS', label: 'Roadworthiness' },
    { value: 'VEHICLE_PHOTO_INTERIOR_2', label: 'Interior Photo (additional)' },
  ],
  Driver: [
    { value: 'DRIVING_LICENSE', label: 'Driving License' },
    { value: 'POLICE_CLEARANCE', label: 'Police Clearance' },
    { value: 'TAXI_LICENSE', label: 'TM License' },
    { value: 'ID_CARD', label: 'ID Card' },
    { value: 'PROFILE_PHOTO', label: 'Profile Photo' },
  ],
};

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
  defaultTab: DocumentTab;
  prefill?: DocumentCenterItem | null;
}

export function UploadDocumentModal({
  isOpen,
  onClose,
  onUploaded,
  defaultTab,
  prefill,
}: UploadDocumentModalProps) {
  const [category, setCategory] = useState<DocumentTab>(defaultTab);
  const [docType, setDocType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string }[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Load drivers/vehicles for dropdowns
  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      const [d, v] = await Promise.all([
        documentService.getDriversList(),
        documentService.getVehiclesList(),
      ]);
      setDrivers(d);
      setVehicles(v);
    };
    loadData();
  }, [isOpen]);

  // Apply prefill
  useEffect(() => {
    if (prefill) {
      if (prefill.driverName) setCategory('Driver');
      else if (prefill.vehiclePlate) setCategory('Vehicle');
      else setCategory('Company');
      setDocType(prefill.type);
    } else {
      setCategory(defaultTab);
      setDocType('');
    }
    setFile(null);
    setExpiryDate('');
    setSelectedDriver('');
    setSelectedVehicle('');
  }, [prefill, defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!docType) {
      toast.error('Please select a document type');
      return;
    }
    if (category === 'Driver' && !selectedDriver) {
      toast.error('Please select a driver');
      return;
    }
    if (category === 'Vehicle' && !selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    setIsSubmitting(true);
    try {
      await documentService.uploadDocument({
        type: docType,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        driverId: category === 'Driver' ? selectedDriver : undefined,
        vehicleId: category === 'Vehicle' ? selectedVehicle : undefined,
        expiresAt: expiryDate || undefined,
      });
      toast.success('Document uploaded successfully');
      onUploaded();
      onClose();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: DocumentTab[] = ['Company', 'Vehicle', 'Driver'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative mx-4 w-full max-w-[500px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-bold text-white">Upload Document</h2>

        {/* Category tabs */}
        <div className="mb-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setCategory(t);
                setDocType('');
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                category === t
                  ? 'bg-[#FACC15] text-black font-medium'
                  : 'bg-[#27272A] text-[#D4D4D8] border border-[#3F3F46] hover:bg-[#3F3F46]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Vehicle dropdown */}
        {category === 'Vehicle' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Select Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none appearance-none"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plate}</option>
              ))}
            </select>
          </div>
        )}

        {/* Driver dropdown */}
        {category === 'Driver' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-[#D4D4D8]">Select Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none appearance-none"
            >
              <option value="">Choose a driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Document type */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-[#D4D4D8]">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none appearance-none"
          >
            <option value="">Select type...</option>
            {docTypesByCategory[category].map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        {/* Expiry date */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-[#D4D4D8]">Expiry Date (optional)</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-lg border border-[#3F3F46] bg-[#0A0A0A] px-3 py-2.5 text-sm text-white focus:border-[#FACC15] focus:outline-none"
          />
        </div>

        {/* File upload */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors ${
              file
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-[#3F3F46] hover:border-[#52525B]'
            }`}
          >
            {file ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm text-[#D4D4D8]">{file.name}</p>
                <p className="text-xs text-[#52525B]">{(file.size / 1024).toFixed(0)} KB</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#52525B]" />
                <p className="text-sm text-[#A1A1AA]">Click to upload or drag and drop</p>
                <p className="text-xs text-[#52525B]">PDF, JPG, PNG — max 10MB</p>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
