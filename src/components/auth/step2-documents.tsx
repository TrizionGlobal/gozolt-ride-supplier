'use client';

import { useRef } from 'react';
import { Upload, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { type: 'businessRegistration', label: 'Business Registration Certificate', required: true },
  { type: 'ownerId', label: 'Owner / Authorized Representative ID', required: true },
  { type: 'addressProof', label: 'Proof of Business Address', required: true },
  { type: 'bankProof', label: 'Bank Account Proof', required: true },
  { type: 'vatCertificate', label: 'VAT Certificate', required: false },
];

export interface DocumentFile {
  type: string;
  file: File | null;
  fileName?: string;
}

interface Step2Props {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2Documents({ documents, onDocumentsChange, onNext, onPrevious }: Step2Props) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getDocForType = (type: string) => documents.find((d) => d.type === type);

  const handleFileSelect = (type: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File "${file.name}" exceeds 5MB limit`);
      return;
    }

    const updated = [...documents];
    const existingIndex = updated.findIndex((d) => d.type === type);
    if (existingIndex >= 0) {
      updated[existingIndex] = { type, file, fileName: file.name };
    } else {
      updated.push({ type, file, fileName: file.name });
    }
    onDocumentsChange(updated);
  };

  const handleCardClick = (type: string) => {
    fileInputRefs.current[type]?.click();
  };

  const handleNextClick = () => {
    // Validate required documents
    const missingDocs = DOCUMENT_TYPES.filter(
      (doc) => doc.required && !documents.find((d) => d.type === doc.type && d.file)
    );

    if (missingDocs.length > 0) {
      toast.error(`Please upload all required documents`);
      return;
    }

    onNext();
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 2: Business Documents</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {DOCUMENT_TYPES.map((doc, index) => {
          const uploaded = getDocForType(doc.type);
          const isLast = index === DOCUMENT_TYPES.length - 1;
          const isOddLast = isLast && DOCUMENT_TYPES.length % 2 !== 0;

          return (
            <div
              key={doc.type}
              className={isOddLast ? 'col-span-2' : ''}
            >
              <button
                type="button"
                onClick={() => handleCardClick(doc.type)}
                className={`w-full rounded-lg border p-4 text-center transition-colors hover:border-[#FACC15]/50 ${
                  uploaded?.file
                    ? 'border-[#22C55E]/50 bg-[#22C55E]/5'
                    : 'border-[#27272A] bg-[#111111]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {uploaded?.file ? (
                    <CheckCircle className="h-6 w-6 text-[#22C55E]" />
                  ) : (
                    <Upload className="h-6 w-6 text-[#71717A]" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {doc.label} {doc.required && <span className="text-[#FACC15]">*</span>}
                  </span>
                  <span className="text-xs text-[#71717A]">
                    {uploaded?.fileName || 'PDF, JPG, PNG — max 5MB'}
                  </span>
                </div>
              </button>
              <input
                ref={(el) => { fileInputRefs.current[doc.type] = el; }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(doc.type, file);
                  e.target.value = '';
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          className="flex items-center gap-1 rounded-full bg-[#FACC15] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
