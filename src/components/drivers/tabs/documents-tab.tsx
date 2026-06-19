'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '@/services/drivers/driver.service';
import type { DriverDocument } from '@/types';
import { DocumentStatusBadge } from '@/components/documents/document-status-badge';

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

  const formatDocType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div>
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{formatDocType(doc.type)}</p>
                {doc.fileName && (
                  <p className="text-xs text-[#71717A] truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                )}
                {doc.referenceNumber && doc.referenceNumber !== 'undefined' && (
                  <p className="text-[10px] text-[#52525B] mt-0.5">{doc.referenceNumber}</p>
                )}
              </div>
              <div className="mr-2">
                <DocumentStatusBadge status={doc.status || 'PENDING'} />
              </div>
              <button
                onClick={() => {
                  console.log('Clicked doc:', doc);
                  if (doc.fileUrl) {
                    window.open(doc.fileUrl, '_blank');
                  } else {
                    toast.error('Document preview not available');
                  }
                }}
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
