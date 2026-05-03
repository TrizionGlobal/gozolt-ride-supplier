'use client';

import { useState, useEffect } from 'react';
import { FileText, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fleetService } from '@/services/fleet/fleet.service';
import type { SupplierDocument } from '@/types';

interface DocumentsTabProps {
  vehicleId: string;
}

export function DocumentsTab({ vehicleId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await fleetService.getVehicleDocuments(vehicleId);
        setDocuments(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [vehicleId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[#27272A] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => toast.info('Document upload coming soon')}
          className="flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-[#52525B]" />
          <p className="text-sm text-[#71717A]">No documents yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#111111] p-4"
            >
              <FileText className="h-5 w-5 shrink-0 text-[#A1A1AA]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{doc.fileName}</p>
                <p className="text-xs text-[#52525B]">#{doc.id.replace(/-/g, '').slice(0, 8)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#52525B]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
