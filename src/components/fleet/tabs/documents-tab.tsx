'use client';

import { useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import type { SupplierDocument, FleetVehicleDetail } from '@/types';

interface DocumentsTabProps {
  vehicle: FleetVehicleDetail;
}

export function DocumentsTab({ vehicle }: DocumentsTabProps) {
  const documents = vehicle.documents || [];



  const formatDocType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div>
      {documents.length === 0 ? (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6 text-center text-sm text-[#71717A]">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                if (doc.fileUrl) {
                  window.open(doc.fileUrl, '_blank');
                }
              }}
              className="flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#111111] p-4 cursor-pointer hover:bg-[#18181B] transition-colors"
            >
              <FileText className="h-5 w-5 shrink-0 text-[#A1A1AA]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{formatDocType(doc.type)}</p>
                <p className="text-xs text-[#52525B] truncate max-w-[200px] sm:max-w-xs">{doc.fileName}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#52525B]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
