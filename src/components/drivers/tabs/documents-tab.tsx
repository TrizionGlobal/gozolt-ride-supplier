'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { DriverDocument } from '@/types';

interface DocumentsTabProps {
  driverId: string;
}

export function DocumentsTab({ driverId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await driverService.getDriverDocuments(driverId);
        setDocuments(data);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [driverId]);

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
          className="flex items-center gap-1.5 text-sm text-[#FACC15] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-8 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-[#52525B]" />
          <p className="text-sm text-[#71717A]">No documents uploaded yet</p>
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
                <p className="text-sm font-medium text-white">{doc.type}</p>
                <p className="text-xs text-[#52525B]">{doc.referenceNumber}</p>
              </div>
              <button
                onClick={() => toast.info('Document preview coming soon')}
                className="text-[#A1A1AA] hover:text-white transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
